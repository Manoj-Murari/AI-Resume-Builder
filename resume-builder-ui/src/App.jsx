import React, { useState, useEffect } from 'react';
import { useResumeStore } from './store';
import { 
  UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, 
  ArrowRight, Download, RefreshCcw, PenTool, Copy, Check, 
  Edit, Save, Plus, Trash2, ChevronRight, ChevronDown, User, Briefcase, GraduationCap, Code, File, Sparkles
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// --- UI COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', disabled, className, icon: Icon }) => {
  const baseStyles = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-md hover:shadow-sky-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    danger: "text-red-600 hover:bg-red-50",
    ghost: "text-slate-500 hover:text-sky-600 hover:bg-sky-50"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={clsx(baseStyles, variants[variant], className)}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const InputGroup = ({ label, value, onChange, placeholder, type="text", className }) => (
  <div className={clsx("mb-4", className)}>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
    {type === 'textarea' ? (
      <textarea 
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all resize-none"
        rows={4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <input 
        type={type}
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

// --- NAVIGATION ---

function StepIndicator({ current }) {
  const { setStep, parsedResume, gapAnalysis, tailoredResume } = useResumeStore();
  
  // Logic to determine if a step is "clickable"
  const isStepUnlocked = (stepIdx) => {
    if (stepIdx === 0) return true; // Step 1 (Upload) always open
    if (stepIdx === 1) return !!parsedResume; // Step 2 (Analyze) needs resume
    if (stepIdx === 2) return !!gapAnalysis;  // Step 3 (Interview) needs gaps
    if (stepIdx === 3) return !!tailoredResume; // Step 4 (Workspace) needs final data
    return false;
  };

  const steps = ['Upload', 'Analyze', 'Interview', 'Workspace'];
  
  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
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

// --- STEPS 1-3 ---

function FileUpload() {
  const { handleFileUpload, isLoading, error } = useResumeStore();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: handleFileUpload, 
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <div className="max-w-xl mx-auto text-center mt-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Upload your Resume</h2>
        <p className="text-slate-500 mb-8 text-lg">We'll extract your skills and experience to build your new profile.</p>
      </motion.div>
      
      <div {...getRootProps()} className={clsx(
        "border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300 group bg-white",
        isDragActive ? "border-sky-500 bg-sky-50 ring-4 ring-sky-100" : "border-slate-200 hover:border-sky-400 hover:shadow-lg"
      )}>
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium animate-pulse">Analyzing Document Structure...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-lg font-medium text-slate-700 group-hover:text-sky-700 transition-colors">
              Click to upload or drag & drop
            </p>
            <p className="text-sm text-slate-400 mt-2">PDF format only (Max 5MB)</p>
          </>
        )}
      </div>
      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center justify-center gap-2 border border-red-100">
          <AlertTriangle className="w-4 h-4" /> {error}
        </motion.div>
      )}
    </div>
  );
}

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
                      onChange={(e) => setAnswers({...answers, [gap.missing_skill]: e.target.value})}
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

// --- WORKSPACE (Step 4) ---

function BulletListEditor({ bullets, onChange }) {
  const updateBullet = (idx, text) => {
    const newBullets = [...bullets];
    newBullets[idx] = text;
    onChange(newBullets);
  };
  return (
    <div className="space-y-3 mt-3 pl-2 border-l-2 border-slate-100">
      {bullets.map((bullet, idx) => (
        <div key={idx} className="flex gap-2 group">
          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
          <textarea
            className="flex-grow p-2 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-sky-500 focus:bg-white rounded text-sm text-slate-700 outline-none resize-none transition-all"
            rows={Math.max(2, Math.ceil(bullet.length / 60))}
            value={bullet}
            onChange={(e) => updateBullet(idx, e.target.value)}
          />
          <button onClick={() => onChange(bullets.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...bullets, ""])} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-2 ml-4">
        <Plus className="w-3 h-3" /> Add Bullet Point
      </button>
    </div>
  );
}

function EditorPanel() {
  const { tailoredResume, updateResumeData, regeneratePdf } = useResumeStore();
  const [formData, setFormData] = useState(tailoredResume);
  const [expandedSection, setExpandedSection] = useState('experience');

  // Auto-save with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(formData) !== JSON.stringify(tailoredResume)) {
        updateResumeData(formData);
        regeneratePdf(formData);
      }
    }, 1000); 
    return () => clearTimeout(handler);
  }, [formData, updateResumeData, regeneratePdf, tailoredResume]);

  const updateNested = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };
  
  const AccordionItem = ({ id, icon: Icon, title, children }) => (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className={clsx("w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors", expandedSection === id && "bg-slate-50")}
      >
        <div className="flex items-center gap-3">
          <Icon className={clsx("w-5 h-5", expandedSection === id ? "text-sky-600" : "text-slate-400")} />
          <span className={clsx("font-semibold text-sm", expandedSection === id ? "text-slate-800" : "text-slate-600")}>{title}</span>
        </div>
        <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", expandedSection === id && "rotate-180")} />
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Edit className="w-4 h-4 text-sky-600" /> Editor
        </h3>
      </div>
      
      <AccordionItem id="personal" icon={User} title="Personal Info">
        <InputGroup label="Full Name" value={formData.personal_info.name} onChange={v => updateNested('personal_info', 'name', v)} />
        <div className="grid grid-cols-2 gap-3">
          <InputGroup label="Email" value={formData.personal_info.email} onChange={v => updateNested('personal_info', 'email', v)} />
          <InputGroup label="Phone" value={formData.personal_info.phone} onChange={v => updateNested('personal_info', 'phone', v)} />
        </div>
        <InputGroup label="Location" value={formData.personal_info.location} onChange={v => updateNested('personal_info', 'location', v)} />
        <InputGroup label="LinkedIn" value={formData.personal_info.linkedin} onChange={v => updateNested('personal_info', 'linkedin', v)} />
        <InputGroup label="GitHub" value={formData.personal_info.github} onChange={v => updateNested('personal_info', 'github', v)} />
      </AccordionItem>

      <AccordionItem id="summary" icon={FileText} title="Summary">
        <InputGroup type="textarea" label="Professional Summary" value={formData.summary} onChange={v => setFormData(prev => ({...prev, summary: v}))} />
      </AccordionItem>

      <AccordionItem id="experience" icon={Briefcase} title="Experience">
        {formData.experience.map((job, idx) => (
          <div key={idx} className="mb-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
            <div className="flex justify-between mb-2">
              <input className="font-bold text-slate-800 text-sm bg-transparent border-none p-0 focus:ring-0 w-full" value={job.company} onChange={(e) => {
                 const newList = [...formData.experience]; newList[idx].company = e.target.value; setFormData({...formData, experience: newList});
              }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
               <input className="text-xs text-slate-500 bg-slate-50 p-1 rounded" value={job.role} onChange={(e) => {
                 const newList = [...formData.experience]; newList[idx].role = e.target.value; setFormData({...formData, experience: newList});
               }} />
               <input className="text-xs text-slate-500 bg-slate-50 p-1 rounded text-right" value={job.dates} onChange={(e) => {
                 const newList = [...formData.experience]; newList[idx].dates = e.target.value; setFormData({...formData, experience: newList});
               }} />
            </div>
            <BulletListEditor bullets={job.bullets} onChange={(newBullets) => {
                const newList = [...formData.experience]; newList[idx].bullets = newBullets; setFormData({...formData, experience: newList});
            }} />
          </div>
        ))}
      </AccordionItem>

      <AccordionItem id="projects" icon={Code} title="Projects">
        {formData.projects.map((proj, idx) => (
          <div key={idx} className="mb-6 pb-6 border-b border-slate-100 last:border-0">
             <div className="flex justify-between mb-2">
               <input className="font-bold text-slate-800 text-sm bg-transparent border-none p-0 focus:ring-0 w-full" value={proj.name} onChange={(e) => {
                 const l = [...formData.projects]; l[idx].name = e.target.value; setFormData({...formData, projects: l});
               }} />
               <button onClick={() => {
                  const l = formData.projects.filter((_, i) => i !== idx);
                  setFormData({...formData, projects: l});
               }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
             </div>
             
             <InputGroup label="GitHub URL" value={proj.github_url} onChange={v => {
                 const l = [...formData.projects]; l[idx].github_url = v; setFormData({...formData, projects: l});
             }} />
             <InputGroup label="Demo URL" value={proj.demo_url} onChange={v => {
                 const l = [...formData.projects]; l[idx].demo_url = v; setFormData({...formData, projects: l});
             }} />
             
             {/* FIXED: Technologies Input */}
             <InputGroup 
               label="Technologies" 
               placeholder="React, Python, Firebase..."
               value={(proj.technologies || []).join(', ')} 
               onChange={v => {
                 const l = [...formData.projects]; 
                 l[idx].technologies = v.split(',').map(s => s.trim());
                 setFormData({...formData, projects: l});
               }} 
             />

             <BulletListEditor bullets={proj.bullets} onChange={(newBullets) => {
                const l = [...formData.projects]; l[idx].bullets = newBullets; setFormData({...formData, projects: l});
             }} />
          </div>
        ))}
        <div className="p-4 pt-0">
          <button onClick={() => setFormData(prev => ({...prev, projects: [{name: "New Project", bullets: [""], technologies: []}, ...prev.projects]}))} className="text-sm font-bold text-sky-600 flex items-center gap-1 w-full justify-center p-2 hover:bg-sky-50 rounded">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </AccordionItem>
      
      <AccordionItem id="skills" icon={Sparkles} title="Skills">
        {Object.entries(formData.skills).map(([category, items]) => (
          <InputGroup 
            key={category} 
            label={category} 
            value={items.join(', ')} 
            onChange={v => {
               const list = v.split(',').map(s => s.trim());
               setFormData(prev => ({ ...prev, skills: { ...prev.skills, [category]: list } }));
            }} 
          />
        ))}
      </AccordionItem>
    </div>
  );
}

function Workspace() {
  const { pdfUrl, tailoredResume, regeneratePdf, coverLetter, coverLetterPdfUrl, generateCoverLetter, isCoverLetterLoading, reset } = useResumeStore();
  const [viewMode, setViewMode] = useState('resume'); // 'resume' | 'coverLetter'

  // Initial PDF Load
  useEffect(() => {
    if (!pdfUrl && tailoredResume) regeneratePdf();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex gap-6 p-6">
      
      {/* LEFT PANE: EDITOR */}
      <div className="w-[400px] flex-shrink-0 flex flex-col gap-4">
        
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
      <div className="flex-grow bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden relative group">
        
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

export default function App() {
  const currentStep = useResumeStore((state) => state.currentStep);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-sky-100 selection:text-sky-900">
      <StepIndicator current={currentStep} />
      
      <AnimatePresence mode="wait">
        <motion.main 
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {currentStep === 1 && <FileUpload />}
          {currentStep === 2 && <JobInput />}
          {currentStep === 3 && <GapInterview />}
          {currentStep === 4 && <Workspace />}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}