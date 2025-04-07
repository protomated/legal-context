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

```bash
# In your LegalContext project directory
bun run claude:server
```

This will start the MCP server that listens on stdin/stdout.

### 2. Configure Claude Desktop

1. Open Claude Desktop's settings
2. Find the MCP Server configuration section
3. Add a new server with the following configuration:

```json
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
```

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

```typescript
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
```

### Adding Custom Tools

To add custom tools:

```typescript
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
```

Remember to restart the server and Claude Desktop after making changes.
