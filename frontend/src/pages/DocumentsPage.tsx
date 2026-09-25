import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, SlidersHorizontal, LayoutGrid, List, 
  Sparkles, Plus, Clock, FileText, ChevronDown, Check, X 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { DocumentItem, DocumentCategory, DocumentStatus } from '../types';
import { DocumentCard } from '../components/DocumentCard';
import { StatusBadge } from '../components/StatusBadge';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface DocumentsPageProps {
  onSelectDocument: (id: string) => void;
  onOpenUpload: () => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  onSelectDocument,
  onOpenUpload,
}) => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [allDocs, setAllDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories: DocumentCategory[] = [
    'all', 'personal', 'vehicle', 'home', 'work', 'education', 'finance', 'other'
  ];

  const fetchDocs = async () => {
    setLoading(true);
    try {
      if (searchQuery.trim() && useSemanticSearch) {
        const results = await api.search(searchQuery.trim(), true);
        const mapped = results.map(r => r.document);
        setDocuments(mapped);
      } else {
        const res = await api.getDocuments({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status_filter: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchQuery.trim() || undefined,
          sort_by: sortBy,
        });
        setDocuments(res);
        if (selectedCategory === 'all' && selectedStatus === 'all' && !searchQuery) {
          setAllDocs(res);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedCategory, selectedStatus, sortBy]);

  useEffect(() => {
    // Initial load for global category count tallies
    api.getDocuments().then(res => setAllDocs(res)).catch(() => {});
  }, []);

  const getCategoryCount = (cat: DocumentCategory) => {
    if (cat === 'all') return allDocs.length;
    return allDocs.filter(d => d.category === cat).length;
  };

  const getStatusCount = (st: string) => {
    if (st === 'all') return allDocs.length;
    return allDocs.filter(d => d.status === st).length;
  };


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocs();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{t('documents')}</span>
            <span className="text-base sm:text-lg font-normal text-slate-400">
              (<AnimatedCounter value={allDocs.length || documents.length} />)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organized, structured, and searchable life document repository
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white gradient-brand shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('uploadDoc')}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, extracted fields, numbers, or provider..."
              className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTimeout(fetchDocs, 10);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Semantic Search Toggle */}
          <button
            type="button"
            onClick={() => setUseSemanticSearch(!useSemanticSearch)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              useSemanticSearch
                ? 'bg-brand-500/15 border-brand-500/40 text-brand-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${useSemanticSearch ? 'text-brand-400' : 'text-slate-500'}`} />
            <span>Semantic Search</span>
            {useSemanticSearch && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 ml-1"></span>}
          </button>

          {/* Sort Control */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="created_at">Sort by Date Added</option>
            <option value="expiry_date">Sort by Expiration Date</option>
            <option value="title">Sort by Name</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs with Dynamic Number Counters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 border-t border-slate-800/60 no-scrollbar">
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{t(`cat_${cat}`)}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                  selectedCategory === cat ? 'bg-brand-500/30 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <AnimatedCounter value={count} duration={500} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter Sub-Bar with Counters */}
      <div className="flex items-center gap-2 text-xs text-slate-400 px-1 overflow-x-auto no-scrollbar">
        <span className="font-semibold text-slate-500">Status:</span>
        {['all', 'safe', 'attention_soon', 'expired', 'needs_review'].map((st) => {
          const count = getStatusCount(st);
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === st
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{st === 'all' ? 'All' : t(`status_${st}`)}</span>
              <span className="text-[10px] font-mono opacity-80">
                (<AnimatedCounter value={count} duration={500} />)
              </span>
            </button>
          );
        })}
      </div>

      {/* Documents Grid / List */}
      {loading ? (
        <div className="text-center py-16 glass-card rounded-2xl text-slate-400 text-xs">
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No documents found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filters, or upload your first personal document now.
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-brand shadow-md shadow-brand-500/20"
          >
            {t('uploadDoc')}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onClick={() => onSelectDocument(doc.id)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc.id)}
              className="p-4 hover:bg-slate-900/60 cursor-pointer transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{doc.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t(`type_${doc.document_type}`)} • {t(`cat_${doc.category}`)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <StatusBadge status={doc.status} />
                <span className="text-xs text-slate-400 hidden sm:block">
                  {doc.expiry_date ? `Exp: ${doc.expiry_date}` : new Date(doc.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
