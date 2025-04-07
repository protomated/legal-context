# .gitignore

```
# compiled output
/dist
/node_modules

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Temporary files
tmp/
temp/

```

# .prettierrc

```
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

# claude-config.json

```json
{
  "mcpServers": {
    "legalcontext": {
      "command": "bunx",
      "args": [
        "run",
        "/path/to/legal-context/src/claude-mcp-server.ts"
      ],
      "cwd": ""
    }
  }
}

```

# CODE_OF_CONDUCT.md

```md
# Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, caste, color, religion, or sexual
identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
* Focusing on what is best not just for us as individuals, but for the overall
  community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or advances of
  any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email address,
  without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Professional Context

As a tool designed for legal professionals, we recognize the heightened importance of maintaining professionalism and respecting confidentiality. Contributors should be particularly mindful of:

* Respecting attorney-client privilege and confidentiality in discussions and examples
* Avoiding sharing any actual client data, even if anonymized
* Being mindful of ethical obligations that may apply to legal professionals who contribute to this project

## Enforcement Responsibilities

Project maintainers are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

Project maintainers have the right and responsibility to remove, edit, or reject
comments, commits, code, wiki edits, issues, and other contributions that are
not aligned to this Code of Conduct, and will communicate reasons for moderation
decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.
Examples of representing our community include using an official e-mail address,
posting via an official social media account, or acting as an appointed
representative at an online or offline event.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the project team at [ask@protomated.com](mailto:ask@protomated.com).
All complaints will be reviewed and investigated promptly and fairly.

All project maintainers are obligated to respect the privacy and security of the
reporter of any incident.

## Enforcement Guidelines

Project maintainers will follow these Community Impact Guidelines in determining
the consequences for any action they deem in violation of this Code of Conduct:

### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed
unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from project maintainers, providing
clarity around the nature of the violation and an explanation of why the
behavior was inappropriate. A public apology may be requested.

### 2. Warning

**Community Impact**: A violation through a single incident or series of
actions.

**Consequence**: A warning with consequences for continued behavior. No
interaction with the people involved, including unsolicited interaction with
those enforcing the Code of Conduct, for a specified period of time. This
includes avoiding interactions in community spaces/

```

# CONTRIBUTING

```
# Contributing to LegalContext Connect

Thank you for your interest in contributing to LegalContext Connect! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Bug reports help us improve LegalContext Connect. To report a bug:

