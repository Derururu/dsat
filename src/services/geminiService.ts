import { GoogleGenAI, Type } from "@google/genai";
import { AlgorithmContext, DebateSession, Verdict, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Reader Agent: Extracts algorithm from image or text.
 */
export async function extractAlgorithm(input: { b64?: string, text?: string }): Promise<AlgorithmContext> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Extract the algorithm details from the provided input. 
    Return a JSON object matching this schema:
    {
      "name": "string",
      "pseudocode": "string",
      "paradigm_hint": "string",
      "variables": ["string"],
      "confidence": number (0.0 to 1.0)
    }
    Be precise. IMPORTANT: For the "pseudocode" field, format the code perfectly with standard, consistent indentation. Do not abbreviate. Do not use markdown wrappers around the code.
  `;

  const parts: any[] = [{ text: prompt }];
  if (input.b64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: input.b64,
      },
    });
  }
  if (input.text) {
    parts.push({ text: `Plain text input: ${input.text}` });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          pseudocode: { type: Type.STRING },
          paradigm_hint: { type: Type.STRING },
          variables: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.NUMBER }
        },
        required: ["name", "pseudocode", "paradigm_hint", "variables", "confidence"]
      }
    }
  });

  const content = JSON.parse(response.text);
  return { ...content, raw_image_b64: input.b64 };
}

/**
 * Conduct Interactive Debate: Generates a conversation between Critic and Textbook agents.
 */
export async function conductDebate(ctx: AlgorithmContext): Promise<DebateSession> {
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    Conduct an interactive debate about this algorithm:
    Name: ${ctx.name}
    Pseudocode: ${ctx.pseudocode}

    Format the debate as a 4-turn exchange between two distinct personas:
    1. Agent A (The Critic): Skeptical, looks for edge cases, high overheads, or hidden complexities.
    2. Agent B (The Textbook Analyst): Conservative, relies on standard asymptotic analysis and common academic interpretations.

    Return a JSON object:
    {
      "exchanges": [
        {"agent_id": "A", "content": "...initial critique..."},
        {"agent_id": "B", "content": "...rebuttal using standard theory..."},
        {"agent_id": "A", "content": "...deep dive into an edge case..."},
        {"agent_id": "B", "content": "...final synthesis or defense..."}
      ],
      "summaryA": { "time": "O(...)", "space": "O(...)", "paradigm": "..." },
      "summaryB": { "time": "O(...)", "space": "O(...)", "paradigm": "..." }
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          exchanges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                agent_id: { type: Type.STRING, enum: ["A", "B"] },
                content: { type: Type.STRING }
              },
              required: ["agent_id", "content"]
            }
          },
          summaryA: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              space: { type: Type.STRING },
              paradigm: { type: Type.STRING }
            },
            required: ["time", "space", "paradigm"]
          },
          summaryB: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              space: { type: Type.STRING },
              paradigm: { type: Type.STRING }
            },
            required: ["time", "space", "paradigm"]
          }
        },
        required: ["exchanges", "summaryA", "summaryB"]
      }
    }
  });

  const rawResult = JSON.parse(response.text);
  return {
    ...rawResult,
    exchanges: rawResult.exchanges.map((e: any) => ({ ...e, timestamp: Date.now() }))
  };
}

/**
 * Judge Agent: Synthesizes the debate based on the full session.
 */
export async function judgeDebate(ctx: AlgorithmContext, debate: DebateSession): Promise<Verdict> {
  const model = "gemini-3.1-pro-preview"; 
  
  const prompt = `
    You are a Senior CS Professor. Evaluate the debate session about this algorithm:
    Algorithm: ${ctx.name}
    
    Conversation History:
    ${debate.exchanges.map(e => `Agent ${e.agent_id}: ${e.content}`).join('\n')}
    
    Summary A: ${JSON.stringify(debate.summaryA)}
    Summary B: ${JSON.stringify(debate.summaryB)}
    
    Provide the definitive verdict. Synthesize the most correct points.
    Be pedagogically clear for a student.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: "You are neutral, rigorous, and pedagogically clear. Acknowledge valid points from both agents before ruling.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          time_complexity: { type: Type.STRING },
          space_complexity: { type: Type.STRING },
          paradigm: { type: Type.STRING },
          explanation: { type: Type.STRING },
          key_insight: { type: Type.STRING },
          agent_a_correct: { type: Type.BOOLEAN },
          agent_b_correct: { type: Type.BOOLEAN }
        },
        required: ["time_complexity", "space_complexity", "paradigm", "explanation", "key_insight", "agent_a_correct", "agent_b_correct"]
      }
    }
  });

  return JSON.parse(response.text);
}

/**
 * Quiz Agent: Generates questions.
 */
export async function generateQuiz(ctx: AlgorithmContext, verdict: Verdict): Promise<QuizQuestion[]> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Generate 3 challenging quiz questions for a student to test their understanding of the following algorithm analysis.
    Algorithm: ${ctx.name}
    Verdict Summary: ${verdict.explanation}
    
    Include:
    1. One Multiple Choice Question (MCQ)
    2. One Short Answer Question
    3. One Edge Case Reasoning Question
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: "You are a Socratic tutor. Probe understanding. Never give the answer directly in the question. Include hints for each question.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["mcq", "short_answer", "edge_case"] },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for MCQ" },
            expected_answer: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ["question", "type", "expected_answer", "hint"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

/**
 * Student Chat: Allows student to ask questions to the Professor.
 */
export async function askProfessor(
  ctx: AlgorithmContext, 
  debate: DebateSession, 
  verdict: Verdict, 
  chatHistory: ChatMessage[],
  userQuestion: string
): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const historyString = chatHistory.map(m => `${m.role === 'user' ? 'Student' : 'Professor'}: ${m.content}`).join('\n');

  const prompt = `
    You are a Senior CS Professor. You just finished a debate and provided a verdict on the following algorithm:
    Algorithm: ${ctx.name}
    Verdict: ${verdict.explanation}
    
    Debate Recap:
    ${debate.exchanges.map(e => `Agent ${e.agent_id}: ${e.content}`).join('\n')}
    
    Past conversation with student:
    ${historyString}
    
    Student's new question: ${userQuestion}
    
    Answer the student's question clearly, pedagogically, and accurately based on the context. If you don't know, suggest looking it up in a trusted source like CLRS.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful, neutral, and rigorous CS Professor. Your goal is to help the student understand the nuances of the algorithm. IMPORTANT: Keep your responses concise to reply quickly. DO NOT use any LaTeX formatting ($ or $$) for math. Write mathematical notation in plain text (e.g., O(N^2)). Use standard markdown for formatting, including triple backticks for any code or pseudocode with consistent indentation.",
    }
  });

  return response.text;
}

/**
 * Evaluate Quiz Answer
 */
export async function evaluateAnswer(question: QuizQuestion, userAnswer: string): Promise<{ isCorrect: boolean, feedback: string }> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Question: ${question.question}
    Expected Key Points/Answer: ${question.expected_answer}
    Student Answer: ${userAnswer}
    
    Evaluate if the student is correct and provide feedback.
    If it's mcq, it must be exact. If it's short answer or edge case, check for conceptual correctness.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING }
        },
        required: ["isCorrect", "feedback"]
      }
    }
  });

  return JSON.parse(response.text);
}
