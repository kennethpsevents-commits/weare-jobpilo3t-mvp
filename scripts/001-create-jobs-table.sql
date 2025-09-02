-- Create jobs table for JobPilot
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('Remote', 'On-site', 'Hybrid')) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  language VARCHAR(2) CHECK (language IN ('en', 'nl', 'de', 'fr', 'pl')) NOT NULL DEFAULT 'nl',
  country VARCHAR(100),
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  salary VARCHAR(100),
  requirements TEXT[],
  benefits TEXT[],
  source VARCHAR(100) NOT NULL,
  -- Added fields for enhanced job tracking and analytics
  date_posted TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  recruiter_id UUID,
  category VARCHAR(100),
  skills TEXT[],
  experience_level VARCHAR(50) CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead', 'not-specified')),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'EUR',
  is_remote BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  -- End of added fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_language ON jobs(language);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_branch ON jobs(branch);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
-- Added new indexes for enhanced search and filtering
CREATE INDEX IF NOT EXISTS idx_jobs_country ON jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_range ON jobs(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_jobs_date_posted ON jobs(date_posted DESC);
-- End of new indexes

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(to_tsvector('dutch', title || ' ' || company || ' ' || COALESCE(description, '')));

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_active_language_created ON jobs(is_active, language, created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_location_type ON jobs(location, type) WHERE is_active = true;
