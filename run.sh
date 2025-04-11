#!/bin/bash
# run.sh - Helper script to run docker-compose commands with the correct environment

# Default to development environment if not specified
ENVIRONMENT=${1:-dev}

case "$ENVIRONMENT" in
  dev|development)
    ENV_FILE="docker-compose.dev.yml"
    ENV_NAME="development"
    shift # Remove the environment argument
    ;;
  prod|production)
    ENV_FILE="docker-compose.prod.yml"
    ENV_NAME="production"
    shift # Remove the environment argument
    ;;
  *)
    echo "Error: Unknown environment '$ENVIRONMENT'"
    echo "Usage: ./run.sh [dev|prod] [command]"
    echo "Examples:"
    echo "  ./run.sh dev ps"
    echo "  ./run.sh prod logs -f"
    exit 1
    ;;
esac

# If no additional arguments, show help
if [ $# -eq 0 ]; then
  echo "Error: No command specified"
  echo "Usage: ./run.sh [dev|prod] [command]"
  echo "Examples:"
  echo "  ./run.sh dev ps"
  echo "  ./run.sh prod logs -f"
  exit 1
fi

echo "Running command for ${ENV_NAME} environment: $@"
docker-compose -f docker-compose.yml -f ${ENV_FILE} "$@"
