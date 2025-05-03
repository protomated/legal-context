# LegalContext

LegalContext is an open-source Model Context Protocol (MCP) server that creates a secure bridge between a law firm's Clio document management system and Claude Desktop AI assistant.

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue" alt="Platform support" />
  <img src="https://img.shields.io/badge/runtime-Bun-black" alt="Bun runtime" />
  <img src="https://img.shields.io/badge/license-MPL--2.0-blue" alt="License: MPL 2.0" />
</p>

## Features

- **Secure Document Access**: Connects to Clio API to access legal documents while maintaining complete security and confidentiality
- **Local Processing**: All document processing happens locally within your firm's infrastructure, ensuring client data never leaves your security perimeter
- **MCP Integration**: Seamlessly integrates with Claude Desktop through the Model Context Protocol (MCP)
- **Semantic Search**: Uses LanceDB for efficient vector search, enabling Claude to find the most relevant documents based on meaning, not just keywords
- **Citation Tracking**: All Claude responses include proper citations to your source documents
- **Free Tier Limitations**: Includes reasonable limits for the free version (100 documents, 50 queries/day)

## Why LegalContext?

For legal professionals, the intersection of AI capabilities and client confidentiality creates a significant challenge:

1. **The AI Hallucination Problem**: Large language models like Claude can provide incorrect or fabricated information. This is particularly dangerous in legal contexts where accuracy is paramount.

2. **The Client Confidentiality Dilemma**: Traditional AI tools require uploading documents to external servers, potentially compromising client confidentiality and attorney-client privilege.

LegalContext solves both problems by:

