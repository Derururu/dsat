import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AlgorithmContext, DebateSession, Verdict } from '../types';
import { askProfessor } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, MessageCircle, Loader2 } from 'lucide-react';

interface StudentChatProps {
  ctx: AlgorithmContext;
  debate: DebateSession;
  verdict: Verdict;
}

export const StudentChat: React.FC<StudentChatProps> = ({ ctx, debate, verdict }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const answer = await askProfessor(ctx, debate, verdict, messages, input);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: answer,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your question right now. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="soft-card flex flex-col h-[500px] overflow-hidden">
      <div className="px-6 py-4 border-b border-line bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="opacity-40" />
          <span className="label-sm">Professor Consultation</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-6 bg-white/50"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
            <User size={40} className="mb-4" />
            <p className="label-sm max-w-[200px]">Any doubts? Ask the Professor about the algorithm or the debate.</p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={m.timestamp + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-ink text-bg shadow-sm' 
                  : 'bg-white border border-line shadow-sm font-serif'
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-line p-4 rounded-2xl flex items-center gap-2">
              <Loader2 size={16} className="animate-spin opacity-40" />
              <span className="label-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-line bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow bg-gray-50 border border-line/20 rounded-full px-5 py-2 text-sm focus:outline-none focus:border-ink transition-colors"
            placeholder="Ask a follow-up question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-ink text-bg flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
