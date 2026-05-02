import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { evaluateAnswer } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Send, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export const Quiz: React.FC<QuizProps> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    setIsEvaluating(true);
    try {
      const result = await evaluateAnswer(currentQuestion, answer);
      setFeedback({ isCorrect: result.isCorrect, text: result.feedback });
      if (result.isCorrect) setScore(s => s + 1);
    } catch (error) {
      console.error(error);
      setFeedback({ isCorrect: false, text: "Evaluation failed. Moving on..." });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setAnswer('');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizFinished(true);
      onComplete(score + (feedback?.isCorrect ? 1 : 0));
    }
  };

  if (quizFinished) {
    return (
      <div className="soft-card p-16 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-ink/5 text-ink flex items-center justify-center rounded-full mb-4">
           <HelpCircle size={40} />
        </div>
        <h3 className="text-3xl font-bold tracking-tight">Audit Complete</h3>
        <div className="data-mono text-7xl font-bold text-ink">{score} <span className="opacity-20">/</span> {questions.length}</div>
        <p className="label-sm">Review your session analysis below.</p>
      </div>
    );
  }

  return (
    <div className="soft-card overflow-hidden">
      <div className="flex justify-between items-center bg-gray-50/80 border-b border-line px-8 py-4">
        <div className="space-y-0.5">
          <span className="label-sm opacity-50">Pedagogical Review</span>
          <h3 className="text-sm font-bold tracking-tight uppercase">Knowledge Review</h3>
        </div>
        <div className="text-right">
          <span className="label-sm block opacity-30">Part</span>
          <span className="data-mono font-bold">{currentIndex + 1} of {questions.length}</span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="p-10 space-y-10"
        >
          <div className="space-y-8">
            <h4 className="text-xl font-medium leading-relaxed text-gray-800">
              {currentQuestion.question}
            </h4>
            
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <div className="grid grid-cols-1 gap-4 mt-8">
                {currentQuestion.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => !feedback && setAnswer(option)}
                    className={`p-6 text-left border-2 rounded-2xl transition-all flex items-center justify-between group ${
                      answer === option 
                        ? 'border-ink bg-ink text-bg shadow-xl shadow-ink/10' 
                        : 'border-line/40 bg-white hover:border-ink/10'
                    } ${feedback ? 'pointer-events-none' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`label-sm shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                        answer === option ? 'border-bg/40 text-bg' : 'border-line opacity-40 group-hover:opacity-100'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-semibold text-sm">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type !== 'mcq' && (
              <textarea
                disabled={!!feedback || isEvaluating}
                className="w-full h-32 bg-transparent border border-line/20 p-4 text-sm focus:outline-none focus:border-ink disabled:opacity-50"
                placeholder="Type your explanation here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            )}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-4 border-l-4 overflow-hidden ${
                  feedback.isCorrect ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {feedback.isCorrect ? <CheckCircle className="text-green-600 shrink-0 mt-1" /> : <AlertCircle className="text-red-600 shrink-0 mt-1" />}
                  <div className="space-y-1">
                    <p className={`font-bold text-xs uppercase tracking-widest ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {feedback.isCorrect ? 'Correct' : 'Incorrect'}
                    </p>
                    <p className="text-sm opacity-80">{feedback.text}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center gap-4 pt-4 border-t border-line/10">
            <div className="flex items-center gap-2 text-xs text-gray-500 italic">
               <HelpCircle size={14} />
               <span>{currentQuestion.hint}</span>
            </div>
            
            {!feedback ? (
              <button
                disabled={!answer || isEvaluating}
                onClick={handleSubmit}
                className="btn-technical flex items-center gap-2"
              >
                {isEvaluating ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                Evaluate
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-technical"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
