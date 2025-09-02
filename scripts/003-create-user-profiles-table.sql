-- Create user_profiles table for AI matching
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skills TEXT[] DEFAULT '{}',
  experience INTEGER DEFAULT 0,
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_type VARCHAR(20) DEFAULT 'On-site' CHECK (preferred_type IN ('Remote', 'On-site', 'Hybrid')),
  preferred_branches TEXT[] DEFAULT '{}',
  salary_expectation JSONB,
  languages TEXT[] DEFAULT '{"en"}',
  cv TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_skills ON user_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_user_profiles_locations ON user_profiles USING GIN (preferred_locations);
CREATE INDEX IF NOT EXISTS idx_user_profiles_branches ON user_profiles USING GIN (preferred_branches);
CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles (preferred_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience ON user_profiles (experience);

-- Create match_results table to store AI matching results
CREATE TABLE IF NOT EXISTS match_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_id UUID,
  match_score DECIMAL(3,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  reasons TEXT[] DEFAULT '{}',
  skills_match TEXT[] DEFAULT '{}',
  skills_gap TEXT[] DEFAULT '{}',
  salary_fit VARCHAR(10) CHECK (salary_fit IN ('below', 'match', 'above')),
  location_fit VARCHAR(10) CHECK (location_fit IN ('exact', 'nearby', 'remote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_profile_id, job_id)
);

-- Create indexes for match_results
CREATE INDEX IF NOT EXISTS idx_match_results_user ON match_results (user_profile_id);
CREATE INDEX IF NOT EXISTS idx_match_results_job ON match_results (job_id);
CREATE INDEX IF NOT EXISTS idx_match_results_score ON match_results (match_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_results_created ON match_results (created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own profiles (you'll need to adjust based on your auth system)
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (true); -- Adjust based on your auth

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (true); -- Adjust based on your auth

CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (true); -- Adjust based on your auth

-- Match results policies
CREATE POLICY "Users can view their own match results" ON match_results
  FOR SELECT USING (true); -- Adjust based on your auth

CREATE POLICY "System can insert match results" ON match_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update match results" ON match_results
  FOR UPDATE USING (true);
