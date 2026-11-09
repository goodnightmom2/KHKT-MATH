import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ModuleCards, MODULES_CONFIG, ModuleData } from './components/ModuleCards';
import { SingleInequalityLab } from './components/SingleInequalityLab';
import { SystemInequalityLab } from './components/SystemInequalityLab/SystemInequalityLab';
import { OptimizationLab } from './components/OptimizationLab/OptimizationLab';
import { PracticeLab } from './components/PracticeLab/PracticeLab';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { TeacherGuideModal } from './components/TeacherGuideModal';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { UnderDevModal } from './components/UnderDevModal';
import { Footer } from './components/Footer';
import { LearningMode } from './types/math';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'lab' | 'system' | 'optimization' | 'quiz'>('home');
  const [learningMode, setLearningMode] = useState<LearningMode>('guided');

  // Default on launch is strictly Student Mode (isTeacherUnlocked = false)
  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const pendingAuthCallbackRef = useRef<(() => void) | null>(null);

  // Modals
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [underDevModule, setUnderDevModule] = useState<ModuleData | null>(null);

  const handleRequestTeacherAuth = (onUnlocked: () => void) => {
    if (isTeacherUnlocked) {
      onUnlocked();
      return;
    }
    pendingAuthCallbackRef.current = onUnlocked;
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsTeacherUnlocked(true);
    if (pendingAuthCallbackRef.current) {
      const cb = pendingAuthCallbackRef.current;
      pendingAuthCallbackRef.current = null;
      cb();
    }
  };

  const handleLockTeacherMode = () => {
    setIsTeacherUnlocked(false);
    setLearningMode('guided');
  };

  const handleSelectModule = (modId: string) => {
    const nextMode: LearningMode = isTeacherUnlocked && learningMode === 'teacher' ? 'teacher' : 'guided';
    if (modId === 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (modId === 'lab') {
      setLearningMode(nextMode);
      setCurrentView('lab');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (modId === 'system') {
      setLearningMode(nextMode);
      setCurrentView('system');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (modId === 'optimization') {
      setLearningMode(nextMode);
      setCurrentView('optimization');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (modId === 'quiz') {
      setLearningMode(nextMode);
      setCurrentView('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (modId === 'knowledge') {
      setIsKnowledgeModalOpen(true);
    } else {
      const found = MODULES_CONFIG.find(m => m.id === modId);
      if (found) {
        setUnderDevModule(found);
      }
    }
  };

  const handleStartExplore = () => {
    setLearningMode('guided');
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTeacherGuide = () => {
    handleRequestTeacherAuth(() => {
      setLearningMode('teacher');
      setIsTeacherModalOpen(true);
    });
  };

  const handleLaunchTeacherLab = () => {
    setIsTeacherModalOpen(false);
    handleRequestTeacherAuth(() => {
      setLearningMode('teacher');
      setCurrentView('lab');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleGoToLabFromModal = () => {
    setIsKnowledgeModalOpen(false);
    setUnderDevModule(null);
    setLearningMode('guided');
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 pb-16 md:pb-0">
      {/* App Header */}
      <Header
        currentModule={currentView}
        isTeacherUnlocked={isTeacherUnlocked}
        onSelectModule={handleSelectModule}
        onOpenTeacherGuide={handleOpenTeacherGuide}
        onLockTeacherMode={handleLockTeacherMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <>
            {/* Hero Section */}
            <Hero
              onStartExplore={handleStartExplore}
              onOpenTeacherGuide={handleOpenTeacherGuide}
            />

            {/* 5 Modules Navigation */}
            <ModuleCards onSelectModule={handleSelectModule} />
          </>
        ) : currentView === 'lab' ? (
          /* Single Inequality Interactive Laboratory (Module 2) */
          <SingleInequalityLab
            initialLearningMode={learningMode}
            isTeacherUnlocked={isTeacherUnlocked}
            onRequestTeacherAuth={handleRequestTeacherAuth}
            onBackToHome={() => setCurrentView('home')}
          />
        ) : currentView === 'system' ? (
          /* System of Inequalities Interactive Laboratory (Module 3) */
          <SystemInequalityLab
            initialLearningMode={learningMode}
            isTeacherUnlocked={isTeacherUnlocked}
            onRequestTeacherAuth={handleRequestTeacherAuth}
            onBackToHome={() => setCurrentView('home')}
          />
        ) : currentView === 'optimization' ? (
          /* Linear Programming & Optimization Laboratory (Module 4) */
          <OptimizationLab
            initialLearningMode={learningMode}
            isTeacherUnlocked={isTeacherUnlocked}
            onRequestTeacherAuth={handleRequestTeacherAuth}
            onBackToHome={() => setCurrentView('home')}
          />
        ) : (
          /* Practice, Step-by-Step Assessment & Personalization Center (Module 5) */
          <PracticeLab
            initialLearningMode={learningMode}
            isTeacherUnlocked={isTeacherUnlocked}
            onRequestTeacherAuth={handleRequestTeacherAuth}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onGoToLab={handleGoToLabFromModal}
      />

      <TeacherGuideModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onOpenTeacherLab={handleLaunchTeacherLab}
      />

      <TeacherAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          pendingAuthCallbackRef.current = null;
        }}
        onSuccess={handleAuthSuccess}
      />

      <UnderDevModal
        module={underDevModule}
        isOpen={!!underDevModule}
        onClose={() => setUnderDevModule(null)}
        onGoToLab={handleGoToLabFromModal}
      />
    </div>
  );
}
