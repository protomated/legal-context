#!/bin/bash
# start.sh - Script to build and start the LegalContext containers

# Default to development environment if not specified
ENVIRONMENT=${1:-dev}

case "$ENVIRONMENT" in
  dev|development)
    ENV_FILE="docker-compose.dev.yml"
    ENV_NAME="development"
    ;;
  prod|production)
    ENV_FILE="docker-compose.prod.yml"
    ENV_NAME="production"
    ;;
  *)
    echo "Error: Unknown environment '$ENVIRONMENT'"
    echo "Usage: ./start.sh [dev|prod]"
    exit 1
    ;;
esac

echo "Building and starting LegalContext containers for ${ENV_NAME} environment..."

# Stop any existing containers for this environment
docker-compose -f docker-compose.yml -f ${ENV_FILE} down

# Rebuild the images
docker-compose -f docker-compose.yml -f ${ENV_FILE} build --no-cache

# Start the containers
docker-compose -f docker-compose.yml -f ${ENV_FILE} up -d

# Show container status
docker-compose -f docker-compose.yml -f ${ENV_FILE} ps

echo ""
echo "Container logs can be viewed with: docker-compose -f docker-compose.yml -f ${ENV_FILE} logs -f"

if [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "development" ]; then
  echo "PostgreSQL is available on port 5488"
  echo "LegalContext API is available on port 3000"
else
  echo "LegalContext production API is available on port 3000"
fi