1. Check the [GitHub Issues](https://github.com/protomated/legalcontext-connect/issues) to see if the bug has already been reported
2. If not, create a new issue using the Bug Report template
3. Provide a clear title and description
4. Include steps to reproduce the issue
5. Add information about your environment (OS, Node.js version, etc.)
6. Add relevant screenshots or logs if possible

### Suggesting Enhancements

We welcome suggestions for enhancements:

1. Check existing issues to see if your idea has already been suggested
2. Create a new issue using the Feature Request template
3. Clearly describe the enhancement and its benefits
4. Provide examples of how the enhancement would work

### Pull Requests

We welcome pull requests for bug fixes and enhancements:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes, following our coding conventions
4. Add or update tests as necessary
5. Ensure all tests pass
6. Update documentation to reflect your changes
7. Submit a pull request

For significant changes, please open an issue to discuss before submitting a pull request.

## Development Setup

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- Git

### Local Development Environment

1. Fork and clone the repository:
   \`\`\`bash
   git clone https://github.com/YOUR-USERNAME/legalcontext-connect.git
   cd legalcontext-connect
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Build the project:
   \`\`\`bash
   npm run build
   \`\`\`

4. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

### Project Structure

- `src/` - Source code
  - `mcp/` - MCP server implementation
  - `netdocuments/` - NetDocuments API integration
  - `oauth/` - OAuth 2.0 implementation
- `electron/` - Electron app code
- `test/` - Test files
- `docs/` - Documentation

## Coding Conventions

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful commit messages
- Include JSDoc comments for all public APIs
- Write tests for all new features and bug fixes

## Documentation

- Update the README.md if your changes affect how users interact with the project
- Update or add documentation in the `docs/` directory as needed
- Include inline comments for complex logic

## Legal

By contributing to LegalContext Connect, you agree that your contributions will be licensed under the project's [Mozilla Public License 2.0](LICENSE).

## Questions?

If you have any questions about contributing, please open an issue or contact us at [ask@protomated.com](mailto:ask@protomated.com).

Thank you for contributing to LegalContext Connect!

```

# CONTRIBUTING.md

```md
# Contributing to LegalContext

Thank you for your interest in contributing to LegalContext! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Bug reports help us improve LegalContext. To report a bug:

1. Check the [GitHub Issues](https://github.com/protomated/legalcontext-connect/issues) to see if the bug has already been reported
2. If not, create a new issue using the Bug Report template
3. Provide a clear title and description
4. Include steps to reproduce the issue
5. Add information about your environment (OS, Node.js version, etc.)
6. Add relevant screenshots or logs if possible

### Suggesting Enhancements

We welcome suggestions for enhancements:

1. Check existing issues to see if your idea has already been suggested
2. Create a new issue using the Feature Request template
3. Clearly describe the enhancement and its benefits
4. Provide examples of how the enhancement would work

### Pull Requests

We welcome pull requests for bug fixes and enhancements:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes, following our coding conventions
4. Add or update tests as necessary
5. Ensure all tests pass
6. Update documentation to reflect your changes
7. Submit a pull request

For significant changes, please open an issue to discuss before submitting a pull request.

## Development Setup

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- Git

### Local Development Environment

1. Fork and clone the repository:
   \`\`\`bash
   git clone https://github.com/YOUR-USERNAME/legalcontext-connect.git
   cd legalcontext-connect
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Build the project:
   \`\`\`bash
   npm run build
   \`\`\`

4. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

### Project Structure

- `src/` - Source code
  - `mcp/` - MCP server implementation
  - `netdocuments/` - NetDocuments API integration
  - `oauth/` - OAuth 2.0 implementation
- `electron/` - Electron app code
- `test/` - Test files
- `docs/` - Documentation

## Coding Conventions

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful commit messages
- Include JSDoc comments for all public APIs
- Write tests for all new features and bug fixes

## Documentation

- Update the README.md if your changes affect how users interact with the project
- Update or add documentation in the `docs/` directory as needed
- Include inline comments for complex logic

## Legal

By contributing to LegalContext, you agree that your contributions will be licensed under the project's [Mozilla Public License 2.0](LICENSE).

## Questions?

If you have any questions about contributing, please open an issue or contact us at [ask@protomated.com](mailto:ask@protomated.com).

Thank you for contributing to LegalContext!

```

# demo.sh

```sh
#!/bin/sh

# LegalContext Demo Script
# This script builds and runs the LegalContext MCP server and then connects a test client to it

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo "${BLUE}=======================================${NC}"
echo "${BLUE}     LegalContext MCP Server Demo     ${NC}"
echo "${BLUE}=======================================${NC}"
echo ""

# Check for bun
echo "${BLUE}Checking prerequisites...${NC}"
if ! command -v bun &> /dev/null
then
    echo "${RED}Bun is not installed. Please install Bun first:${NC}"
    echo "  curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Install dependencies if needed
echo "${BLUE}Installing dependencies...${NC}"
bun install

# Run the demo client
echo "${BLUE}Starting demo client...${NC}"
echo "${BLUE}This will initialize the MCP server and connect a test client to it.${NC}"
echo ""

# Start the demo client
bun run demo

echo ""
echo "${GREEN}Demo completed!${NC}"
echo ""
echo "To integrate with Claude Desktop, follow the instructions in:"
echo "  docs/mcp-client-integration.md"
echo ""
echo "${BLUE}=======================================${NC}"

```

# docker-compose.yml

```yml
version: '3.8'

services:
  # Development services
  legalcontext-dev:
    container_name: legalcontext-dev
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - DATABASE_HOST=postgres-dev
      - DATABASE_PORT=5432
      - DATABASE_USERNAME=postgres
      - DATABASE_PASSWORD=postgres
      - DATABASE_NAME=legalcontext_dev
      # These would typically be in a .env file or passed at runtime
      - CLIO_CLIENT_ID=${CLIO_CLIENT_ID}
      - CLIO_CLIENT_SECRET=${CLIO_CLIENT_SECRET}
      - CLIO_REDIRECT_URI=${CLIO_REDIRECT_URI}
      - CLIO_API_URL=${CLIO_API_URL}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - postgres-dev
    command: bun run start:dev

  postgres-dev:
    container_name: postgres-dev
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=legalcontext_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres-dev-data:/var/lib/postgresql/data
      # Add custom initialization scripts if needed
      - ./docker/postgres/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro
      - ./docker/postgres/init-vector.sql:/docker-entrypoint-initdb.d/init-vector.sql:ro

  # Production services
  legalcontext-prod:
    container_name: legalcontext-prod
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_HOST=postgres-prod
      - DATABASE_PORT=5432
      - DATABASE_USERNAME=postgres
      - DATABASE_PASSWORD=${PROD_DB_PASSWORD}
      - DATABASE_NAME=legalcontext_prod
      - CLIO_CLIENT_ID=${PROD_CLIO_CLIENT_ID}
      - CLIO_CLIENT_SECRET=${PROD_CLIO_CLIENT_SECRET}
      - CLIO_REDIRECT_URI=${PROD_CLIO_REDIRECT_URI}
      - CLIO_API_URL=${PROD_CLIO_API_URL}
      - ENCRYPTION_KEY=${PROD_ENCRYPTION_KEY}
      - MAX_DOCUMENT_SIZE=5242880
      - CHUNK_SIZE=1000
      - CHUNK_OVERLAP=200
    depends_on:
      - postgres-prod
    restart: unless-stopped
    # Production specific logging configuration
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  postgres-prod:
    container_name: postgres-prod
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${PROD_DB_PASSWORD}
      - POSTGRES_DB=legalcontext_prod
    volumes:
      - postgres-prod-data:/var/lib/postgresql/data
      # Add custom initialization scripts
      - ./docker/postgres/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro
      - ./docker/postgres/init-vector.sql:/docker-entrypoint-initdb.d/init-vector.sql:ro
    # Production-specific configurations
    restart: unless-stopped
    # Use a custom postgres configuration for production
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    configs:
      - source: postgres_config
        target: /etc/postgresql/postgresql.conf

configs:
  postgres_config:
    file: ./docker/postgres/postgresql.conf

volumes:
  node_modules:
  postgres-dev-data:
  postgres-prod-data:

```

# docker/postgres/init-db.sh

```sh
#!/bin/bash
set -e

# Create pgvector extension
echo "Creating pgvector extension..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vector;
EOSQL

echo "PostgreSQL initialization completed"

```

# docker/postgres/init-vector.sql

```sql
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

```

# docker/postgres/postgresql.conf

```conf
# postgresql.conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 7864kB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
max_parallel_maintenance_workers = 2

```

# Dockerfile

```
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

```

# docs/about-legal-text.md

```md
# LegalContext
## Secure AI document context for law firms

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://github.com/protomated/legalcontext-connect/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/protomated/legalcontext-connect/releases)

## Table of Contents

1. [Overview](#overview)
2. [The AI Hallucination Crisis in Legal Practice](#the-ai-hallucination-crisis-in-legal-practice)
3. [How LegalContext Solves This Problem](#how-legalcontext-connect-solves-this-problem)
4. [User Flow Diagram](#user-flow-diagram)
5. [LegalContext vs. Alternative Solutions](#legalcontext-connect-vs-alternative-solutions)
6. [Key Features](#key-features)
7. [Technical Architecture](#technical-architecture)
8. [Frequently Asked Questions](#frequently-asked-questions)
9. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Free Tier Limitations](#free-tier-limitations)
10. [Licensing Tiers and Pricing](#licensing-tiers-and-pricing)
    - [Free Open Source](#free-open-source)
    - [Professional](#professional)
    - [Enterprise](#enterprise)
    - [Additional Services](#additional-services)
11. [For Collaborators](#for-collaborators)
    - [Development Setup](#development-setup)
    - [Project Structure](#project-structure)
    - [Testing](#testing)
    - [Deployment](#deployment)
12. [Contributing](#contributing)
13. [License](#license)
14. [Support](#support)

## Overview

LegalContext is an open-source Model Context Protocol (MCP) server that creates a secure, standardized bridge between law firms' document management systems (specifically Clio) and AI assistants (starting with Claude Desktop). It enables AI tools to access, retrieve, and incorporate firm document context while maintaining complete security and control over sensitive information.

**Key Value Proposition**: Transform AI from a liability risk into a trusted legal assistant by ensuring all AI responses are grounded in your firm's actual documents and expertise.

## The AI Hallucination Crisis in Legal Practice

AI hallucinations pose a critical risk in legal settings, as evidenced by several high-profile cases:

- A recent Stanford study found that even the latest legal AI tools hallucinate in 1 out of 6 (or more) queries, despite using Retrieval Augmented Generation (RAG). While some legal tech companies claim their tools are "hallucination-free," Stanford researchers found that LexisNexis and Thomson Reuters AI tools each hallucinate between 17% and 33% of the time. [Source: [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries), [Stanford Law School](https://law.stanford.edu/publications/hallucination-free-assessing-the-reliability-of-leading-ai-legal-research-tools/)]

- Federal judges have imposed serious sanctions on attorneys for relying on AI hallucinations. In one Manhattan case, two New York lawyers were fined $5,000 for submitting fictional cases generated by ChatGPT. A Texas lawyer was ordered to pay a $2,000 penalty and attend AI education courses after citing nonexistent cases and fabricated quotations. [Source: [Reuters](https://www.reuters.com/technology/artificial-intelligence/ai-hallucinations-court-papers-spell-trouble-lawyers-2025-02-18/), [Bloomberg Law](https://news.bloomberglaw.com/litigation/lawyer-sanctioned-over-ai-hallucinated-case-cites-quotations)]

- Lawyers at Morgan & Morgan, one of the nation's largest personal injury firms, faced sanctions when their internal AI platform "hallucinated" fake cases. The judge fined the primary attorney $3,000 and revoked his temporary admission to practice. [Source: [ABA Journal](https://www.abajournal.com/news/article/no-42-law-firm-by-headcount-could-face-sanctions-over-fake-case-citations-generated-by-chatgpt), [Clio Blog](https://www.clio.com/blog/ai-hallucination-case/)]

- These incidents led Morgan & Morgan to send an urgent email to its more than 1,000 lawyers warning that "Artificial intelligence can invent fake case law, and using made-up information in a court filing could get you fired." [Source: [Reuters](https://www.reuters.com/technology/artificial-intelligence/ai-hallucinations-court-papers-spell-trouble-lawyers-2025-02-18/)]

- As Judge Marcia Crone noted, "The duties imposed by Rule 11 require that attorneys read, and thereby confirm the existence and validity of, the legal authorities on which they rely." Multiple courts have emphasized that AI use does not excuse attorneys from their professional responsibility to verify sources. [Source: [Baker Botts](https://www.bakerbotts.com/thought-leadership/publications/2024/december/trust-but-verify-avoiding-the-perils-of-ai-hallucinations-in-court)]

## How LegalContext Solves This Problem

LegalContext addresses the hallucination crisis through a fundamentally different approach to AI document integration:

### 1. Firm-Specific Document Grounding

Unlike generic RAG systems or public legal databases, LegalContext:
- Connects directly to your firm's Clio document management system
- Makes your firm's proprietary knowledge and precedents available to Claude
- Ensures AI responses are based on your actual documents, not imagined cases
- Creates an institutional memory accessible to all your attorneys

### 2. Secure Local Processing

All document processing occurs completely within your firm's security perimeter:
- Zero document content transmitted to external servers
- No sensitive data exposed to third parties
- Complies with client confidentiality requirements
- Maintains Clio's existing security model and permissions

### 3. Citation Tracking & Verification

Every statement generated by the AI is transparently linked to its source:
- Automatic citation of specific firm documents
- Clear attribution to enable verification
- Prevention of unsourced claims
- Audit trail for AI-generated content

## User Flow Diagram

\`\`\`mermaid
sequenceDiagram
    participant Attorney as Attorney
    participant Claude as Claude Desktop
    participant LCServer as LegalContext
    participant Clio as Clio Document System
    
    %% Everyday Usage Flow
    rect rgb(240, 255, 245)
        Note over Attorney,Clio: Typical Workflow
        
        Attorney->>Claude: "What precedents do we have for consumer privacy cases?"
        Note over Claude: Claude decides to use search tool
        Claude->>LCServer: Search firm documents (tool call)
        LCServer->>Clio: Retrieve relevant documents
        Clio-->>LCServer: Return document list & content
        LCServer-->>Claude: Return search results with metadata
        Claude-->>Attorney: Present answer with cited firm documents
        Note right of Attorney: All citations link to source documents
    end
\`\`\`

## LegalContext vs. Alternative Solutions

| Feature | LegalContext                           | Generic RAG Systems | Legal Research AI | General Purpose AI |
|---------|----------------------------------------|---------------------|-------------------|-------------------|
| **Knowledge Source** | 🟢 Firm-specific documents & expertise | 🟡 Generic knowledge bases | 🟡 Public legal databases | 🔴 General training data |
| **Data Processing** | 🟢 100% local processing               | 🔴 Cloud processing | 🔴 Cloud processing | 🔴 Cloud processing |
| **Document Integration** | 🟢 Native Clio integration             | 🔴 No DMS integration | 🔴 Research tool focus | 🔴 No document integration |
| **Hallucination Prevention** | 🟢 Firm knowledge + citation tracking  | 🟡 Limited context | 🟡 Generic citations | 🔴 High hallucination risk |
| **Workflow Integration** | 🟢 Seamless with Claude Desktop        | 🟡 Requires workflow changes | 🔴 Standalone product | 🟡 Generic capabilities |
| **Security & Compliance** | 🟢 Zero data exposure                  | 🔴 External data processing | 🔴 External data processing | 🔴 External data processing |

🟢 = Excellent &nbsp;&nbsp; 🟡 = Moderate &nbsp;&nbsp; 🔴 = Poor/None

### Why LegalContext Is Different

While many solutions claim to solve the AI hallucination problem, they fall short in key ways:

1. **Superior to Existing RAG Systems**
   - A June 2024 Stanford study found that even leading RAG-based legal AI tools from LexisNexis and Thomson Reuters hallucinate 17-33% of the time
   - Generic RAG systems rely on text similarity rather than legal relevance
   - LegalContext grounds AI responses in your firm's actual knowledge, not public databases

2. **Better Than Clio Duo**
   - Complements rather than competes with Clio's native AI
   - Provides integration with Claude's advanced capabilities
   - Allows flexibility in AI assistant choice
   - Works with your existing document management system

3. **More Secure Than Cloud Solutions**
   - No sensitive data transmitted outside your firm
   - Complete control over document access
   - Maintains existing security permissions
   - Protects client confidentiality

## Key Features

### 🔒 Secure Document Integration
- Creates a protected pathway for Claude to access documents stored in Clio
- All document processing happens locally within your firm's network
- Zero sensitive data exposed outside your security perimeter

### 📚 Contextual Retrieval
- Intelligently surfaces relevant firm documents when attorneys ask legal questions
- Ensures AI responses are grounded in the firm's actual knowledge and precedents
- Enables access to document content across practice areas and matters

### 📝 Citation Tracking
- Automatically adds proper citations to AI outputs
- Links each statement to specific firm documents for verification
- Creates an audit trail for AI-generated content

### ❌ Hallucination Prevention
- Dramatically reduces AI "hallucinations" by grounding responses in actual firm documents
- Prevents the generation of fictional case law, precedents, or legal principles
- Increases reliability and trustworthiness of AI output

### 🧠 Knowledge Amplification
- Makes the firm's collective expertise accessible to every attorney
- Helps junior staff leverage institutional knowledge previously siloed across the organization
- Extends the impact of expert attorneys throughout the firm

### 💼 Workflow Integration
- Seamlessly integrates with existing attorney workflows
- No new interfaces to learn
- Maintains Clio security model and permissions

## Technical Architecture

\`\`\`mermaid
graph TB
    %% Define styles
    classDef secureZone fill:#e6fff2,stroke:#00b33c,stroke-width:2px
    
    subgraph LawFirm["Law Firm Environment"]
        %% Claude Desktop
        Claude[Claude Desktop<br>AI Assistant]
        
        %% MCP Section
        subgraph MCP["LegalContext (MCP Server)"]
            subgraph NestJS["NestJS Backend"]
                Server["MCP Server"]
                
                subgraph Core["Core Components"]
                    McpHandler["MCP Protocol Handler"]
                    ResourceMgr["Resource Manager"]
                    ToolMgr["Tool Manager"]
                    PromptMgr["Prompt Manager"]
                    SecurityMgr["Security Manager"]
                end
                
                subgraph Services["Business Services"]
                    DocService["Document Service"]
                    MatterService["Matter Service"]
                    SearchService["Search Service"]
                    AnalyticsService["Analytics Service"]
                end
                
                subgraph Integration["Integration Layer"]
                    ClioIntegration["Clio Integration"]
                    OAuthHandler["OAuth 2.0 Handler"]
                    TokenStore["Secure Token Store"]
                end
            end
            
            DB[(SQLite Database)]
            Cache["Document Cache"]
            Logs["Access & Audit Logs"]
        end
        
        %% Clio Section
        Clio["Clio<br>Document Management"]
        
        %% Flow between components
        Claude <--> |"MCP Protocol<br>(stdio)"| Server
        Server <--> Core
        Core <--> Services
        Services <--> Integration
        Integration <--> |"REST API<br>OAuth 2.0"| Clio
        
        NestJS <--> DB
        NestJS <--> Cache
        NestJS <--> Logs
    end
    
    %% Apply styles to elements
    class LawFirm secureZone
    class MCP secureZone
\`\`\`

## Frequently Asked Questions

### Privacy & Security

#### Does LegalContext send my documents to external services?
No. All document processing happens 100% locally within your firm's network. LegalContext creates a secure bridge between Clio and Claude Desktop that keeps your documents within your security perimeter at all times. Your document content never leaves your firm's environment or gets transmitted to external servers. [Source: [TechTarget](https://www.techtarget.com/searchenterpriseai/news/366616516/Anthropics-new-standard-raises-AI-privacy-other-concerns)]

#### Does Claude use my document data for training?
No. Anthropic (Claude's creator) has a clear policy stating: "We will not use your Inputs or Outputs to train our models" by default. The only exceptions are if: (1) your conversations are flagged for Trust & Safety review, or (2) you explicitly opt-in by submitting feedback. [Source: [Anthropic Privacy Center](https://privacy.anthropic.com/en/articles/10023555-how-do-you-use-personal-data-in-model-training)]

#### Who can view my conversations with Claude?
By default, Anthropic employees cannot access your conversations. Limited access is provided only when: (1) you explicitly consent to share data through feedback, or (2) review is needed to enforce their Usage Policy. Even then, only designated Trust & Safety team members may access this data on a need-to-know basis. [Source: [Anthropic Help Center](https://support.anthropic.com/en/articles/8325621-i-would-like-to-input-sensitive-data-into-free-claude-ai-or-claude-pro-who-can-view-my-conversations)]

#### How is my data protected?
Anthropic implements multiple security measures: (1) Data is encrypted both in transit and at rest, (2) Access controls limit who can view your data, (3) Regular security monitoring and vulnerability checks are performed, and (4) Employee access follows the principle of least privilege. [Source: [Anthropic Privacy Center](https://privacy.anthropic.com/en/articles/10458704-how-does-anthropic-protect-the-personal-data-of-claude-ai-users)]

#### How long is my data retained?
For LegalContext, which implements the Model Context Protocol (MCP), your data is handled according to your firm's policies. For all Anthropic products, they automatically delete inputs and outputs on the backend within 30 days of receipt or generation, unless otherwise agreed. [Source: [Anthropic Privacy Center](https://privacy.anthropic.com/en/articles/10023548-how-long-do-you-store-personal-data)]

### Technical Questions

#### How does LegalContext work with MCP?
LegalContext is built on Anthropic's Model Context Protocol (MCP), an open standard that enables secure two-way connections between data sources and AI tools. MCP handles both local resources (your Clio documents) and ensures Claude can access them through a standardized interface. [Source: [VentureBeat](https://venturebeat.com/data-infrastructure/anthropic-releases-model-context-protocol-to-standardize-ai-data-integration/)]

#### Can I control which documents Claude can access?
Yes. LegalContext respects Clio's existing security model and permissions. You can specify which document repositories Claude can access during setup, and the system maintains all access controls defined in Clio. You'll also be prompted for approval before Claude accesses any documents.

#### Do I need to install additional software?
You'll need to install Claude Desktop and LegalContext. During installation, LegalContext will automatically configure Claude Desktop to use it. No additional software is required beyond the prerequisites listed in the installation section.

#### Can I use LegalContext with other document management systems?
The current version supports Clio. We're working on integrations with additional document management systems for future releases. If you're interested in a specific integration, please contact us at ask@protomated.com.

#### Is LegalContext compatible with my operating system?
LegalContext is compatible with Windows 10 or later and macOS 12 or later. It requires Claude Desktop, which is available for the same operating systems.

### Troubleshooting

#### What should I do if Claude can't access my documents?
1. Verify that LegalContext is properly configured and running
2. Check that your Clio account has the necessary API permissions
3. Confirm that you've completed the OAuth authorization flow
4. Ensure the document repositories are properly selected
5. Restart Claude Desktop if necessary

#### How do I update LegalContext?
LegalContext includes an auto-update feature that checks for new versions. You can also manually check for updates through the application menu. Updates are downloaded and installed automatically.

#### Who do I contact for support?
For technical support, please visit our documentation at https://help.protomated.com/legalcontext or submit an issue on our GitHub repository. For professional support, contact us at ask@protomated.com.

## Getting Started

### Prerequisites
- Windows 10+ or macOS 12+ 
- Claude Desktop application installed
- Clio account with appropriate API permissions
- Node.js 16 or higher

### Installation

1. Download the latest release from the [releases page](https://github.com/protomated/legalcontext-connect/releases)

2. Run the installer and follow the setup wizard

3. Launch LegalContext and configure your Clio connection:
   - Enter your Clio organization ID
   - Complete the OAuth authorization flow
   - Select document repositories to make available

4. Configure Claude Desktop to use LegalContext:
   - During installation, LegalContext will automatically configure Claude Desktop
   - You'll be prompted to restart Claude Desktop to apply the changes
   - After restarting, LegalContext will guide you through a test process to verify connectivity

5. Restart Claude Desktop and verify connection:
   - Look for the tools icon in the Claude interface
   - Try these sample prompts to test the connection:
      - *"Can you summarize the key points from our recent settlement agreement with Acme Corp?"*
      - *"What precedents do we have for consumer data privacy cases in the healthcare sector?"*
      - *"Find documents related to non-compete agreements that we've drafted in the last year."*
      - *"What are the common clauses we include in our software licensing agreements?"*
      - *"Can you analyze the risks in the Johnson contract that was uploaded to Clio last week?"*
   - You should see Claude requesting permission to access documents before responding
   - Successful responses will include citations to specific documents in your Clio repository

### Free Tier Limitations

The open-source version includes the following limitations:

- 100 documents maximum
- 2 Claude Desktop users maximum
- 50 queries per day
- Single Clio repository
- 3 concurrent requests maximum
- Daily document indexing (not real-time)

To remove these limitations, check our [pricing page](https://protomated.com/legalcontext#pricing) for Professional and Enterprise options.

## Licensing Tiers and Pricing

LegalContext is available in three licensing tiers to accommodate firms of all sizes and requirements.

### Free Open Source

Our community edition is ideal for small firms and solo practitioners:

- **Price**: Free
- **Features**:
  - Full document search and retrieval
  - Secure local processing
  - Citation tracking
  - Basic document indexing
- **Limitations**:
  - 100 documents maximum
  - 2 Claude Desktop users maximum
  - 50 queries per day
  - Single Clio repository
  - 3 concurrent requests maximum
  - Daily document indexing (not real-time)
- **Support**: Community forum and GitHub issues

### Professional

For small to medium law firms requiring additional capacity and features:

- **Price**: $99/month per user
- **Features**:
  - All Free tier features
  - Unlimited documents
  - Real-time document indexing
  - Advanced security controls
  - Enhanced document processing
  - Multi-repository support
  - Usage analytics and reporting
- **Support**: 
  - Email support with 48-hour response time
  - Knowledge base access
  - Quarterly security updates

### Enterprise

Designed for medium to large firms with complex security and compliance needs:

- **Price**: $199/month per user (volume discounts available)
- **Features**:
  - All Professional features
  - Unlimited concurrent requests
  - Advanced document analytics
  - Custom integration capabilities
  - On-premises deployment option
  - High availability configuration
  - Custom security policies
  - Document utilization insights
  - Priority feature development
  - Custom branding
- **Support**:
  - Dedicated account manager
  - Priority support with 4-hour response time
  - Quarterly business reviews
  - Custom training sessions
  - 24/7 critical issue response

### Additional Services

Protomated offers complementary services to enhance your LegalContext deployment:

#### Implementation Services

- **Setup & Configuration**: $1,500 one-time fee
  - Full environment setup
  - Clio integration configuration
  - Document repository optimization
  - User training sessions (2 hours)
  - Go-live support

- **Custom Integration Development**: Starting at $5,000
  - Integration with additional document management systems
  - Custom workflow automation
  - Data migration services
  - Security assessment and hardening

#### Ongoing Support Options

- **Standard Support Plan**: Included with Professional tier
  - Email support during business hours
  - 48-hour response time
  - Access to knowledge base

- **Premium Support Plan**: $500/month
  - Phone and email support
  - 8-hour response time
  - Monthly health checks
  - Dedicated support contact

- **Enterprise Support Plan**: Included with Enterprise tier
  - 24/7 critical issue support
  - 4-hour response time
  - Quarterly system reviews
  - Dedicated account manager

#### Training and Documentation

- **User Training**: $750 per session (up to 10 users)
  - 2-hour live training
  - Custom training materials
  - Hands-on exercises
  - Q&A session

- **Admin Training**: $1,200 per session
  - 4-hour technical training
  - Advanced configuration
  - Troubleshooting techniques
  - Performance optimization

For custom pricing or to discuss specific requirements, please contact our sales team at sales@protomated.com.

## For Collaborators

This section provides detailed information for developers and contributors who want to work on LegalContext.

### Development Setup

#### Prerequisites
- Bun 1.0 or higher
- PostgreSQL 15 with pgvector extension
- Clio Developer account with API access
- Claude Desktop for testing

#### Local Development Environment

1. **Clone the repository**

\`\`\`bash
git clone https://github.com/protomated/legalcontext-connect.git
cd legalcontext-connect
\`\`\`

2. **Install dependencies**

\`\`\`bash
bun install
\`\`\`

3. **Set up environment variables**

Create a `.env.local` file based on the `.env.example` template:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit the `.env.local` file and fill in your Clio API credentials and other configuration values.

4. **Set up the development database**

\`\`\`bash
# If using Docker
docker-compose up -d postgres-dev

# Or manually create PostgreSQL database with pgvector
# See docker/postgres/init-vector.sql for required schema setup
\`\`\`

5. **Run the OAuth setup**

\`\`\`bash
bun run setup
\`\`\`

This will walk you through the Clio OAuth authorization flow to get valid access tokens.

6. **Start the development server**

\`\`\`bash
bun run start:dev
\`\`\`

The server will be available at http://localhost:3000.

7. **Configure Claude Desktop**

Edit your Claude Desktop configuration to use the local MCP server:

\`\`\`json
{
  "mcpServers": {
    "legalcontext": {
      "command": "bun",
      "args": ["run", "start:dev"],
      "cwd": "/path/to/legalcontext-connect"
    }
  }
}
\`\`\`

### Project Structure

The project follows a modular NestJS architecture:

\`\`\`
legalcontext-connect/
├── src/
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts            # Root module
│   ├── config/                  # Configuration handling
│   ├── mcp/                     # MCP Server module
│   │   ├── mcp.module.ts        
│   │   ├── mcp-server.service.ts
│   │   ├── resources/           # MCP resources implementation
│   │   └── tools/               # MCP tools implementation
│   ├── clio/                    # Clio Integration module
│   │   ├── clio.module.ts       
│   │   ├── auth/                # OAuth authentication
│   │   ├── api/                 # Clio API client
│   │   └── dto/                 # Data transfer objects
│   ├── document-processing/     # Document Processing module
│   │   ├── extractors/          # Text extraction services
│   │   ├── chunking/            # Document chunking service
│   │   ├── embedding/           # Vector embedding service
│   │   └── indexing/            # Search and indexing services
│   └── database/                # Database module
│       └── entities/            # Database entities
├── test/                        # Test directory
│   ├── e2e/                     # End-to-end tests
│   └── unit/                    # Unit tests
├── docker/                      # Docker configuration
└── scripts/                     # Utility scripts
\`\`\`

### Testing

The project includes several types of tests to ensure quality and reliability:

#### Unit Tests

Run unit tests to verify individual components:

\`\`\`bash
# Run all unit tests
bun run test

# Run tests with coverage report
bun run test:cov

# Run tests in watch mode during development
bun run test:watch
\`\`\`

#### Integration Tests

Test interaction between components:

\`\`\`bash
# Run integration tests
bun run test:integration
\`\`\`

#### End-to-End Tests

Test complete flows from Claude Desktop to Clio and back:

\`\`\`bash
# Run e2e tests
bun run test:e2e
\`\`\`

#### Mock Clio API

For development and testing, you can use the mock Clio API server:

\`\`\`bash
# Start mock Clio API server
bun run start:mock-clio
\`\`\`

This provides a simulated Clio API environment with test documents and OAuth endpoints.

### Deployment

LegalContext supports multiple deployment options:

#### Docker Deployment

The simplest way to deploy is using Docker Compose:

\`\`\`bash
# Build and start production containers
docker-compose up -d legalcontext-prod
\`\`\`

This will set up PostgreSQL with pgvector and the MCP server in production mode.

#### Manual Deployment

For on-premises deployment:

1. **Build the production version**

\`\`\`bash
bun run build
\`\`\`

2. **Configure environment**

Ensure all environment variables are set correctly for production.

3. **Set up PostgreSQL**

Install PostgreSQL with pgvector extension and run the initialization scripts.

4. **Start the server**

\`\`\`bash
NODE_ENV=production bun run start:prod
\`\`\`

#### Scaling Considerations

- For increased document capacity, consider upgrading to PostgreSQL with more CPU and RAM
- For multiple users, ensure the server has sufficient concurrent connection capacity
- Consider using a load balancer for high-availability deployments
- Implement proper backup strategies for the PostgreSQL database

#### Monitoring and Maintenance

- Set up health checks to monitor the MCP server
- Schedule regular backups of the PostgreSQL database
- Implement log rotation for audit logs
- Create an update strategy for security patches

## Contributing

We welcome contributions to LegalContext! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

## License

LegalContext is licensed under the [Mozilla Public License 2.0](LICENSE).

## Support

- **Documentation**: [https://help.protomated.com/legalcontext](https://help.protomated.com/legalcontext)
- **Community Forum & Issues**: [GitHub Issues](https://github.com/protomated/legalcontext-connect/issues)
- **Professional Support**: [ask@protomated.com](mailto:ask@protomated.com)

---

© 2025 Protomated

```

# docs/claude-integration.md

```md
# Claude Desktop Integration Guide

This guide explains how to integrate LegalContext with Claude Desktop using the Model Context Protocol (MCP).

## Overview

The Model Context Protocol (MCP) allows applications like Claude Desktop to connect to external servers like LegalContext to access resources and use tools. However, Claude Desktop expects strict JSON-RPC communication over stdio, which means any console logs or other output can break the protocol.

## Using the Claude MCP Server

We've created a specialized MCP server specifically for Claude Desktop integration that:

1. Routes all logging to stderr instead of stdout
2. Implements the basic MCP protocol requirements
3. Provides resources and tools for interacting with legal documents

## Configuration Steps

### 1. Run the Claude MCP Server

\`\`\`bash
# In your LegalContext project directory
bun run claude:server
\`\`\`

This will start the MCP server that listens on stdin/stdout.

### 2. Configure Claude Desktop

1. Open Claude Desktop's settings
2. Find the MCP Server configuration section
3. Add a new server with the following configuration:

\`\`\`json
{
  "mcpServers": {
    "legalcontext": {
      "command": "bun",
      "args": [
        "run",
        "claude:server"
      ],
      "cwd": "/path/to/your/legalcontext/directory"
    }
  }
}
\`\`\`

Replace `/path/to/your/legalcontext/directory` with the actual path to your LegalContext project directory.

### 3. Test the Integration

1. Restart Claude Desktop
2. Open a new conversation
3. Type a message like "What resources are available from the LegalContext server?"
4. Claude should be able to list the available resources and tools from the LegalContext server

## Troubleshooting

If Claude Desktop cannot connect to the LegalContext server, check the following:

1. Make sure the server is running (`bun run claude:server`)
2. Check Claude Desktop's logs for any connection errors
3. Verify the path in the configuration is correct
4. Ensure no console.log statements are being used in the server code

## Common Issues

### JSON Parse Errors in Claude Desktop Logs

If you see errors like `Unexpected token 'I', "Initializi"... is not valid JSON` in Claude Desktop logs, it means the server is outputting non-JSON content to stdout. This is usually caused by:

1. Console.log statements in the server code
2. Startup messages or other output to stdout

Solution: Use our custom logger that routes all output to stderr instead of stdout.

### Connection Timeouts

If Claude Desktop times out trying to connect to the server, check:

1. The server is running and listening
2. The path in the configuration is correct
3. The permissions are set correctly for the server directory

## Advanced Configuration

### Adding Custom Resources

To add custom resources to the LegalContext server for Claude Desktop, modify the `claude-mcp-server.ts` file:

\`\`\`typescript
// Add a custom resource
server.resource(
  'custom-resource',
  new ResourceTemplate('custom://{parameter}', { list: undefined }),
  (uri, params) => {
    logger.debug('Handling custom resource request:', uri.href, params);
    const { parameter } = params;
    return {
      contents: [{
        uri: uri.href,
        text: `Custom resource content with parameter: ${parameter}`
      }]
    };
  }
);
\`\`\`

### Adding Custom Tools

To add custom tools:

\`\`\`typescript
// Add a custom tool
server.tool(
  'custom-tool',
  { 
    param1: z.string(),
    param2: z.number().optional()
  },
  (params) => {
    logger.debug('Handling custom tool request:', params);
    return {
      content: [{ 
        type: "text", 
        text: `Custom tool result with params: ${JSON.stringify(params)}`
      }]
    };
  }
);
\`\`\`

Remember to restart the server and Claude Desktop after making changes.

```

# docs/development-roadmap.md

```md
# LegalContext Development Roadmap

This document outlines the development roadmap for LegalContext, focusing on the implementation of the various epics and their associated stories.

## Completed

### Epic 1: Core MCP Server Infrastructure

- ✅ Story 1.1: Setup Project Repository & Structure
- ✅ Story 1.2: Implement Basic MCP Server
- ✅ Story 1.3: Create Configuration Management

## Next Steps

### Epic 2: Clio API Integration (Estimated: 2 weeks)

- 🔄 Story 2.1: Implement OAuth 2.0 Authentication Flow
- 🔄 Story 2.2: Develop Document API Wrapper
- 🔄 Story 2.3: Build Document Metadata Parser
- 🔄 Story 2.4: Add Document Access Controls

#### Implementation Strategy for Epic 2

1. **OAuth Implementation**
   - Create OAuth service with proper token management
   - Implement secure credential storage
   - Add token refresh logic

2. **Document API Integration**
   - Create Clio API client classes
   - Implement document listing functionality
   - Build document content retrieval

3. **Testing**
   - Create mock Clio server for testing
   - Write unit and integration tests

### Epic 3: MCP Resources Implementation (Estimated: 2 weeks)

- 🔄 Story 3.1: Implement Document List Resource
- 🔄 Story 3.2: Build Document Content Resource
- 🔄 Story 3.3: Develop Resource Change Notifications

#### Implementation Strategy for Epic 3

1. **Resource URI Design**
   - Define clean URI schema for documents
   - Create templates for document resources

2. **Resource Handler Implementation**
   - Implement document list resource
   - Create document content resource
   - Build metadata resource

3. **Testing**
   - Test resource handling
   - Verify proper content formatting

### Epic 4: Document Processing Engine (Estimated: 3 weeks)

- 🔄 Story 4.1: Create Document Chunking System
- 🔄 Story 4.2: Build Document Indexing
- 🔄 Story 4.3: Implement Citation Tracking

#### Implementation Strategy for Epic 4

1. **Document Chunking**
   - Implement semantic chunking algorithm
   - Create chunk metadata tracking

2. **Document Indexing**
   - Set up vector database for similarity search
   - Implement embedding generation
   - Build relevance ranking system

3. **Citation System**
   - Create citation generation
   - Implement verification links
   - Build source tracking

### Epic 5: MCP Tools Implementation (Estimated: 2 weeks)

- 🔄 Story 5.1: Implement Document Search Tool
- 🔄 Story 5.2: Build Document Retrieval Tool
- 🔄 Story 5.3: Develop Citation Generation Tool

#### Implementation Strategy for Epic 5

1. **Tool Schema Design**
   - Define tool schemas with Zod
   - Create parameter validation

2. **Tool Handler Implementation**
   - Implement search tool
   - Create retrieval tool
   - Build citation tool

3. **Testing**
   - Test tool functionality
   - Verify proper error handling

### Epic 8: Claude Desktop Integration (Estimated: 1 week)

- 🔄 Story 8.1: Create Claude Desktop Configuration
- 🔄 Story 8.2: Test with Claude Desktop
- 🔄 Story 8.3: Optimize Context Window

#### Implementation Strategy for Epic 8

1. **Configuration Documentation**
   - Create clear setup instructions
   - Build troubleshooting guide

2. **Integration Testing**
   - Test with live Claude Desktop
   - Verify resource and tool functionality

3. **Context Optimization**
   - Implement efficient context packaging
   - Create content prioritization

### Epic 9: Testing, Security, and Quality (Estimated: 2 weeks)

- 🔄 Story 9.1: Implement Comprehensive Testing
- 🔄 Story 9.2: Implement Security Testing
- 🔄 Story 9.3: Implement Performance Testing

#### Implementation Strategy for Epic 9

1. **Test Suite Development**
   - Build end-to-end tests
   - Create security test suite
   - Implement performance benchmarks

2. **CI/CD Setup**
   - Set up continuous integration
   - Implement automated testing

3. **Security Auditing**
   - Perform security audit
   - Implement recommended fixes

### Epic 10: Documentation and Deployment (Estimated: 1 week)

- 🔄 Story 10.1: Create Comprehensive Documentation
- 🔄 Story 10.2: Create Deployment Package

#### Implementation Strategy for Epic 10

1. **Documentation**
   - Create user guide
   - Build administrator documentation
   - Write API reference

2. **Deployment**
   - Create Docker configuration
   - Build installation scripts
   - Test deployment in various environments

## Timeline

\`\`\`mermaid
gantt
    title LegalContext Development Timeline
    dateFormat  YYYY-MM-DD
    section Core Infrastructure
    Epic 1: Core MCP Server Infrastructure        :done,    e1, 2025-04-01, 1w
    section Integration
    Epic 2: Clio API Integration                  :active,  e2, after e1, 2w
    Epic 3: MCP Resources Implementation          :         e3, after e2, 2w
    section Processing
    Epic 4: Document Processing Engine            :         e4, after e3, 3w
    Epic 5: MCP Tools Implementation              :         e5, after e4, 2w
    section Integration & Quality
    Epic 8: Claude Desktop Integration            :         e8, after e5, 1w
    Epic 9: Testing, Security, and Quality        :         e9, after e8, 2w
    Epic 10: Documentation and Deployment         :         e10, after e9, 1w
\`\`\`

## Resource Allocation

- **Backend Development**: 2 developers (Epics 1, 2, 3, 4, 5)
- **Testing**: 1 QA engineer (Epic 9)
- **Documentation**: 1 technical writer (Epic 10)
- **Integration**: 1 developer (Epic 8)

## Technical Debt Considerations

During rapid development, we should be aware of potential technical debt:

1. **Code Quality**: Maintain high standards with automated linting and testing
2. **Documentation**: Keep documentation updated as features evolve
3. **Test Coverage**: Ensure comprehensive test coverage
4. **Refactoring**: Regularly refactor to improve code quality

## Risk Mitigation

Potential risks and mitigation strategies:

1. **API Changes**: Monitor Clio API for changes and update accordingly
2. **Security Vulnerabilities**: Regular security audits and updates
3. **Performance Issues**: Benchmark and optimize critical paths
4. **Deployment Challenges**: Create comprehensive deployment documentation

## Conclusion

This roadmap provides a structured approach to developing LegalContext, focusing on delivering value incrementally while maintaining high quality standards. Regular reviews of progress against this roadmap will help ensure successful delivery of the project.

```

# docs/mcp-architecture.md

```md
# MCP Server Architecture

## Overview

The Model Context Protocol (MCP) is a standardized way for LLMs to interact with external data sources and tools. LegalContext implements an MCP server that allows Claude Desktop to access legal documents stored in Clio in a secure, controlled manner.

## Architectural Components

\`\`\`
┌────────────────────────────────────────────────────────────┐
│                         MCP Module                          │
│                                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ McpServerService│  │McpResourceService│  │McpToolService│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                   │                   │         │
│           ▼                   ▼                   ▼         │
│     ┌────────────────────────────────────────────────┐     │
│     │              McpOrchestratorService            │     │
│     └────────────────────────────────────────────────┘     │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
                                 ▼
                          ┌────────────┐
                          │Claude Desktop│
                          └────────────┘
\`\`\`

### McpServerService

The `McpServerService` is responsible for:

- Initializing the MCP server
- Managing connection to the transport (stdio)
- Handling server lifecycle events
- Providing access to the MCP server instance

### McpResourcesService

The `McpResourcesService` handles:

- Registering MCP resources
- Managing document resources
- Creating URI templates for resource access
- Handling resource content formatting

### McpToolsService

The `McpToolsService` is responsible for:

- Registering MCP tools
- Implementing document interaction capabilities
- Defining tool schemas and parameters
- Processing tool execution requests

### McpOrchestratorService

The `McpOrchestratorService` coordinates:

- Initialization sequence of components
- Registration of resources and tools
- Connection to transport
- Order of operations during startup

## Communication Flow

1. **Initialization**:
   - NestJS application starts
   - MCP components are instantiated
   - Resources and tools are registered
   - Server connects to stdio transport

2. **Client Connection**:
   - Claude Desktop connects via stdio
   - MCP server validates the connection
   - Connection is established

3. **Resource Access**:
   - Claude requests a resource via URI
   - MCP server resolves the resource
   - Resource handler retrieves the document data
   - Data is returned to Claude

4. **Tool Execution**:
   - Claude invokes a tool with parameters
   - MCP server validates the parameters
   - Tool handler performs the requested action
   - Result is returned to Claude

## Security Considerations

The MCP architecture prioritizes security:

1. **Data Boundary**: All processing occurs within the law firm's network
2. **No Data Transmission**: Document content never leaves the firm's security perimeter
3. **Transport Security**: Using stdio ensures local-only communication
4. **Access Control**: Document access respects permissions from Clio
5. **Controlled API**: MCP provides a limited, well-defined interface

## Integration Points

The MCP server integrates with several components:

1. **Claude Desktop**: Connects as an MCP client
2. **Clio API**: Provides document data (through integration layer)
3. **Document Processing Engine**: Processes documents for context
4. **License Management**: Controls feature access based on license tier
5. **Analytics**: Tracks usage and performance metrics

## Future Extensibility

The modular design allows for future enhancements:

1. **Additional Resources**: New document types and sources
2. **Enhanced Tools**: More sophisticated search and analysis capabilities
3. **Alternative Transports**: Support for HTTP/SSE for remote connections
4. **Multiple LLM Support**: Integration with other MCP-compatible LLMs

```

# docs/mcp-client-integration.md

```md
# Claude Desktop Integration Guide

This document provides guidance on integrating Claude Desktop with the LegalContext MCP server to enable secure access to law firm document management systems.

## Claude Desktop and MCP

Claude Desktop is Anthropic's desktop application that provides access to Claude AI. It supports the Model Context Protocol (MCP), allowing it to connect to external data sources and tools like LegalContext.

## Setting Up Claude Desktop with LegalContext

### Prerequisites

- Claude Desktop application installed
- LegalContext MCP server running

### Configuration Steps

1. **Start the LegalContext server**

   Run the LegalContext server by executing:

   \`\`\`bash
   bun run start
   \`\`\`

2. **Configure Claude Desktop**

   Claude Desktop uses a configuration file to manage MCP connections. Add the LegalContext server to your configuration:

   \`\`\`json
   {
     "mcpServers": {
       "legalcontext": {
         "command": "bun",
         "args": ["run", "dist/main.js"],
         "cwd": "/path/to/legalcontext"
       }
     }
   }
   \`\`\`

   For production use, you would typically provide the path to the compiled executable.

3. **Verify the connection**

   After configuring Claude Desktop, restart it and check for the LegalContext server in the available tools.

## Using LegalContext with Claude

Once connected, Claude can use the resources and tools provided by LegalContext.

### Available Resources

- `info://server` - Basic information about the LegalContext server
- `example://{parameter}` - Example resource with dynamic parameter
- More document-specific resources will be available in the full implementation

### Available Tools

- `echo` - Simple echo tool for testing
- More document-specific tools will be available in the full implementation

### Example Interactions

Here are some examples of how to interact with LegalContext through Claude:

1. **Accessing server information**

   \`\`\`
   Please retrieve information about the LegalContext server.
   \`\`\`

2. **Using the example resource**

   \`\`\`
   Can you access the example resource with parameter "test"?
   \`\`\`

3. **Using the echo tool**

   \`\`\`
   Use the echo tool to repeat this message: "Testing LegalContext integration"
   \`\`\`

## Security Considerations

The LegalContext MCP server is designed with security as a top priority:

1. **Local Processing**: All document processing occurs locally, with no sensitive data sent to external servers
2. **Transport Security**: Using stdio ensures secure communication between Claude Desktop and LegalContext
3. **Access Control**: Document access respects the underlying permissions from the document management system

## Troubleshooting

If Claude cannot connect to LegalContext:

1. Ensure LegalContext is running
2. Check the Claude Desktop configuration
3. Verify that the path to LegalContext is correct
4. Check for any error messages in the LegalContext logs

For more detailed troubleshooting, check the LegalContext logs at `logs/legalcontext.log`.

```

# docs/security-architecture.md

```md
# LegalContext Security Architecture

This document outlines the security architecture of LegalContext, focusing on how it secures sensitive legal documents while enabling AI-assisted legal research.

## Security Design Principles

LegalContext is built on the following security principles:

1. **Data Boundary Control**: All document processing remains within the firm's security perimeter
2. **Least Privilege**: Components operate with minimal necessary permissions
3. **Transport Security**: Secure communication protocols between components
4. **Access Control**: Respect for underlying document management system permissions
5. **Audit Logging**: Comprehensive logging of all access and operations

## Component Security

### MCP Server Security

The MCP (Model Context Protocol) server is the primary interface between Claude and the document management system. Security considerations include:

1. **Local Processing**: The MCP server runs locally within the firm's network
2. **Stdio Transport**: Communication with Claude Desktop uses stdio, ensuring data doesn't traverse network boundaries
3. **Permission Scoping**: Resource and tool access is scoped to specific document repositories
4. **Content Validation**: All input and output is validated to prevent injection attacks

\`\`\`mermaid
graph TD
    subgraph Firm["Law Firm Security Boundary"]
        Claude["Claude Desktop"]
        MCP["LegalContext MCP Server"]
        DMS["Document Management System"]
        
        Claude <--> |"Local stdio transport"| MCP
        MCP <--> |"Authentication via OAuth"| DMS
    end
    
    subgraph Cloud["Cloud Services"]
        Anthropic["Anthropic Services"]
    end
    
    Claude <--> |"Model API access only"| Anthropic
    
    classDef secure fill:#e6fff2,stroke:#00b33c,stroke-width:2px
    class Firm secure
\`\`\`

### Document Access Security

Access to documents is secured through multiple layers:

1. **OAuth 2.0 Integration**: Secure authentication with document management systems
2. **Token Management**: Secure storage and handling of access tokens
3. **Permissions Inheritance**: Document access respects the permissions defined in the source system
4. **Content Filtering**: Sensitive content can be filtered based on configured rules

### Data-in-Transit Security

1. **Local Communication**: Primary communication occurs locally via stdio
2. **TLS for API Access**: All communication with document management APIs uses TLS 1.2+
3. **Token Security**: OAuth tokens are securely stored and never exposed

### Data-at-Rest Security

1. **No Document Storage**: Documents are processed in memory and not persisted
2. **Metadata Encryption**: Any cached metadata is encrypted using industrial-strength encryption
3. **Token Encryption**: OAuth tokens are encrypted at rest

## Security Controls

### Authentication & Authorization

1. **Document Management Authentication**: OAuth 2.0 flow for secure access
2. **Access Control**: Enforcement of document-level permissions
3. **Fine-grained Authorization**: Controls on which documents can be accessed

### Audit & Compliance

1. **Access Logging**: All document access is logged with:
   - User identity
   - Document identifier
   - Access timestamp
   - Access type (read, search)

2. **Operation Logging**: All operations are logged for audit purposes
3. **Compliance Reports**: Generate reports for compliance requirements

### Incident Response

1. **Revocation Procedures**: Quick revocation of access if security issues are detected
2. **Monitoring**: Real-time monitoring for suspicious access patterns
3. **Alerting**: Automated alerts for potential security incidents

## Deployment Security Recommendations

For secure deployment of LegalContext:

1. **Network Isolation**: Deploy on an isolated network segment
2. **Minimal Dependencies**: Reduce attack surface by minimizing dependencies
3. **Regular Updates**: Keep all components updated with security patches
4. **Penetration Testing**: Regular security testing of the deployment
5. **Access Controls**: Restrict administrative access to LegalContext

## Data Privacy Considerations

LegalContext is designed to maintain data privacy:

1. **No Data Transmission**: Document content never leaves the firm's security boundary
2. **Minimized Metadata**: Only essential metadata is used
3. **Privacy by Design**: Data privacy considerations are built into the architecture

## Security Certification

LegalContext security architecture aligns with industry standards:

1. **OWASP Compliance**: Follows OWASP secure development practices
2. **ISO 27001 Alignment**: Designed with ISO 27001 information security principles

## Conclusion

The LegalContext security architecture ensures that sensitive legal documents remain secure while enabling AI-assisted legal research. By maintaining a strict security boundary and implementing multiple layers of protection, LegalContext provides a secure bridge between document management systems and AI tools.

```

# eslint.config.mjs

```mjs
// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);
```

# nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "entryFile": "main",
  "monorepo": false,
  "compilerOptions": {
    "deleteOutDir": true
  }
}

