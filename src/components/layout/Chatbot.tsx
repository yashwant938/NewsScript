'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  CornerDownLeft, 
  Bot,
  User,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  "What is trending in tech?",
  "How can I generate video hooks?",
  "Explain the top science story",
  "Write an outline for a TikTok script"
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your NewsScript AI Assistant. Ask me about today's trending news, script outlines, or general questions about using the platform!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!res.ok) throw new Error('Chat API returned an error');

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now. Please verify your AI API keys are configured." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-55">
      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-650 to-indigo-600 hover:from-violet-550 hover:to-indigo-500 text-white shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/50 cursor-pointer border border-indigo-500/20 transition-all active:scale-95 trending-badge-glow"
        title="Open Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Floating Chat Box Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] rounded-2xl border border-slate-900 bg-slate-950 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <header className="px-4 py-3 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">NewsScript Assistant</h3>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </header>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
              {messages.map((m, idx) => {
                const isBot = m.role === 'assistant';
                return (
                  <div key={idx} className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
                    {isBot && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-650/10 text-indigo-400 border border-indigo-500/25 flex-shrink-0">
                        <Bot size={12} />
                      </div>
                    )}
                    
                    <div className={`rounded-xl px-3.5 py-2.5 max-w-[80%] text-xs leading-relaxed ${
                      isBot 
                        ? 'bg-slate-900 text-slate-200 border border-slate-850 whitespace-pre-line' 
                        : 'bg-indigo-600 text-white font-medium'
                    }`}>
                      {m.content}
                    </div>

                    {!isBot && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-slate-400 border border-slate-800 flex-shrink-0">
                        <User size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-650/10 text-indigo-400 border border-indigo-500/25">
                    <Bot size={12} />
                  </div>
                  <div className="bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions list (only shown when not loading) */}
            {messages.length === 1 && !loading && (
              <div className="px-4 py-2 border-t border-slate-900/60 bg-slate-950">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Suggested Topics</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug)}
                      className="text-[10px] text-slate-400 hover:text-indigo-400 border border-slate-900 hover:border-indigo-500/20 bg-slate-900/20 hover:bg-indigo-500/5 rounded px-2 py-1 transition-all text-left flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={8} />
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-850">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="relative rounded-lg border border-slate-800 bg-slate-950/80 p-1 flex items-center focus-within:border-indigo-500/40 transition-all"
              >
                <input
                  type="text"
                  placeholder="Ask Assistant..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-transparent border-0 px-2 py-1 text-xs text-slate-200 placeholder-slate-550 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || loading}
                  className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all cursor-pointer"
                >
                  <Send size={12} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
