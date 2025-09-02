-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to embeds table
ALTER TABLE embeds ADD COLUMN IF NOT EXISTS vec vector(1536);

-- Create vector similarity index
CREATE INDEX IF NOT EXISTS idx_embeds_vec ON embeds USING ivfflat (vec vector_cosine_ops) WITH (lists = 100);

-- Create function for semantic job search
CREATE OR REPLACE FUNCTION search_jobs_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  job_id text,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT 
    e.job_id,
    1 - (e.vec <=> query_embedding) as similarity
  FROM embeds e
  JOIN jobs j ON j.id = e.job_id
  WHERE 
    j.is_active = true
    AND 1 - (e.vec <=> query_embedding) > match_threshold
  ORDER BY e.vec <=> query_embedding
  LIMIT match_count;
$$;
