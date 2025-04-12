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

## Installation

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

## Usage

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
   - Locate the Claude Desktop configuration file:
     - On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
     - On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

   - Create or edit the file with the following structure:
     ```json
     {
       "mcpServers": {
         "legalcontext": {
           "command": "/path/to/bun",
           "args": ["/path/to/legal-context/src/server.ts"],
           "cwd": "/path/to/legal-context"
         }
       }
     }
     ```

   - Replace `/path/to/bun` with the actual path to your Bun executable:
     - Find it using `which bun` on macOS/Linux
     - Typically located at `~/.bun/bin/bun` on macOS or `/usr/local/bin/bun`

   - Replace `/path/to/legal-context` with the absolute path to your cloned repository

   - Note: Do not edit the main `config.json` file, only the `claude_desktop_config.json` file

3. Restart Claude Desktop to apply the configuration

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

## Development

- TypeScript type checking:
  ```bash
  bun typecheck
  ```

## License

This project is licensed under the Mozilla Public License 2.0 - see the LICENSE file for details.

---

Built with [Bun](https://bun.sh) and the [Model Context Protocol](https://github.com/anthropics/model-context-protocol-sdk).
