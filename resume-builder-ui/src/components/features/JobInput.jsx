
import React from 'react';
import { useResumeStore } from '../../store';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Loader2, ArrowRight, Lock } from 'lucide-react';

function JobInput() {
    const { jobDescription, setJobDescription, handleGapAnalysis, isLoading, error, masterProfile, parsedResume, setGenerationMode } = useResumeStore();

    // Check if profile has enough data (e.g., at least a name or skills)
    const hasProfile = masterProfile && (Object.keys(masterProfile.skills || {}).length > 0 || (masterProfile.projects || []).length > 0);

    // Check for base resume
    const hasBaseResume = !!parsedResume;

    // Effect: If no base resume, force 'architect' mode
    React.useEffect(() => {
        if (!hasBaseResume && masterProfile) {
            setGenerationMode('architect');
        }
    }, [hasBaseResume, masterProfile, setGenerationMode]);

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

                <div className="mt-6 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Select Generation Strategy:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <StrategyCard
                            mode="quick"
                            title="Quick Tailor"
                            desc="Optimize existing resume with new categories."
                            disabled={!hasBaseResume}
                        />
                        <StrategyCard
                            mode="augmented"
                            title="Augmented Tailor"
                            desc="Fill gaps using Master Profile context."
                            recommended={true}
                            disabled={!hasProfile || !hasBaseResume}
                        />
                        <StrategyCard
                            mode="architect"
                            title="Career Architect"
                            desc="Build from scratch using Master Profile."
                            disabled={!hasProfile}
                        />
                    </div>
                </div>

                {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

                <Button
                    onClick={handleGapAnalysis}
                    disabled={isLoading || !jobDescription}
                    className="w-full mt-6 py-3.5 text-lg"
                    icon={isLoading ? Loader2 : ArrowRight}
                >
                    {isLoading ? "Analyzing..." : "Analyze Compatibility"}
                </Button>
            </motion.div>
        </div>
    );
}

function StrategyCard({ mode, title, desc, disabled, recommended }) {
    const { generationMode, setGenerationMode } = useResumeStore();
    const isSelected = generationMode === mode;

    return (
        <button
            onClick={() => !disabled && setGenerationMode(mode)}
            disabled={disabled}
            className={`text-left relative p-4 rounded-xl border-2 transition-all w-full ${disabled
                ? 'opacity-50 border-slate-100 bg-slate-50 cursor-not-allowed'
                : isSelected
                    ? 'border-sky-500 bg-sky-50 cursor-pointer'
                    : 'border-slate-200 hover:border-sky-300 cursor-pointer bg-white'
                }`}
        >
            {recommended && !disabled && (
                <div className="absolute -top-3 -right-2 bg-sky-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Recommended
                </div>
            )}

            {disabled && (
                <div className="absolute top-2 right-2 text-slate-400">
                    <Lock size={16} />
                </div>
            )}

            <div className="flex items-center space-x-2 mb-1">
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                    }`} />
                <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </button>
    );
}

export default JobInput;
