import React, { useState } from 'react';
import { useResumeStore } from './store';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, ArrowRight, Download, RefreshCcw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';

// --- UI COMPONENTS ---

function StepIndicator({ current }) {
  const steps = ['Upload', 'Analyze', 'Interview', 'Download'];
  return (
    <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={label} className="flex flex-col items-center z-10">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
              isActive ? "bg-sky-600 text-white ring-4 ring-sky-100" : 
              isDone ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
            )}>
              {isDone ? <CheckCircle className="w-5 h-5" /> : stepNum}
            </div>
            <span className={clsx("text-xs mt-2 font-medium", isActive ? "text-sky-700" : "text-slate-400")}>{label}</span>
          </div>
        );
      })}
      {/* Progress Bar Background */}
      <div className="absolute top-4 left-0 w-full h-1 bg-slate-200 z-0 hidden md:block" /> 
    </div>
  );
}

function FileUpload() {
  const { handleFileUpload, isLoading, error } = useResumeStore();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: handleFileUpload, 
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <div className="max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload your Resume</h2>
      <p className="text-slate-500 mb-6">We'll extract your skills and experience automatically.</p>
      
      <div {...getRootProps()} className={clsx(
        "border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all bg-white",
        isDragActive ? "border-sky-500 bg-sky-50" : "border-slate-300 hover:border-sky-400"
      )}>
        <input {...getInputProps()} />
        {isLoading ? (
          <Loader2 className="w-12 h-12 text-sky-600 animate-spin mx-auto" />
        ) : (
          <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        )}
        <p className="text-lg font-medium text-slate-700">
          {isLoading ? "Parsing PDF..." : "Drag & drop or click to upload"}
        </p>
        <p className="text-sm text-slate-400 mt-2">PDF only (Max 5MB)</p>
      </div>
      {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
    </div>
  );
}

function JobInput() {
  const { jobDescription, setJobDescription, handleGapAnalysis, isLoading, error } = useResumeStore();
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Target Job Description</h2>
      <p className="text-slate-500 mb-6">Paste the full job description below. The AI will check for missing skills.</p>
      
      <textarea 
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste JD here..."
        className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm resize-none"
      />
      
      {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
      
      <button 
        onClick={handleGapAnalysis}
        disabled={isLoading || !jobDescription}
        className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-6 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:bg-sky-300 transition-all"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        Analyze My Fit
      </button>
    </div>
  );
}

function GapInterview() {
  const { gapAnalysis, handleGeneration, isLoading } = useResumeStore();
  const [answers, setAnswers] = useState({});

  const handleSubmit = () => {
    handleGeneration(answers);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Skill Gap Analysis</h2>
        <div className="flex justify-center items-center gap-2 mt-2">
           <span className="text-slate-500">Match Score:</span>
           <span className={clsx("font-bold text-xl", gapAnalysis.match_score > 70 ? "text-emerald-600" : "text-amber-600")}>
             {gapAnalysis.match_score}/100
           </span>
        </div>
      </div>

      <div className="space-y-6">
        {gapAnalysis.gaps.map((gap, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-800">Missing: {gap.missing_skill}</h3>
                <p className="text-sm text-slate-500">{gap.context}</p>
              </div>
            </div>
            <div className="mt-4 bg-slate-50 p-4 rounded-md">
                <p className="text-sm font-medium text-slate-700 mb-2">{gap.question}</p>
                <textarea 
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-sky-500"
                  placeholder="Yes, I used this when..."
                  rows={2}
                  onChange={(e) => setAnswers({...answers, [gap.missing_skill]: e.target.value})}
                />
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3 px-6 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:bg-sky-300 transition-all"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <FileText />}
        Generate Tailored Resume
      </button>
    </div>
  );
}

function PreviewDownload() {
  const { pdfUrl, reset } = useResumeStore();

  return (
    // UPDATED: Increased height to 95vh (95% of viewport) for a much taller preview
    <div className="flex flex-col h-[95vh] w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">Your Resume is Ready!</h2>
        <div className="flex gap-3">
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">
            <RefreshCcw className="w-4 h-4" /> Start Over
          </button>
          <a href={pdfUrl} download="tailored_resume.pdf" className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200 transition-all">
            <Download className="w-4 h-4" /> Download PDF
          </a>
        </div>
      </div>

      <div className="grow bg-slate-800 rounded-xl p-4 shadow-xl overflow-hidden">
        <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
            className="w-full h-full rounded-lg bg-white border-none" 
            title="Resume Preview"
        />
      </div>
    </div>
  );
}

// --- MAIN APP ---

export default function App() {
  const currentStep = useResumeStore((state) => state.currentStep);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Resume Builder</h1>
        <p className="text-slate-500 mt-2">Tailor your resume for any job in seconds.</p>
      </header>

      <StepIndicator current={currentStep} />

      <main className="transition-all duration-500 ease-in-out">
        {currentStep === 1 && <FileUpload />}
        {currentStep === 2 && <JobInput />}
        {currentStep === 3 && <GapInterview />}
        {currentStep === 4 && <PreviewDownload />}
      </main>
    </div>
  );
}