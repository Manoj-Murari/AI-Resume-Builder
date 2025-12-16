
import React, { useState, useRef } from 'react';
import { useResumeStore } from '../../store';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { AlertTriangle, Sparkles, Loader2, FileText, CheckCircle2, Lightbulb } from 'lucide-react';
import clsx from 'clsx';

function GapInterview() {
    const { gapAnalysis, handleGeneration, isLoading, suggestGapAnswer } = useResumeStore();
    const [answers, setAnswers] = useState({});
    const [skipped, setSkipped] = useState({}); // Track skipped questions
    const [isSuggesting, setIsSuggesting] = useState({});
    const textRefs = useRef({});

    // Helper to update answers
    const updateAnswer = (skill, value) => {
        setAnswers(prev => ({ ...prev, [skill]: value }));
        // If answering, ensure it's un-skipped
        if (skipped[skill]) {
            setSkipped(prev => {
                const newSkipped = { ...prev };
                delete newSkipped[skill];
                return newSkipped;
            });
        }
    };

    const toggleSkip = (skill) => {
        if (skipped[skill]) {
            // Un-skip
            setSkipped(prev => {
                const newSkipped = { ...prev };
                delete newSkipped[skill];
                return newSkipped;
            });
        } else {
            // Skip
            setSkipped(prev => ({ ...prev, [skill]: true }));
            // Clear answer if skipped
            setAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[skill];
                return newAnswers;
            });
        }
    };

    const handleSuggestClick = async (skill) => {
        setIsSuggesting(prev => ({ ...prev, [skill]: true }));
        const suggestion = await suggestGapAnswer(skill);

        if (suggestion) {
            updateAnswer(skill, suggestion);

            // Auto-highlight [Project Name]
            setTimeout(() => {
                const textarea = textRefs.current[skill];
                if (textarea) {
                    const idx = suggestion.indexOf("[Project Name]");
                    if (idx !== -1) {
                        textarea.focus();
                        textarea.setSelectionRange(idx, idx + "[Project Name]".length);
                    }
                }
            }, 100);
        }
        setIsSuggesting(prev => ({ ...prev, [skill]: false }));
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 pb-32">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Match Score</span>
                    <span className={clsx("font-bold text-lg", gapAnalysis.match_score > 70 ? "text-emerald-600" : "text-amber-600")}>
                        {gapAnalysis.match_score}/100
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Review & Refine</h2>
                <p className="text-slate-500 mt-2">Help the AI fill in these gaps to boost your compatibility.</p>
            </div>

            <div className="space-y-4">
                {gapAnalysis.gaps.map((gap, idx) => {
                    const isSkipped = skipped[gap.missing_skill];
                    const isBinary = gap.type === 'binary';

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isSkipped ? 0.6 : 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={clsx(
                                "bg-white rounded-xl border transition-all duration-300",
                                isSkipped ? "border-slate-100 bg-slate-50 grayscale-[50%]" : "border-slate-200 shadow-sm hover:shadow-md"
                            )}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-grow">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                            isSkipped ? "bg-slate-100 text-slate-400" : "bg-amber-50 text-amber-600"
                                        )}>
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={clsx("font-bold text-lg", isSkipped ? "text-slate-400" : "text-slate-800")}>
                                                    {gap.missing_skill}
                                                </h3>
                                                {isBinary && <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">Skill Check</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 mb-3">{gap.context}</p>

                                            {!isSkipped && (
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-2">
                                                    <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3 text-sky-500" /> {gap.question}
                                                    </p>

                                                    {isBinary ? (
                                                        // BINARY UI
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        if (answers[gap.missing_skill]) {
                                                                            // Toggle OFF
                                                                            const newAnswers = { ...answers };
                                                                            delete newAnswers[gap.missing_skill];
                                                                            setAnswers(newAnswers);
                                                                        } else {
                                                                            // Toggle ON
                                                                            updateAnswer(gap.missing_skill, "Yes, I have this skill.");
                                                                        }
                                                                    }}
                                                                    className={clsx(
                                                                        "px-4 py-2 rounded-lg text-sm font-semibold border transition-all flex items-center gap-2",
                                                                        answers[gap.missing_skill] ? "bg-emerald-600 border-emerald-600 text-white shadow-md hover:bg-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                                                                    )}
                                                                >
                                                                    {answers[gap.missing_skill] ? (
                                                                        <>
                                                                            <CheckCircle2 className="w-4 h-4" /> Verified
                                                                        </>
                                                                    ) : "Verify Skill"}
                                                                </button>
                                                            </div>
                                                            {answers[gap.missing_skill] && (
                                                                <motion.p
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    className="text-xs text-emerald-600 font-medium flex items-center gap-1"
                                                                >
                                                                    ✓ Skill confirmed. AI will include this.
                                                                </motion.p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // ELABORATE UI
                                                        <div className="relative">
                                                            <textarea
                                                                ref={el => textRefs.current[gap.missing_skill] = el}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all pr-24"
                                                                placeholder="e.g., I have used this in..."
                                                                rows={3}
                                                                value={answers[gap.missing_skill] || ''}
                                                                onChange={(e) => updateAnswer(gap.missing_skill, e.target.value)}
                                                            />
                                                            <button
                                                                onClick={() => handleSuggestClick(gap.missing_skill)}
                                                                disabled={isSuggesting[gap.missing_skill]}
                                                                className="absolute bottom-3 right-3 text-xs bg-amber-50 text-amber-700 font-medium px-2 py-1 rounded-md hover:bg-amber-100 border border-amber-100 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                                            >
                                                                {isSuggesting[gap.missing_skill] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3 text-amber-500" />}
                                                                {isSuggesting[gap.missing_skill] ? "Thinking..." : "Suggest"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skip Button */}
                                    <button
                                        onClick={() => toggleSkip(gap.missing_skill)}
                                        className={clsx(
                                            "text-xs font-semibold px-3 py-1.5 rounded-md transition-all",
                                            isSkipped
                                                ? "bg-slate-200 text-slate-600 hover:bg-slate-300" // Unskip style
                                                : "bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600" // Skip style
                                        )}
                                    >
                                        {isSkipped ? "Undo" : "Skip"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-500 hidden sm:block">
                        <strong>{Object.keys(answers).length}</strong> questions answered • <strong>{Object.keys(skipped).length}</strong> skipped
                    </p>
                    <Button
                        onClick={() => handleGeneration(answers)}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-8 py-3 text-lg shadow-xl"
                        icon={isLoading ? Loader2 : FileText}
                    >
                        {isLoading ? "Generating..." : "Generate My Resume"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default GapInterview;
