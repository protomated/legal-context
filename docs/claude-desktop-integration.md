# Integrating LegalContext with Claude Desktop

This guide provides detailed instructions for integrating LegalContext with Claude Desktop, allowing Claude to securely access your firm's documents stored in Clio.

## Prerequisites

Before you begin, make sure you have:

1. **Claude Desktop** installed on your computer
   - Download from [claude.ai/desktop](https://claude.ai/desktop)
   - Version 1.0.0 or higher required

2. **LegalContext** properly installed and configured
   - All dependencies installed with `bun install`
   - Clio API credentials configured in `.env.local`
   - Database properly set up

3. **Clio API** access configured
   - OAuth credentials set up (via `bun run test:clio:auth`)
   - Authentication flow completed

## Configuration Steps

### Step 1: Create Claude Desktop Configuration File

Claude Desktop needs a configuration file that tells it how to connect to the LegalContext MCP server. The file location depends on your operating system:

- **Windows**: `%APPDATA%\Claude\claude-config.json`
- **macOS**: `~/Library/Application Support/Claude/claude-config.json`
- **Linux**: `~/.config/Claude/claude-config.json`

### Step 2: Configure the LegalContext MCP Server

Edit the `claude-config.json` file to include the LegalContext MCP server configuration:

```json
{
  "mcpServers": {
    "legalcontext": {
      "command": "bun",
      "args": [
        "run",
        "/ABSOLUTE/PATH/TO/legal-context/src/claude-mcp-server.ts"
      ],
      "cwd": "/ABSOLUTE/PATH/TO/legal-context"
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/legal-context` with the actual absolute path to your LegalContext installation. For example:

- Windows: `C:\\Users\\username\\projects\\legal-context`
- macOS: `/Users/username/projects/legal-context`
- Linux: `/home/username/projects/legal-context`

### Step 3: Restart Claude Desktop

After creating or updating the configuration file:

1. Close Claude Desktop completely (including from the system tray)
2. Reopen Claude Desktop

### Step 4: Connect to LegalContext Server

1. Open Claude Desktop and start a new conversation
2. Look for the server selection dropdown in the lower right corner
3. Click it and select "legalcontext" from the dropdown
4. Claude should indicate that it's connecting to LegalContext

If the connection is successful, you'll see a notification and Claude will have access to your firm's documents through the MCP protocol.

## Testing the Integration

To verify that Claude can access your documents through LegalContext, try the following prompts:

1. **Check server information**:
   ```
   What MCP server am I connected to?
   ```

2. **Browse available resources**:
   ```
   What document resources are available through LegalContext?
   ```

3. **Search for documents**:
   ```
   Can you search for documents containing the term "contract"?
   ```

4. **Try accessing a specific document** (if you know a document ID):
   ```
   Please retrieve document with ID [DOCUMENT_ID]
   ```

## Troubleshooting

If you encounter issues connecting Claude Desktop to LegalContext:

### Connection Issues

1. **Check paths in configuration**:
   - Ensure paths in `claude-config.json` are correct absolute paths
   - Make sure the `claude-mcp-server.ts` file exists and is executable

2. **Check permissions**:
   - Make sure Claude Desktop has permission to execute the Bun runtime
   - Ensure all scripts have executable permissions (`chmod +x src/claude-mcp-server.ts`)

3. **Check Clio authentication**:
   - Run `bun run test:clio:auth` to ensure OAuth authentication is working
   - Check if authentication tokens are stored properly

### Claude Cannot Access Documents

1. **Verify Clio API setup**:
   - Run `bun run test:clio:documents` to check if documents can be retrieved
   - Check `.env.local` for proper API credentials

2. **Check server logs**:
   - Look for error messages in the terminal where Claude runs LegalContext
   - Check for access control or permission issues

3. **Test resources individually**:
   - Run `bun run test:mcp-document-integration` to test resources

## Maintaining Security

Even though LegalContext provides secure access to documents, always follow these best practices:

1. Do not share your Claude configuration file with others
2. Keep your Clio API credentials secure
3. Do not expose sensitive document information in public conversations
4. Follow your firm's data security policies when using AI tools

## Advanced Setup

### Setting Up a Production Environment

For a more stable production environment:

1. Create a production build:
   ```
   bun build src/claude-mcp-server.ts --outfile dist/claude-mcp-server.js --target node
   ```

2. Update the Claude configuration to use the production build:
   ```json
   {
     "mcpServers": {
       "legalcontext": {
         "command": "bun",
         "args": [
           "run",
           "/path/to/legal-context/dist/claude-mcp-server.js"
         ],
         "cwd": "/path/to/legal-context"
       }
     }
   }
   ```

### Environment Variables

For security, use environment variables in the Claude Desktop configuration:

```json
{
  "mcpServers": {
    "legalcontext": {
      "command": "bun",
      "args": [
        "run",
        "/path/to/legal-context/src/claude-mcp-server.ts"
      ],
      "cwd": "/path/to/legal-context",
      "env": {
        "NODE_ENV": "production",
        "DATABASE_CONNECTION_STRING": "postgresql://user:password@localhost:5432/legalcontext"
      }
    }
  }
}
```

## Next Steps

After successfully integrating Claude Desktop with LegalContext:

1. Train users on how to effectively use document context
2. Set up backup procedures for database and configuration
3. Consider implementing user-specific permissions
4. Monitor usage and performance for optimization

For more information and updates, visit the [LegalContext GitHub repository](https://github.com/protomated/legal-context).
