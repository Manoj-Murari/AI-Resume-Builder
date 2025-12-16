-- User Profiles Table (Master Context)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY, -- Maps to Supabase Auth User ID or custom ID
    full_name TEXT,
    bio TEXT,
    skills JSONB DEFAULT '{}'::jsonb, -- Store categorized skills
    experience JSONB DEFAULT '[]'::jsonb, -- List of experience objects
    projects JSONB DEFAULT '[]'::jsonb, -- List of project objects
    education JSONB DEFAULT '[]'::jsonb, -- List of education objects
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saved Resumes Table
CREATE TABLE IF NOT EXISTS public.saved_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL, -- e.g., "Frontend Developer at Google"
    job_description TEXT,
    resume_json JSONB NOT NULL, -- The specific tailored resume data
    resume_html TEXT, -- Optional: cache the rendered HTML
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_resumes ENABLE ROW LEVEL SECURITY;

-- Allow public access for now as per current setup (can be tightened later)
CREATE POLICY "Allow public all" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "Allow public all" ON public.saved_resumes FOR ALL USING (true);
