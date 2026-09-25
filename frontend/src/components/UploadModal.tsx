import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, X, 
  Loader2, Sparkles, Eye, ArrowRight, Camera, Image as ImageIcon 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { DocumentItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (doc: DocumentItem) => void;
}

type UploadStep = 'idle' | 'uploading' | 'reading' | 'understanding' | 'extracting' | 'complete';

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('other');
  const [step, setStep] = useState<UploadStep>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processedDoc, setProcessedDoc] = useState<DocumentItem | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    setStep('uploading');
    setProgress(15);

    try {
      // Step: Reading
      setTimeout(() => {
        setStep('reading');
        setProgress(35);
      }, 600);

      // Step: Understanding
      setTimeout(() => {
        setStep('understanding');
        setProgress(65);
      }, 1300);

      // Step: Extracting
      setTimeout(() => {
        setStep('extracting');
        setProgress(85);
      }, 2000);

      const doc = await api.uploadDocument(selectedFile, docTitle, docType);

      setTimeout(() => {
        setStep('complete');
        setProgress(100);
        setProcessedDoc(doc);
      }, 2600);

    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed');
      setStep('idle');
    }
  };

  const handleConfirmAndClose = () => {
    if (processedDoc) {
      onUploadSuccess(processedDoc);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedFile(null);
    setDocTitle('');
    setDocType('other');
    setStep('idle');
    setProgress(0);
    setErrorMessage(null);
    setProcessedDoc(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl max-sm:rounded-t-3xl max-sm:rounded-b-none sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 relative max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Mobile handle bar indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto -mt-2 mb-4 sm:hidden"></div>

        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="w-11 h-11 rounded-2xl bg-sand/15 border border-sand/30 flex items-center justify-center text-sand mb-3">
            <Camera className="w-5 h-5 sm:hidden" />
            <UploadCloud className="w-5 h-5 hidden sm:block" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {t('uploadDoc')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scan via camera or select a PDF/image from your device
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Body based on step */}
        {step === 'idle' ? (
          <div className="space-y-4">
            
            {/* Quick Capture Options (Mobile First) */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-4 rounded-2xl bg-sand/10 hover:bg-sand/20 border border-sand/30 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-full bg-sand/20 text-sand flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-sand">Camera Scan</span>
                <span className="text-[10px] text-slate-400 -mt-1">Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200">Browse Files</span>
                <span className="text-[10px] text-slate-400 -mt-1">PDF or Images</span>
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                selectedFile
                  ? 'border-sand/60 bg-sand/5'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
              }`}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-sand/20 text-sand flex items-center justify-center mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-white truncate max-w-[260px]">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                  </p>
                  <span className="mt-2 text-[11px] text-sand font-medium">Tap to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-xs font-medium text-slate-300">Or drag and drop files here</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">PDF, JPG, PNG up to 25MB</p>
                </div>
              )}
            </div>

            {/* Title & Category Input */}
            {selectedFile && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. My Vehicle License"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sand"
                  >
                    <option value="other">Auto-detect with AI (Recommended)</option>
                    <option value="national_id">{t('type_national_id')}</option>
                    <option value="vehicle_license">{t('type_vehicle_license')}</option>
                    <option value="vehicle_insurance">{t('type_vehicle_insurance')}</option>
                    <option value="rental_contract">{t('type_rental_contract')}</option>
                    <option value="utility_bill">{t('type_utility_bill')}</option>
                    <option value="certificate">{t('type_certificate')}</option>
                    <option value="work_contract">{t('type_work_contract')}</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartUpload}
                    className="w-full py-3 rounded-xl text-xs font-semibold text-white gradient-brand shadow-lg shadow-sand/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Process with AI</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : step === 'complete' && processedDoc ? (
          /* Processing Complete State */
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center mx-auto animate-bounce-subtle">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('step_complete')}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Classified as <strong className="text-sand">{t(`type_${processedDoc.document_type}`)}</strong> with {Math.round(processedDoc.confidence_score * 100)}% confidence.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleConfirmAndClose}
                className="w-full py-3 rounded-xl text-xs font-semibold text-white gradient-brand shadow-lg shadow-sand/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Review & Confirm Fields</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        ) : (
          /* Multi-step Visual Progress */
          <div className="py-8 space-y-6">
            <div className="text-center space-y-2">
              <Loader2 className="w-9 h-9 text-sand animate-spin mx-auto" />
              <h3 className="text-sm font-semibold text-white">
                {step === 'uploading' && t('step_uploading')}
                {step === 'reading' && t('step_reading')}
                {step === 'understanding' && t('step_understanding')}
                {step === 'extracting' && t('step_extracting')}
              </h3>
              <p className="text-xs text-slate-400">
                Running OCR, document classification, and structured field extraction...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="gradient-brand h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-[10px] text-center text-slate-400">
              <span className={step === 'uploading' ? 'text-sand font-bold' : ''}>Upload</span>
              <span className={step === 'reading' ? 'text-sand font-bold' : ''}>OCR</span>
              <span className={step === 'understanding' ? 'text-sand font-bold' : ''}>Classify</span>
              <span className={step === 'extracting' ? 'text-sand font-bold' : ''}>Extract</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