```

# package.json

```json
{
  "name": "legal-context",
  "version": "1.0.0",
  "description": "LegalContext - A secure bridge between law firms' document management systems and AI assistants",
  "main": "dist/main/main.js",
  "scripts": {
    "build": "bun build ./src/main.ts --outfile ./dist/main.js --target node",
    "demo:server": "bun run src/demo-mcp.ts",
    "demo:client": "bun run src/demo-client.ts",
    "demo": "bun run demo:client",
    "basic:server": "bun run src/basic-mcp.ts",
    "basic:client": "bun run src/basic-client.ts",
    "basic": "bun run basic:client",
    "simple:server": "bun run src/simple-mcp.ts",
    "simple:client": "bun run src/simple-client.ts",
    "simple": "bun run simple:client",
    "minimal:server": "bun run src/minimal-mcp.ts",
    "minimal:client": "bun run src/minimal-client.ts",
    "minimal": "bun run minimal:client",
    "example:server": "bun run src/example/echo-server.ts",
    "example:client": "bun run src/example/echo-client.ts",
    "example": "bun run example:client",
    "direct:server": "node src/direct-server.js",
    "direct:run": "node src/run-direct-server.js",
    "standalone:server": "bun run src/standalone/server.ts",
    "standalone:client": "bun run src/standalone/client.ts",
    "standalone": "bun run standalone:client",
    "claude:server": "bun src/claude-mcp-server.ts",
    "simple-test": "node src/simple-test.js",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "bun run dist/main.js",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:cov": "bun test --coverage",
    "test:debug": "bun test --inspect-wait",
    "digest": "ai-digest",
    "test:client": "bun run tools/test-client.ts"
  },
  "author": "Protomated",
  "license": "MPL-2.0",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.8.0",
    "@nestjs/axios": "^4.0.0",
    "@nestjs/common": "^10.2.10",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.2.10",
    "@nestjs/microservices": "^11.0.13",
    "@nestjs/typeorm": "^11.0.0",
    "@nestjs/websockets": "^11.0.13",
    "ai-digest": "^1.0.8",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "joi": "^17.13.3",
    "open": "^10.1.0",
    "pg": "^8.14.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.22",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.2.1",
    "@nestjs/schematics": "^10.0.3",
    "@nestjs/testing": "^10.2.10",
    "@types/jest": "^29.5.10",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.1",
    "@typescript-eslint/parser": "^6.13.1",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "jest": "^29.7.0",
    "prettier": "^3.1.0",
    "source-map-support": "^0.5.21",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.2"
  },
  "trustedDependencies": [
    "@nestjs/cli"
  ]
}

