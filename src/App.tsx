/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  AlgorithmContext, 
  DebateSession, 
  Verdict, 
  QuizQuestion, 
  SessionState,
  HistoryItem
} from './types';
import { 
  extractAlgorithm, 
  conductDebate, 
  judgeDebate, 
  generateQuiz 
} from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { AgentDebate } from './components/AgentDebate';
import { JudgeVerdict } from './components/JudgeVerdict';
import { Quiz } from './components/Quiz';
import { StudentChat } from './components/StudentChat';
import { HistoryBar } from './components/HistoryBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Terminal, 
  RefreshCw, 
  AlertTriangle,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  History as HistoryIcon
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<SessionState>(SessionState.IDLE);
  const [ctx, setCtx] = useState<AlgorithmContext | null>(null);
  const [debate, setDebate] = useState<DebateSession | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('dsa_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('dsa_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (score: number) => {
    if (!ctx || !verdict || !debate) return;
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: ctx.name,
      timeComplexity: verdict.time_complexity,
      score,
      totalQuestions: questions.length,
      timestamp: Date.now(),
      ctx,
      debate,
      verdict,
      questions
    };
    setHistory(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCtx(item.ctx);
    setDebate(item.debate);
    setVerdict(item.verdict);
    setQuestions(item.questions);
    setQuizScore(item.score);
    setState(SessionState.SUMMARIZED);
    setError(null);
  };

  const reset = () => {
    setState(SessionState.IDLE);
    setCtx(null);
    setDebate(null);
    setVerdict(null);
    setQuestions([]);
    setError(null);
    setQuizScore(null);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all analysis history?')) {
      setHistory([]);
    }
  };

  const handleUpload = async (input: { b64?: string; text?: string }) => {
    try {
      setError(null);
      setState(SessionState.READING);
      const extracted = await extractAlgorithm(input);
      setCtx(extracted);

      setState(SessionState.DEBATING);
      const session = await conductDebate(extracted);
      setDebate(session);

      setState(SessionState.JUDGING);
      const finalVerdict = await judgeDebate(extracted, session);
      setVerdict(finalVerdict);

      setState(SessionState.QUIZZING);
      const quizQuestions = await generateQuiz(extracted, finalVerdict);
      setQuestions(quizQuestions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during processing.');
      setState(SessionState.ERROR);
    }
  };

  const renderProgress = () => {
    const steps = [
      { id: SessionState.READING, label: 'Reader', icon: <Terminal size={14} /> },
      { id: SessionState.DEBATING, label: 'Debate', icon: <Cpu size={14} /> },
      { id: SessionState.JUDGING, label: 'Judge', icon: <BrainCircuit size={14} /> },
      { id: SessionState.QUIZZING, label: 'Quiz', icon: <BookOpen size={14} /> },
    ];

    const currentIdx = steps.findIndex(s => s.id === state);
    if (state === SessionState.IDLE || state === SessionState.ERROR) return null;

    return (
      <div className="flex items-center gap-4 mb-8 overflow-x-auto no-scrollbar">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-4 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1 border transition-all ${
              state === step.id 
                ? 'bg-ink text-bg border-ink' 
                : i < currentIdx 
                  ? 'border-green-600 text-green-600' 
                  : 'border-line/20 text-line/40'
            }`}>
              {i < currentIdx ? <CheckCircle2 size={14} /> : step.icon}
              <span className="label-sm whitespace-nowrap">{step.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} className="opacity-20" />}
          </div>
        ))}
        {state !== SessionState.SUMMARIZED && state !== SessionState.QUIZZING && (
          <div className="ml-auto animate-pulse flex shrink-0">
            <span className="label-sm uppercase opacity-40">Processing...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-4 md:p-12 space-y-24 pb-48">
      {/* History Sidebar */}
      <HistoryBar 
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onClear={clearHistory}
        onSelect={loadHistoryItem}
      />

      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center text-bg transform group-hover:rotate-12 transition-transform">
             <BrainCircuit size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            DSA <span className="opacity-20">/</span> Tutor
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink/60 hover:text-ink"
            title="View History"
          >
            <HistoryIcon size={20} />
          </button>
          <div className="w-px h-4 bg-line mx-2" />
          <button 
            onClick={reset}
            className="text-xs font-semibold uppercase tracking-wider text-ink/40 hover:text-ink transition-colors px-4 py-2"
          >
            Reset
          </button>
          <button 
            onClick={reset}
            className="btn-technical shadow-sm"
          >
            New Session
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderProgress()}

        <AnimatePresence mode="wait">
          {state === SessionState.IDLE && (
            <motion.section 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-12 py-12"
            >
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-12 h-12 bg-ink/5 text-ink flex items-center justify-center rounded-2xl mb-8"
                >
                  <BrainCircuit size={24} />
                </motion.div>
                
                <div className="space-y-4">
                  <motion.h2 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-7xl font-bold tracking-tight leading-[0.9] text-ink"
                  >
                    Hello Scholar, <br/>
                    <span className="opacity-20 italic font-serif text-5xl">I'm your DSA Tutor.</span>
                  </motion.h2 >
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-medium text-gray-500 max-w-lg leading-relaxed"
                  >
                    I help you master complex algorithms by analyzing your notes and facilitating deep analytical debates between specialist AI agents.
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col gap-3 pt-4 border-l-2 border-ink/5 pl-6"
                >
                   <div className="flex items-center gap-3 label-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Logical Reasoning Pool: ACTIVE
                   </div>
                   <div className="flex items-center gap-3 label-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Multimodal Vision Agents: STANDBY
                   </div>
                   <div className="flex items-center gap-3 label-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Socratic Tutor: READY
                   </div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="soft-card p-12 space-y-8"
              >
                <div className="space-y-1">
                  <span className="label-sm font-bold text-ink/40 tracking-widest">Instruction</span>
                  <p className="text-sm opacity-60">Upload your source material to begin the learning process.</p>
                </div>
                <FileUpload onUpload={handleUpload} />
              </motion.div>
            </motion.section>
          )}

          {state === SessionState.ERROR && (
            <motion.section 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 border-2 border-red-600 bg-red-50 flex flex-col items-center space-y-4"
            >
              <AlertTriangle className="text-red-600 w-12 h-12" />
              <div className="text-center">
                <h3 className="text-red-600 font-bold uppercase">Pipeline Failure</h3>
                <p className="text-sm opacity-80">{error}</p>
              </div>
              <button onClick={reset} className="btn-technical bg-red-600 border-red-600">Restart Session</button>
            </motion.section>
          )}

          {(state !== SessionState.IDLE && state !== SessionState.ERROR) && (
            <motion.div 
              key="pipeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Algorithm Context */}
              {ctx && (
                <section className="soft-card overflow-hidden">
                  <div className="bg-gray-50 border-b border-line px-8 py-3 flex justify-between items-center">
                     <span className="label-sm opacity-60">Source Definition</span>
                     <span className="label-sm">Match: {(ctx.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="p-8 md:col-span-1 border-r border-line space-y-8">
                      <div>
                        <span className="label-sm block mb-2">Identifier</span>
                        <h3 className="text-2xl font-bold tracking-tight">{ctx.name}</h3>
                      </div>
                      <div>
                        <span className="label-sm block mb-3">Variables</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ctx.variables.map(v => (
                            <span key={v} className="bg-gray-100 px-2 py-1 text-[11px] font-mono rounded-md border border-line/20">{v}</span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-6 border-t border-line/5">
                        <span className="label-sm block mb-3">Input Scan</span>
                        {ctx.raw_image_b64 ? (
                          <div className="aspect-video bg-gray-50 rounded-xl border border-line/20 flex items-center justify-center overflow-hidden transition-all duration-500">
                             <img src={`data:image/png;base64,${ctx.raw_image_b64}`} alt="Uploaded notes" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 text-xs font-mono opacity-50 h-32 overflow-hidden italic leading-loose">
                            [Text Source Transmission]
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-8 md:col-span-2 bg-white flex flex-col">
                      <span className="label-sm block mb-4">Transcription</span>
                      <pre className="data-mono text-xs leading-loose overflow-x-auto p-8 rounded-xl bg-gray-50/50 border border-line flex-grow whitespace-pre-wrap">
                        {ctx.pseudocode}
                      </pre>
                    </div>
                  </div>
                </section>
              )}

              {/* Debate Section */}
              {debate && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-line flex-grow" />
                    <h2 className="label-sm px-4">Agent Analytical Debate</h2>
                    <div className="h-px bg-line flex-grow" />
                  </div>
                  <AgentDebate debate={debate} />
                </section>
              )}

              {/* Verdict Section */}
              {verdict && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-line flex-grow" />
                    <h2 className="label-sm px-4">The Synthesis</h2>
                    <div className="h-px bg-line flex-grow" />
                  </div>
                  <JudgeVerdict verdict={verdict} />
                </section>
              )}

              {/* Chat Consultation */}
              {ctx && debate && verdict && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-line flex-grow" />
                    <h2 className="label-sm px-4">Deep Dive Consultation</h2>
                    <div className="h-px bg-line flex-grow" />
                  </div>
                  <StudentChat ctx={ctx} debate={debate} verdict={verdict} />
                </section>
              )}

              {/* Quiz Section */}
              {questions.length > 0 && state === SessionState.QUIZZING && (
                  <Quiz 
                    questions={questions} 
                    onComplete={(score) => {
                      setQuizScore(score);
                      setState(SessionState.SUMMARIZED);
                      addToHistory(score);
                    }} 
                  />
              )}

              {state === SessionState.SUMMARIZED && (
                <motion.section 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-ink text-bg p-12 text-center space-y-6 flex flex-col items-center"
                >
                  <div className="w-16 h-16 border-2 border-bg rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Session Summarized</h2>
                    <p className="label-sm opacity-60">You have completed the audit of {ctx?.name}.</p>
                  </div>
                  <div className="flex gap-12 mt-8">
                    <div className="text-center">
                      <span className="label-sm opacity-40 block">Final Score</span>
                      <span className="text-5xl font-mono">{quizScore} / {questions.length}</span>
                    </div>
                    <div className="text-center border-l border-bg/20 pl-12">
                      <span className="label-sm opacity-40 block">Algorithm</span>
                      <span className="text-xl font-bold uppercase block">{ctx?.name}</span>
                      <span className="label-sm opacity-40 block mt-2">Complexity</span>
                      <span className="text-lg font-mono block">{verdict?.time_complexity}</span>
                    </div>
                  </div>
                  <button onClick={reset} className="btn-technical bg-bg text-ink border-bg mt-8">Start New session</button>
                </motion.section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Loading Overlay for step transitions */}
      {(state === SessionState.READING || state === SessionState.DEBATING || state === SessionState.JUDGING) && (
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden z-50">
           <motion.div 
             initial={{ x: '-100%' }}
             animate={{ x: '100%' }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             className="w-full h-full bg-ink"
           />
        </div>
      )}
    </div>
  );
}


