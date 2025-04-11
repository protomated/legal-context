#!/bin/bash
# check-pgvector.sh - Script to verify pgvector extension in PostgreSQL

# Default to development environment if not specified
ENVIRONMENT=${1:-dev}

case "$ENVIRONMENT" in
  dev|development)
    ENV_FILE="docker-compose.dev.yml"
    ENV_NAME="development"
    POSTGRES_SERVICE="postgres-dev"
    DB_NAME="legalcontext_dev"
    ;;
  prod|production)
    ENV_FILE="docker-compose.prod.yml"
    ENV_NAME="production"
    POSTGRES_SERVICE="postgres-prod"
    DB_NAME="legalcontext_prod"
    ;;
  *)
    echo "Error: Unknown environment '$ENVIRONMENT'"
    echo "Usage: ./check-pgvector.sh [dev|prod]"
    exit 1
    ;;
esac

echo "Checking pgvector extension in PostgreSQL container (${ENV_NAME})..."

# Check if container exists and is running
if ! docker-compose -f docker-compose.yml -f ${ENV_FILE} ps ${POSTGRES_SERVICE} | grep -q "Up"; then
  echo "Error: ${POSTGRES_SERVICE} container is not running"
  echo "Please run ./start.sh ${ENVIRONMENT} to start the containers"
  exit 1
fi

# Run SQL query to check for pgvector extension
echo "Running query to check for 'vector' extension..."
docker-compose -f docker-compose.yml -f ${ENV_FILE} exec ${POSTGRES_SERVICE} psql -U postgres -d ${DB_NAME} -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"

# Check if we can create a vector column
echo "Testing vector functionality..."
docker-compose -f docker-compose.yml -f ${ENV_FILE} exec ${POSTGRES_SERVICE} psql -U postgres -d ${DB_NAME} -c "
  DROP TABLE IF EXISTS vector_test;
  CREATE TABLE vector_test (id serial PRIMARY KEY, embedding vector(3));
  INSERT INTO vector_test (embedding) VALUES ('[1,2,3]');
  SELECT * FROM vector_test;
"

echo "PGVector check completed. If no errors appeared, the extension is working correctly."
