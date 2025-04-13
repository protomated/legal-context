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

## Prerequisites

- [Bun](https://bun.sh) v1.0 or later (for local development/installation)
- Clio Developer Account (for API access)
- Claude Desktop (for AI assistant integration)

## Installation Options

### 1. Automated Setup (Local Development)

The fastest way to get started for local development is to use our automated setup script:

```bash
# Make the script executable
chmod +x install.sh

# Run the setup script
./install.sh
```

The setup script will:
1. Install Bun if it's not already installed
2. Configure your environment variables
3. Set up OAuth with Clio
4. Update Claude Desktop configuration automatically

### 2. Claude Desktop Configuration

You can configure Claude Desktop to use LegalContext in several ways:

#### Option 1: Using npm/npx

```json
{
  "mcpServers": {
    "legalcontext": {
      "command": "npx",
      "args": [
        "-y",
        "@protomated/legal-context"
      ]
    }
  }
}
```

#### Option 2: Using Docker

```json
{
  "mcpServers": {
    "legalcontext": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-v", "/path/to/local/data:/app/data",
        "protomated/legal-context:0.1.0"
      ]
    }
  }
}
```

#### Option 3: Using Bun directly

```json
{
  "mcpServers": {
    "legalcontext": {
      "command": "bunx",
      "args": [
        "@protomated/legal-context"
      ]
    }
  }
}
```

Apply this configuration to your Claude Desktop by editing the `claude_desktop_config.json` file:
- On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- On Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- On Linux: `~/.config/Claude/claude_desktop_config.json`

## Setup and Configuration

### Clio API Credentials

You'll need to set up a Clio Developer account and create an application:

1. Go to [Clio Developer Dashboard](https://app.clio.com/settings/developer_applications)
2. Create a new application
3. Set the redirect URI to match what you'll use (default is `http://localhost:3001/clio/auth/callback`)
4. Copy the Client ID and Client Secret for configuration

### Environment Variables

LegalContext requires several environment variables to be set:

- `CLIO_CLIENT_ID`: Your Clio API Client ID
- `CLIO_CLIENT_SECRET`: Your Clio API Client Secret
- `CLIO_REDIRECT_URI`: OAuth callback URL (default: `http://localhost:3001/clio/auth/callback`)
- `CLIO_API_REGION`: Clio API region (`us`, `ca`, `eu`, or `au`)
- `PORT`: Port for the OAuth HTTP server (default: 3001)
- `LANCEDB_DB_PATH`: Path to store LanceDB database files (default: `./lancedb`)

## Usage Examples

Once you have LegalContext set up and connected to Claude Desktop, you can try these example queries:

- **Document Summarization**:
  - "Can you summarize the key points from our recent settlement agreement with Acme Corp?"
  - "What are the main provisions in our latest employment contract template?"

- **Legal Research**:
  - "What precedents do we have for consumer data privacy cases in the healthcare sector?"
  - "Find relevant cases in our repository related to intellectual property disputes."

- **Document Search**:
  - "Find documents related to non-compete agreements that we've drafted in the last year."
  - "Show me all merger and acquisition contracts we have with technology companies."

- **Contract Analysis**:
  - "What are the common clauses we include in our software licensing agreements?"
  - "Can you analyze the risks in the Johnson contract that was uploaded to Clio last week?"

## Troubleshooting

If you encounter issues with the Clio integration:

1. **Authentication Issues**:
   - Check that your Clio credentials are correct
   - Ensure your redirect URI matches exactly what's registered in Clio
   - Verify that your Clio API region is set correctly

2. **Claude Desktop Connection Issues**:
   - Make sure your configuration matches one of the examples above
   - Restart Claude Desktop after changing configuration

## Free Tier Limitations

The open-source version includes the following limitations:

- 100 documents maximum
- 2 Claude Desktop users maximum
- 50 queries per day
- Single Clio repository
- 3 concurrent requests maximum
- Daily document indexing (not real-time)

For higher limits, check our [pricing page](https://github.com/protomated/legal-context/blob/main/docs/about-legal-context.md#licensing-tiers-and-pricing) for Professional and Enterprise options.

## License

This project is licensed under the Mozilla Public License 2.0 - see the LICENSE file for details.

---

Built with [Bun](https://bun.sh) and the [Model Context Protocol](https://github.com/anthropics/model-context-protocol-sdk).
