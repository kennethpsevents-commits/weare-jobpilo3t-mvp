-- Create crawl logs table for tracking crawler activity
CREATE TABLE IF NOT EXISTS crawl_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(100) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('running', 'completed', 'failed')) NOT NULL DEFAULT 'running',
  jobs_found INTEGER DEFAULT 0,
  jobs_saved INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  errors TEXT[],
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crawl_logs_status ON crawl_logs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_source ON crawl_logs(source);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_started_at ON crawl_logs(started_at);

-- Create function to update crawl log completion
CREATE OR REPLACE FUNCTION complete_crawl_log(
  log_id UUID,
  final_status VARCHAR(20),
  jobs_found_count INTEGER,
  jobs_saved_count INTEGER,
  error_messages TEXT[] DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE crawl_logs 
  SET 
    status = final_status,
    jobs_found = jobs_found_count,
    jobs_saved = jobs_saved_count,
    completed_at = NOW(),
    duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
    errors = COALESCE(error_messages, ARRAY[]::TEXT[])
  WHERE id = log_id;
END;
$$ LANGUAGE plpgsql;
