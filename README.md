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
2. Configure Claude to use LegalContext as an MCP server
3. Start querying your legal documents!

## Development

- TypeScript type checking:
  ```bash
  bun typecheck
  ```

## License

This project is licensed under the Mozilla Public License 2.0 - see the LICENSE file for details.

---

Built with [Bun](https://bun.sh) and the [Model Context Protocol](https://github.com/anthropics/model-context-protocol-sdk).
