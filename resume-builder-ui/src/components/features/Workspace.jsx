
import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../../store';
import { PenTool, Loader2, RefreshCcw, Download, Save, X, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Button from '../ui/Button';
import EditorPanel from './EditorPanel';
import clsx from 'clsx';

function Workspace() {
    const {
        pdfUrl, tailoredResume, regeneratePdf,
        coverLetter, coverLetterPdfUrl, generateCoverLetter, isCoverLetterLoading,
        reset, saveApplication, jobDescription, jobMetadata
    } = useResumeStore();
    const [viewMode, setViewMode] = useState('resume'); // 'resume' | 'coverLetter'

    // Save Modal State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [appForm, setAppForm] = useState({
        job_title: '',
        company_name: '',
        job_url: '',
        job_location: '',
        platform: '',
        status: 'Applied'
    });

    useEffect(() => {
        if (showSaveModal && jobMetadata) {
            setAppForm(prev => ({
                ...prev,
                job_title: jobMetadata.title || prev.job_title,
                company_name: jobMetadata.company || prev.company_name,
                job_url: jobMetadata.url || prev.job_url,
                job_location: jobMetadata.location || prev.job_location,
                platform: jobMetadata.platform || prev.platform
            }));
        }
    }, [showSaveModal, jobMetadata]);

    // Initial PDF Load
    useEffect(() => {
        if (!pdfUrl && tailoredResume) regeneratePdf();
    }, []);

    // Smart Naming Logic
    const constructFilename = () => {
        if (!tailoredResume || !tailoredResume.personal_info) return "Resume.pdf";

        const { name } = tailoredResume.personal_info;
        // Try to get role from experience, fallback to nothing
        const role = tailoredResume.experience && tailoredResume.experience.length > 0 ? tailoredResume.experience[0].role : "";

        const sanitize = (str) => {
            if (!str) return "";
            return str
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .replace(/[^a-zA-Z0-9_\-]/g, ''); // Remove non-safe characters
        };

        const safeName = sanitize(name);
        const safeRole = sanitize(role);

        if (safeRole) {
            return `${safeName}_${safeRole}_Resume.pdf`;
        }
        return `${safeName}_Resume.pdf`;
    };

    const downloadFilename = constructFilename();

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
    };

    const triggerSaveFlow = () => {
        if (!tailoredResume) return;
        setShowSaveModal(true);
    };

    const confirmSave = async () => {
        setIsSaving(true);
        const success = await saveApplication({
            ...appForm,
            // If user entered them in modal, use them. Fallback to metadata only if empty (already handled by useEffect sync)
            // Actually appForm should be the source of truth now.
            job_url: appForm.job_url || jobMetadata?.url || '',
            platform: appForm.platform || jobMetadata?.platform || 'Other',
            job_location: appForm.job_location || jobMetadata?.location || '',
            resume_json: tailoredResume
        });
        if (success) alert("Application tracked!");

        setIsSaving(false);
        setShowSaveModal(false);
    };

    // Detect Context (Side Panel vs Full)
    const [isSidePanel, setIsSidePanel] = useState(false);

    useEffect(() => {
        const checkWidth = () => setIsSidePanel(window.innerWidth < 1024);
        checkWidth(); // initial
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    const openDashboard = () => {
        const extensionId = chrome.runtime.id;
        const dashboardUrl = `chrome-extension://${extensionId}/index.html?mode=dashboard#/builder`;
        window.open(dashboardUrl, '_blank');
        window.close(); // Close the side panel
    };

    return (
        <div className="max-w-[1600px] mx-auto lg:h-[calc(100vh-100px)] h-auto flex flex-col lg:flex-row gap-6 p-4 lg:p-6">

            {/* LEFT PANE: EDITOR OR INFO */}
            <div className={clsx("w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4", isSidePanel ? "order-2" : "order-1")}>

                {isSidePanel ? (
                    /* SIDE PANEL MODE: HIDE EDITOR, SHOW LINK & TOGGLE */
                    <div className="flex flex-col gap-4">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-200 rounded-lg border border-slate-300">
                            <button
                                onClick={() => setViewMode('resume')}
                                className={clsx("flex-1 py-2 text-sm font-semibold rounded-md transition-all", viewMode === 'resume' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                Resume
                            </button>
                            <button
                                onClick={() => setViewMode('coverLetter')}
                                className={clsx("flex-1 py-2 text-sm font-semibold rounded-md transition-all", viewMode === 'coverLetter' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                Cover Letter
                            </button>
                        </div>

                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-6 text-center">
                            <h3 className="font-bold text-sky-900 text-lg mb-2">Edit in Dashboard</h3>
                            <p className="text-sm text-sky-700 mb-4">
                                {viewMode === 'resume' ? "Edit resume details and formatting." : "Generate and refine your cover letter."}
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={openDashboard}
                                    variant="primary"
                                    icon={ExternalLink}
                                    className="w-full justify-center"
                                >
                                    Open Dashboard
                                </Button>
                                {viewMode === 'resume' && (
                                    <Button
                                        onClick={triggerSaveFlow}
                                        variant="outline" // Assuming outline variant exists, or fallback to default style
                                        icon={Save}
                                        className="w-full justify-center bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                                    >
                                        Save Application
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* FULL MODE: SHOW EDITOR */
                    <>
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-200 rounded-lg border border-slate-300">
                            <button
                                onClick={() => setViewMode('resume')}
                                className={clsx("flex-1 py-2 text-sm font-semibold rounded-md transition-all", viewMode === 'resume' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                Resume
                            </button>
                            <button
                                onClick={() => setViewMode('coverLetter')}
                                className={clsx("flex-1 py-2 text-sm font-semibold rounded-md transition-all", viewMode === 'coverLetter' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                Cover Letter
                            </button>
                        </div>

                        {viewMode === 'resume' ? (
                            <EditorPanel onSave={triggerSaveFlow} />
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 p-6 h-full flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                    <PenTool className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-xl mb-2">AI Cover Letter Writer</h3>
                                <p className="text-slate-500 mb-8">Generate a personalized letter matching your resume style in seconds.</p>
                                <Button onClick={generateCoverLetter} disabled={isCoverLetterLoading} variant="primary" icon={isCoverLetterLoading ? Loader2 : PenTool} className="w-full py-3 text-lg">
                                    {isCoverLetterLoading ? "Writing..." : "Generate Letter"}
                                </Button>
                            </div>
                        )}
                        <div className="mt-auto pt-4">
                            <Button onClick={reset} variant="ghost" icon={RefreshCcw} className="w-full">Start Over</Button>
                        </div>
                    </>
                )}

            </div>

            {/* RIGHT PANE: PREVIEW */}
            <div className="w-full h-[500px] lg:h-auto lg:flex-grow bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden relative group">

                {/* Toolbar Overlay */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">

                    {viewMode === 'resume' && pdfUrl && (
                        <button onClick={handleDownload} className="bg-white text-slate-800 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer">
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                    )}
                    {viewMode === 'coverLetter' && coverLetterPdfUrl && (
                        <a href={coverLetterPdfUrl} download="CoverLetter.pdf" className="bg-white text-slate-800 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer">
                            <Download className="w-4 h-4" /> Download PDF
                        </a>
                    )}
                </div>

                <div className="w-full h-full">
                    {viewMode === 'resume' ? (
                        pdfUrl ? <iframe src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`} className="w-full h-full border-none bg-white" /> : <div className="flex h-full items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin" /></div>
                    ) : (
                        coverLetterPdfUrl ? <iframe src={`${coverLetterPdfUrl}#toolbar=0&navpanes=0&view=FitH`} className="w-full h-full border-none bg-white" /> : (
                            coverLetter ? <div className="p-12 bg-white h-full overflow-y-auto prose max-w-none"><p className="whitespace-pre-wrap font-serif">{coverLetter}</p></div> : <div className="flex h-full items-center justify-center text-slate-400">Generate a cover letter to preview it here.</div>
                        )
                    )}
                </div>
            </div>



            {/* SAVE APPLICATION MODAL */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setShowSaveModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Save Application</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Track this application in your dashboard.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                                <input
                                    value={appForm.company_name}
                                    onChange={e => setAppForm({ ...appForm, company_name: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                    placeholder="e.g. Google"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title</label>
                                <input
                                    value={appForm.job_title}
                                    onChange={e => setAppForm({ ...appForm, job_title: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                                    <input
                                        value={appForm.job_location || ''}
                                        onChange={e => setAppForm({ ...appForm, job_location: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        placeholder="e.g. Remote"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Platform</label>
                                    <input
                                        value={appForm.platform || ''}
                                        onChange={e => setAppForm({ ...appForm, platform: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        placeholder="e.g. LinkedIn"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job URL</label>
                                <input
                                    value={appForm.job_url || ''}
                                    onChange={e => setAppForm({ ...appForm, job_url: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                <select
                                    value={appForm.status}
                                    onChange={e => setAppForm({ ...appForm, status: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                >
                                    <option value="Applied">Applied</option>
                                    <option value="Interviewing">Interviewing</option>
                                    <option value="Offer">Offer</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSave}
                                disabled={!appForm.company_name || !appForm.job_title || isSaving}
                                className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                Save Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Workspace;
