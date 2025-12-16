
-- Add personal_info column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS personal_info JSONB DEFAULT '{}'::jsonb;
