# DSA Tutor

**An AI-powered study companion that helps you master Data Structures and Algorithms through multi-agent reasoning, adversarial debates, and adaptive quizzing.**

Instead of giving you a single-pass answer, DSA Tutor orchestrates a pipeline of specialist AI agents that *debate* each other about your algorithm — forcing nuanced analysis of edge cases, hidden complexities, and competing interpretations — then synthesizes the best arguments into a clear verdict you can actually learn from.

> **Try it live →** [DSA Tutor](dsa-multi-agent-study-tutor-971896187222.europe-west1.run.app)

---

## ✨ Features

| Feature | Description |
|---|---|
| **📸 Multimodal Input** | Upload an image of handwritten/printed pseudocode *or* paste plain text — the Reader agent handles both |
| **⚔️ Multi-Agent Debate** | Two specialist agents (Critic vs. Textbook Analyst) debate time/space complexity, paradigm classification, and edge cases across 4 structured turns |
| **⚖️ Judge Synthesis** | A neutral Judge agent evaluates both positions and delivers a pedagogically clear verdict with key insights |
| **💬 Professor Consultation** | Chat with "Professor Turing" — a context-aware AI tutor that has full memory of the debate and verdict |
| **📝 Adaptive Quizzing** | Automatically generated quizzes (MCQ, short answer, edge-case reasoning) tailored to the specific algorithm analyzed |
| **📂 Session History** | All sessions are saved locally with full context — revisit any past analysis instantly |

---

## 🏗️ Architecture

DSA Tutor runs a sequential multi-agent pipeline, where each stage feeds into the next:

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER INPUT                                │
│              (image upload  or  plain text)                       │
└──────────────┬───────────────────────────────────────────────────┘
               ▼
┌──────────────────────────┐
│   1. READER AGENT        │  Gemini 3.1 Pro · Vision + Text
│   Extracts algorithm     │  → name, pseudocode, paradigm hint,
│   context from input     │    variables, confidence score
└──────────────┬───────────┘
               ▼
┌──────────────────────────┐
│   2. DEBATE AGENTS       │  Gemini 3.1 Pro · Structured Output
│   Agent A: The Critic    │  → 4-turn adversarial exchange
│   Agent B: The Textbook  │  → independent complexity summaries
└──────────────┬───────────┘
               ▼
┌──────────────────────────┐
│   3. JUDGE AGENT         │  Gemini 3.1 Pro · System Instruction
│   Synthesizes both       │  → definitive verdict on time/space
│   positions neutrally    │    complexity, paradigm, key insight
└──────────────┬───────────┘
               ▼
┌──────────────────────────┐
│   4. QUIZ AGENT          │  Gemini 3.1 Pro · Socratic Tutor
│   Generates targeted     │  → 3 questions: MCQ, short answer,
│   assessment questions   │    edge-case reasoning (with hints)
└──────────────┬───────────┘
               ▼
┌──────────────────────────┐
│   5. PROFESSOR CHAT      │  Gemini 3 Flash · Conversational
│   Interactive follow-up  │  → full context of debate + verdict
│   Q&A with the student   │    for deep-dive exploration
└──────────────────────────┘
```

### Why Multi-Agent?

A single LLM call tends to give a confident but potentially shallow answer. By splitting analysis across competing agents with distinct personas (skeptic vs. academic), the system surfaces nuances that a single pass would miss — like amortized vs. worst-case discrepancies, hidden constant factors, or paradigm edge cases.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Google Gemini API key** ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/Derururu/dsat.git
cd dsat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY="your-api-key-here"
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 6 |
| **Styling** | Tailwind CSS 4 with custom design tokens |
| **Animations** | Motion (Framer Motion) |
| **AI Backend** | Google Gemini API via `@google/genai` |
| **Markdown** | react-markdown + remark-gfm |
| **Icons** | Lucide React |
| **Typography** | Inter (sans) + JetBrains Mono (mono) |
| **Language** | TypeScript |

---

## 📁 Project Structure

```
dsat_v2/
├── src/
│   ├── App.tsx                    # Main app — state machine & pipeline orchestration
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Design system (tokens, components, utilities)
│   ├── types.ts                   # TypeScript interfaces for all data models
│   ├── components/
│   │   ├── FileUpload.tsx         # Drag-and-drop image / text input
│   │   ├── AgentDebate.tsx        # Debate visualization with turn-based thread
│   │   ├── JudgeVerdict.tsx       # Verdict display with complexity breakdown
│   │   ├── Quiz.tsx               # Interactive quiz with AI-graded answers
│   │   ├── StudentChat.tsx        # Chat interface with "Professor Turing"
│   │   └── HistoryBar.tsx         # Session history sidebar
│   └── services/
│       └── geminiService.ts       # All Gemini API calls (5 agents + evaluator)
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 🎯 How It Works — Step by Step

1. **Upload** — Drop an image of pseudocode from your lecture notes, or paste the algorithm as text.
2. **Read** — The Reader agent extracts the algorithm's name, pseudocode, paradigm hint, and key variables using multimodal vision.
3. **Debate** — Two AI agents engage in a structured 4-turn debate:
   - **Agent A (The Critic):** Probes for edge cases, hidden overhead, and worst-case gotchas.
   - **Agent B (The Textbook Analyst):** Defends the standard academic analysis with formal reasoning.
4. **Judge** — A Senior CS Professor agent reviews the full debate transcript and delivers a synthesized verdict — time complexity, space complexity, paradigm, and a key pedagogical insight.
5. **Quiz** — Three tailored questions test your understanding:
   - Multiple choice (exact match)
   - Short answer (conceptual correctness)
   - Edge-case reasoning (deep understanding)
6. **Consult** — Chat with Professor Turing for follow-up questions. The professor has full context of the debate and verdict to give informed, nuanced answers.
7. **Review** — Your session is automatically saved. Revisit it anytime from the history sidebar.

