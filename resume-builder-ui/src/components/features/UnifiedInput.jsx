import React, { useState } from 'react';
import { useResumeStore } from '../../store';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import {
    UploadCloud, Loader2, ArrowRight, FileText,
    AlertTriangle, Lock, User, CheckCircle2, Globe
} from 'lucide-react';
import { parseJobDetails } from '../../utils/scraper';
import clsx from 'clsx';

function UnifiedInput() {
    const {
        // File Upload State
        handleFileUpload, isLoading: isUploading, error: uploadError, masterProfile,
        // Job Input State
        jobDescription, setJobDescription, handleGapAnalysis,
        setJobMetadata, // NEW
        isLoading: isAnalyzing, error: analysisError,
        parsedResume, generationMode, setGenerationMode
    } = useResumeStore();

    const [isScraping, setIsScraping] = useState(false);

    const handleAutoFill = async () => {
        // Environment Check: Are we in an extension?
        const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage;

        if (!isExtension) {
            alert("Auto-Fill is only available when using the Chrome Extension.\n\nPlease manually paste the Job Description.");
            return;
        }

        setIsScraping(true);
        const data = await parseJobDetails();
        if (data) {
            setJobDescription(data.description || "");
            setJobMetadata(data);
        } else {
            alert("Could not detect job details. Please ensure you are on a supported job page (LinkedIn, Naukri, Workday).");
        }
        setIsScraping(false);
    };

    const [resumeSource, setResumeSource] = useState('upload'); // 'upload' | 'profile'

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => {
            handleFileUpload(files);
            setResumeSource('upload');
        },
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    // Check availability
    const hasProfile = masterProfile && (Object.keys(masterProfile.skills || {}).length > 0 || (masterProfile.projects || []).length > 0);
    const hasBaseResume = !!parsedResume;

    // Effect: Auto-switch strategy based on source
    React.useEffect(() => {
        if (resumeSource === 'profile') {
            setGenerationMode('architect');
        } else if (hasBaseResume) {
            // Default to augmented if we have a resume
            if (generationMode === 'architect') setGenerationMode('augmented');
        }
    }, [resumeSource, hasBaseResume, setGenerationMode, generationMode]);

    // Handle Manual Source Switch
    const handleSourceSwitch = (source) => {
        setResumeSource(source);
        if (source === 'profile') {
            // Clear parsed resume if switching to profile only? 
            // Ideally we might want to keep it in memory but ignore it.
            // For now, let's just create the visual distinction.
            useResumeStore.setState({ parsedResume: null });
            setGenerationMode('architect');
        } else {
            setGenerationMode('augmented');
        }
    };

    const isReady = jobDescription.length > 50 && (hasBaseResume || (resumeSource === 'profile' && hasProfile));

    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* COLUMN 1: RESUME SOURCE */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">1</span>
                        Resume Context
                    </h2>

                    {/* Source Toggles */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                        <button
                            onClick={() => handleSourceSwitch('upload')}
                            className={clsx(
                                "flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
                                resumeSource === 'upload' ? "bg-white shadow-sm text-sky-700" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <UploadCloud size={16} /> Upload PDF
                        </button>
                        <button
                            onClick={() => hasProfile ? handleSourceSwitch('profile') : null}
                            disabled={!hasProfile}
                            className={clsx(
                                "flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
                                resumeSource === 'profile' ? "bg-white shadow-sm text-sky-700" : "text-slate-500 hover:text-slate-700",
                                !hasProfile && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <User size={16} /> Master Profile
                        </button>
                    </div>

                    {/* Upload Area */}
                    {resumeSource === 'upload' && (
                        <div {...getRootProps()} className={clsx(
                            "border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 group bg-white h-64 flex flex-col items-center justify-center text-center",
                            isDragActive ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-400",
                            hasBaseResume && "border-green-400 bg-green-50"
                        )}>
                            <input {...getInputProps()} />
                            {isUploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin mb-3" />
                                    <p className="text-slate-600 text-sm animate-pulse">Parsing PDF...</p>
                                </div>
                            ) : hasBaseResume ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-green-700 font-medium">Resume Uploaded!</p>
                                    <p className="text-xs text-green-600 mt-1">Ready to analyze</p>
                                    <button className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline">Replace File</button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 font-medium text-sm">Click to upload or drag PDF</p>
                                    <p className="text-xs text-slate-400 mt-1">Max 5MB</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Master Profile View */}
                    {resumeSource === 'profile' && (
                        <div className="border-2 border-slate-100 rounded-xl p-8 bg-sky-50 h-64 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-3">
                                <User className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-sky-900">Using Master Profile</h3>
                            <p className="text-sm text-sky-700 mt-2 max-w-xs mx-auto">
                                We will build your resume from scratch using the skills and projects saved in your profile.
                            </p>
                            <div className="mt-4 text-xs bg-white px-3 py-1 rounded-full text-sky-600 border border-sky-100">
                                {Object.keys(masterProfile?.skills || {}).length} Skill Categories available
                            </div>
                        </div>
                    )}

                    {uploadError && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> {uploadError}
                        </motion.div>
                    )}
                </motion.div>


                {/* COLUMN 2: JOB DESCRIPTION */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">2</span>
                            Job Description
                        </div>
                        <button
                            onClick={handleAutoFill}
                            disabled={isScraping}
                            className="text-xs flex items-center gap-1 text-sky-600 font-medium hover:text-sky-700 bg-sky-50 px-2 py-1 rounded-md transition-colors"
                        >
                            {isScraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                            {isScraping ? "Scanning..." : "Auto-Fill"}
                        </button>
                    </h2>
                    <div className="relative">
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the target Job Description here..."
                            className="w-full h-[330px] p-5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm resize-none text-sm leading-relaxed bg-white"
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-slate-300 font-medium">
                            {jobDescription.length} chars
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* BOTTOM: STRATEGY & ACTION */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-8 pt-8 border-t border-slate-100"
            >
                <div className="flex flex-col lg:flex-row gap-8 items-center">

                    {/* Strategy Selector (Compact) */}
                    <div className="flex-1 w-full">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Generation Strategy</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <StrategyCard
                                mode="quick"
                                title="Quick"
                                desc="Re-categorize only."
                                disabled={resumeSource === 'profile' || !hasBaseResume}
                            />
                            <StrategyCard
                                mode="augmented"
                                title="Augmented"
                                desc="Fill gaps from profile."
                                recommended={true}
                                disabled={resumeSource === 'profile' || !hasBaseResume || !hasProfile}
                            />
                            <StrategyCard
                                mode="architect"
                                title="Architect"
                                desc="Build from scratch."
                                disabled={!hasProfile}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="w-full lg:w-auto min-w-[200px] flex flex-col gap-2">
                        <Button
                            onClick={handleGapAnalysis}
                            disabled={isAnalyzing || !isReady}
                            className="w-full py-4 text-lg shadow-xl shadow-sky-500/20"
                            icon={isAnalyzing ? Loader2 : ArrowRight}
                        >
                            {isAnalyzing ? "Analyzing..." : "Analyze Match"}
                        </Button>
                        {analysisError && <p className="text-xs text-red-500 text-center">{analysisError}</p>}
                    </div>

                </div>
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
            className={clsx(
                "text-left relative p-3 rounded-lg border-2 transition-all w-full",
                disabled ? "opacity-50 border-slate-100 bg-slate-50 cursor-not-allowed" :
                    isSelected ? "border-sky-500 bg-sky-50 cursor-pointer" : "border-slate-200 hover:border-sky-300 cursor-pointer bg-white"
            )}
        >
            {recommended && !disabled && (
                <div className="absolute -top-2 -right-2 bg-sky-600 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    Best
                </div>
            )}
            {disabled && (
                <div className="absolute top-2 right-2 text-slate-400">
                    <Lock size={12} />
                </div>
            )}
            <div className="flex items-center gap-2 mb-1">
                <div className={clsx(
                    "w-3 h-3 rounded-full border flex-shrink-0",
                    isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                )} />
                <h3 className="font-bold text-slate-700 text-xs uppercase">{title}</h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight pl-5">{desc}</p>
        </button>
    );
}

export default UnifiedInput;