```

# README.md

```md
# LegalContext MCP Server

LegalContext is an open-source Model Context Protocol (MCP) server that creates a secure bridge between law firms' document management systems (specifically Clio) and AI assistants (starting with Claude Desktop). It enables AI tools to access, retrieve, and incorporate firm document context while maintaining complete security and control over sensitive information.

## Project Status

⚠️ **Development Status**: This project is in active development. Core MCP functionality is implemented, but document management integration is still in progress.
about
## Core Functionality

The current implementation includes:

- ✅ Basic MCP server with stdio transport
- ✅ Resource and tool registration
- ✅ Example resources and tools
- ✅ Configuration management
- ✅ Testing infrastructure

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.0 or higher
- [Claude Desktop](https://claude.ai/desktop) (for integration testing)

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/protomated/legalcontext.git
cd legalcontext
\`\`\`

2. Install dependencies:

\`\`\`bash
bun install
\`\`\`

3. Build the project:

\`\`\`bash
bun run build
\`\`\`

### Running the Server

Start the server with:

\`\`\`bash
bun run start
\`\`\`

### Testing the MCP Server

You can test the MCP server using the included test client:

\`\`\`bash
bun run test:client
\`\`\`

This will start the server and connect a test client that will verify the basic functionality.

## Architecture

LegalContext is built around a modular NestJS architecture:

\`\`\`mermaid
graph TB
    Claude[Claude Desktop] <--> |MCP/stdio| MCP[MCP Server]
    MCP --> Resources[MCP Resources]
    MCP --> Tools[MCP Tools]
    Resources --> Clio[Clio API]
    Tools --> Clio
\`\`\`

The system is designed to keep all document processing within the firm's security perimeter, with zero sensitive data transmitted to external servers.

## Documentation

Additional documentation can be found in the `docs` directory:
- [About LegalContext](docs/about-legal-text.md) - The "why" behind LegalContext
- [MCP Server Implementation Guide](docs/mcp-server-guide.md) - Overview of the MCP implementation
- [Claude Desktop Integration](docs/mcp-client-integration.md) - Guide to integrating with Claude Desktop
- [Security Architecture](docs/security-architecture.md) - Overview of the security design
- [Development Roadmap](docs/development-roadmap.md) - Planned features and timeline

## Core Components

### McpServerService

Manages the MCP server lifecycle and connection to Claude Desktop.

### McpResourcesService

Handles registration and management of resources that provide document context.

### McpToolsService

Manages tools that enable Claude to perform actions like searching or retrieving documents.

### McpOrchestratorService

Coordinates the initialization and operation of the MCP components.

## Security

LegalContext prioritizes security at every level:

1. **Data Boundary Control**: All document processing occurs locally
2. **Secure Transport**: Uses stdio for communication with Claude Desktop
3. **Access Control**: Respects document management system permissions
4. **Zero Data Transmission**: No document content sent to external servers

See the [Security Architecture](docs/security-architecture.md) document for more details.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

LegalContext is licensed under the [Mozilla Public License 2.0](LICENSE).

## Support

For support, please open an issue on GitHub or contact us at ask@protomated.com.

```

# run-test-client.sh

```sh
#!/bin/sh
# Run the build command first
echo "Building the project..."
bun run build

# Run the test client
echo "Running the test client..."
bun run test:client

```

# src/app.controller.spec.ts

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

```

# src/app.controller.ts

```ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

```

# src/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpModule } from './mcp/mcp.module';
import configuration from './config/configuration';

/**
 * Main application module that integrates all components of the LegalContext server.
 */
@Module({
  imports: [
    // Global config module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // MCP module for Claude Desktop integration
    McpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

# src/app.service.ts

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

```

# src/basic-client.ts

```ts
// src/basic-client.ts - A minimal MCP client for testing
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Start a test client to connect to the MCP server
 */
async function startClient() {
  console.log('Starting MCP client...');
  
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/basic-mcp.ts']
  });

  // Create the client
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      },
      timeout: 5000, // Set a smaller timeout value
      debug: true // Enable debug mode for more information
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected to MCP server');

    // List resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', JSON.stringify(resources, null, 2));

    // Test the info resource
    console.log('Reading info resource...');
    const infoResource = await client.readResource('info://server');
    console.log('Info resource content:', JSON.stringify(infoResource, null, 2));

    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Tools:', JSON.stringify(tools, null, 2));

    // Test the echo tool
    console.log('Calling echo tool...');
    const echoResult = await client.callTool("echo", {
      message: 'Hello from test client!'
    });
    console.log('Echo tool result:', JSON.stringify(echoResult, null, 2));

    console.log('Tests completed successfully');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    console.log('Disconnecting...');
    process.exit(0);
  }
}

// Start the client
startClient();
```

# src/basic-mcp.ts

```ts
// src/basic-mcp.ts - A minimal implementation of the MCP server
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

/**
 * Start the MCP server with basic resources and tools for demonstration
 */
async function startMcpServer() {
  console.log('Creating MCP server...');
  
  // Create an MCP server
  const server = new McpServer({
    name: "LegalContext",
    version: "1.0.0"
  });

  // Add a simple info resource
  server.resource(
    'info',
    'info://server',
    async (uri) => {
      console.log('Handling info resource request:', uri.href);
      return {
        contents: [{
          uri: uri.href,
          text: 'LegalContext MCP Server'
        }]
      };
    }
  );

  // Add a simple echo tool
  server.tool(
    'echo',
    { message: z.string() },
    async ({ message }) => ({
      content: [{ type: "text", text: `Echo: ${message}` }]
    })
  );

  console.log('Starting MCP server with stdio transport...');
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    console.log('MCP server connected successfully');
    
    // Keep the process running
    process.stdin.resume();
    
    process.on('SIGINT', () => {
      console.log('Shutting down MCP server...');
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error connecting MCP server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server when the file is executed
console.log('Starting basic MCP server...');
startMcpServer().catch(error => {
  console.error(`Failed to start MCP server: ${error.message}`);
  process.exit(1);
});
```

# src/claude-mcp-server.ts

```ts
// src/claude-mcp-server.ts
// A clean MCP server implementation specifically for Claude Desktop

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createLogger } from './utils/logger';

// Create a logger that writes to stderr only
const logger = createLogger('LegalContext');

// Redirect console methods to our logger to avoid stdout pollution
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleDebug = console.debug;

// Override console methods to use our stderr logger
console.log = (...args) => logger.info(...args);
console.info = (...args) => logger.info(...args);
console.warn = (...args) => logger.warn(...args);
console.error = (...args) => logger.error(args[0], args[1] instanceof Error ? args[1] : undefined);
console.debug = (...args) => logger.debug(...args);

/**
 * Main entry point for the LegalContext MCP server
 */
async function main() {
  logger.info('Initializing LegalContext MCP server...');
  
  // Create the MCP server
  const server = new McpServer({
    name: "LegalContext",
    version: "1.0.0"
  });

  // Register resources
  logger.info('Registering resources...');
  
  // Info resource
  server.resource(
    'info',
    'info://server',
    (uri) => {
      logger.debug('Handling info resource request:', uri.href);
      return {
        contents: [{
          uri: uri.href,
          text: "LegalContext MCP Server - A secure bridge between law firm document management systems and AI assistants."
        }]
      };
    }
  );
  
  // Document resource (placeholder)
  server.resource(
    'document',
    new ResourceTemplate('document://{id}', { list: undefined }),
    (uri, params) => {
      logger.debug('Handling document resource request:', uri.href, params);
      const { id } = params;
      return {
        contents: [{
          uri: uri.href,
          text: `Document ${id} content would appear here.`
        }]
      };
    }
  );

  // Register tools
  logger.info('Registering tools...');
  
  // Search tool
  server.tool(
    'search',
    { 
      query: z.string(),
      limit: z.number().optional()
    },
    (params) => {
      logger.debug('Handling search tool request:', params);
      const { query, limit = 5 } = params;
      return {
        content: [{ 
          type: "text", 
          text: `Found ${limit} results for query: "${query}"`
        }]
      };
    }
  );
  
  // Echo tool for testing
  server.tool(
    'echo',
    { message: z.string() },
    (params) => {
      logger.debug('Handling echo tool request:', params);
      return {
        content: [{ 
          type: "text", 
          text: `Echo: ${params.message}`
        }]
      };
    }
  );

  // Connect to stdio transport
  logger.info('Starting server with stdio transport...');
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    logger.info('MCP server successfully connected to transport');
    
    // Keep the process alive
    process.stdin.resume();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down LegalContext MCP server...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error connecting MCP server:', error);
    process.exit(1);
  }
}

// Start the server
main().catch(error => {
  logger.error('Unhandled error in MCP server:', error);
  process.exit(1);
});

```

# src/clio/api/.gitkeep

```

```

# src/clio/api/clio-document.service.ts

```ts
// src/clio/api/clio-document.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClioAuthService } from '../auth/clio-auth.service';
import { DocumentListParams, DocumentListResponse, DocumentResponse } from '../dto/document.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClioDocumentService {
  private readonly logger = new Logger(ClioDocumentService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: ClioAuthService,
  ) {}

  /**
   * List documents with optional filtering
   */
  async listDocuments(params: DocumentListParams = {}): Promise<DocumentListResponse> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');

      const response = await lastValueFrom(
        this.httpService.get<DocumentListResponse>(`${apiUrl}/documents`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: params.fields || 'id,etag,name,content_type,created_at,updated_at,parent',
            limit: params.limit || 100,
            page: params.page || 1,
            ...params,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to list documents: ${error.message}`, error.stack);
      throw new Error(`Unable to list documents: ${error.message}`);
    }
  }

  /**
   * List contents of a folder
   */
  async listFolderContents(folderId: string, params: DocumentListParams = {}): Promise<DocumentListResponse> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');

      const response = await lastValueFrom(
        this.httpService.get<DocumentListResponse>(`${apiUrl}/folders/list`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: params.fields || 'id,etag,name,content_type,created_at,updated_at,parent',
            parent_id: folderId,
            limit: params.limit || 100,
            page: params.page || 1,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to list folder contents: ${error.message}`, error.stack);
      throw new Error(`Unable to list folder contents: ${error.message}`);
    }
  }

  /**
   * Get document metadata
   */
  async getDocument(documentId: string, fields?: string): Promise<DocumentResponse> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');

      const response = await lastValueFrom(
        this.httpService.get<{ data: DocumentResponse }>(`${apiUrl}/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: fields || 'id,etag,name,content_type,created_at,updated_at,parent,description',
          },
        })
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get document: ${error.message}`, error.stack);
      throw new Error(`Unable to get document: ${error.message}`);
    }
  }

  /**
   * Download document content
   */
  async downloadDocument(documentId: string): Promise<Buffer> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');

      const response = await lastValueFrom(
        this.httpService.get(`${apiUrl}/documents/${documentId}/download`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'arraybuffer',
        })
      );

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Failed to download document: ${error.message}`, error.stack);
      throw new Error(`Unable to download document: ${error.message}`);
    }
  }
}

```

# src/clio/auth/.gitkeep

```

