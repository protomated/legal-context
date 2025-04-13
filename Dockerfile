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
USER mcpuser

# Expose any necessary ports (if your MCP uses HTTP)
# EXPOSE 3001

# Command to run the MCP server
ENTRYPOINT ["bun", "run", "src/server.ts"]
