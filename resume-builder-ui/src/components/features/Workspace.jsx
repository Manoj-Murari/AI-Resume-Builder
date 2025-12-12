
import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../../store';
import { PenTool, Loader2, RefreshCcw, Download } from 'lucide-react';
import Button from '../ui/Button';
import EditorPanel from './EditorPanel';
import clsx from 'clsx';

function Workspace() {
    const { pdfUrl, tailoredResume, regeneratePdf, coverLetter, coverLetterPdfUrl, generateCoverLetter, isCoverLetterLoading, reset } = useResumeStore();
    const [viewMode, setViewMode] = useState('resume'); // 'resume' | 'coverLetter'

    // Initial PDF Load
    useEffect(() => {
        if (!pdfUrl && tailoredResume) regeneratePdf();
    }, []);

    return (
        <div className="max-w-[1600px] mx-auto lg:h-[calc(100vh-100px)] h-auto flex flex-col lg:flex-row gap-6 p-4 lg:p-6">

            {/* LEFT PANE: EDITOR */}
            <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4">

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
                    <EditorPanel />
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
            </div>

            {/* RIGHT PANE: PREVIEW */}
            <div className="w-full h-[500px] lg:h-auto lg:flex-grow bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden relative group">

                {/* Toolbar Overlay */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    {viewMode === 'resume' && pdfUrl && (
                        <a href={pdfUrl} download="Resume.pdf" className="bg-white text-slate-800 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer">
                            <Download className="w-4 h-4" /> Download PDF
                        </a>
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
        </div>
    );
}

export default Workspace;
