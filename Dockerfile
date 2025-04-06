# Base stage for both development and production
FROM oven/bun:1.0 AS base
WORKDIR /app
# Install dependencies that might be needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Development stage
FROM base AS development
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
# We don't copy the source code here as we'll use volume mounts for development

# Production dependencies stage
FROM base AS production-deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=development /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
# Copy production dependencies
COPY --from=production-deps /app/node_modules ./node_modules
# Copy built application
COPY --from=build /app/dist ./dist
# Copy necessary files
COPY package.json ./

# Set up healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pg_isready -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USERNAME || exit 1

# Run the application
CMD ["bun", "dist/main.js"]
