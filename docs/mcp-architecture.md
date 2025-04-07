# MCP Server Architecture

## Overview

The Model Context Protocol (MCP) is a standardized way for LLMs to interact with external data sources and tools. LegalContext implements an MCP server that allows Claude Desktop to access legal documents stored in Clio in a secure, controlled manner.

## Architectural Components

```
┌────────────────────────────────────────────────────────────┐
│                         MCP Module                          │
│                                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ McpServerService│  │McpResourceService│  │McpToolService│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                   │                   │         │
│           ▼                   ▼                   ▼         │
│     ┌────────────────────────────────────────────────┐     │
│     │              McpOrchestratorService            │     │
│     └────────────────────────────────────────────────┘     │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
                                 ▼
                          ┌────────────┐
                          │Claude Desktop│
                          └────────────┘
```

### McpServerService

The `McpServerService` is responsible for:

- Initializing the MCP server
- Managing connection to the transport (stdio)
- Handling server lifecycle events
- Providing access to the MCP server instance

### McpResourcesService

The `McpResourcesService` handles:

- Registering MCP resources
- Managing document resources
- Creating URI templates for resource access
- Handling resource content formatting

### McpToolsService

The `McpToolsService` is responsible for:

- Registering MCP tools
- Implementing document interaction capabilities
- Defining tool schemas and parameters
- Processing tool execution requests

### McpOrchestratorService

The `McpOrchestratorService` coordinates:

- Initialization sequence of components
- Registration of resources and tools
- Connection to transport
- Order of operations during startup

## Communication Flow

1. **Initialization**:
   - NestJS application starts
   - MCP components are instantiated
   - Resources and tools are registered
   - Server connects to stdio transport

2. **Client Connection**:
   - Claude Desktop connects via stdio
   - MCP server validates the connection
   - Connection is established

3. **Resource Access**:
   - Claude requests a resource via URI
   - MCP server resolves the resource
   - Resource handler retrieves the document data
   - Data is returned to Claude

4. **Tool Execution**:
   - Claude invokes a tool with parameters
   - MCP server validates the parameters
   - Tool handler performs the requested action
   - Result is returned to Claude

## Security Considerations

The MCP architecture prioritizes security:

1. **Data Boundary**: All processing occurs within the law firm's network
2. **No Data Transmission**: Document content never leaves the firm's security perimeter
3. **Transport Security**: Using stdio ensures local-only communication
4. **Access Control**: Document access respects permissions from Clio
5. **Controlled API**: MCP provides a limited, well-defined interface

## Integration Points

The MCP server integrates with several components:

1. **Claude Desktop**: Connects as an MCP client
2. **Clio API**: Provides document data (through integration layer)
3. **Document Processing Engine**: Processes documents for context
4. **License Management**: Controls feature access based on license tier
5. **Analytics**: Tracks usage and performance metrics

## Future Extensibility

The modular design allows for future enhancements:

1. **Additional Resources**: New document types and sources
2. **Enhanced Tools**: More sophisticated search and analysis capabilities
3. **Alternative Transports**: Support for HTTP/SSE for remote connections
4. **Multiple LLM Support**: Integration with other MCP-compatible LLMs
