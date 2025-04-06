-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector index on document_vector if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'document_vector'
    ) THEN
        -- Create index for cosine distance
        EXECUTE 'CREATE INDEX IF NOT EXISTS document_vector_embedding_idx
                 ON document_vector USING ivfflat (embedding vector_cosine_ops)
                 WITH (lists = 100)';
    END IF;
END
$$;

-- Set permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
