
import React from 'react';
import { useResumeStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';
import StepIndicator from './components/features/StepIndicator';
import FileUpload from './components/features/FileUpload';
import JobInput from './components/features/JobInput';
import GapInterview from './components/features/GapInterview';
import Workspace from './components/features/Workspace';

export default function App() {
  const currentStep = useResumeStore((state) => state.currentStep);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-sky-100 selection:text-sky-900">
      <StepIndicator current={currentStep} />

      <AnimatePresence mode="wait">
        <motion.main
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {currentStep === 1 && <FileUpload />}
          {currentStep === 2 && <JobInput />}
          {currentStep === 3 && <GapInterview />}
          {currentStep === 4 && <Workspace />}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
