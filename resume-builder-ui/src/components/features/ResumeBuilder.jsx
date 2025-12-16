import React from 'react';
import { useResumeStore } from '../../store';
import { AnimatePresence, motion } from 'framer-motion';
import StepIndicator from './StepIndicator';
import UnifiedInput from './UnifiedInput';
import GapInterview from './GapInterview';
import Workspace from './Workspace';

export default function ResumeBuilder({ isSidePanel = false }) {
    const currentStep = useResumeStore((state) => state.currentStep);

    return (
        <div className="w-full">
            {!isSidePanel && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">New Resume</h2>
                    <p className="text-slate-500">Create a tailored resume for a specific job description.</p>
                </div>
            )}

            <StepIndicator current={currentStep} />

            <AnimatePresence mode="wait">
                <motion.main
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full mt-8"
                >
                    {currentStep === 1 && <UnifiedInput />}
                    {currentStep === 2 && <GapInterview />}
                    {currentStep === 3 && <Workspace />}
                </motion.main>
            </AnimatePresence>
        </div>
    );
}