1. **Grounding Claude's responses in your actual documents** - eliminating hallucinations by using Retrieval-Augmented Generation (RAG)
2. **Processing all documents locally** - maintaining complete data control and meeting confidentiality requirements
3. **Creating a secure bridge to Claude Desktop** - leveraging AI capabilities without exposing sensitive information

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
   - [Automated Setup](#automated-setup)
   - [Manual Setup](#manual-setup)
- [Claude Desktop Integration](#claude-desktop-integration)
- [Clio Setup](#clio-setup)
- [Usage Guide](#usage-guide)
   - [Authentication](#authentication)
   - [Indexing Documents](#indexing-documents)
   - [Using with Claude Desktop](#using-with-claude-desktop)
- [Security Features](#security-features)
- [Free Tier Limitations](#free-tier-limitations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- **Bun**: Version 1.0 or later (JavaScript runtime and package manager)
- **Clio**: A Clio account with API access and registered application credentials
- **Claude Desktop**: Anthropic's Claude Desktop application
- **Operating System**: macOS, Linux, or Windows with WSL

## Quick Start

```bash
# Clone the repository
git clone https://github.com/protomated/legal-context.git
cd legal-context

# Install dependencies
bun install

# Run the setup script (automated configuration)
./install.sh

# The script will set up everything including an initial document indexing
# Start Claude Desktop and verify that LegalContext appears as an MCP server
# In Claude Desktop, ask a legal question that requires document access
# Example: "What are the key provisions in our standard NDA?"
```

## Detailed Installation

### Automated Setup

Our automated setup script handles the complete configuration process for you:

```bash
# Run the setup script
./install.sh
```

The script will:
1. Check for Bun installation or install it if needed
2. Configure necessary environment variables in .env
3. Create Claude Desktop configuration file automatically with the correct paths and environment variables
4. Guide you through Clio OAuth setup
5. Run an initial batch indexing of your documents (up to 100 for free tier)

This is the recommended approach as it ensures all components are correctly configured.

### Manual Setup

If you prefer to set up manually:

1. **Install Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/protomated/legal-context.git
   cd legal-context
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Clio credentials and other settings

5. **Configure Claude Desktop**
   Create or edit the Claude Desktop configuration file (see [Claude Desktop Integration](#claude-desktop-integration))

6. **Start the server**
   ```bash
   bun run src/server.ts
   ```

## Claude Desktop Integration

LegalContext communicates with Claude Desktop using the Model Context Protocol (MCP). To configure Claude Desktop to use LegalContext:

### Automated Configuration (Recommended)

The `install.sh` script will automatically create or update the Claude Desktop configuration file. After running the script, simply restart Claude Desktop to apply the changes.

### Manual Configuration

Create or edit the Claude Desktop configuration file at:

#### macOS
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

#### Windows
```
%APPDATA%\Claude\claude_desktop_config.json
```

#### Linux
```
~/.config/Claude/claude_desktop_config.json
```

Add the following configuration (adjust paths and environment variables for your system):

```json
{
  "mcpServers": {
    "legalcontext": {
      "command": "/path/to/bun",
      "args": [
        "/path/to/legal-context/src/server.ts"
      ],
      "cwd": "/path/to/legal-context",
      "env": {
        "CLIO_CLIENT_ID": "your_clio_client_id",
        "CLIO_CLIENT_SECRET": "your_clio_client_secret",
        "CLIO_REDIRECT_URI": "http://127.0.0.1:3001/clio/auth/callback",
        "CLIO_API_REGION": "us"
      }
    }
  }
}
```

**Important Notes:**
1. Replace the command path with the full path to your Bun executable (find using `which bun`)
2. Replace the args path with the full absolute path to your server.ts file
3. Add your actual Clio API credentials in the env section
4. The environment variables in this config will override your .env file

### Verifying the Integration

1. Start Claude Desktop
2. Go to Settings > Developer
3. You should see "legalcontext" listed as an MCP server with status "Running"
4. If it shows "Not running" or doesn't appear:
   - Ensure the paths in your configuration are absolute and correct for your system
   - Verify that the Bun executable path is correct (use `which bun` to find it)
   - Check that you have the correct environment variables set
   - Restart Claude Desktop after making configuration changes
   - Check the logs at:
      - macOS: `~/Library/Logs/Claude/legalcontext.log`
      - Windows: `%USERPROFILE%\AppData\Local\Claude\Logs\legalcontext.log`

### Testing the Integration

Once the integration is set up, you can test it with a simple query in Claude Desktop:

1. Open Claude Desktop
2. Type: "Can you check if LegalContext is working?"
3. Claude should respond that it can access the LegalContext tools
4. Try a document query like: "What documents do we have in our Clio account?"

## Clio Setup

### Creating a Clio API Application

1. Visit [Clio Developers Portal](https://app.clio.com/settings/developer_applications)
   - Use the appropriate regional URL if not using the US version of Clio
2. Click "New Application"
3. Enter application details:
   - **Name**: "LegalContext"
   - **Redirect URI**: `http://127.0.0.1:3001/clio/auth/callback`
   - **Scopes**: Enable `documents` and `folders` scopes
4. Save the application and note your Client ID and Client Secret
5. Add these credentials to your `.env` file or directly to your Claude Desktop configuration

## Usage Guide

### Authentication

1. Start Claude Desktop (which will automatically launch LegalContext)
2. Open a browser and navigate to:
   ```
   http://localhost:3001/clio/auth
   ```
3. Follow the Clio OAuth flow to authorize LegalContext
4. You'll be redirected to a success page once authentication completes

### Indexing Documents

The installation script automatically runs an initial batch indexing process for your documents (up to the free tier limit of 100).

For additional documents or to refresh the index, you can:

Ask Claude to index specific documents:

```
Claude, please index the document with ID 12345 from our Clio account.
```

Or use the batch indexing tool directly:

```bash
bun run index:batch
```

### Using with Claude Desktop

Once your documents are indexed, you can ask Claude questions about them:

- **Document search**: "Find all employment contracts drafted in the last year"
- **Document analysis**: "What are the key provisions in our standard NDA?"
- **Legal research**: "Summarize our precedents for data privacy cases"
- **Contract comparison**: "How does the Johnson contract compare to our standard terms?"

Claude will use the LegalContext tools to search your document repository, retrieve the most relevant documents, ground its answers in your actual documents, and provide citations to the source documents.

## Security Features

LegalContext prioritizes security and confidentiality:

- **Local Processing**: All document content is processed within your infrastructure
- **Secure OAuth**: Uses industry-standard OAuth 2.0 for Clio authentication
- **Encrypted Token Storage**: Access tokens are securely stored with encryption
- **No Cloud Dependencies**: Documents are never sent to external AI services
- **Full Transparency**: Open-source codebase allows complete security audit

## Free Tier Limitations

The free version of LegalContext includes reasonable limitations:

- **Document Limit**: Maximum of 100 indexed documents
- **Query Limit**: 50 queries per day
- **Single Instance**: Designed for individual use rather than firm-wide deployment

These limitations ensure the project remains sustainable while providing value to individual legal practitioners.

## Troubleshooting

### Common Issues

1. **"Clio API client not initialized"**
   - Ensure you've completed the Clio authentication process
   - Check your Clio API credentials in `.env` or Claude Desktop config
   - Verify the redirect URI matches your Clio application settings
   - Try running `bun run auth:simple` to test authentication

2. **"No documents found in vector search"**
   - Make sure you've indexed documents with `bun run index:batch`
   - Check that your documents are in a compatible format (PDF, DOCX)
   - Verify that the documents exist in your Clio account
   - Look at the `indexed_documents.json` file to see which documents are indexed

3. **LegalContext not appearing in Claude Desktop**
   - Ensure the Claude Desktop configuration file has the correct format and location
   - Use absolute paths for both the Bun executable and the server.ts file
   - Verify all required environment variables are set in the config
   - Check that LegalContext server is running (`bun start` in a terminal)
   - Restart Claude Desktop after configuration changes
   - Look at the logs in `~/Library/Logs/Claude/legalcontext.log` (macOS)

### Diagnostic Tools

LegalContext includes several diagnostic tools:

```bash
# Test Clio authentication
bun run auth:simple

# Check Clio API access
bun run check:clio

# Test document processing
bun run test:extraction

# Reset indexing state
bun run src/tools/reset-index-tracking.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the [Mozilla Public License 2.0](LICENSE) - see the LICENSE file for details.

---

## Support

For assistance, please:
- Open an issue on GitHub
- Email the team at team@protomated.com
- Visit our website at [protomated.com](https://protomated.com)