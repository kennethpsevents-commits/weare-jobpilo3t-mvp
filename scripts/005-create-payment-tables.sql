-- Create payment_logs table for tracking all payment transactions
CREATE TABLE IF NOT EXISTS payment_logs (
  id SERIAL PRIMARY KEY,
  recruiter_id INTEGER REFERENCES recruiters(id) ON DELETE CASCADE,
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER NOT NULL, -- Amount in cents
  credits INTEGER NOT NULL,
  package_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_logs_recruiter_id ON payment_logs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

-- Add credits column to recruiters table if it doesn't exist
ALTER TABLE recruiters 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Create credit_transactions table for detailed credit tracking
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  recruiter_id INTEGER REFERENCES recruiters(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'purchase', 'spend', 'refund'
  amount INTEGER NOT NULL, -- Positive for additions, negative for spending
  balance_after INTEGER NOT NULL,
  description TEXT,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  payment_log_id INTEGER REFERENCES payment_logs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for credit transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_recruiter_id ON credit_transactions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Function to handle credit transactions
CREATE OR REPLACE FUNCTION handle_credit_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert credit transaction record
  INSERT INTO credit_transactions (
    recruiter_id,
    type,
    amount,
    balance_after,
    description,
    job_id,
    payment_log_id
  ) VALUES (
    NEW.recruiter_id,
    CASE 
      WHEN NEW.credits > OLD.credits THEN 'purchase'
      WHEN NEW.credits < OLD.credits THEN 'spend'
      ELSE 'adjustment'
    END,
    NEW.credits - OLD.credits,
    NEW.credits,
    CASE 
      WHEN NEW.credits > OLD.credits THEN 'Credits purchased'
      WHEN NEW.credits < OLD.credits THEN 'Credits spent on job posting'
      ELSE 'Credit adjustment'
    END,
    NULL, -- job_id will be set separately when spending credits
    NULL  -- payment_log_id will be set separately when purchasing credits
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credit transactions
DROP TRIGGER IF EXISTS trigger_credit_transaction ON recruiters;
CREATE TRIGGER trigger_credit_transaction
  AFTER UPDATE OF credits ON recruiters
  FOR EACH ROW
  WHEN (OLD.credits IS DISTINCT FROM NEW.credits)
  EXECUTE FUNCTION handle_credit_transaction();
