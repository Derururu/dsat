import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AlgorithmContext, DebateSession, Verdict } from '../types';
import { askProfessor } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, MessageCircle, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
    <div className="soft-card flex flex-col h-[600px] overflow-hidden bg-white">
      <div className="px-6 py-4 border-b border-line bg-white flex items-center gap-4 z-10 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink">Professor Turing</h3>
          <span className="text-[11px] font-medium text-green-600 uppercase tracking-wider flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Online
          </span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/80"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <MessageCircle size={48} className="mb-4 text-ink/40" />
            <h3 className="font-bold text-ink mb-2">Professor Consultation</h3>
            <p className="text-sm max-w-[250px] text-ink/70">Any doubts? Ask the Professor about the algorithm or the debate.</p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={m.timestamp + i}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mr-3 mt-auto">
                  <User size={16} />
                </div>
              )}
              
              <div className={`max-w-[85%] md:max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm block whitespace-pre-wrap ${
                m.role === 'user' 
                  ? 'bg-ink text-bg rounded-2xl rounded-br-[4px]' 
                  : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-[4px] markdown-body'
              }`}>
                {m.role === 'user' ? (
                  m.content
                ) : (
                  <Markdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {m.content}
                  </Markdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start w-full"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mr-3 mt-auto">
              <User size={16} />
            </div>
            <div className="bg-gray-100 border border-transparent px-5 py-3.5 rounded-2xl rounded-bl-[4px] flex items-center gap-2 shadow-sm">
              <div className="flex gap-1.5">
                <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-line bg-white">
        <div className="flex gap-3 max-w-4xl mx-auto items-end">
          <textarea
            className="flex-grow bg-gray-50 border border-line/20 rounded-2xl px-5 py-3 text-[15px] focus:outline-none focus:border-ink/50 focus:ring-4 focus:ring-ink/5 transition-all resize-none min-h-[50px] max-h-[150px]"
            placeholder="Message the Professor..."
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 shrink-0 bg-ink text-bg flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 mb-[1px]"
          >
            <Send size={20} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
