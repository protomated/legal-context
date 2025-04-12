# LegalContext

LegalContext is an open-source Model Context Protocol (MCP) server that creates a secure bridge between a law firm's Clio document management system and Claude Desktop AI assistant.

## Features

- **Secure Document Access**: Connects to Clio API to access legal documents while maintaining security
- **Local Processing**: All document processing happens locally within the firm's infrastructure
- **MCP Integration**: Implements the Model Context Protocol for seamless integration with Claude Desktop
- **Vector Search**: Uses LanceDB for efficient document retrieval based on semantic similarity
- **Free Tier Limitations**: Includes built-in limits for the free version (100 documents, 50 queries/day)

## Prerequisites

- [Bun](https://bun.sh) v1.0 or later
- Clio Developer Account (for API access)
- Claude Desktop (for AI assistant integration)

## Quick Start

The fastest way to get started is to use our automated setup script:

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

## Manual Installation

If you prefer to set things up manually, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/protomated/legal-context.git
   cd legal-context
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Clio API credentials and other settings
   ```

4. Set up your Clio Developer Account:
   - Go to [Clio Developer Dashboard](https://app.clio.com/settings/developer_applications)
   - Create a new application
   - Set the redirect URI to exactly match what you specified in your `.env` file
     (default is `http://localhost:3001/clio/auth/callback`)
   - Copy the Client ID and Client Secret to your `.env` file
   - Set the `CLIO_API_REGION` based on your Clio account (us, ca, eu, au)

5. Verify your Clio configuration:
   ```bash
   bun run check:clio
   ```

## Usage

### Testing Clio Integration

Before starting the server, you can test your connection to Clio:

```bash
# Verify your Clio API credentials and configuration
bun run check:clio

# Simple authentication test (recommended for first-time setup)
bun run auth:simple

# Full authentication test
bun test:auth

# Test the full Clio integration (document listing, etc.)
bun test:clio
```

The first time you run these tests, you'll need to authenticate with Clio:

1. The test will start a local web server on the port specified in your `.env` file (default: 3001)
2. It will provide a URL to visit (e.g., `http://localhost:3001/clio/auth`)
3. Visit this URL in your browser
4. Log in to your Clio account if prompted
5. Review and approve the authorization request
6. You should be redirected back to a success page
7. Return to the terminal where you'll see the authentication result

**Important:** Make sure that the redirect URI in your Clio Developer Application settings **exactly** matches the one in your `.env` file. Any mismatch (even in capitalization or trailing slashes) will result in an "Invalid authorization request" error.

### Starting the Server

Run the server using Bun:

```bash
bun start
```

For development with auto-reload:

```bash
bun dev
```

### Connecting with Claude Desktop

1. Open Claude Desktop

2. Configure Claude to use LegalContext as an MCP server:
   - Locate the Claude Desktop configuration file (`claude_desktop_config.json`):
     - On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
     - On Windows: `%APPDATA%\Claude\claude_desktop_config.json`
     - On Linux: `~/.config/Claude/claude_desktop_config.json`

   - Create or edit the `claude_desktop_config.json` file with the following structure:
     ```json
     {
       "mcpServers": {
         "legalcontext": {
           "command": "/absolute/path/to/bun",
           "args": ["/absolute/path/to/legal-context/src/server.ts"],
           "cwd": "/absolute/path/to/legal-context"
         }
       }
     }
     ```

   - For the `command` field, specify the absolute path to your Bun executable:
     - Find it using `which bun` on macOS/Linux
     - Typically located at `~/.bun/bin/bun` on macOS or `/usr/local/bin/bun`
     - Example: `"command": "~/.bun/bin/bun"`

   - For the `args` field, provide an array containing the absolute path to the main server TypeScript file:
     - Example: `"args": ["/Users/username/projects/legal-context/src/server.ts"]`

   - For the `cwd` field, specify the absolute path to your cloned repository:
     - Example: `"cwd": "/Users/username/projects/legal-context"`

   - **IMPORTANT**: Do NOT edit the main `config.json` file. Only edit the `claude_desktop_config.json` file.

   **Pro Tip**: Use our setup script (`./install.sh`) to automatically configure Claude Desktop.

3. Restart Claude Desktop to apply the configuration:
   - Quit Claude Desktop completely (not just closing the window)
   - Relaunch Claude Desktop
   - LegalContext should now appear as an available server in Claude Desktop

4. Start querying your legal documents!

### Example Queries

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

- **Legal Advice Preparation**:
  - "Based on our previous cases, what arguments should we prepare for the upcoming Smith litigation?"
  - "What documentation do we typically require from clients for trademark registration?"

> **Note**: The current implementation is a placeholder that tracks query counts but returns generic responses. Full document retrieval and context-aware responses will be available in future updates.

## Development Tools

For developers, we provide a TypeScript setup script that offers the same functionality as the shell script but can be run using Bun:

```bash
# Run the TypeScript setup script
bun run setup.ts
```

Other development commands:
- TypeScript type checking:
  ```bash
  bun typecheck
  ```

## Troubleshooting

If you encounter issues with the Clio integration:

1. **Authentication Issues**:
   - Check that your Clio credentials are correct
   - Ensure your redirect URI matches exactly what's registered in Clio
   - Verify that your Clio API region is set correctly

2. **Claude Desktop Connection Issues**:
   - Make sure the path to Bun is correct in your Claude configuration
   - Check that the path to the server.ts file is correct
   - Restart Claude Desktop after changing configuration

3. **Permission Issues**:
   - Ensure the install.sh and setup.ts files are executable (`chmod +x install.sh`)
   - Check that Bun has write permissions to the project directory

## License

This project is licensed under the Mozilla Public License 2.0 - see the LICENSE file for details.

---

Built with [Bun](https://bun.sh) and the [Model Context Protocol](https://github.com/anthropics/model-context-protocol-sdk).
