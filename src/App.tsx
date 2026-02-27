import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, Terminal, Sparkles, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getChatResponse } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Cortex. I'm here to help you with your daily tasks and coding projects. What can I do for you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const response = await getChatResponse(input, history);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error. Please check your connection or try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Chat cleared. I'm Cortex, how can I help you now?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-bottom border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cortex-accent flex items-center justify-center shadow-lg shadow-cortex-accent/20">
            <Terminal className="text-cortex-bg w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Cortex <span className="text-xs font-mono bg-cortex-accent/20 text-cortex-accent px-2 py-0.5 rounded uppercase tracking-widest">v1.0</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/50 font-mono">NEURAL ASSISTANT // CODING SPECIALIST</p>
              <span className="text-[10px] text-cortex-accent/40 font-mono uppercase tracking-widest border-l border-white/10 pl-2">Created by Kushal</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-red-400"
          title="Clear Chat"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
                message.role === 'user' ? "bg-white/10" : "bg-cortex-accent/20 text-cortex-accent"
              )}>
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "max-w-[85%] rounded-2xl p-4 shadow-sm",
                message.role === 'user' 
                  ? "bg-white/5 border border-white/10" 
                  : "bg-cortex-card border border-white/5"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div className="mt-2 text-[10px] opacity-30 font-mono uppercase tracking-tighter">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 items-center"
          >
            <div className="w-8 h-8 rounded-lg bg-cortex-accent/20 text-cortex-accent flex items-center justify-center animate-pulse">
              <Sparkles size={16} />
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-cortex-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-cortex-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-cortex-accent rounded-full animate-bounce"></div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cortex-accent/20 to-purple-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
        <form 
          onSubmit={handleSend}
          className="relative bg-cortex-card border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl"
        >
          <div className="pl-3 text-white/20">
            <ChevronRight size={20} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Cortex for code or daily help..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 py-3"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
              input.trim() && !isLoading 
                ? "bg-cortex-accent text-cortex-bg shadow-lg shadow-cortex-accent/20 hover:scale-105 active:scale-95" 
                : "bg-white/5 text-white/20"
            )}
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          { label: "Write a React hook", icon: <Code size={14} /> },
          { label: "Explain async/await", icon: <Terminal size={14} /> },
          { label: "Plan my day", icon: <Sparkles size={14} /> }
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => setInput(action.label)}
            className="text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-white/40 hover:text-white/80"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