```

# src/clio/auth/clio-auth.service.ts

```ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthToken } from '../../database/entities/oauth-token.entity';
import { TokenResponse } from '../dto/auth.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClioAuthService {
  private readonly logger = new Logger(ClioAuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(OAuthToken)
    private readonly tokenRepository: Repository<OAuthToken>,
  ) {}

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async authenticate(code: string): Promise<OAuthToken> {
    try {
      const clientId = this.configService.get('clio.clientId');
      const clientSecret = this.configService.get('clio.clientSecret');
      const redirectUri = this.configService.get('clio.redirectUri');
      const apiUrl = this.configService.get('clio.apiUrl');

      const tokenUrl = apiUrl.replace('/api/v4', '/oauth/token');

      const response = await lastValueFrom(
        this.httpService.post<TokenResponse>(
          tokenUrl,
          {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Create and save token
      const token = this.tokenRepository.create({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      });

      return this.tokenRepository.save(token);
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`, error.stack);
      throw new Error(`Failed to authenticate with Clio: ${error.message}`);
    }
  }

  /**
   * Refresh access token using the refresh token
   */
  async refreshToken(token: OAuthToken): Promise<OAuthToken> {
    try {
      const clientId = this.configService.get('clio.clientId');
      const clientSecret = this.configService.get('clio.clientSecret');
      const apiUrl = this.configService.get('clio.apiUrl');

      const tokenUrl = apiUrl.replace('/api/v4', '/oauth/token');

      const response = await lastValueFrom(
        this.httpService.post<TokenResponse>(
          tokenUrl,
          {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Update token
      token.accessToken = access_token;
      token.refreshToken = refresh_token;
      token.expiresAt = expiresAt;

      return this.tokenRepository.save(token);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    try {
      // Get the most recent token
      const token = await this.tokenRepository.findOne({
        order: { createdAt: 'DESC' },
      });

      if (!token) {
        throw new Error('No OAuth token found. Authentication required.');
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const now = new Date();
      const expirationThreshold = new Date(now);
      expirationThreshold.setMinutes(now.getMinutes() + 5);

      if (token.expiresAt < expirationThreshold) {
        const refreshedToken = await this.refreshToken(token);
        return refreshedToken.accessToken;
      }

      return token.accessToken;
    } catch (error) {
      this.logger.error(`Failed to get valid access token: ${error.message}`, error.stack);
      throw new Error(`Unable to get valid access token: ${error.message}`);
    }
  }
}

```

# src/clio/clio.module.ts

```ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthToken } from '../database/entities/oauth-token.entity';
import { ClioAuthService } from './auth/clio-auth.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([OAuthToken]),
  ],
  providers: [
    ClioAuthService,
  ],
  exports: [
    ClioAuthService,
  ],
})
export class ClioModule {}

```

# src/clio/dto/.gitkeep

```

```

# src/clio/dto/auth.dto.ts

```ts
export class TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

```

# src/clio/dto/clio-auth.service.ts

```ts
// src/clio/auth/clio-auth.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthToken } from '../../database/entities/oauth-token.entity';
import { TokenResponse } from '../dto/auth.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClioAuthService {
  private readonly logger = new Logger(ClioAuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(OAuthToken)
    private readonly tokenRepository: Repository<OAuthToken>,
  ) {}

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async authenticate(code: string): Promise<OAuthToken> {
    try {
      const clientId = this.configService.get('clio.clientId');
      const clientSecret = this.configService.get('clio.clientSecret');
      const redirectUri = this.configService.get('clio.redirectUri');
      const apiUrl = this.configService.get('clio.apiUrl');

      const tokenUrl = apiUrl.replace('/api/v4', '/oauth/token');

      const response = await lastValueFrom(
        this.httpService.post<TokenResponse>(
          tokenUrl,
          {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Create and save token
      const token = this.tokenRepository.create({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      });

      return this.tokenRepository.save(token);
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`, error.stack);
      throw new Error(`Failed to authenticate with Clio: ${error.message}`);
    }
  }

  // src/clio/auth/clio-auth.service.ts (continued)
  /**
   * Refresh access token using the refresh token
   */
  async refreshToken(token: OAuthToken): Promise<OAuthToken> {
    try {
      const clientId = this.configService.get('clio.clientId');
      const clientSecret = this.configService.get('clio.clientSecret');
      const apiUrl = this.configService.get('clio.apiUrl');

      const tokenUrl = apiUrl.replace('/api/v4', '/oauth/token');

      const response = await lastValueFrom(
        this.httpService.post<TokenResponse>(
          tokenUrl,
          {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Update token
      token.accessToken = access_token;
      token.refreshToken = refresh_token;
      token.expiresAt = expiresAt;

      return this.tokenRepository.save(token);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    try {
      // Get the most recent token
      const token = await this.tokenRepository.findOne({
        order: { createdAt: 'DESC' },
      });

      if (!token) {
        throw new Error('No OAuth token found. Authentication required.');
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const now = new Date();
      const expirationThreshold = new Date(now);
      expirationThreshold.setMinutes(now.getMinutes() + 5);

      if (token.expiresAt < expirationThreshold) {
        const refreshedToken = await this.refreshToken(token);
        return refreshedToken.accessToken;
      }

      return token.accessToken;
    } catch (error) {
      this.logger.error(`Failed to get valid access token: ${error.message}`, error.stack);
      throw new Error(`Unable to get valid access token: ${error.message}`);
    }
  }
}

```

# src/clio/dto/document.dto.ts

```ts
// src/clio/dto/document.dto.ts
export interface DocumentListParams {
  fields?: string;
  limit?: number;
  page?: number;
  parent_id?: string; // For folder contents
  updated_since?: string;
  matter_id?: string;
  custom_field_values?: Record<string, any>;
}

export interface DocumentResponse {
  id: string;
  etag: string;
  name: string;
  content_type: string;
  description?: string;
  parent?: {
    id: string;
    type: string;
  };
  created_at: string;
  updated_at: string;
  [key: string]: any; // For any additional fields
}

export interface DocumentListResponse {
  data: DocumentResponse[];
  meta: {
    paging: {
      limit: number;
      page: number;
      total_pages: number;
      total_entries: number;
    };
  };
}


```

# src/config/configuration.ts

```ts
// src/config/configuration.ts
export default () => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const dbPort = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432;
  const maxDocSize = process.env.MAX_DOCUMENT_SIZE ? parseInt(process.env.MAX_DOCUMENT_SIZE, 10) : 5 * 1024 * 1024;
  const chunkSize = process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE, 10) : 1000;
  const chunkOverlap = process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP, 10) : 200;

  return {
    port,
    environment: process.env.NODE_ENV || 'development',

    mcpServer: {
      name: process.env.MCP_SERVER_NAME || 'LegalContext Connect',
      version: process.env.MCP_SERVER_VERSION || '1.0.0',
    },

    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: dbPort,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      name: process.env.DATABASE_NAME || 'legalcontext',
    },

    security: {
      encryptionKey: process.env.ENCRYPTION_KEY || 'development-key',
    },

    documentProcessing: {
      maxDocumentSize: maxDocSize,
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    },
  };
};

```

# src/config/validation.schema.ts

```ts
// src/config/validation.schema.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Server configuration
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  // MCP server configuration
  MCP_SERVER_NAME: Joi.string().default('LegalContext Connect'),
  MCP_SERVER_VERSION: Joi.string().default('1.0.0'),

  // Database configuration
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // Security configuration
  ENCRYPTION_KEY: Joi.string().required(),

  // Document processing configuration
  MAX_DOCUMENT_SIZE: Joi.number().default(5 * 1024 * 1024), // 5MB
  CHUNK_SIZE: Joi.number().default(1000),
  CHUNK_OVERLAP: Joi.number().default(200),
});

```

# src/database/database.module.ts

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Document } from './entities/document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import { DocumentVector } from './entities/document-vector.entity';
import { OAuthToken } from './entities/oauth-token.entity';

/**
 * Database module for entity management
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [Document, DocumentChunk, DocumentVector, OAuthToken],
        synchronize: configService.get('environment') !== 'production',
        logging: configService.get('environment') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Document, DocumentChunk, DocumentVector, OAuthToken]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

```

# src/database/entities/.gitkeep

```

```

# src/database/entities/document-chunk.entity.ts

```ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity';
import { DocumentVector } from './document-vector.entity';

@Entity()
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, document => document.chunks, { onDelete: 'CASCADE' })
  document: Document;

  @Column('text')
  content: string;

  @Column('int')
  startIndex: number;

  @Column('int')
  endIndex: number;

  @OneToOne(() => DocumentVector, vector => vector.chunk, { cascade: true })
  vector: DocumentVector;
}

```

# src/database/entities/document-vector.entity.ts

```ts
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { DocumentChunk } from './document-chunk.entity';

@Entity()
export class DocumentVector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => DocumentChunk, chunk => chunk.vector)
  @JoinColumn()
  chunk: DocumentChunk;

  @Column('simple-array')
  embedding: number[];
}

```

# src/database/entities/document.entity.ts

```ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DocumentChunk } from './document-chunk.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  clioId: string;

  @Column()
  mimeType: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => DocumentChunk, chunk => chunk.document)
  chunks: DocumentChunk[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

```

# src/database/entities/oauth-token.entity.ts

```ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class OAuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

```

# src/demo-client.ts

```ts
// src/demo-client.ts - A simple MCP client for testing the server
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Start a test client to connect to the MCP server
 */
async function startTestClient() {
  console.log('Starting MCP test client...');
  
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/demo-mcp.ts']
  });

  // Create the client
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      },
      timeout: 10000 // Set a smaller timeout value
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected to MCP server');

    // Test the info resource
    console.log('Reading info resource...');
    const infoResource = await client.readResource('info://server');
    console.log('Info resource content:', JSON.stringify(infoResource, null, 2));

    // Test the example resource
    console.log('Reading example resource...');
    const exampleResource = await client.readResource('example://test');
    console.log('Example resource content:', JSON.stringify(exampleResource, null, 2));

    // Test the echo tool
    console.log('Calling echo tool...');
    const echoResult = await client.callTool("echo", {
      message: 'Hello from test client!'
    });
    console.log('Echo tool result:', JSON.stringify(echoResult, null, 2));

    console.log('Tests completed successfully');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    // Disconnect and exit
    console.log('Disconnecting...');
    process.exit(0);
  }
}

// Start the test client
startTestClient();
```

# src/demo-mcp.ts

```ts
// src/demo-mcp.ts - A simple implementation of the MCP server for demonstration
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

/**
 * Start the MCP server with basic resources and tools for demonstration
 */
async function startMcpServer() {
  // Create an MCP server
  const server = new McpServer({
    name: "LegalContext",
    version: "1.0.0"
  });

  // Add an info resource
  server.resource(
    'info',
    'info://server',
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: 'LegalContext MCP Server - A secure bridge between law firms\' document management systems and AI assistants.'
      }]
    })
  );

  // Add a dynamic example resource
  server.resource(
    'example',
    new ResourceTemplate("example://{parameter}", { list: undefined }),
    async (uri, params) => {
      const { parameter } = params;
      return {
        contents: [{
          uri: uri.href,
          text: `Example resource with parameter: ${parameter}`
        }]
      };
    }
  );

  // Add an echo tool
  server.tool(
    'echo',
    { message: z.string() },
    async ({ message }) => ({
      content: [{ type: "text", text: `Echo: ${message}` }]
    })
  );

  // Start the server
  console.log('Starting MCP server...');
  const transport = new StdioServerTransport();
  
  // Add debug logging
  console.log('Transport created, connecting to client...');
  
  // Connect to transport
  await server.connect(transport);
  console.log('MCP server connected successfully');

  return server;
}

// Start the server when the file is executed
startMcpServer().catch(error => {
  console.error(`Failed to start MCP server: ${error.message}`);
  process.exit(1);
});
```

# src/direct-server.js

```js
// src/direct-server.js
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

// Create a simple server
const server = new McpServer({
  name: "Direct Server",
  version: "1.0.0"
});

// Add a simple info resource
server.resource('info', 'info://server', async (uri) => {
  console.log('INFO RESOURCE ACCESSED');
  return {
    contents: [{
      uri: uri.href,
      text: "This is a direct MCP server."
    }]
  };
});

// Add a simple echo tool
server.tool('echo', { message: 'string' }, async (params) => {
  console.log('ECHO TOOL CALLED');
  return {
    content: [{ type: "text", text: `Echo: ${params.message}` }]
  };
});

// Start the server
const transport = new StdioServerTransport();

console.log('Starting direct MCP server...');
server.connect(transport)
  .then(() => {
    console.log('MCP server connected successfully');
  })
  .catch((error) => {
    console.error('Failed to connect MCP server:', error);
    process.exit(1);
  });

// Keep the process alive
process.stdin.resume();

```

# src/document-processing/chunking/.gitkeep

```

```

# src/document-processing/chunking/chunking.service.ts

```ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  preserveParagraphs?: boolean;
}

export interface DocumentChunkData {
  content: string;
  startIndex: number;
  endIndex: number;
}

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Split document text into chunks with optional overlap
   */
  chunk(text: string, options?: ChunkingOptions): DocumentChunkData[] {
    const defaultChunkSize = this.configService.get<number>('documentProcessing.chunkSize', 1000);
    const defaultChunkOverlap = this.configService.get<number>('documentProcessing.chunkOverlap', 200);
    
    const chunkSize = options?.chunkSize ?? defaultChunkSize;
    const chunkOverlap = options?.chunkOverlap ?? defaultChunkOverlap;
    const preserveParagraphs = options?.preserveParagraphs !== undefined ? options.preserveParagraphs : true;

    this.logger.debug(`Chunking document with size: ${chunkSize}, overlap: ${chunkOverlap}, preserveParagraphs: ${preserveParagraphs}`);

    if (preserveParagraphs) {
      return this.chunkByParagraphs(text, chunkSize, chunkOverlap);
    } else {
      return this.chunkBySize(text, chunkSize, chunkOverlap);
    }
  }

  /**
   * Split text into chunks of approximately equal size
   */
  private chunkBySize(text: string, chunkSize: number, chunkOverlap: number): DocumentChunkData[] {
    const chunks: DocumentChunkData[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);

      chunks.push({
        content: text.substring(startIndex, endIndex),
        startIndex,
        endIndex,
      });

      startIndex = endIndex - chunkOverlap;

      // Prevent infinite loop if overlap >= chunkSize
      if (startIndex <= chunks[chunks.length - 1].startIndex) {
        startIndex = chunks[chunks.length - 1].endIndex;
      }
    }

    return chunks;
  }

  /**
   * Split text by paragraphs, keeping paragraphs together when possible
   */
  private chunkByParagraphs(text: string, chunkSize: number, chunkOverlap: number): DocumentChunkData[] {
    // Split text into paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: DocumentChunkData[] = [];

    let currentChunk = '';
    let chunkStartIndex = 0;
    let currentIndex = 0;

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed chunk size and we already have content,
      // create a new chunk
      if (currentChunk.length + paragraph.length + 2 > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk,
          startIndex: chunkStartIndex,
          endIndex: currentIndex - 2, // Subtract 2 for the paragraph separator
        });

        // Calculate new start index with overlap
        const overlapStart = Math.max(currentIndex - chunkOverlap, chunkStartIndex);
        const overlapContent = text.substring(overlapStart, currentIndex - 2);

        currentChunk = overlapContent;
        chunkStartIndex = overlapStart;
      }

      // Add paragraph to current chunk
      if (currentChunk.length > 0) {
        currentChunk += '\n\n';
        currentIndex += 2;
      }

      currentChunk += paragraph;
      currentIndex += paragraph.length;
    }

    // Add the last chunk if it has content
    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk,
        startIndex: chunkStartIndex,
        endIndex: currentIndex,
      });
    }

    return chunks;
  }
}

```

# src/document-processing/document-processing.module.ts

```ts
// src/document-processing/document-processing.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../database/entities/document.entity';
import { DocumentChunk } from '../database/entities/document-chunk.entity';
import { DocumentVector } from '../database/entities/document-vector.entity';
import { TextExtractorService } from './extractors/text-extractor.service';
import { ChunkingService } from './chunking/chunking.service';
import { EmbeddingService } from './embedding/embedding.service';
import { DocumentProcessorService } from './document-processor.service';
import { SearchService } from './search/search.service';
import { ClioModule } from '../clio/clio.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Document, DocumentChunk, DocumentVector]),
    ClioModule,
  ],
  providers: [
    TextExtractorService,
    ChunkingService,
    EmbeddingService,
    DocumentProcessorService,
    SearchService,
  ],
  exports: [
    TextExtractorService,
    ChunkingService,
    EmbeddingService,
    DocumentProcessorService,
    SearchService,
  ],
})
export class DocumentProcessingModule {
}

```

# src/document-processing/document-processor.service.ts

