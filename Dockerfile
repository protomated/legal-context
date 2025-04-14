FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source files
COPY . .

# Create a non-root user
RUN adduser --disabled-password --gecos "" mcpuser

# Build the project
RUN bun run build

# Switch to non-root user
USER mcpuser

# Volume for persistent data
VOLUME /app/data

# Environment variables
ENV NODE_ENV=production
ENV LANCEDB_DB_PATH=/app/data/lancedb

# Expose the OAuth port
EXPOSE 3001

# Command to run the MCP server
ENTRYPOINT ["bun", "run", "dist/server.js"]
