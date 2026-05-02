/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AlgorithmContext {
  name: string;
  pseudocode: string;
  paradigm_hint: string;
  variables: string[];
  confidence: number;
  raw_image_b64?: string;
}

export interface DebateTurn {
  agent_id: 'A' | 'B';
  content: string;
  timestamp: number;
}

export interface DebateSession {
  exchanges: DebateTurn[];
  summaryA: {
    time: string;
    space: string;
    paradigm: string;
  };
  summaryB: {
    time: string;
    space: string;
    paradigm: string;
  };
}

export interface Verdict {
  time_complexity: string;
  space_complexity: string;
  paradigm: string;
  explanation: string;
  key_insight: string;
  agent_a_correct: boolean;
  agent_b_correct: boolean;
}

export interface QuizQuestion {
  question: string;
  type: 'mcq' | 'short_answer' | 'edge_case';
  options?: string[];
  expected_answer: string;
  hint: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
  user_answers: string[];
  feedback: string[];
  score: number;
}

export interface HistoryItem {
  id: string;
  name: string;
  timeComplexity: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
}

export enum SessionState {
  IDLE = 'IDLE',
  READING = 'READING',
  DEBATING = 'DEBATING',
  JUDGING = 'JUDGING',
  QUIZZING = 'QUIZZING',
  SUMMARIZED = 'SUMMARIZED',
  ERROR = 'ERROR'
}