```ts
// src/document-processing/document-processor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../database/entities/document.entity';
import { DocumentChunk } from '../database/entities/document-chunk.entity';
import { TextExtractorService } from './extractors/text-extractor.service';
import { ChunkingService } from './chunking/chunking.service';
import { EmbeddingService } from './embedding/embedding.service';
import { ClioDocumentService } from '../clio/api/clio-document.service';

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    private readonly textExtractorService: TextExtractorService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly clioDocumentService: ClioDocumentService,
  ) {}

  /**
   * Process a document from Clio and store it in the local database
   */
  async processDocument(clioDocumentId: string): Promise<Document> {
    this.logger.debug(`Processing document ${clioDocumentId}`);

    try {
      // Check if document already exists
      let document = await this.documentRepository.findOne({
        where: { clioId: clioDocumentId },
        relations: ['chunks'],
      });

      if (document) {
        this.logger.debug(`Document ${clioDocumentId} already exists, updating...`);

        // Update document if it exists
        const documentMeta = await this.clioDocumentService.getDocument(clioDocumentId);

        if (new Date(documentMeta.updated_at) <= document.updatedAt) {
          this.logger.debug(`Document ${clioDocumentId} is up to date, skipping processing`);
          return document;
        }

        // Update document metadata
        document.title = documentMeta.name;
        document.mimeType = documentMeta.content_type;
        document.metadata = documentMeta;

        await this.documentRepository.save(document);
      } else {
        // Create new document
        this.logger.debug(`Document ${clioDocumentId} is new, creating...`);

        // Fetch document metadata
        const documentMeta = await this.clioDocumentService.getDocument(clioDocumentId);

        // Create document entity
        document = this.documentRepository.create({
          clioId: clioDocumentId,
          title: documentMeta.name,
          mimeType: documentMeta.content_type,
          metadata: documentMeta,
        });

        await this.documentRepository.save(document);
      }

      // Download document
      const documentContent = await this.clioDocumentService.downloadDocument(clioDocumentId);

      // Extract text
      const text = await this.textExtractorService.extract(documentContent, document.mimeType);

      // Delete existing chunks if any
      if (document.chunks && document.chunks.length > 0) {
        await this.chunkRepository.remove(document.chunks);
      }

      // Create chunks
      const chunkDataList = this.chunkingService.chunk(text);

      const chunks: DocumentChunk[] = [];

      for (const chunkData of chunkDataList) {
        const chunk = this.chunkRepository.create({
          document,
          content: chunkData.content,
          startIndex: chunkData.startIndex,
          endIndex: chunkData.endIndex,
        });

        chunks.push(await this.chunkRepository.save(chunk));
      }

      // Generate embeddings
      await this.embeddingService.generateEmbeddings(chunks);

      // Update document with chunks relation
      document.chunks = chunks;
      await this.documentRepository.save(document);

      this.logger.debug(`Document ${clioDocumentId} processed successfully with ${chunks.length} chunks`);

      return document;
    } catch (error) {
      this.logger.error(`Error processing document ${clioDocumentId}: ${error.message}`, error.stack);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  /**
   * Search for documents using semantic search
   */
  async searchDocuments(query: string, limit: number = 5): Promise<Document[]> {
    // In a real implementation, you would use vector similarity search
    // For this example, we'll use a simple text search

    this.logger.debug(`Searching documents with query: ${query}`);

    try {
      // Simple search by title for demonstration
      const documents = await this.documentRepository
        .createQueryBuilder('document')
        .where('document.title ILIKE :query', { query: `%${query}%` })
        .limit(limit)
        .getMany();

      return documents;
    } catch (error) {
      this.logger.error(`Error searching documents: ${error.message}`, error.stack);
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }
}


```

# src/document-processing/embedding/.gitkeep

```

```

# src/document-processing/embedding/embedding.service.ts

```ts
// src/document-processing/embedding/embedding.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';
import { DocumentVector } from '../../database/entities/document-vector.entity';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    @InjectRepository(DocumentVector)
    private readonly vectorRepository: Repository<DocumentVector>,
  ) {
  }

  /**
   * Generate vector embeddings for document chunks
   * In a real implementation, you would use a model like OpenAI's embeddings API
   */
  async generateEmbeddings(chunks: DocumentChunk[]): Promise<DocumentVector[]> {
    this.logger.debug(`Generating embeddings for ${chunks.length} chunks`);

    const vectors: DocumentVector[] = [];

    for (const chunk of chunks) {
      // In a real implementation, you would call an embedding API
      // This is a placeholder that generates random embeddings
      const embedding = this.mockEmbeddingGeneration(chunk.content);

      const vector = this.vectorRepository.create({
        chunk,
        embedding,
      });

      vectors.push(await this.vectorRepository.save(vector));
    }

    return vectors;
  }

  /**
   * Mock embedding generation for demonstration purposes
   * In a real implementation, you would use a proper embedding model
   */
  private mockEmbeddingGeneration(text: string): number[] {
    // Generate a fixed-size random embedding (1536-dim for demonstration)
    const embedding = Array(1536).fill(0).map(() => Math.random() * 2 - 1);

    // Normalize the embedding to unit length
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }
}

```

# src/document-processing/extractors/.gitkeep

```

```

# src/document-processing/extractors/text-extractor.service.ts

```ts
import { Injectable, Logger } from '@nestjs/common';

export class UnsupportedDocumentTypeException extends Error {
  constructor(mimeType: string) {
    super(`Unsupported document type: ${mimeType}`);
  }
}

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  /**
   * Extract text from document based on MIME type
   */
  async extract(document: Buffer, mimeType: string): Promise<string> {
    this.logger.debug(`Extracting text from document with MIME type: ${mimeType}`);

    switch (mimeType) {
      case 'application/pdf':
        return this.extractFromPdf(document);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractFromDocx(document);
      case 'text/plain':
        return document.toString('utf-8');
      case 'text/html':
        return this.extractFromHtml(document);
      case 'application/rtf':
        return this.extractFromRtf(document);
      default:
        throw new UnsupportedDocumentTypeException(mimeType);
    }
  }

  /**
   * Extract text from PDF using pdf-parse library
   * Note: In a real implementation, you'd want to use a library like pdf-parse
   */
  private async extractFromPdf(document: Buffer): Promise<string> {
    // Placeholder for actual PDF extraction
    // In a real implementation, use a library like pdf-parse
    this.logger.debug('Extracting text from PDF');

    // Mock implementation for demonstration
    return 'Extracted PDF text would appear here';
  }

  /**
   * Extract text from DOCX using mammoth.js or similar
   */
  private async extractFromDocx(document: Buffer): Promise<string> {
    // Placeholder for actual DOCX extraction
    // In a real implementation, use a library like mammoth.js
    this.logger.debug('Extracting text from DOCX');

    // Mock implementation for demonstration
    return 'Extracted DOCX text would appear here';
  }

  /**
   * Extract text from HTML using cheerio or similar
   */
  private async extractFromHtml(document: Buffer): Promise<string> {
    // Placeholder for actual HTML extraction
    // In a real implementation, use a library like cheerio
    this.logger.debug('Extracting text from HTML');

    // Mock implementation for demonstration
    return 'Extracted HTML text would appear here';
  }

  /**
   * Extract text from RTF
   */
  private async extractFromRtf(document: Buffer): Promise<string> {
    // Placeholder for actual RTF extraction
    this.logger.debug('Extracting text from RTF');

    // Mock implementation for demonstration
    return 'Extracted RTF text would appear here';
  }
}

```

# src/document-processing/indexing/.gitkeep

```

```

# src/document-processing/search/search.service.ts

```ts
// src/document-processing/search/search.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';
import { DocumentVector } from '../../database/entities/document-vector.entity';
import { EmbeddingService } from '../embedding/embedding.service';

export interface SearchResult {
  document: Document;
  chunk: DocumentChunk;
  similarity: number;
}

export interface SearchOptions {
  matter_id?: string;
  limit?: number;
  minSimilarity?: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    @InjectRepository(DocumentVector)
    private readonly vectorRepository: Repository<DocumentVector>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Search for document chunks by semantic similarity
   */
  async searchSimilar(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    this.logger.debug(`Searching for documents similar to: ${query}`);

    try {
      const limit = options.limit || 5;
      const minSimilarity = options.minSimilarity || 0.7;

      // In a real implementation, you would use pgvector's cosine similarity search
      // For this example, we'll use a mock approach

      // Generate embedding for the query
      // This uses our mock implementation
      const mockQueryChunk = this.chunkRepository.create({
        content: query,
        startIndex: 0,
        endIndex: query.length,
        document: null,
      });

      const [mockVector] = await this.embeddingService.generateEmbeddings([mockQueryChunk]);

      // In a real implementation with pgvector, you would use:
      // SELECT c.*, d.*, 1 - (v.embedding <=> [query_embedding]) as similarity
      // FROM document_vector v
      // JOIN document_chunk c ON c.id = v.chunk_id
      // JOIN document d ON d.id = c.document_id
      // WHERE 1 - (v.embedding <=> [query_embedding]) > [min_similarity]
      // ORDER BY similarity DESC
      // LIMIT [limit]

      // For the mock implementation, we'll retrieve all vectors and compute similarity in memory
      const allVectors = await this.vectorRepository.find({
        relations: ['chunk', 'chunk.document'],
      });

      // Mock similarity computation (dot product)
      const results: SearchResult[] = allVectors
        .map(vector => {
          // Compute cosine similarity
          const similarity = vector.embedding.reduce(
            (sum, val, i) => sum + val * mockVector.embedding[i],
            0
          );

          return {
            document: vector.chunk.document,
            chunk: vector.chunk,
            similarity,
          };
        })
        .filter(result => result.similarity > minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      if (options.matter_id) {
        // Filter by matter ID if specified
        return results.filter(result => {
          const metadata = result.document.metadata as any;
          return metadata.matter_id === options.matter_id;
        });
      }

      return results;
    } catch (error) {
      this.logger.error(`Error in semantic search: ${error.message}`, error.stack);
      throw new Error(`Failed to perform semantic search: ${error.message}`);
    }
  }

  /**
   * Search for documents by text matching
   */
  async searchText(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    this.logger.debug(`Searching for documents containing text: ${query}`);

    try {
      const limit = options.limit || 5;

      // In a real implementation, you would use full-text search capabilities
      // For this example, we'll use a simple LIKE query

      const chunks = await this.chunkRepository
        .createQueryBuilder('chunk')
        .innerJoinAndSelect('chunk.document', 'document')
        .where('chunk.content ILIKE :query', { query: `%${query}%` })
        .limit(limit)
        .getMany();

      // Create search results with a default similarity score
      const results: SearchResult[] = chunks.map(chunk => ({
        document: chunk.document,
        chunk,
        similarity: 1.0, // Default similarity for text matching
      }));

      if (options.matter_id) {
        // Filter by matter ID if specified
        return results.filter(result => {
          const metadata = result.document.metadata as any;
          return metadata.matter_id === options.matter_id;
        });
      }

      return results;
    } catch (error) {
      this.logger.error(`Error in text search: ${error.message}`, error.stack);
      throw new Error(`Failed to perform text search: ${error.message}`);
    }
  }

  /**
   * Hybrid search combining semantic and text search
   */
  async searchHybrid(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      // Perform both types of search
      const semanticResults = await this.searchSimilar(query, options);
      const textResults = await this.searchText(query, options);

      // Combine results, preferring semantic matches
      const combinedResults = [...semanticResults];

      // Add text results that aren't duplicates
      for (const textResult of textResults) {
        if (!combinedResults.some(result =>
          result.document.id === textResult.document.id &&
          result.chunk.id === textResult.chunk.id
        )) {
          combinedResults.push(textResult);
        }
      }

      // Sort by similarity and limit results
      return combinedResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, options.limit || 5);
    } catch (error) {
      this.logger.error(`Error in hybrid search: ${error.message}`, error.stack);
      throw new Error(`Failed to perform hybrid search: ${error.message}`);
    }
  }
}


```

# src/example/echo-client.ts

```ts
// src/example/echo-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('Starting Echo client...');
  
  // Create a transport to connect to the Echo server
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/example/echo-server.ts'],
    debug: true
  });

  // Create a client
  const client = new Client(
    {
      name: 'echo-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      },
      timeout: 5000 // 5s timeout
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to Echo server...');
    await client.connect(transport);
    console.log('Connected successfully');

    // List resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', JSON.stringify(resources, null, 2));

    // Read a resource
    console.log('Reading echo resource...');
    const resourceResult = await client.readResource('echo://hello');
    console.log('Resource result:', JSON.stringify(resourceResult, null, 2));

    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Tools:', JSON.stringify(tools, null, 2));

    // Call a tool
    console.log('Calling echo tool...');
    const toolResult = await client.callTool('echo', { message: 'Hello from tool call!' });
    console.log('Tool result:', JSON.stringify(toolResult, null, 2));

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Clean exit
    console.log('Exiting client...');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
```

# src/example/echo-server.ts

```ts
// src/example/echo-server.ts
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create a simple Echo server
const server = new McpServer({
  name: "Echo",
  version: "1.0.0"
});

// Add an echo resource
server.resource(
  'echo',
  new ResourceTemplate('echo://{message}', { list: undefined }),
  (uri, params) => {
    console.log('Resource request received:', uri.href, params);
    return {
      contents: [{
        uri: uri.href,
        text: `Resource echo: ${params.message}`
      }]
    };
  }
);

// Add an echo tool
server.tool(
  'echo',
  { message: z.string() },
  (params) => {
    console.log('Tool request received:', params);
    return {
      content: [{ type: "text", text: `Tool echo: ${params.message}` }]
    };
  }
);

// Start the server
console.log('Starting Echo server...');
const transport = new StdioServerTransport();
server.connect(transport)
  .then(() => {
    console.log('Server connected');
  })
  .catch(error => {
    console.error('Connection error:', error);
    process.exit(1);
  });

console.log('Server initialization complete');

```

# src/main.ts

```ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('Initializing LegalContext server...');
    
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Start the application
    // Note: Since we're using stdio for MCP communication,
    // we don't need to actually listen on a port
    await app.init();
    
    logger.log('LegalContext server initialized successfully');
    
    // Keep the application running
    process.on('SIGINT', async () => {
      logger.log('Shutting down LegalContext server...');
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Failed to initialize LegalContext server: ${error.message}`, error.stack);
    process.exit(1);
  }
}

// Start the application
bootstrap();

```

# src/main/app.module.ts

```ts
// src/main/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '../mcp/mcp.module';
import configuration from '../config/configuration';

/**
 * Main application module that integrates all components of the LegalContext server.
 */
