-- Upgrade user_profiles table for Master Profile 2.0

-- Ensure columns exist (Postgres 9.6+)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;

-- Comment: Skills column likely already exists as JSONB. 
-- We will just change the stored data format from Object to Array via Application Logic.
