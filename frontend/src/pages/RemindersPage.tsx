import React, { useState, useEffect } from 'react';
import { 
  Bell, Clock, CheckCircle2, AlertCircle, Plus, 
  Calendar, Trash2, X, Check, Filter 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { ReminderItem } from '../types';

interface RemindersPageProps {
  onSelectDocument: (docId: string) => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({ onSelectDocument }) => {
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newDaysBefore, setNewDaysBefore] = useState(7);
  const [newDesc, setNewDesc] = useState('');

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await api.getReminders();
      setReminders(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissReminder(id);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTargetDate) return;

    try {
      const created = await api.createReminder({
        title: newTitle,
        target_date: newTargetDate,
        days_before: Number(newDaysBefore),
        description: newDesc,
      });
      setReminders([created, ...reminders]);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewTargetDate('');
      setNewDesc('');
    } catch (err) {
      alert('Failed to create reminder');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('reminders')} & Deadlines
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts scheduled 30 days, 7 days, and 1 day before expiration
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white gradient-brand shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Reminder</span>
        </button>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="text-center py-16 glass-card rounded-2xl text-slate-400 text-xs">
          Loading active reminders...
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No active reminders</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Uploaded documents with expiration dates will automatically generate reminder schedules here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((rem) => {
            const isUrgent = rem.days_remaining <= 7;
            const isPast = rem.days_remaining < 0;

            return (
              <div
                key={rem.id}
                className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isPast
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : isUrgent
                      ? 'bg-sand/15 text-sand border border-sand/30'
                      : 'bg-brand-500/10 text-sand border border-brand-500/20'
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {rem.title}
                    </h3>
                    {rem.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {rem.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <span>Target: {new Date(rem.target_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Trigger: {rem.days_before} days prior</span>
                      {rem.document_title && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => rem.document_id && onSelectDocument(rem.document_id)}
                            className="text-brand-400 hover:underline font-medium"
                          >
                            {rem.document_title}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isPast
                      ? 'bg-rose-500/10 text-rose-400'
                      : isUrgent
                      ? 'bg-sand/15 text-sand'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isPast ? 'Expired' : `${rem.days_remaining} days left`}
                  </span>

                  <button
                    onClick={() => handleDismiss(rem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Mark Done / Dismiss"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700/60 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Custom Reminder</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Renew Passport"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Deadline Date
                </label>
                <input
                  type="date"
                  required
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Remind Me Before
                </label>
                <select
                  value={newDaysBefore}
                  onChange={(e) => setNewDaysBefore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value={30}>30 days before</option>
                  <option value={14}>14 days before</option>
                  <option value={7}>7 days before</option>
                  <option value={1}>1 day before</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Instructions or notes..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white gradient-brand shadow-md"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
