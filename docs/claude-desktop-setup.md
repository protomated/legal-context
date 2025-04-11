# Setting up Claude Desktop with LegalContext

This guide will walk you through the process of configuring Claude Desktop to work with LegalContext, allowing you to access your firm's legal documents securely through Claude.

## Prerequisites

Before you begin, ensure you have:

1. [Claude Desktop](https://claude.ai/desktop) installed on your computer
2. LegalContext server installed and configured
3. Clio API credentials set up and authentication completed

## Configuration Steps

### Step 1: Create Claude Desktop Configuration File

Claude Desktop needs a configuration file to know how to connect to the LegalContext MCP server. This file needs to be created in Claude Desktop's configuration directory:

- **Windows**: `%APPDATA%\Claude\claude-config.json`
- **macOS**: `~/Library/Application Support/Claude/claude-config.json`
- **Linux**: `~/.config/Claude/claude-config.json`

### Step 2: Set up the Configuration File

Create the `claude-config.json` file with the following content, adjusting the paths to match your LegalContext installation:

```json
{
  "mcpServers": {
    "legalcontext": {
      "command": "bun",
      "args": [
        "run",
        "/path/to/legal-context/src/claude-mcp-server.ts"
      ],
      "cwd": "/path/to/legal-context"
    }
  }
}
```

Replace `/path/to/legal-context` with the actual path to your LegalContext installation. For example:

- Windows: `C:\\Users\\username\\projects\\legal-context`
- macOS/Linux: `/Users/username/projects/legal-context`

### Step 3: Restart Claude Desktop

After creating or updating the configuration file, you need to restart Claude Desktop for the changes to take effect:

1. Close Claude Desktop completely (including from the system tray)
2. Launch Claude Desktop again

### Step 4: Verify Connection

To verify that Claude Desktop is connected to LegalContext:

1. Open Claude Desktop
2. Start a new conversation
3. In the conversation, you should see a "Server" dropdown in the lower right
4. Select "legalcontext" from the dropdown
5. If the connection is successful, you should see a "Connected to LegalContext" message

### Step 5: Test Document Access

Try the following prompts to test document access:

- "Show me a list of available documents"
- "Search for documents about contracts"
- "Find recent documents in Matter XYZ"

## Troubleshooting

If you encounter issues connecting Claude Desktop to LegalContext:

1. **Check paths**: Ensure the paths in your `claude-config.json` file are correct
2. **Verify authorization**: Make sure you have completed the Clio OAuth authorization flow
3. **Check logs**: Look at the Claude Desktop logs for error messages
4. **Restart**: Try restarting both Claude Desktop and the LegalContext server
5. **Permission issues**: Ensure the LegalContext server has the necessary permissions to access files

For more detailed help, consult the [LegalContext documentation](https://github.com/yourusername/legal-context) or contact support.

## Security Considerations

Remember that even though LegalContext provides secure access to firm documents, always follow these security best practices:

1. Don't share your configuration file with others
2. Keep your Clio credentials secure
3. Don't expose sensitive document information in public places
4. Follow your firm's security policies when using AI tools with legal documents
