create table public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,

  -- Job Metadata
  job_title text not null,
  company_name text not null,
  job_location text, -- "Remote", "Chennai"
  platform text,     -- "LinkedIn", "Naukri"
  job_url text,      -- The link to the application
  job_description text, -- The full text (for future AI context)

  -- The Resume Used
  resume_version_id uuid, -- Link to the specific generated resume (optional, or could link to saved_resumes)
  resume_json jsonb,      -- Snapshot of the resume data sent

  status text default 'Applied', -- 'Applied', 'Interviewing', 'Rejected', 'Offer'
  created_at timestamptz default now()
);
