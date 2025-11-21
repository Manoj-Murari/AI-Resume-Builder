import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const useResumeStore = create((set, get) => ({
  // --- STATE ---
  currentStep: 1,
  isLoading: false,
  error: null,
  
  // Data
  file: null,
  parsedResume: null, // The "Golden Schema" from Step 1
  jobDescription: '',
  gapAnalysis: null,  // The missing skills from Step 2
  tailoredResume: null, // The final JSON from Step 3
  pdfUrl: null,

  // --- ACTIONS ---
  setJobDescription: (text) => set({ jobDescription: text }),
  
  // Step 1: Ingest
  handleFileUpload: async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    set({ isLoading: true, error: null });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/ingest`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ parsedResume: res.data.data, currentStep: 2 });
    } catch (err) {
      set({ error: "Failed to parse resume. Please try another PDF." });
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Step 2: Analyze Gaps
  handleGapAnalysis: async () => {
    const { parsedResume, jobDescription } = get();
    if (!jobDescription) return set({ error: "Please paste a Job Description." });

    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/analyze-gaps`, {
        resume_data: parsedResume,
        job_description: jobDescription
      });
      set({ gapAnalysis: res.data, currentStep: 3 });
    } catch (err) {
      set({ error: "AI Analysis failed. Try shortening the job description." });
    } finally {
      set({ isLoading: false });
    }
  },

  // Step 3: Generate Tailored
  handleGeneration: async (gapAnswers) => {
    const { parsedResume, jobDescription } = get();
    set({ isLoading: true, error: null });
    
    try {
      // 1. Generate JSON
      const genRes = await axios.post(`${API_URL}/generate-tailored`, {
        resume_data: parsedResume,
        job_description: jobDescription,
        gap_answers: gapAnswers
      });
      set({ tailoredResume: genRes.data });

      // 2. Render PDF
      const pdfRes = await axios.post(`${API_URL}/render-pdf`, genRes.data, {
        responseType: 'blob' // Important: Receive binary data
      });
      
      // --- THE FIX ---
      // Explicitly set the MIME type so the browser treats it as a PDF
      const pdfBlob = new Blob([pdfRes.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);

      set({ pdfUrl: url, currentStep: 4 });

    } catch (err) {
      console.error(err);
      set({ error: "Generation failed." });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ 
    currentStep: 1, 
    parsedResume: null, 
    jobDescription: '', 
    gapAnalysis: null, 
    tailoredResume: null, 
    pdfUrl: null 
  })
}));