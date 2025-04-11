-- This SQL script runs during PostgreSQL initialization.
-- The pgvector extension should already be installed in the ankane/pgvector image,
-- but we'll confirm it's available and create any necessary indexes.

-- Confirm vector extension is available and create it if not already created
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

-- Create a test table to verify pgvector works
CREATE TABLE IF NOT EXISTS vector_test (
    id serial PRIMARY KEY,
    embedding vector(3)
);

-- Insert a test vector if the table is empty
INSERT INTO vector_test (embedding)
SELECT '[1,2,3]'
WHERE NOT EXISTS (SELECT 1 FROM vector_test LIMIT 1);

-- Set permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
