import React from 'react';
import { HistoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, Clock, Award, Trash2 } from 'lucide-react';

interface HistoryBarProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
}

export const HistoryBar: React.FC<HistoryBarProps> = ({ 
  history, 
  isOpen, 
  onClose, 
  onClear,
  onSelect 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l-2 border-ink z-50 flex flex-col"
          >
            <div className="p-6 border-b border-line flex justify-between items-center bg-ink text-bg">
              <div className="flex items-center gap-2">
                <History size={18} />
                <span className="label-sm">Session History</span>
              </div>
              <button onClick={onClose} className="hover:opacity-60">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                  <Clock size={48} className="mb-4" />
                  <p className="label-sm">No previous sessions found</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                        onSelect(item);
                        onClose();
                    }}
                    className="w-full text-left p-4 border border-line/10 hover:border-ink transition-all group relative bg-gray-50/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-mono opacity-40">
                         {new Date(item.timestamp).toLocaleDateString()}
                       </span>
                       <div className="flex items-center gap-1 text-green-600">
                         <Award size={12} />
                         <span className="font-mono text-[10px] font-bold">{item.score}/{item.totalQuestions}</span>
                       </div>
                    </div>
                    <h4 className="font-black uppercase tracking-tight text-sm truncate">{item.name}</h4>
                    <p className="data-mono text-[10px] opacity-60 mt-1">{item.timeComplexity}</p>
                    
                    <div className="absolute right-2 bottom-2 transition-opacity">
                       <span className="label-sm text-[8px] underline opacity-40 group-hover:opacity-100">View Details</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-line">
                <button 
                  onClick={onClear}
                  className="w-full py-3 flex items-center justify-center gap-2 label-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Clear All History
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
