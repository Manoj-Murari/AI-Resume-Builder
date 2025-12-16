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
      jobMetadata: null, // { title, company, location, platform, url }
      gapAnalysis: null,
      tailoredResume: null,
      pdfUrl: null,

      // NEW: Generation Mode (Unified Pipeline)
      generationMode: 'augmented', // 'quick' | 'architect' | 'augmented'

      // NEW: Global Profile State (for guardrails)
      masterProfile: null,
      isProfileLoading: false,

      coverLetter: null,
      coverLetterPdfUrl: null,
      isCoverLetterLoading: false,

      // Edit Mode
      isEditing: false,

      // --- ACTIONS ---
      setJobDescription: (text) => set({ jobDescription: text }),
      setJobMetadata: (data) => set({ jobMetadata: data }),
      setIsEditing: (isEditing) => set({ isEditing }),
      setGenerationMode: (mode) => set({ generationMode: mode }),

      // NEW: Navigation Action
      setStep: (step) => set({ currentStep: step }),

      // Update the local JSON data
      updateResumeData: (newData) => set({ tailoredResume: newData }),

      // Fetch Master Profile (Global)
      fetchMasterProfile: async () => {
        // Hardcoded User ID for now
        const USER_ID = "00000000-0000-0000-0000-000000000000";
        set({ isProfileLoading: true });
        try {
          // We can reuse the backend endpoint
          const res = await axios.get(`${API_URL}/profile/${USER_ID}`);
          set({ masterProfile: res.data });
        } catch (err) {
          console.error("Failed to fetch profile", err);
          // set masterProfile to null if failed/empty
          set({ masterProfile: null });
        } finally {
          set({ isProfileLoading: false });
        }
      },

      // Step 1: Ingest
      handleFileUpload: async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Fetch profile when starting a new flow to have it ready for Step 2
        get().fetchMasterProfile();

        set({ isLoading: true, error: null });
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await axios.post(`${API_URL}/ingest`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          set({ parsedResume: res.data.data, currentStep: 1 }); // Stay on Step 1 (Unified)
        } catch (err) {
          set({ error: "Failed to parse resume. Please try another PDF." });
          console.error(err);
        } finally {
          set({ isLoading: false });
        }
      },

      // Skip Upload action now irrelevant with UnifiedInput state, but kept for legacy/fallback
      handleSkipUpload: () => {
        get().fetchMasterProfile();
        set({
          parsedResume: null,
          currentStep: 1,
          generationMode: 'architect',
          error: null
        });
      },

      // Step 2: Analyze Gaps (Transitions from Unified Input [Step 1] -> Gap Interview [Step 2])
      handleGapAnalysis: async () => {
        const { parsedResume, jobDescription } = get();
        if (!jobDescription) return set({ error: "Please paste a Job Description." });

        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_URL}/analyze-gaps`, {
            resume_data: parsedResume, // Can be null now (handled by backend fix)
            job_description: jobDescription
          });
          set({ gapAnalysis: res.data, currentStep: 2 }); // Move to Step 2
        } catch (err) {
          set({ error: "AI Analysis failed. Try shortening the job description." });
        } finally {
          set({ isLoading: false });
        }
      },

      // Step 3: Generate Tailored Resume
      handleGeneration: async (gapAnswers) => {
        const { parsedResume, jobDescription, generationMode } = get();
        set({ isLoading: true, error: null });

        try {
          // 1. Generate JSON
          const genRes = await axios.post(`${API_URL}/generate-tailored`, {
            current_resume: parsedResume, // Changed key to match backend expectation
            job_description: jobDescription,
            gap_answers: gapAnswers,
            generation_mode: generationMode
          });
          set({ tailoredResume: genRes.data });

          // 2. Render PDF
          await get().regeneratePdf(genRes.data);
          // 2. Render PDF
          await get().regeneratePdf(genRes.data);
          set({ currentStep: 3 }); // Move to Step 3 (Editor/Workspace)

        } catch (err) {
          console.error(err);
          set({ error: "Generation failed." });
        } finally {
          set({ isLoading: false });
        }


      },

      // Step 2.5: Suggest Gap Answer (Resume Coach)
      suggestGapAnswer: async (missingSkill) => {
        const { jobDescription } = get();
        // Hardcoded user ID for now, consistent with other actions
        const USER_ID = "00000000-0000-0000-0000-000000000000";

        try {
          const res = await axios.post(`${API_URL}/suggest-gap-answer`, {
            user_id: USER_ID,
            missing_skill: missingSkill,
            job_description: jobDescription
          });
          return res.data.suggested_text;
        } catch (err) {
          console.error("Suggestion failed", err);
          return null; // Return null on failure so UI can handle it
        }
      },

      // --- APPLICATION TRACKER ACTIONS ---
      saveApplication: async (appData) => {
        // appData: { job_title, company_name, job_location, platform, job_url, status, resume_version_id, resume_json }
        const { jobDescription, jobMetadata } = get();
        const USER_ID = "00000000-0000-0000-0000-000000000000";

        // Merge metadata if not provided in appData (UI might override)
        const payload = {
          user_id: USER_ID,
          job_description: jobDescription,
          ...appData
        };

        try {
          await axios.post(`${API_URL}/applications`, payload);
          return true;
        } catch (error) {
          console.error("Failed to save application", error);
          return false;
        }
      },

      fetchApplications: async () => {
        const USER_ID = "00000000-0000-0000-0000-000000000000";
        try {
          const res = await axios.get(`${API_URL}/applications/${USER_ID}`);
          return res.data;
        } catch (error) {
          console.error("Failed to fetch applications", error);
          return [];
        }
      },

      summarizeReadme: async (text) => {
        try {
          const res = await axios.post(`${API_URL}/summarize-readme`, { readme_text: text });
          return res.data.bullets;
        } catch (error) {
          console.error("Summary failed", error);
          return [];
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