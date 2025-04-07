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

   ```bash
   bun run start
   ```

2. **Configure Claude Desktop**

   Claude Desktop uses a configuration file to manage MCP connections. Add the LegalContext server to your configuration:

   ```json
   {
     "mcpServers": {
       "legalcontext": {
         "command": "bun",
         "args": ["run", "dist/main.js"],
         "cwd": "/path/to/legalcontext"
       }
     }
   }
   ```

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

   ```
   Please retrieve information about the LegalContext server.
   ```

2. **Using the example resource**

   ```
   Can you access the example resource with parameter "test"?
   ```

3. **Using the echo tool**

   ```
   Use the echo tool to repeat this message: "Testing LegalContext integration"
   ```

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
