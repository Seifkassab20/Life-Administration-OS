import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { Navbar } from './components/Navbar';
import { MobileTabBar } from './components/MobileTabBar';
import { UploadModal } from './components/UploadModal';
import { HumanVerificationModal } from './components/HumanVerificationModal';
import { AssistantDrawer } from './components/AssistantDrawer';
import { OnboardingTour } from './components/OnboardingTour';
import { TabGuideModal } from './components/TabGuideModal';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { RemindersPage } from './pages/RemindersPage';
import { AssistantPage } from './pages/AssistantPage';
import { DocumentItem } from './types';
import { api } from './services/api';
import { Bot, Sparkles, Compass, HelpCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { startTour, openTabGuide } = useOnboarding();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docCount, setDocCount] = useState<number>(7);
  const [reminderCount, setReminderCount] = useState<number>(2);
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [verifyDoc, setVerifyDoc] = useState<DocumentItem | null>(null);
  const [isAssistantDrawerOpen, setIsAssistantDrawerOpen] = useState(false);
  const [assistantTargetDoc, setAssistantTargetDoc] = useState<{ id?: string; title?: string }>({});
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');

  // Fetch initial counts
  useEffect(() => {
    if (isAuthenticated) {
      api.getDashboard().then((dash) => {
        if (dash?.total_documents !== undefined) {
          setDocCount(dash.total_documents);
        }
        if (dash?.expiring_soon_count !== undefined) {
          setReminderCount(dash.expiring_soon_count);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Navigation handlers
  const handleNavigate = (tab: string) => {
    setSelectedDocId(null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    setCurrentTab('document-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadSuccess = (doc: DocumentItem) => {
    setIsUploadOpen(false);
    setDocCount((prev) => prev + 1);
    // Automatically trigger Human Verification review modal
    setVerifyDoc(doc);
  };

  const handleOpenAssistant = (query?: string) => {
    if (query) {
      setAssistantInitialQuery(query);
      setCurrentTab('assistant');
    } else {
      setAssistantTargetDoc({});
      setIsAssistantDrawerOpen(true);
    }
  };

  const handleAskAboutDoc = (docId: string, title: string) => {
    setAssistantTargetDoc({ id: docId, title });
    setIsAssistantDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      
      {/* Global Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAssistant={() => handleOpenAssistant()}
        documentsCount={docCount}
        remindersCount={reminderCount}
      />

      {/* Main Page Layout (with padding for mobile bottom bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {!isAuthenticated ? (
          currentTab === 'login' ? (
            <LoginPage
              onSuccess={() => handleNavigate('dashboard')}
              onNavigateSignUp={() => handleNavigate('signup')}
            />
          ) : currentTab === 'signup' ? (
            <SignUpPage
              onSuccess={() => handleNavigate('dashboard')}
              onNavigateLogin={() => handleNavigate('login')}
            />
          ) : (
            <LandingPage
              onGetStarted={() => handleNavigate('signup')}
              onExploreDemo={() => handleNavigate('dashboard')}
            />
          )
        ) : currentTab === 'document-detail' && selectedDocId ? (
          <DocumentDetailPage
            documentId={selectedDocId}
            onBack={() => handleNavigate('documents')}
            onAskAboutDoc={handleAskAboutDoc}
          />
        ) : currentTab === 'documents' ? (
          <DocumentsPage
            onSelectDocument={handleSelectDocument}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        ) : currentTab === 'reminders' ? (
          <RemindersPage onSelectDocument={handleSelectDocument} />
        ) : currentTab === 'assistant' ? (
          <AssistantPage
            onSelectDocument={handleSelectDocument}
            initialQuery={assistantInitialQuery}
          />
        ) : (
          <DashboardPage
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenAssistant={handleOpenAssistant}
            onSelectDocument={handleSelectDocument}
            onNavigateDocuments={() => handleNavigate('documents')}
            onNavigateReminders={() => handleNavigate('reminders')}
          />
        )}
      </main>

      {/* Floating Assistant Trigger Pill (Desktop/Tablet) */}
      {isAuthenticated && currentTab !== 'assistant' && (
        <button
          onClick={() => handleOpenAssistant()}
          className="hidden md:flex fixed bottom-6 right-6 z-30 px-4 py-3 rounded-full gradient-brand text-white shadow-xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all items-center gap-2 group font-semibold text-xs"
        >
          <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Ask Documents</span>
        </button>
      )}

      {/* Floating Tour & Guide Trigger Pill (Replay anytime) */}
      {isAuthenticated && (
        <button
          onClick={() => startTour(0)}
          title="Interactive App Tour (Replay anytime)"
          className="fixed bottom-6 left-6 z-30 hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-sand border border-sand/30 hover:border-sand/60 shadow-xl backdrop-blur-md text-xs font-bold transition-all active:scale-95 group"
        >
          <Compass className="w-4 h-4 text-sand group-hover:rotate-45 transition-transform" />
          <span>App Tour</span>
        </button>
      )}

      {/* Dedicated Mobile Bottom Tab Bar */}
      {isAuthenticated && (
        <MobileTabBar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenScan={() => setIsUploadOpen(true)}
          urgentCount={reminderCount}
          documentsCount={docCount}
        />
      )}

      {/* Global Interactive Onboarding Tour & Tab Guide */}
      <OnboardingTour
        onNavigateTab={handleNavigate}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <TabGuideModal
        onNavigateTab={handleNavigate}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Global Modals & Drawers */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <HumanVerificationModal
        document={verifyDoc}
        isOpen={!!verifyDoc}
        onClose={() => setVerifyDoc(null)}
        onConfirmed={(updated) => {
          setVerifyDoc(null);
          handleSelectDocument(updated.id);
        }}
      />

      <AssistantDrawer
        isOpen={isAssistantDrawerOpen}
        onClose={() => setIsAssistantDrawerOpen(false)}
        targetDocumentId={assistantTargetDoc.id}
        targetDocumentTitle={assistantTargetDoc.title}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <OnboardingProvider>
          <AppContent />
        </OnboardingProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
