import React, { useState } from 'react';
import { 
  Check, Edit3, X, Calendar, AlertTriangle, ShieldCheck, 
  Tag, Plus, Trash2, ArrowRight 
} from 'lucide-react';
import { DocumentItem, DocumentField, DocumentType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface HumanVerificationModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: (updated: DocumentItem) => void;
}

export const HumanVerificationModal: React.FC<HumanVerificationModalProps> = ({
  document,
  isOpen,
  onClose,
  onConfirmed,
}) => {
  const { t } = useLanguage();

  if (!isOpen || !document) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document.title);
  const [docType, setDocType] = useState<DocumentType>(document.document_type);
  const [issueDate, setIssueDate] = useState(document.issue_date || '');
  const [expiryDate, setExpiryDate] = useState(document.expiry_date || '');
  const [dueDate, setDueDate] = useState(document.due_date || '');
  const [fields, setFields] = useState<DocumentField[]>(document.fields || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (index: number, val: string) => {
    const updated = [...fields];
    updated[index].field_value = val;
    setFields(updated);
  };

  const handleAddField = () => {
    setFields([...fields, { field_name: 'Custom Field', field_value: '', confidence: 1.0 }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const updatedDoc = await api.confirmDocument(document.id, {
        title,
        document_type: docType,
        issue_date: issueDate || null,
        expiry_date: expiryDate || null,
        due_date: dueDate || null,
        fields: fields.map(f => ({ field_name: f.field_name, field_value: f.field_value })),
      });
      onConfirmed(updatedDoc);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex-1 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('reviewHeading')}</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-lg font-bold text-white focus:outline-none focus:border-brand-500"
                placeholder="Document Title"
              />
            ) : (
              <h2 className="text-xl font-bold text-white">
                {title || document.title}
              </h2>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {t('reviewSubheading')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Low confidence warning banner if applicable */}
        {document.confidence_score < 0.75 && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Review Recommended: </span>
              AI confidence score was {Math.round(document.confidence_score * 100)}%. Please verify or adjust the details below.
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          
          {/* Document Type Selector */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Document Type
              </label>
              <span className="text-[11px] text-slate-400">
                Confidence: {Math.round(document.confidence_score * 100)}%
              </span>
            </div>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              disabled={!isEditing}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 disabled:opacity-80 focus:outline-none focus:border-brand-500"
            >
              <option value="national_id">{t('type_national_id')}</option>
              <option value="vehicle_license">{t('type_vehicle_license')}</option>
              <option value="vehicle_insurance">{t('type_vehicle_insurance')}</option>
              <option value="rental_contract">{t('type_rental_contract')}</option>
              <option value="utility_bill">{t('type_utility_bill')}</option>
              <option value="certificate">{t('type_certificate')}</option>
              <option value="work_contract">{t('type_work_contract')}</option>
              <option value="other">{t('type_other')}</option>
            </select>
          </div>

          {/* Dates Section (Issue Date, Expiry Date, Due Date) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                disabled={!isEditing}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 disabled:opacity-80 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={!isEditing}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 disabled:opacity-80 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Due Date (Bills)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={!isEditing}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 disabled:opacity-80 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Structured Fields */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Extracted Fields ({fields.length})
              </h4>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddField}
                  className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              )}
            </div>

            {fields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2 pt-1">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={field.field_name}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[idx].field_name = e.target.value;
                        setFields(updated);
                      }}
                      className="w-1/3 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      value={field.field_value}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between py-2 border-b border-slate-800/80 last:border-0">
                    <span className="text-xs text-slate-400 font-medium">
                      {field.field_name}
                    </span>
                    <span className="text-xs text-slate-100 font-semibold text-right max-w-[60%] truncate">
                      {field.field_value}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Done Editing' : t('editBtn')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white gradient-brand shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{t('confirmBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
