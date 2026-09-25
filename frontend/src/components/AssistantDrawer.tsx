import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, X, Sparkles, ShieldCheck, FileText, 
  ExternalLink, ArrowUpRight, HelpCircle, Loader2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { ChatMessage, AssistantSource } from '../types';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetDocumentId?: string;
  targetDocumentTitle?: string;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  targetDocumentId,
  targetDocumentTitle,
}) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: targetDocumentTitle
        ? `Hello! I'm grounded in your document **${targetDocumentTitle}**. What would you like to know?`
        : "Hello! I am your Life Administration Assistant. Ask me anything about your documents, deadlines, licenses, contracts, or bills.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      grounded: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickQuestions = targetDocumentTitle
    ? [
        `When does this expire?`,
        `Summarize the key information`,
        `Who is listed on this document?`
      ]
    : [
        'When does my car license expire?',
        'How much was my latest electricity bill?',
        'Show me all documents related to my car',
        'Which documents expire this year?'
      ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.askAssistant(query, targetDocumentId);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        grounded: res.grounded,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I couldn't find that information in your documents.",
          grounded: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg h-full border-l border-slate-700/60 flex flex-col justify-between shadow-2xl bg-slate-950/95 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                AI Document Assistant
              </h3>
              <p className="text-xs text-slate-400">
                {targetDocumentTitle ? `Grounded in ${targetDocumentTitle}` : 'Grounded in all your documents'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'gradient-brand text-white shadow-md shadow-brand-500/15'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Sources & Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <p className="text-[11px] font-semibold text-brand-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{t('sourceLabel')} References:</span>
                    </p>
                    {msg.sources.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300"
                      >
                        <div className="font-semibold text-slate-200 flex items-center justify-between">
                          <span>{s.document_title} (Page {s.page_number})</span>
                          <span className="text-[10px] text-emerald-400 font-normal">
                            {Math.round(s.confidence * 100)}% verified
                          </span>
                        </div>
                        <p className="text-slate-400 mt-0.5 italic line-clamp-1">
                          "{s.excerpt}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-brand-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying facts against your documents...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/50">
          <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Quick Questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('askAnythingPlaceholder')}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl gradient-brand text-white shadow-md shadow-brand-500/20 hover:opacity-95 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
