-- Create recruiters table
CREATE TABLE IF NOT EXISTS recruiters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) UNIQUE NOT NULL,
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  description TEXT,
  posted_jobs UUID[] DEFAULT '{}',
  credits INTEGER DEFAULT 0,
  subscription VARCHAR(20) DEFAULT 'free' CHECK (subscription IN ('free', 'basic', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES recruiters(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  type VARCHAR(20) NOT NULL CHECK (type IN ('job_posting', 'subscription', 'credits')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  job_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recruiters_email ON recruiters (contact_email);
CREATE INDEX IF NOT EXISTS idx_recruiters_subscription ON recruiters (subscription);
CREATE INDEX IF NOT EXISTS idx_recruiters_created ON recruiters (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiters_active ON recruiters (last_active DESC);

CREATE INDEX IF NOT EXISTS idx_payments_recruiter ON payments (recruiter_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments (type);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_job ON payments (job_id);

-- Add RLS policies
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Recruiters can manage their own data
CREATE POLICY "Recruiters can view their own data" ON recruiters
  FOR SELECT USING (true); -- Adjust based on your auth system

CREATE POLICY "Recruiters can insert their own data" ON recruiters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Recruiters can update their own data" ON recruiters
  FOR UPDATE USING (true);

-- Payments policies
CREATE POLICY "Recruiters can view their own payments" ON payments
  FOR SELECT USING (true);

CREATE POLICY "System can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON payments
  FOR UPDATE USING (true);

-- Update jobs table to add recruiter_id reference
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS recruiter_id UUID REFERENCES recruiters(id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs (recruiter_id);
