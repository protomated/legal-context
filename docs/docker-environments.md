# Docker Environment Setup

This guide explains how to use the separate Docker Compose environments for development and production.

## Environment Structure

The Docker Compose configuration has been split into three files:

1. `docker-compose.yml` - Base configuration with common settings
2. `docker-compose.dev.yml` - Development-specific settings
3. `docker-compose.prod.yml` - Production-specific settings

This separation allows you to run different environments without conflicts and customize each environment independently.

## Helper Scripts

Several scripts have been created to make working with the environments easier:

### 1. `start.sh` - Start containers for an environment

```bash
# Start development environment (default if no argument provided)
./start.sh dev

# Start production environment
./start.sh prod
```

This script will:
- Stop any existing containers for the specified environment
- Rebuild the images (with --no-cache to ensure latest changes)
- Start the containers
- Show container status

### 2. `run.sh` - Run any docker-compose command for an environment

```bash
# Run a command for development environment
./run.sh dev ps
./run.sh dev logs -f
./run.sh dev exec postgres-dev psql -U postgres -d legalcontext_dev

# Run a command for production environment
./run.sh prod ps
./run.sh prod logs -f
```

This script is a convenient wrapper around `docker-compose -f docker-compose.yml -f docker-compose.dev.yml` (or prod) commands.

### 3. `check-pgvector.sh` - Verify pgvector extension

```bash
# Check pgvector in development environment
./check-pgvector.sh dev

# Check pgvector in production environment
./check-pgvector.sh prod
```

This script verifies that the pgvector extension is properly installed and functioning.

## Common Operations

### Starting the Development Environment

```bash
./start.sh dev
```

### Starting the Production Environment

```bash
./start.sh prod
```

### Viewing Logs

```bash
# Development logs
./run.sh dev logs -f

# Production logs
./run.sh prod logs -f
```

### Stopping Containers

```bash
# Stop development environment
./run.sh dev down

# Stop production environment
./run.sh prod down
```

### Accessing PostgreSQL

```bash
# Development database
./run.sh dev exec postgres-dev psql -U postgres -d legalcontext_dev

# Production database
./run.sh prod exec postgres-prod psql -U postgres -d legalcontext_prod
```

## Environment Differences

### Development Environment

- Uses development build target
- Mounts code volume for live reloading
- Uses simple PostgreSQL configuration
- Uses default development credentials

### Production Environment

- Uses production build target
- Does not mount code volumes (uses built code)
- Uses custom PostgreSQL configuration
- Uses environment variables for sensitive credentials
- Includes logging configuration optimized for production
- Sets restart policies for reliability

## Environment Variables

### Development

Development environment variables can be set in a `.env` file or passed directly to the container:

```
CLIO_CLIENT_ID=your_client_id
CLIO_CLIENT_SECRET=your_client_secret
CLIO_REDIRECT_URI=http://localhost:3000/clio/auth/callback
CLIO_API_URL=https://app.clio.com/api/v4
ENCRYPTION_KEY=your_encryption_key
```

### Production

Production environment variables should be set securely (e.g., using Docker secrets or environment variables):

```
PROD_DB_PASSWORD=secure_password
PROD_CLIO_CLIENT_ID=your_production_client_id
PROD_CLIO_CLIENT_SECRET=your_production_client_secret
PROD_CLIO_REDIRECT_URI=https://your-domain.com/clio/auth/callback
PROD_CLIO_API_URL=https://app.clio.com/api/v4
PROD_ENCRYPTION_KEY=your_production_encryption_key
```

## Troubleshooting

### pgvector Extension Not Available

If you encounter an error about the pgvector extension not being available:

1. Check if the PostgreSQL container is running:
   ```bash
   ./run.sh dev ps
   ```

2. If it's running, try manually creating the extension:
   ```bash
   ./run.sh dev exec postgres-dev psql -U postgres -d legalcontext_dev -c "CREATE EXTENSION vector;"
   ```

3. Verify the extension is installed:
   ```bash
   ./check-pgvector.sh dev
   ```

### Connection Issues

If you're having trouble connecting to services:

1. Check if the containers are running:
   ```bash
   ./run.sh dev ps
   ```

2. Check the logs for errors:
   ```bash
   ./run.sh dev logs
   ```

3. Verify the ports are correctly mapped:
   ```bash
   ./run.sh dev port
   ```

### Database Reset

If you need to reset the database:

```bash
# Remove volumes along with containers
./run.sh dev down -v

# Restart with fresh volumes
./start.sh dev
```

## Custom Configuration

To customize the environments further, edit the respective docker-compose files:

- `docker-compose.dev.yml` for development-specific settings
- `docker-compose.prod.yml` for production-specific settings
- `docker-compose.yml` for common settings shared between environments