@Module({
  imports: [
    // Global config module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // MCP module for Claude Desktop integration
    McpModule,
  ],
})
export class AppModule {}
```

# src/main/config/validation.schema.ts

```ts
// src/main/config/validation.schema.ts
export default () => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const dbPort = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432;
  const maxDocSize = process.env.MAX_DOCUMENT_SIZE ? parseInt(process.env.MAX_DOCUMENT_SIZE, 10) : 5 * 1024 * 1024;
  const chunkSize = process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE, 10) : 1000;
  const chunkOverlap = process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP, 10) : 200;

  return {
    port,
    environment: process.env.NODE_ENV || 'development',

    mcpServer: {
      name: process.env.MCP_SERVER_NAME || 'LegalContext Connect',
      version: process.env.MCP_SERVER_VERSION || '1.0.0',
    },

    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: dbPort,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      name: process.env.DATABASE_NAME || 'legalcontext',
    },

    security: {
      encryptionKey: process.env.ENCRYPTION_KEY || 'development-key',
    },

    documentProcessing: {
      maxDocumentSize: maxDocSize,
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    },
  };
};
```

# src/main/main.ts

```ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('Initializing LegalContext server...');
    
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Start the application
    // Note: Since we're using stdio for MCP communication,
    // we don't need to actually listen on a port
    await app.init();
    
    logger.log('LegalContext server initialized successfully');
    
    // Keep the application running
    process.on('SIGINT', async () => {
      logger.log('Shutting down LegalContext server...');
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Failed to initialize LegalContext server: ${error.message}`, error.stack);
    process.exit(1);
  }
}

// Start the application
bootstrap();

```

# src/main/mcp/index.ts

```ts
// src/main/mcp/index.ts
export * from './mcp.module';
```

# src/main/mcp/mcp-orchestrator.service.ts

```ts
// src/main/mcp/mcp-orchestrator.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { McpServerService } from './mcp-server.service';
import { McpResourcesService } from './mcp-resources.service';
import { McpToolsService } from './mcp-tools.service';

/**
 * Service that orchestrates the initialization of MCP components.
 * Ensures that resources and tools are registered before the server connects.
 */
@Injectable()
export class McpOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(McpOrchestratorService.name);
  
  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly mcpResourcesService: McpResourcesService,
    private readonly mcpToolsService: McpToolsService,
  ) {}
  
  /**
   * Initialize the MCP ecosystem
   */
  async onModuleInit() {
    try {
      this.logger.log('Starting MCP orchestration...');
      
      // Register resources
      await this.mcpResourcesService.registerResources();
      
      // Register tools
      await this.mcpToolsService.registerTools();
      
      // Connect the server to transport
      await this.mcpServerService.connect();
      
      this.logger.log('MCP orchestration completed successfully');
    } catch (error) {
      this.logger.error(`Failed to orchestrate MCP initialization: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

# src/main/mcp/mcp-resources.service.ts

```ts
// src/main/mcp/mcp-resources.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServerService } from './mcp-server.service';

/**
 * Service that manages MCP resources.
 * Resources in the Model Context Protocol are used to provide data (like documents)
 * to the LLM for context.
 */
@Injectable()
export class McpResourcesService {
  private readonly logger = new Logger(McpResourcesService.name);
  
  constructor(private readonly mcpServerService: McpServerService) {}

  /**
   * Register all resources with the MCP server
   */
  async registerResources(): Promise<void> {
    const server = this.mcpServerService.getServer();
    if (!server) {
      this.logger.error('Cannot register resources: MCP server not initialized');
      return;
    }

    try {
      // Register a simple example resource to verify functionality
      this.registerExampleResource(server);
      
      this.logger.log('MCP resources registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register MCP resources: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Register a simple example resource for testing purposes
   */
  private registerExampleResource(server: any): void {
    // Example static resource
    server.resource(
      'info',
      'info://server',
      async (uri: any) => ({
        contents: [{
          uri: uri.href,
          text: 'LegalContext MCP Server - A secure bridge between law firm document management systems and AI assistants.'
        }]
      })
    );
    
    // Example dynamic resource with parameters
    server.resource(
      'example',
      new ResourceTemplate("example://{parameter}", { list: undefined }),
      async (uri: any, params: any) => {
        const { parameter } = params;
        return {
          contents: [{
            uri: uri.href,
            text: `Example resource with parameter: ${parameter}`
          }]
        };
      }
    );
    
    this.logger.log('Example resources registered');
  }
}
```

# src/main/mcp/mcp-server.service.ts

```ts
// src/main/mcp/mcp-server.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/**
 * Service that initializes and manages the MCP server.
 * Handles connection via stdio transport for Claude Desktop integration.
 */
@Injectable()
export class McpServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpServerService.name);
  private server: McpServer;
  private transport: StdioServerTransport;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize the MCP server when the module is loaded
   */
  async onModuleInit() {
    try {
      this.logger.log('Initializing MCP server...');
      
      // Create the MCP server instance
      this.server = new McpServer({
        name: this.configService.get('mcpServer.name', 'LegalContext'),
        version: this.configService.get('mcpServer.version', '1.0.0'),
      });

      this.logger.log('MCP server instance created');

      // Initialize the stdio transport for Claude Desktop
      this.transport = new StdioServerTransport();
      
      this.logger.log('MCP server ready to connect to transport');
    } catch (error) {
      this.logger.error(`Failed to initialize MCP server: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clean up resources when the module is destroyed
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect the MCP server to the transport
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.warn('MCP server is already connected');
      return;
    }

    try {
      this.logger.log('Connecting MCP server to stdio transport...');
      await this.server.connect(this.transport);
      this.isConnected = true;
      this.logger.log('MCP server connected successfully');
    } catch (error) {
      this.logger.error(`Failed to connect MCP server: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Disconnect the MCP server from the transport
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      this.logger.log('Disconnecting MCP server...');
      // The SDK doesn't have a disconnect method, but we can handle cleanup here
      this.isConnected = false;
      this.logger.log('MCP server disconnected successfully');
    } catch (error) {
      this.logger.error(`Failed to disconnect MCP server: ${error.message}`, error.stack);
    }
  }

  /**
   * Get the underlying MCP server instance
   */
  getServer(): McpServer {
    return this.server;
  }

  /**
   * Check if the server is connected
   */
  isServerConnected(): boolean {
    return this.isConnected;
  }
}
```

# src/main/mcp/mcp-tools.service.ts

```ts
// src/main/mcp/mcp-tools.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { McpServerService } from './mcp-server.service';

/**
 * Service that manages MCP tools.
 * Tools in the Model Context Protocol enable the LLM to perform
 * actions like searching documents or retrieving specific information.
 */
@Injectable()
export class McpToolsService {
  private readonly logger = new Logger(McpToolsService.name);
  
  constructor(private readonly mcpServerService: McpServerService) {}
  
  /**
   * Register all tools with the MCP server
   */
  async registerTools(): Promise<void> {
    const server = this.mcpServerService.getServer();
    if (!server) {
      this.logger.error('Cannot register tools: MCP server not initialized');
      return;
    }
    
    try {
      // Register a simple example tool to verify functionality
      this.registerExampleTool(server);
      
      this.logger.log('MCP tools registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register MCP tools: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Register a simple example tool for testing purposes
   */
  private registerExampleTool(server: any): void {
    // Example echo tool
    server.tool(
      'echo',
      { message: z.string() },
      async (params: any) => {
        const { message } = params;
        return {
          content: [{ type: "text", text: `Echo: ${message}` }]
        };
      }
    );
    
    this.logger.log('Example tools registered');
  }
}
```

# src/main/mcp/mcp.module.ts

```ts
// src/main/mcp/mcp.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpServerService } from './mcp-server.service';
import { McpResourcesService } from './mcp-resources.service';
import { McpToolsService } from './mcp-tools.service';
import { McpOrchestratorService } from './mcp-orchestrator.service';

/**
 * Module that provides MCP server capabilities.
 * Integrates with the Model Context Protocol TypeScript SDK to connect
 * with Claude Desktop through stdio transport.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    McpServerService,
    McpResourcesService,
    McpToolsService,
    McpOrchestratorService,
  ],
  exports: [
    McpServerService,
    McpResourcesService,
    McpToolsService,
  ],
})
export class McpModule {}
```

# src/mcp/index.ts

```ts
export * from './mcp.module';
export * from './mcp-server.service';
export * from './mcp-resources.service';
export * from './mcp-tools.service';
export * from './mcp-orchestrator.service';
export * from './interfaces';

```

# src/mcp/interfaces/index.ts

```ts
/**
 * Resource content item returned by MCP resources
 */
export interface ResourceContentItem {
  uri: string;
  text: string;
}

/**
 * Resource response returned by MCP resource handlers
 */
export interface ResourceResponse {
  contents: ResourceContentItem[];
}

/**
 * Tool content item type for text responses
 */
export interface ToolTextContent {
  type: 'text';
  text: string;
}

/**
 * Tool response returned by MCP tool handlers
 */
export interface ToolResponse {
  content: ToolTextContent[];
  isError?: boolean;
}

/**
 * Server information used to initialize the MCP server
 */
export interface ServerInfo {
  name: string;
  version: string;
}

```

# src/mcp/mcp-orchestrator.service.ts

```ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { McpServerService } from './mcp-server.service';
import { McpResourcesService } from './mcp-resources.service';
import { McpToolsService } from './mcp-tools.service';

/**
 * Service that orchestrates the initialization of MCP components.
 * Ensures that resources and tools are registered before the server connects.
 */
@Injectable()
export class McpOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(McpOrchestratorService.name);
  
  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly mcpResourcesService: McpResourcesService,
    private readonly mcpToolsService: McpToolsService,
  ) {}
  
  /**
   * Initialize the MCP ecosystem
   */
  async onModuleInit() {
    try {
      this.logger.log('Starting MCP orchestration...');
      
      // Register resources
      await this.mcpResourcesService.registerResources();
      
      // Register tools
      await this.mcpToolsService.registerTools();
      
      // Connect the server to transport
      await this.mcpServerService.connect();
      
      this.logger.log('MCP orchestration completed successfully');
    } catch (error) {
      this.logger.error(`Failed to orchestrate MCP initialization: ${error.message}`, error.stack);
      throw error;
    }
  }
}

```

# src/mcp/mcp-resources.service.ts

```ts
import { Injectable, Logger } from '@nestjs/common';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServerService } from './mcp-server.service';

/**
 * Service that manages MCP resources.
 * Resources in the Model Context Protocol are used to provide data (like documents)
 * to the LLM for context.
 */
@Injectable()
export class McpResourcesService {
  private readonly logger = new Logger(McpResourcesService.name);
  
  constructor(private readonly mcpServerService: McpServerService) {}

  /**
   * Register all resources with the MCP server
   */
  async registerResources(): Promise<void> {
    const server = this.mcpServerService.getServer();
    if (!server) {
      this.logger.error('Cannot register resources: MCP server not initialized');
      return;
    }

    try {
      // Register a simple example resource to verify functionality
      this.registerExampleResource(server);
      
      this.logger.log('MCP resources registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register MCP resources: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Register a simple example resource for testing purposes
   */
  private registerExampleResource(server: any): void {
    // Example static resource
    server.resource(
      'info',
      'info://server',
      async (uri: any) => ({
        contents: [{
          uri: uri.href,
          text: 'LegalContext MCP Server - A secure bridge between law firm document management systems and AI assistants.'
        }]
      })
    );
    
    // Example dynamic resource with parameters
    server.resource(
      'example',
      new ResourceTemplate("example://{parameter}", { list: undefined }),
      async (uri: any, params: any) => {
        const { parameter } = params;
        return {
          contents: [{
            uri: uri.href,
            text: `Example resource with parameter: ${parameter}`
          }]
        };
      }
    );
    
    this.logger.log('Example resources registered');
  }
}

```

# src/mcp/mcp-server.service.ts

```ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/**
 * Service that initializes and manages the MCP server.
 * Handles connection via stdio transport for Claude Desktop integration.
 */
@Injectable()
export class McpServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpServerService.name);
  private server: McpServer;
  private transport: StdioServerTransport;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize the MCP server when the module is loaded
   */
  async onModuleInit() {
    try {
      this.logger.log('Initializing MCP server...');
      
      // Create the MCP server instance
      this.server = new McpServer({
        name: this.configService.get('mcpServer.name', 'LegalContext'),
        version: this.configService.get('mcpServer.version', '1.0.0'),
      });

      this.logger.log('MCP server instance created');

      // Initialize the stdio transport for Claude Desktop
      this.transport = new StdioServerTransport();
      
      this.logger.log('MCP server ready to connect to transport');
    } catch (error) {
      this.logger.error(`Failed to initialize MCP server: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clean up resources when the module is destroyed
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect the MCP server to the transport
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.warn('MCP server is already connected');
      return;
    }

    try {
      this.logger.log('Connecting MCP server to stdio transport...');
      await this.server.connect(this.transport);
      this.isConnected = true;
      this.logger.log('MCP server connected successfully');
    } catch (error) {
      this.logger.error(`Failed to connect MCP server: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Disconnect the MCP server from the transport
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      this.logger.log('Disconnecting MCP server...');
      // The SDK doesn't have a disconnect method, but we can handle cleanup here
      this.isConnected = false;
      this.logger.log('MCP server disconnected successfully');
    } catch (error) {
      this.logger.error(`Failed to disconnect MCP server: ${error.message}`, error.stack);
    }
  }

  /**
   * Get the underlying MCP server instance
   */
  getServer(): McpServer {
    return this.server;
  }

  /**
   * Check if the server is connected
   */
  isServerConnected(): boolean {
    return this.isConnected;
  }
}

```

# src/mcp/mcp-tools.service.ts

```ts
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { McpServerService } from './mcp-server.service';

/**
 * Service that manages MCP tools.
 * Tools in the Model Context Protocol enable the LLM to perform
 * actions like searching documents or retrieving specific information.
 */
@Injectable()
export class McpToolsService {
  private readonly logger = new Logger(McpToolsService.name);
  
  constructor(private readonly mcpServerService: McpServerService) {}
  
  /**
   * Register all tools with the MCP server
   */
  async registerTools(): Promise<void> {
    const server = this.mcpServerService.getServer();
    if (!server) {
      this.logger.error('Cannot register tools: MCP server not initialized');
      return;
    }
    
    try {
      // Register a simple example tool to verify functionality
      this.registerExampleTool(server);
      
      this.logger.log('MCP tools registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register MCP tools: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Register a simple example tool for testing purposes
   */
  private registerExampleTool(server: any): void {
    // Example echo tool
    server.tool(
      'echo',
      { message: z.string() },
      async (params: any) => {
        const { message } = params;
        return {
          content: [{ type: "text", text: `Echo: ${message}` }]
        };
      }
    );
    
    this.logger.log('Example tools registered');
  }
}

```

# src/mcp/mcp.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpServerService } from './mcp-server.service';
import { McpResourcesService } from './mcp-resources.service';
import { McpToolsService } from './mcp-tools.service';
import { McpOrchestratorService } from './mcp-orchestrator.service';

/**
 * Module that provides MCP server capabilities.
 * Integrates with the Model Context Protocol TypeScript SDK to connect
 * with Claude Desktop through stdio transport.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    McpServerService,
    McpResourcesService,
    McpToolsService,
    McpOrchestratorService,
  ],
  exports: [
    McpServerService,
    McpResourcesService,
    McpToolsService,
  ],
})
export class McpModule {}

```

# src/mcp/resources/.gitkeep

```

```

# src/mcp/resources/document-resource.service.ts

```ts
// src/mcp/resources/document-resource.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServerService } from '../mcp-server.service';
import { ClioDocumentService } from '../../clio/api/clio-document.service';
import { TextExtractorService } from '../../document-processing/extractors/text-extractor.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';

@Injectable()
export class DocumentResourceService implements OnModuleInit {
  private readonly logger = new Logger(DocumentResourceService.name);

  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly clioDocumentService: ClioDocumentService,
    private readonly textExtractorService: TextExtractorService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
  }

  async onModuleInit() {
    this.registerResources();
  }

  /**
   * Register document-related MCP resources
   */
  registerResources() {
    const server = this.mcpServerService.getServer();

    // Document list resource
    server.resource(
      'document-list',
      new ResourceTemplate('documents://list/{filter}/{page}', { list: undefined }),
      async (uri, params: any) => {
          const { filter, page } = params;
        this.logger.debug(`Handling document list resource request: ${uri.href}`);

        try {
          const pageNum = parseInt(Array.isArray(page) ? page[0] : (page || '1'), 10);
          const filterParams = filter ? JSON.parse(decodeURIComponent(Array.isArray(filter) ? filter[0] : filter)) : {};

          const documents = await this.clioDocumentService.listDocuments({
            ...filterParams,
            page: pageNum,
            limit: 20,
            fields: 'id,name,content_type,created_at,updated_at,description',
          });

          const documentList = documents.data.map(doc =>
            `Document: ${doc.name} (ID: ${doc.id})
Type: ${doc.content_type}
Created: ${new Date(doc.created_at).toLocaleString()}
Updated: ${new Date(doc.updated_at).toLocaleString()}
${doc.description ? `Description: ${doc.description}` : ''}`,
          ).join('\n\n');

          const metaInfo = `Page ${pageNum} of ${documents.meta.paging.total_pages} (${documents.meta.paging.total_entries} documents total)`;

          return {
            contents: [{
              uri: uri.href,
              text: `# Document List\n\n${documentList}\n\n${metaInfo}`,
            }],
          };
        } catch (error) {
          this.logger.error(`Error handling document list request: ${error.message}`, error.stack);

          return {
            contents: [{
              uri: uri.href,
              text: `Error retrieving document list: ${error.message}`,
            }],
          };
        }
      },
    );

    // Document content resource
    server.resource(
      'document',
      new ResourceTemplate('document://{id}', { list: undefined }),
      async (uri, params: any) => {
          const { id } = params;
        this.logger.debug(`Handling document content resource request: ${uri.href}`);

        try {
          // Check if document exists in local database
          const idStr = Array.isArray(id) ? id[0] : id;
          let document = await this.documentRepository.findOne({ where: { clioId: idStr } });

          if (!document) {
            // Fetch document metadata from Clio
            const documentMeta = await this.clioDocumentService.getDocument(idStr);

            // Download document content
            const documentContent = await this.clioDocumentService.downloadDocument(idStr);

            // Extract text
            const text = await this.textExtractorService.extract(documentContent, documentMeta.content_type);

            // Create document entity
            document = this.documentRepository.create({
              clioId: idStr,
              title: documentMeta.name,
              mimeType: documentMeta.content_type,
              metadata: documentMeta,
            });

            await this.documentRepository.save(document);

            return {
              contents: [{
                uri: uri.href,
                text: `# ${documentMeta.name}\n\n${text}`,
              }],
            };
          } else {
            // Use cached document if available
            // In a real implementation, you would retrieve the processed text from your database
            // For this example, we'll download and process again
            const documentMeta = await this.clioDocumentService.getDocument(idStr);
            const documentContent = await this.clioDocumentService.downloadDocument(idStr);
            const text = await this.textExtractorService.extract(documentContent, documentMeta.content_type);

            return {
              contents: [{
                uri: uri.href,
                text: `# ${documentMeta.name}\n\n${text}`,
              }],
            };
          }
        } catch (error) {
          this.logger.error(`Error handling document content request: ${error.message}`, error.stack);

          return {
            contents: [{
              uri: uri.href,
              text: `Error retrieving document content: ${error.message}`,
            }],
          };
        }
      },
    );

    this.logger.log('Document resources registered');
  }
}

```

# src/mcp/tools/.gitkeep

```

```

# src/mcp/tools/document-tool.service.ts

```ts
// src/mcp/tools/document-tool.service.ts (updated)
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { z } from 'zod';
import { McpServerService } from '../mcp-server.service';
import { ClioDocumentService } from '../../clio/api/clio-document.service';
import { DocumentProcessorService } from '../../document-processing/document-processor.service';
import { SearchService } from '../../document-processing/search/search.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';

@Injectable()
export class DocumentToolService implements OnModuleInit {
  private readonly logger = new Logger(DocumentToolService.name);

  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly clioDocumentService: ClioDocumentService,
    private readonly documentProcessorService: DocumentProcessorService,
    private readonly searchService: SearchService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
  }

  async onModuleInit() {
    this.registerTools();
  }

  /**
   * Register document-related MCP tools
   */
  registerTools() {
    const server = this.mcpServerService.getServer();

    // Advanced document search tool using our search service
    server.tool(
      'search-documents',
      {
        query: z.string(),
        matter_id: z.string().optional(),
        limit: z.number().optional(),
        search_type: z.enum(['semantic', 'text', 'hybrid']).optional(),
      },
      async ({ query, matter_id, limit = 5, search_type = 'hybrid' }) => {
        this.logger.debug(`Searching documents with query: ${query}, type: ${search_type}`);

        try {
          const searchOptions = {
            matter_id,
            limit,
          };

          let searchResults;

          // Use the appropriate search method based on the search_type
          switch (search_type) {
            case 'semantic':
              searchResults = await this.searchService.searchSimilar(query, searchOptions);
              break;
            case 'text':
              searchResults = await this.searchService.searchText(query, searchOptions);
              break;
            case 'hybrid':
            default:
              searchResults = await this.searchService.searchHybrid(query, searchOptions);
              break;
          }

          if (searchResults.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `No documents found matching '${query}'. Try a different search term or use the document-list resource to browse available documents.`,
              }],
            };
          }

          // Format the search results
          const formattedResults = searchResults.map(result => ({
            documentId: result.document.clioId,
            documentTitle: result.document.title,
            similarity: result.similarity.toFixed(2),
            excerpt: result.chunk.content.length > 150
              ? result.chunk.content.substring(0, 150) + '...'
              : result.chunk.content,
            uri: `document://${result.document.clioId}`,
          }));

          return {
            content: [{
              type: 'text',
              text: `Found ${formattedResults.length} results matching '${query}':\n\n` +
                formattedResults.map((r, i) =>
                  `${i + 1}. **${r.documentTitle}** (Similarity: ${r.similarity})\n` +
                  `   "${r.excerpt}"\n` +
                  `   URI: ${r.uri}`,
                ).join('\n\n'),
            }],
          };
        } catch (error) {
          this.logger.error(`Document search error: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error searching documents: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
    );

    // Document processing tool to explicitly process a document
    server.tool(
      'process-document',
      {
        document_id: z.string(),
      },
      async ({ document_id }) => {
        this.logger.debug(`Processing document: ${document_id}`);

        try {
          const document = await this.documentProcessorService.processDocument(document_id);

          return {
            content: [{
              type: 'text',
              text: `Document "${document.title}" processed successfully.`,
            }],
          };
        } catch (error) {
          this.logger.error(`Document processing error: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error processing document: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
    );

    // Citation tool (unchanged from previous implementation)
    server.tool(
      'generate-citation',
      {
        document_id: z.string(),
        section: z.string().optional(),
      },
      async ({ document_id, section }) => {
        this.logger.debug(`Generating citation for document ${document_id}, section: ${section}`);

        try {
          const documentMeta = await this.clioDocumentService.getDocument(document_id);

          // Basic citation format
          const citationText = section
            ? `${documentMeta.name}, Section: "${section}", ${new Date(documentMeta.updated_at).toLocaleDateString()}, Document ID: ${document_id}`
            : `${documentMeta.name}, ${new Date(documentMeta.updated_at).toLocaleDateString()}, Document ID: ${document_id}`;

          return {
            content: [{
              type: 'text',
              text: citationText,
            }],
          };
        } catch (error) {
          this.logger.error(`Citation generation error: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error generating citation: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
    );

    this.logger.log('Document tools registered');
  }
}

```

# src/minimal-client.ts

```ts
// src/minimal-client.ts - A minimal MCP client implementation
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('Starting minimal MCP client...');
  
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/minimal-mcp.ts'],
    debug: true // Enable debugging
  });

  // Create a client with minimal capabilities
  const client = new Client(
    {
      name: 'minimal-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {}
      },
      timeout: 3000 // 3 second timeout
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to server...');
    await client.connect(transport);
    console.log('Connected to server');

    // List available resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', JSON.stringify(resources, null, 2));

    // Read the info resource
    console.log('Reading info resource...');
    const info = await client.readResource('info://server');
    console.log('Info resource content:', JSON.stringify(info, null, 2));

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    console.log('Exiting client...');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
```

# src/minimal-mcp.ts

```ts
// src/minimal-mcp.ts - A minimal MCP server implementation
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourcesResultSchema,
  ReadResourceResultSchema
} from '@modelcontextprotocol/sdk/types.js';

// Create a basic server
const server = new Server(
  {
    name: "MinimalMCP",
    version: "1.0.0"
  },
  {
    capabilities: {
      resources: {}
    }
  }
);

// Set up handlers for resource-related requests
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.log('Handling ListResourcesRequest');
  return {
    resources: [
      {
        uri: "info://server",
        name: "info"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  console.log('Handling ReadResourceRequest:', request.params.uri);
  
  if (request.params.uri === 'info://server') {
    return {
      contents: [
        {
          uri: "info://server",
          text: "This is a minimal MCP server."
        }
      ]
    };
  }
  
  throw new Error(`Resource not found: ${request.params.uri}`);
});

// Connect to the transport
const transport = new StdioServerTransport();

console.log('Starting minimal MCP server...');
server.connect(transport)
  .then(() => {
    console.log('Server connected successfully');
  })
  .catch((error) => {
    console.error('Failed to connect server:', error);
    process.exit(1);
  });

// Keep the server alive
process.stdin.resume();

```

# src/run-direct-server.js

```js
// src/run-direct-server.js
const { exec } = require('child_process');
const path = require('path');

// Run the server in a separate process
const server = exec('node src/direct-server.js', {
  cwd: process.cwd(),
  env: process.env
});

// Log the server's output
server.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

// Keep the process alive
console.log('Server started in background. Press Ctrl+C to exit.');
process.stdin.resume();

// Clean up when exiting
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit(0);
});

```

# src/setup.ts

```ts
// src/setup.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as readline from 'readline';
import { AppModule } from './app.module';
import { ClioAuthService } from './clio/auth/clio-auth.service';

/**
 * Setup script to handle initial OAuth flow and environment configuration
 */
async function setup() {
  const logger = new Logger('Setup');

  logger.log('Starting LegalContext Connect setup');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Get configuration service
  const configService = app.get(ConfigService);

  // Get Clio auth service
  const clioAuthService = app.get(ClioAuthService);

  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Prompt for confirmation
  rl.question('This will start the OAuth flow to authorize LegalContext Connect with your Clio account. Continue? (y/n) ', async (answer) => {
    if (answer.toLowerCase() !== 'y') {
      logger.log('Setup cancelled');
      rl.close();
      await app.close();
      return;
    }

    // Get OAuth configuration
    const clientId = configService.get('clio.clientId');
    const redirectUri = configService.get('clio.redirectUri');

    // Generate authorization URL
    const authUrl = `${configService.get('clio.apiUrl').replace('/api/v4', '')}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

    logger.log('Please open the following URL in your browser for OAuth authorization:');
    logger.log(authUrl);

    // Prompt for authorization code
    rl.question('After authorizing, please enter the authorization code: ', async (code) => {
      try {
        // Exchange authorization code for tokens
        const token = await clioAuthService.authenticate(code);

        logger.log('OAuth authorization successful');
        logger.log(`Access token will expire at: ${token.expiresAt.toLocaleString()}`);

        rl.close();
        await app.close();

        logger.log('Setup complete. You can now start LegalContext Connect.');
      } catch (error) {
        logger.error(`OAuth authorization failed: ${error.message}`);
        rl.close();
        await app.close();
      }
    });
  });
}

setup();
```

# src/simple-client.ts

```ts
// src/simple-client.ts - A simplified MCP client for testing
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Main function
async function main() {
  console.log('Starting simple MCP client...');
  
  // Create a transport
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/simple-mcp.ts']
  });

  // Create the client
  const client = new Client(
    { 
      name: 'test-client',
      version: '1.0.0' 
    },
    {
      timeout: 3000, // 3 second timeout
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected successfully');

    // List resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', resources);

    // Access the info resource
    console.log('Reading info resource...');
    const info = await client.readResource('info://server');
    console.log('Info resource:', info);

    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Tools:', tools);

    // Call the echo tool
    console.log('Calling echo tool...');
    const echoResult = await client.callTool('echo', {
      message: 'Hello from simple client!'
    });
    console.log('Echo result:', echoResult);

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    console.log('Exiting client...');
    process.exit(0);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
```

# src/simple-mcp.ts

```ts
// src/simple-mcp.ts - A simpler implementation of the MCP server
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create an MCP server
const server = new McpServer({
  name: "LegalContext",
  version: "1.0.0"
});

// Add a simple info resource
server.resource(
  'info',
  'info://server',
  (uri) => {
    console.log('Handling info resource request:', uri.href);
    return {
      contents: [{
        uri: uri.href,
        text: 'LegalContext MCP Server - A simple test server'
      }]
    };
  }
);

// Add an echo tool
server.tool(
  'echo',
  { message: 'string' },
  (params) => {
    console.log('Handling echo tool request:', params);
    return {
      content: [{ type: "text", text: `Echo: ${params.message}` }]
    };
  }
);

// Connect to the transport
console.log('Creating stdio transport...');
const transport = new StdioServerTransport();

console.log('Connecting to the transport...');
server.connect(transport)
  .then(() => {
    console.log('MCP server connected successfully');
  })
  .catch((error) => {
    console.error('Failed to connect MCP server:', error);
    process.exit(1);
  });

// Keep the server alive
process.on('SIGINT', () => {
  console.log('Shutting down MCP server...');
  process.exit(0);
});
```

# src/simple-test.js

```js
// A simple test script for the MCP server
const { execSync } = require('child_process');
const { spawn } = require('child_process');

// Start the MCP server in a separate process
console.log('Starting MCP server...');
const server = spawn('bun', ['run', 'src/demo-mcp.ts'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Log server output
server.stdout.on('data', (data) => {
  console.log(`Server stdout: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server stderr: ${data}`);
});

// Wait for server to start
setTimeout(() => {
  try {
    // Run a simple test to see if we can connect to the server
    console.log('Testing server...');
    
    // End the server process
    console.log('Test complete, stopping server...');
    server.kill();
  } catch (error) {
    console.error('Error during test:', error);
    server.kill();
  }
}, 2000);

```

# src/standalone/client.ts

```ts
// src/standalone/client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createLogger } from '../utils/logger';

// Create a logger that writes to stderr
const logger = createLogger('MCP-Client');

/**
 * Test client for the LegalContext MCP server
 */
async function main() {
  logger.info('Starting LegalContext MCP test client...');
  
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/standalone/server.ts'],
    debug: true
  });

  // Create the client
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      },
      timeout: 5000 // 5 second timeout
    }
  );

  try {
    // Connect to the server
    logger.info('Connecting to MCP server...');
    await client.connect(transport);
    logger.info('Connected successfully');

    // Test basic capabilities
    await runTests(client);
    
    logger.info('All tests completed successfully');
  } catch (error) {
    logger.error('Error during test:', error);
  } finally {
    logger.info('Exiting client...');
    process.exit(0);
  }
}

/**
 * Run test suite against the MCP server
 */
async function runTests(client: Client) {
  // Test 1: List resources
  logger.info('\n--- Test 1: List Resources ---');
  const resources = await client.listResources();
  logger.info('Resources:', resources);

  // Test 2: Read info resource
  logger.info('\n--- Test 2: Read Info Resource ---');
  const infoResource = await client.readResource('info://server');
  logger.info('Info resource:', infoResource);

  // Test 3: Read document resource
  logger.info('\n--- Test 3: Read Document Resource ---');
  const documentResource = await client.readResource('document://test-doc-123');
  logger.info('Document resource:', documentResource);

  // Test 4: List tools
  logger.info('\n--- Test 4: List Tools ---');
  const tools = await client.listTools();
  logger.info('Tools:', tools);

  // Test 5: Call echo tool
  logger.info('\n--- Test 5: Call Echo Tool ---');
  const echoResult = await client.callTool('echo', {
    message: 'Hello from the test client!'
  });
  logger.info('Echo result:', echoResult);

  // Test 6: Call search tool
  logger.info('\n--- Test 6: Call Search Tool ---');
  const searchResult = await client.callTool('search', {
    query: 'legal documents',
    limit: 3
  });
  logger.info('Search result:', searchResult);
}

// Run the main function
main().catch(error => {
  logger.error('Unhandled error in MCP client:', error);
  process.exit(1);
});

```

# src/standalone/server.ts

```ts
// src/standalone/server.ts
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createLogger } from '../utils/logger';

// Create a logger that writes to stderr
const logger = createLogger('LegalContext');

/**
 * Main entry point for the standalone LegalContext MCP server
 */
async function main() {
  logger.info('Initializing LegalContext MCP server...');
  
  // Create the MCP server
  const server = new McpServer({
    name: "LegalContext",
    version: "1.0.0"
  });

  // Register resources
  logger.info('Registering resources...');
  
  // Info resource
  server.resource(
    'info',
    'info://server',
    (uri) => {
      logger.debug('Handling info resource request:', uri.href);
      return {
        contents: [{
          uri: uri.href,
          text: "LegalContext MCP Server - A secure bridge between law firm document management systems and AI assistants."
        }]
      };
    }
  );
  
  // Document resource (placeholder)
  server.resource(
    'document',
    new ResourceTemplate('document://{id}', { list: undefined }),
    (uri, params) => {
      logger.debug('Handling document resource request:', uri.href, params);
      const { id } = params;
      return {
        contents: [{
          uri: uri.href,
          text: `Document ${id} content would appear here.`
        }]
      };
    }
  );

  // Register tools
  logger.info('Registering tools...');
  
  // Search tool
  server.tool(
    'search',
    { 
      query: z.string(),
      limit: z.number().optional()
    },
    (params) => {
      logger.debug('Handling search tool request:', params);
      const { query, limit = 5 } = params;
      return {
        content: [{ 
          type: "text", 
          text: `Found ${limit} results for query: "${query}"`
        }]
      };
    }
  );
  
  // Echo tool for testing
  server.tool(
    'echo',
    { message: z.string() },
    (params) => {
      logger.debug('Handling echo tool request:', params);
      return {
        content: [{ 
          type: "text", 
          text: `Echo: ${params.message}`
        }]
      };
    }
  );

  // Connect to stdio transport
  logger.info('Starting server with stdio transport...');
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    logger.info('MCP server successfully connected to transport');
    
    // Keep the process alive
    process.stdin.resume();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down LegalContext MCP server...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error connecting MCP server:', error);
    process.exit(1);
  }
}

// Start the server
main().catch(error => {
  logger.error('Unhandled error in MCP server:', error);
  process.exit(1);
});

```

# src/utils/logger.ts

```ts
// src/utils/logger.ts
// Simple logger that writes to stderr

/**
 * Log level names
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger interface
 */
export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, error?: Error) => void;
}

