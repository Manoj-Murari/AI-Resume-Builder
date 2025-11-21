-- Storage for raw resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('raw_resumes', 'raw_resumes', true) ON CONFLICT (id) DO NOTHING;

-- Master Resumes Table
CREATE TABLE public.master_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    parsed_data JSONB,
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Security Policies (RLS)
ALTER TABLE public.master_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON public.master_resumes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.master_resumes FOR SELECT USING (true);
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'raw_resumes');
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'raw_resumes');