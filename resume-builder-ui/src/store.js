import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const useResumeStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      currentStep: 1,
      isLoading: false,
      error: null,

      // Data
      file: null,
      parsedResume: null,
      jobDescription: '',
      gapAnalysis: null,
      tailoredResume: null,
      pdfUrl: null,

      coverLetter: null,
      coverLetterPdfUrl: null,
      isCoverLetterLoading: false,

      // Edit Mode
      isEditing: false,

      // --- ACTIONS ---
      setJobDescription: (text) => set({ jobDescription: text }),
      setIsEditing: (isEditing) => set({ isEditing }),

      // NEW: Navigation Action
      setStep: (step) => set({ currentStep: step }),

      // Update the local JSON data
      updateResumeData: (newData) => set({ tailoredResume: newData }),

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

      // Step 3: Generate Tailored Resume
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
          await get().regeneratePdf(genRes.data);
          set({ currentStep: 4 });

        } catch (err) {
          console.error(err);
          set({ error: "Generation failed." });
        } finally {
          set({ isLoading: false });
        }
      },

      // Helper: Regenerate PDF
      regeneratePdf: async (dataToRender = null) => {
        const { tailoredResume } = get();
        const data = dataToRender || tailoredResume;
        if (!data) return;

        try {
          const pdfRes = await axios.post(`${API_URL}/render-pdf`, data, {
            responseType: 'blob'
          });
          const pdfBlob = new Blob([pdfRes.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);
          set({ pdfUrl: url });
        } catch (err) {
          console.error("Failed to render PDF", err);
          set({ error: "Failed to render PDF preview." });
        }
      },

      // Generate Cover Letter
      generateCoverLetter: async () => {
        const { parsedResume, jobDescription } = get();
        if (!parsedResume || !jobDescription) return;

        set({ isCoverLetterLoading: true, error: null });

        try {
          // 1. Generate Text
          const res = await axios.post(`${API_URL}/generate-cover-letter`, {
            resume_data: parsedResume,
            job_description: jobDescription
          });
          const text = res.data.cover_letter_text;
          set({ coverLetter: text });

          // 2. Generate PDF
          const pdfRes = await axios.post(`${API_URL}/render-cover-letter-pdf`, {
            resume_data: parsedResume,
            cover_letter_text: text
          }, {
            responseType: 'blob'
          });

          const pdfBlob = new Blob([pdfRes.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);
          set({ coverLetterPdfUrl: url });

        } catch (err) {
          console.error(err);
          set({ error: "Failed to generate cover letter." });
        } finally {
          set({ isCoverLetterLoading: false });
        }
      },

      reset: () => {
        localStorage.removeItem('resume-storage');
        set({
          currentStep: 1,
          parsedResume: null,
          jobDescription: '',
          gapAnalysis: null,
          tailoredResume: null,
          pdfUrl: null,
          coverLetter: null,
          coverLetterPdfUrl: null,
          isCoverLetterLoading: false,
          isEditing: false
        });
      }
    }),
    {
      name: 'resume-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        parsedResume: state.parsedResume,
        jobDescription: state.jobDescription,
        gapAnalysis: state.gapAnalysis,
        tailoredResume: state.tailoredResume,
        coverLetter: state.coverLetter
      }),
    }
  )
);