/**
 * Create a logger that writes to stderr
 * 
 * @param namespace - The namespace for the logger
 * @returns A logger instance
 */
export function createLogger(namespace: string): Logger {
  return {
    debug: (message: string, ...args: any[]) => {
      process.stderr.write(`[${namespace}] [debug] ${message}\n`);
      if (args.length > 0) {
        process.stderr.write(`${JSON.stringify(args, null, 2)}\n`);
      }
    },
    
    info: (message: string, ...args: any[]) => {
      process.stderr.write(`[${namespace}] [info] ${message}\n`);
      if (args.length > 0) {
        process.stderr.write(`${JSON.stringify(args, null, 2)}\n`);
      }
    },
    
    warn: (message: string, ...args: any[]) => {
      process.stderr.write(`[${namespace}] [warn] ${message}\n`);
      if (args.length > 0) {
        process.stderr.write(`${JSON.stringify(args, null, 2)}\n`);
      }
    },
    
    error: (message: string, error?: Error) => {
      process.stderr.write(`[${namespace}] [error] ${message}\n`);
      if (error) {
        process.stderr.write(`[${namespace}] [error] ${error.stack || error.message}\n`);
      }
    }
  };
}

```

# test/.gitkeep

```

```

# test/app.e2e-spec.ts

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

```

# test/jest-e2e.json

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}

```

# test/mcp/mcp-server.service.spec.ts

```ts
import { test, expect, mock } from "bun:test";
import { ConfigService } from '@nestjs/config';
import { McpServerService } from '../../src/mcp/mcp-server.service';

// Mock the MCP SDK modules
mock.module('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: function() {
      return {
        connect: mock(() => Promise.resolve())
      };
    }
  };
});

mock.module('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: function() {
      return {};
    }
  };
});

// Create a mock config service
const createMockConfigService = () => {
  return {
    get: (key: string, defaultValue?: any) => {
      if (key === 'mcpServer.name') return 'TestServer';
      if (key === 'mcpServer.version') return '1.0.0';
      return defaultValue;
    }
  } as ConfigService;
};

test('McpServerService should be defined', () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  expect(service).toBeDefined();
});

test('onModuleInit should initialize the MCP server with configured name and version', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  
  // We can't easily verify the constructor args with Bun's test runner
  // but we can check that the service has a server instance
  expect(service.getServer()).toBeDefined();
});

test('connect should connect the server to the transport', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  
  await service.connect();
  
  expect(service.isServerConnected()).toBe(true);
});

test('connect should not reconnect if already connected', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  await service.connect();
  
  await service.connect();
  
  expect(service.isServerConnected()).toBe(true);
});

test('disconnect should set isConnected to false', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  await service.connect();
  
  await service.disconnect();
  
  expect(service.isServerConnected()).toBe(false);
});

test('getServer should return the MCP server instance', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  
  const server = service.getServer();
  
  expect(server).toBeDefined();
});

```

# tools/run-test.sh

```sh
#!/bin/sh

# Build the project
echo "Building project..."
bun run build

# Run the test client
echo "Running MCP test client..."
bun run tools/test-client.ts

```

# tools/test-client.ts

```ts
/**
 * Simple MCP test client to verify server functionality
 * Run with: bun run tools/test-client.ts
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('Starting MCP test client...');
  
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/demo-mcp.ts'],
    debug: true // Enable transport debugging
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      },
      timeout: 10000 // Set a smaller timeout value
    }
  );

  try {
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected to MCP server');

    // List resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', JSON.stringify(resources, null, 2));

    // Test info resource
    console.log('Reading info resource...');
    const infoResource = await client.readResource('info://server');
    console.log('Info resource:', JSON.stringify(infoResource, null, 2));

    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Tools:', JSON.stringify(tools, null, 2));

    // Test echo tool
    console.log('Calling echo tool...');
    const echoResult = await client.callTool("echo", {
      message: 'Hello from test client!'
    });
    console.log('Echo result:', JSON.stringify(echoResult, null, 2));

    console.log('Tests completed successfully');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    // Disconnect
    process.exit(0);
  }
}

main();
```

# tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2020",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*spec.ts"]
}

```

