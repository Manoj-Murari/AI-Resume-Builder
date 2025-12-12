
import React from 'react';
import { useResumeStore } from '../../store';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

function StepIndicator({ current }) {
    const { setStep, parsedResume, gapAnalysis, tailoredResume } = useResumeStore();

    const isStepUnlocked = (stepIdx) => {
        if (stepIdx === 0) return true;
        if (stepIdx === 1) return !!parsedResume;
        if (stepIdx === 2) return !!gapAnalysis;
        if (stepIdx === 3) return !!tailoredResume;
        return false;
    };

    const steps = ['Upload', 'Analyze', 'Interview', 'Workspace'];

    return (
        <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4">
                <div className="flex justify-between items-center relative">
                    {steps.map((label, idx) => {
                        const stepNum = idx + 1;
                        const isActive = stepNum === current;
                        const isDone = stepNum < current;
                        const unlocked = isStepUnlocked(idx);

                        return (
                            <button
                                key={label}
                                onClick={() => unlocked && setStep(stepNum)}
                                disabled={!unlocked}
                                className={clsx(
                                    "flex items-center gap-3 z-10 bg-white px-2 transition-opacity",
                                    !unlocked && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                                    isActive ? "bg-sky-600 text-white ring-4 ring-sky-100 scale-110" :
                                        isDone ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                    {isDone ? <Check className="w-4 h-4" /> : stepNum}
                                </div>
                                <span className={clsx("text-sm font-medium hidden sm:block", isActive ? "text-slate-800" : "text-slate-400")}>{label}</span>
                            </button>
                        );
                    })}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-0" />
                    <motion.div
                        className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -z-0"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((current - 1) / 3) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    );
}

export default StepIndicator;
