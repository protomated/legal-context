#!/bin/bash
# switch-postgres-image.sh - Switch between different PostgreSQL images

# Default to the simple approach if not specified
APPROACH=${1:-simple}

case "$APPROACH" in
  simple|s)
    DEV_DOCKERFILE="Dockerfile.simple"
    PROD_DOCKERFILE="Dockerfile.simple"
    APPROACH_NAME="simple (pre-built pgvector)"
    ;;
  custom|c)
    DEV_DOCKERFILE="Dockerfile"
    PROD_DOCKERFILE="Dockerfile"
    APPROACH_NAME="custom (build pgvector from source)"
    ;;
  *)
    echo "Error: Unknown approach '$APPROACH'"
    echo "Usage: ./switch-postgres-image.sh [simple|custom]"
    exit 1
    ;;
esac

echo "Switching to $APPROACH_NAME PostgreSQL image..."

# Update development docker-compose file
sed -i.bak "s/dockerfile: Dockerfile[^[:space:]]*/dockerfile: $DEV_DOCKERFILE/g" docker-compose.dev.yml

# Update production docker-compose file
sed -i.bak "s/dockerfile: Dockerfile[^[:space:]]*/dockerfile: $PROD_DOCKERFILE/g" docker-compose.prod.yml

echo "Done. You will need to rebuild your containers with:"
echo "./start.sh dev"
echo "or"
echo "./start.sh prod"
