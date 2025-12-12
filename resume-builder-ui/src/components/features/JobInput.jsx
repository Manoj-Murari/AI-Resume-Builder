
import React from 'react';
import { useResumeStore } from '../../store';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Loader2, ArrowRight } from 'lucide-react';

function JobInput() {
    const { jobDescription, setJobDescription, handleGapAnalysis, isLoading, error } = useResumeStore();

    return (
        <div className="max-w-2xl mx-auto mt-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Target Job Description</h2>
                <p className="text-slate-500 mb-6">Paste the full job description below. Our AI will analyze it for keywords and skill gaps.</p>

                <div className="relative">
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the JD here..."
                        className="w-full h-64 p-5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm resize-none text-sm leading-relaxed bg-white"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-300 font-medium">
                        {jobDescription.length} chars
                    </div>
                </div>

                {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

                <Button
                    onClick={handleGapAnalysis}
                    disabled={isLoading || !jobDescription}
                    className="w-full mt-6 py-3.5 text-lg"
                    icon={isLoading ? Loader2 : ArrowRight}
                >
                    {isLoading ? "Analyzing Fit..." : "Analyze Compatibility"}
                </Button>
            </motion.div>
        </div>
    );
}

export default JobInput;
