import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, ShieldCheck, FileText, 
  ExternalLink, ChevronDown, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { ChatMessage, DocumentItem, AssistantSource } from '../types';
import { HelpIcon } from '../components/HelpIcon';

interface AssistantPageProps {
  onSelectDocument: (id: string) => void;
  initialQuery?: string;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  onSelectDocument,
  initialQuery = '',
}) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your Life Administration Assistant. Ask me anything about your documents, deadlines, licenses, contracts, or bills.\n\nEvery answer is strictly verified and cited from your documents.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      grounded: true
    }
  ]);
  const [input, setInput] = useState(initialQuery);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await api.getDocuments();
        setDocuments(res);
      } catch (err) {
        console.error(err);
      }
    };
    loadDocs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (queryText?: string) => {
    const query = (queryText || input).trim();
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
      const docFilter = selectedDocId !== 'all' ? selectedDocId : undefined;
      const res = await api.askAssistant(query, docFilter);
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

  const sampleQuestions = [
    'When does my car license expire?',
    'How much was my latest electricity bill?',
    'What documents do I have related to my car?',
    'What is the rent amount in my lease contract?',
    'Show me my National ID date of birth and governorate'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Hallucination Grounded Intelligence</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{t('assistantTitle')}</span>
            </h1>
            <HelpIcon tabId="assistant" size="md" />
            <HelpIcon tabId="assistant" variant="pill" label="About AI Assistant" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('assistantPrompt')}
          </p>
        </div>

        {/* Document Scope Filter */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <FileText className="w-4 h-4 text-brand-400 ml-2" />
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-transparent text-xs text-slate-200 py-1 pr-3 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Stored Documents</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-900">
                {d.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col h-[650px] shadow-2xl overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
                    : 'bg-slate-900/90 border border-slate-800/90 text-slate-100 shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounded Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-2">
                    <p className="text-xs font-semibold text-brand-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t('sourceLabel')} Citations:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => onSelectDocument(s.document_id)}
                          className="bg-slate-950/80 hover:bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 cursor-pointer transition-colors text-xs group"
                        >
                          <div className="font-semibold text-slate-200 group-hover:text-brand-400 transition-colors flex items-center justify-between">
                            <span className="truncate">{s.document_title}</span>
                            <span className="text-[10px] text-emerald-400 font-normal shrink-0 ml-1">
                              Pg {s.page_number}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                            "{s.excerpt}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 px-2">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-brand-400 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Grounded retrieval: embedding query, searching vectors, formulating answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] text-slate-500 shrink-0 font-medium">Examples:</span>
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors shrink-0 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your vehicle license, contracts, ID, or bills..."
              className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3.5 rounded-2xl gradient-brand text-white shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all disabled:opacity-40 flex items-center gap-2 font-semibold text-xs"
            >
              <span>Send</span>
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
