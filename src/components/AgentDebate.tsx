import React from 'react';
import { DebateSession } from '../types';
import { motion } from 'motion/react';
import { User, Cpu } from 'lucide-react';

interface AgentDebateProps {
  debate: DebateSession;
}

export const AgentDebate: React.FC<AgentDebateProps> = ({ debate }) => {
  return (
    <div className="space-y-12">
      {/* Conversation Thread */}
      <div className="max-w-4xl mx-auto space-y-12 relative">
        {/* Connection Line */}
        <div className="absolute left-[34px] top-4 bottom-4 w-px bg-line hidden md:block" />

        {debate.exchanges.map((exchange, idx) => {
          const isA = exchange.agent_id === 'A';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={`flex gap-6 ${isA ? '' : 'flex-row-reverse md:flex-row'}`}
            >
              <div className={`shrink-0 w-16 h-16 rounded-2xl border flex items-center justify-center bg-white z-10 transition-colors shadow-sm ${
                isA ? 'border-ink/20 text-ink' : 'border-line text-line/40'
              }`}>
                {isA ? <User size={24} /> : <Cpu size={24} />}
              </div>
              
              <div className={`p-8 soft-card flex-grow relative ${
                isA ? 'bg-white' : 'bg-gray-50/50'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`label-sm ${isA ? 'text-ink font-bold' : 'text-line/60'}`}>
                      {isA ? 'AGENT A / CRITIC' : 'AGENT B / TEXTBOOK'}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${isA ? 'bg-red-400' : 'bg-blue-400'}`} />
                  </div>
                  <span className="text-[10px] font-mono opacity-20 uppercase tracking-tighter">Turn {idx + 1}</span>
                </div>

                <div className="text-base leading-relaxed whitespace-pre-wrap text-gray-700 font-serif">
                  {exchange.content}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Recap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div className="soft-card p-10 space-y-6">
          <span className="label-sm block opacity-40">Critic Position</span>
          <div className="space-y-4">
            <div>
               <span className="label-sm block text-[9px] mb-1">Time Complexity</span>
               <p className="data-mono text-xl text-red-600 font-bold">{debate.summaryA.time}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line/5">
                <div>
                  <span className="label-sm block text-[9px] mb-1">Space</span>
                  <p className="data-mono">{debate.summaryA.space}</p>
                </div>
                <div>
                  <span className="label-sm block text-[9px] mb-1">Paradigm</span>
                  <p className="data-mono text-[11px] truncate">{debate.summaryA.paradigm}</p>
                </div>
            </div>
          </div>
        </div>
        <div className="soft-card p-10 space-y-6">
          <span className="label-sm block opacity-40">Standard Position</span>
          <div className="space-y-4">
            <div>
               <span className="label-sm block text-[9px] mb-1">Time Complexity</span>
               <p className="data-mono text-xl text-blue-600 font-bold">{debate.summaryB.time}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line/5">
                <div>
                  <span className="label-sm block text-[9px] mb-1">Space</span>
                  <p className="data-mono">{debate.summaryB.space}</p>
                </div>
                <div>
                  <span className="label-sm block text-[9px] mb-1">Paradigm</span>
                  <p className="data-mono text-[11px] truncate">{debate.summaryB.paradigm}</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
