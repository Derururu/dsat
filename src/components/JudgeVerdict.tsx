import React from 'react';
import { Verdict } from '../types';
import { motion } from 'motion/react';
import { Check, X, ShieldCheck } from 'lucide-react';

interface JudgeVerdictProps {
  verdict: Verdict;
}

export const JudgeVerdict: React.FC<JudgeVerdictProps> = ({ verdict }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="soft-card p-10 space-y-10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <ShieldCheck size={180} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-line">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-ink text-bg px-3 py-1 rounded-full label-sm">
             <ShieldCheck size={12} />
             Final Learning Synthesis
          </div>
          <h2 className="text-4xl font-bold tracking-tight">The Verdict</h2>
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2">
              <span className="label-sm">Agent A</span>
              <div className={`p-1 rounded-full ${verdict.agent_a_correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {verdict.agent_a_correct ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-sm">Agent B</span>
              <div className={`p-1 rounded-full ${verdict.agent_b_correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {verdict.agent_b_correct ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-12 border-l border-line pl-8">
          <div>
            <span className="label-sm block mb-1">Complexity (T)</span>
            <p className="data-mono font-bold text-2xl tracking-tighter text-ink">{verdict.time_complexity}</p>
          </div>
          <div>
            <span className="label-sm block mb-1">Complexity (S)</span>
            <p className="data-mono font-bold text-2xl tracking-tighter text-ink">{verdict.space_complexity}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-6">
          <span className="label-sm block text-ink/30 italic">Comprehensive Explanation</span>
          <p className="text-xl leading-relaxed text-gray-700 font-serif italic">
            "{verdict.explanation}"
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-8 space-y-6 border border-line">
          <div className="space-y-3">
            <span className="label-sm opacity-50 block">Key Insight</span>
            <p className="text-sm leading-relaxed text-gray-600 font-medium">
              {verdict.key_insight}
            </p>
          </div>
          <div className="pt-6 border-t border-line/10 space-y-2">
             <span className="label-sm opacity-50 block">Classification</span>
             <p className="data-mono text-xs uppercase font-bold text-ink/70">{verdict.paradigm}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
