
import React, { useState } from 'react';
import { useResumeStore } from '../../store';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { AlertTriangle, Sparkles, Loader2, FileText } from 'lucide-react';
import clsx from 'clsx';

function GapInterview() {
    const { gapAnalysis, handleGeneration, isLoading } = useResumeStore();
    const [answers, setAnswers] = useState({});

    return (
        <div className="max-w-3xl mx-auto mt-8 pb-12">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Match Score</span>
                    <span className={clsx("font-bold text-lg", gapAnalysis.match_score > 70 ? "text-emerald-600" : "text-amber-600")}>
                        {gapAnalysis.match_score}/100
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">We found a few gaps.</h2>
                <p className="text-slate-500 mt-2">Answer these questions to help the AI tailor your resume perfectly.</p>
            </div>

            <div className="space-y-6">
                {gapAnalysis.gaps.map((gap, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{gap.missing_skill}</h3>
                                <p className="text-sm text-slate-500 mb-4">{gap.context}</p>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-sky-500" /> {gap.question}
                                    </p>
                                    <textarea
                                        className="w-full p-3 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                        placeholder="e.g., I used this technology in my final year project..."
                                        rows={2}
                                        onChange={(e) => setAnswers({ ...answers, [gap.missing_skill]: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="sticky bottom-6 mt-8">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent -z-10 h-24 -top-24" />
                <Button
                    onClick={() => handleGeneration(answers)}
                    disabled={isLoading}
                    className="w-full py-4 text-lg shadow-xl"
                    icon={isLoading ? Loader2 : FileText}
                >
                    {isLoading ? "Crafting Resume..." : "Generate Tailored Resume"}
                </Button>
            </div>
        </div>
    );
}

export default GapInterview;
