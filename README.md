# LegalContext

LegalContext is an open-source Model Context Protocol (MCP) server that creates a secure bridge between a law firm's Clio document management system and Claude Desktop AI assistant.

## Features

- **Secure Document Access**: Connects to Clio API to access legal documents while maintaining security
- **Local Processing**: All document processing happens locally within the firm's infrastructure
- **MCP Integration**: Implements the Model Context Protocol for seamless integration with Claude Desktop
- **Vector Search**: Uses LanceDB for efficient document retrieval based on semantic similarity
- **Free Tier Limitations**: Includes built-in limits for the free version (100 documents, 50 queries/day)

## About LegalContext

LegalContext addresses a critical challenge in legal practice: efficiently finding and leveraging information within your document management system while maintaining the highest standards of data security and client confidentiality.

For a comprehensive overview of how LegalContext can transform your legal practice, solve search frustrations, and protect against AI hallucinations, please read our [detailed white paper](docs/about-legal-context.md).

The white paper covers:
- How LegalContext addresses the crisis of information retrieval in legal practice
- Why traditional search methods fail for legal documents
- How our local-first approach protects client confidentiality
- Real-world use cases and implementation examples
- Detailed technical architecture and security model

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Automated Setup (Local)](#automated-setup-local)
  - [macOS Setup](#macos-setup)
  - [Windows Setup](#windows-setup)
- [Docker Deployment (Firmwide)](#docker-deployment-firmwide)
  - [Basic Docker Deployment](#basic-docker-deployment)
  - [Advanced Firmwide Deployment](#advanced-firmwide-deployment)
- [Clio Setup](#clio-setup)
- [Usage](#usage)
  - [Authenticating with Clio](#authenticating-with-clio)
  - [Indexing Documents](#indexing-documents)
  - [Using with Claude Desktop](#using-with-claude-desktop)
- [Security Considerations](#security-considerations)
- [Limitations (Free Tier)](#limitations-free-tier)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- **Bun**: Version 1.0 or later (JavaScript runtime and package manager)
- **Clio**: A Clio account with API access and registered application credentials
- **Claude Desktop**: Anthropic's Claude Desktop application
- **Operating System**: macOS, Linux, or Windows with WSL

## Automated Setup (Local)

### macOS Setup

1. **Install Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
   
   After installation, you may need to close and reopen your terminal, or run:
   ```bash
   source ~/.bashrc  # if using bash
   source ~/.zshrc   # if using zsh
   ```

2. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/legalcontext-mcp-server.git
   cd legalcontext-mcp-server
   ```

3. **Install Dependencies**
   ```bash
   bun install
   ```

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file using your preferred text editor and set the required variables:
   ```bash
   nano .env  # or use any other text editor
   ```
   
   Ensure you set the following variables:
   - `CLIO_CLIENT_ID`: Your Clio application's Client ID
   - `CLIO_CLIENT_SECRET`: Your Clio application's Client Secret
   - `CLIO_REDIRECT_URI`: The callback URL registered in your Clio app settings
   - `CLIO_API_REGION`: The region of your Clio account ('us', 'eu', 'ca', 'au')
   - `LANCEDB_DB_PATH`: Local filesystem path to store the LanceDB database files (e.g., `./lancedb`)

5. **Start the Server**
   ```bash
   bun run src/server.ts
   ```

6. **Configure Claude Desktop**
   
   Create or edit the Claude Desktop configuration file:
   ```bash
   nano ~/.config/Claude-Desktop/claude_desktop_config.json
   ```
   
   Add LegalContext as an MCP server:
   ```json
   {
     "mcpServers": [
       {
         "name": "LegalContext",
         "command": "/Users/YOUR_USERNAME/.bun/bin/bun",
         "args": ["/Users/YOUR_USERNAME/path/to/legalcontext-mcp-server/src/server.ts"]
       }
     ]
   }
   ```
   
   Replace `/Users/YOUR_USERNAME/` with your actual home directory path.
   
   Restart Claude Desktop for the changes to take effect.

### Windows Setup

1. **Install Bun**
   
   Install Windows Subsystem for Linux (WSL) if you haven't already:
   ```
   wsl --install
   ```
   
   After WSL is installed, open a WSL terminal and install Bun:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
   
   Close and reopen your WSL terminal, or run:
   ```bash
   source ~/.bashrc
   ```

2. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/legalcontext-mcp-server.git
   cd legalcontext-mcp-server
   ```

3. **Install Dependencies**
   ```bash
   bun install
   ```

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file:
   ```bash
   nano .env
   ```
   
   Configure the required variables as described in the macOS section.

5. **Start the Server**
   ```bash
   bun run src/server.ts
   ```

6. **Configure Claude Desktop**
   
   Create or edit the Claude Desktop configuration file at this location:
   ```
   C:\Users\YOUR_USERNAME\AppData\Roaming\Claude-Desktop\claude_desktop_config.json
   ```
   
   Add LegalContext as an MCP server:
   ```json
   {
     "mcpServers": [
       {
         "name": "LegalContext",
         "command": "wsl",
         "args": ["~/.bun/bin/bun", "~/path/to/legalcontext-mcp-server/src/server.ts"]
       }
     ]
   }
   ```
   
   Replace `~/path/to/` with your actual WSL path to the project.
   
   Restart Claude Desktop for the changes to take effect.

## Docker Deployment (Firmwide)

LegalContext can be deployed using Docker for a more standardized, firmwide setup. This approach simplifies deployment across different environments and ensures consistent behavior.

> **Need help?** [Email the Protomated team](mailto:team@protomated.com?subject=LegalContext%20Assistance&body=Hello%20Protomated%20team%2C%0A%0AWe%20are%20interested%20in%20LegalContext%20for%20our%20law%20firm%20and%20would%20like%20assistance%20with%3A%0A%0A-%20%5B%20%5D%20Initial%20deployment%0A-%20%5B%20%5D%20Custom%20features%0A-%20%5B%20%5D%20Configuration%20for%20our%20specific%20needs%0A-%20%5B%20%5D%20Other%0A%0AFirm%20name%3A%20%0ANumber%20of%20attorneys%3A%20%0ANumber%20of%20documents%3A%20%0ACurrent%20document%20management%20system%3A%20%0A%0ABriefly%20describe%20your%20requirements%3A%0A%0A%0AThanks%2C%0A) for deployment assistance or custom features/configurations for your firm's specific needs.

### Prerequisites

- Docker installed on the host machine
- Docker Compose (optional, for more complex setups)
- Network access to Clio API
- Clio API credentials

### Basic Docker Deployment

1. **Build the Docker Image**

   ```bash
   docker build -t legalcontext-mcp-server:latest .
   ```

2. **Create a docker-compose.yml File**

   ```yaml
   version: '3'
   services:
     legalcontext:
       image: legalcontext-mcp-server:latest
       container_name: legalcontext
       restart: unless-stopped
       volumes:
         - ./lancedb:/app/lancedb  # Persist vector database
         - ./config:/app/config    # Store configuration and tokens
       environment:
         - NODE_ENV=production
         - LOG_LEVEL=info
         - CLIO_CLIENT_ID=${CLIO_CLIENT_ID}
         - CLIO_CLIENT_SECRET=${CLIO_CLIENT_SECRET}
         - CLIO_REDIRECT_URI=${CLIO_REDIRECT_URI}
         - CLIO_API_REGION=${CLIO_API_REGION}
         - LANCEDB_DB_PATH=/app/lancedb
         - MAX_DOCUMENTS=100
         - MAX_QUERIES_PER_DAY=50
       ports:
         - "3001:3001"  # Expose HTTP port if needed
   ```

3. **Create an Environment Variables File**

   Create a `.env` file in the same directory as your `docker-compose.yml`:
   ```
   CLIO_CLIENT_ID=your_client_id
   CLIO_CLIENT_SECRET=your_client_secret
   CLIO_REDIRECT_URI=https://your-server-address/auth/clio/callback
   CLIO_API_REGION=us
   ```

4. **Start the Container**

   ```bash
   docker-compose up -d
   ```

### Advanced Firmwide Deployment

For any firm seeking advanced deployments, consider these additional steps:

1. **Authentication and Security**

   - Use a reverse proxy (like Nginx or Traefik) to handle HTTPS termination
   - Implement IP-based access controls to restrict access to the server
   - Consider integration with the firm's identity provider (e.g., Azure AD, Okta) for authentication

2. **High Availability Setup**

   - Deploy multiple instances behind a load balancer
   - Use shared storage (e.g., NFS, S3) for the vector database to enable scaling
   - Implement health checks and automatic container restart

3. **Monitoring and Logging**

   ```yaml
   version: '3'
   services:
     legalcontext:
       # ... basic config as above
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
       # Add these if using Prometheus monitoring
       labels:
         - "prometheus.scrape=true"
         - "prometheus.port=3001"
         - "prometheus.path=/metrics"
   ```

4. **Using Docker Secrets for Sensitive Information**

   ```yaml
   version: '3.8'
   services:
     legalcontext:
       # ... other configuration
       secrets:
         - clio_client_id
         - clio_client_secret
       environment:
         - CLIO_CLIENT_ID_FILE=/run/secrets/clio_client_id
         - CLIO_CLIENT_SECRET_FILE=/run/secrets/clio_client_secret
         # ... other environment variables

   secrets:
     clio_client_id:
       file: ./secrets/clio_client_id.txt
     clio_client_secret:
       file: ./secrets/clio_client_secret.txt
   ```

5. **Integration with Claude Desktop**

   For firmwide deployments, instead of having each user configure Claude Desktop manually, consider:
   
   - Creating a standard Claude Desktop configuration package for distribution
   - Using a centralized network service for MCP communication instead of stdio
   - Developing a simple configuration utility that sets up the proper paths for each user

   Example centralized configuration script:
   ```bash
   #!/bin/bash
   # Script to configure Claude Desktop for LegalContext
   
   # Create config directory if it doesn't exist
   mkdir -p ~/.config/Claude-Desktop
   
   # Generate the config file with the correct server address
   cat > ~/.config/Claude-Desktop/claude_desktop_config.json << EOF
   {
     "mcpServers": [
       {
         "name": "LegalContext (Firm)",
         "url": "http://legalcontext.internal.example.com:3001"
       }
     ]
   }
   EOF
   
   echo "Claude Desktop configured successfully."
   ```

### Updating the Docker Deployment

```bash
# Pull the latest code
git pull

# Rebuild the Docker image
docker-compose build

# Restart the service
docker-compose down
docker-compose up -d

# View logs
docker-compose logs -f
```

### Backing Up the Vector Database

```bash
# Stop the container
docker-compose stop legalcontext

# Back up the vector database
tar -czf lancedb-backup-$(date +%Y%m%d).tar.gz ./lancedb

# Restart the container
docker-compose start legalcontext
```

## Clio Setup

### Creating a Clio API Application

1. Visit [Clio Developers Portal](https://app.clio.com/settings/developer_applications) (or your region-specific Clio instance)
2. Click "New Application"
3. Enter required information:
   - **Name**: "LegalContext"
   - **Redirect URI**: http://localhost:3001/auth/clio/callback (for local development)
   - **Scopes**: documents, folders (minimum required)
4. Save the application and note your Client ID and Client Secret

## Usage

### Authenticating with Clio

1. Start the LegalContext server
2. Visit http://localhost:3001/auth/clio in your browser
3. Follow the OAuth flow to authorize LegalContext with your Clio account

### Indexing Documents

Run the document indexing process to pull and index Clio documents:

```bash
bun run src/scripts/index.ts
```

This process:
1. Fetches documents from Clio (up to 100 for free tier)
2. Downloads document content
3. Extracts text from PDFs and DOCXs
4. Generates vector embeddings
5. Stores embeddings in the local LanceDB database

### Using with Claude Desktop

1. Start Claude Desktop
2. Verify LegalContext appears in the available tools list
3. Ask legal questions that require access to your documents
4. Claude will automatically use LegalContext to retrieve relevant context from your documents

Example queries:
- "What are the key provisions in our standard NDA?"
- "Summarize the legal implications in the Johnson case documents."
- "What arguments were made in our most recent motion for summary judgment?"

## Security Considerations

- **Data Boundary Control**: All document processing happens locally. Sensitive content never leaves your infrastructure during processing.
- **Authentication**: OAuth 2.0 authentication with Clio protects document access.
- **Token Security**: Access tokens are stored securely with encryption.
- **Transparency**: Open-source codebase allows security review by your team.

## Limitations (Free Tier)

- Maximum of 100 indexed documents
- 50 queries per day limit
- Manual or scheduled batch indexing only (no real-time)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [Mozilla Public License 2.0](LICENSE) - see the LICENSE file for details.
