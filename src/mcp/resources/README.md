# Document Resources for MCP

## Overview

This module implements the resources part of the MCP (Model Context Protocol) integration required for providing document context to Claude. Document resources allow Claude to browse, search, and retrieve documents from the law firm's Clio document management system.

## Document Resources

The following MCP resources are implemented in this module:

### 1. Document List Resource
- **URI Pattern**: `documents://list/{filter}/{page}`
- **Description**: Retrieves a paginated list of available documents with optional filtering
- **Parameters**:
  - `filter`: JSON-encoded filter criteria or 'all'
  - `page`: Page number (starting at 1)

### 2. Document Content Resource
- **URI Pattern**: `document://{id}`
- **Description**: Retrieves the full content of a specific document
- **Parameters**:
  - `id`: The Clio document ID

### 3. Document Search Resource
- **URI Pattern**: `documents://search/{query}/{page}`
- **Description**: Searches for documents matching the provided query
- **Parameters**:
  - `query`: The search query
  - `page`: Page number (starting at 1)

### 4. Matter Documents Resource
- **URI Pattern**: `matter://{matter_id}/documents/{page}`
- **Description**: Retrieves documents associated with a specific matter
- **Parameters**:
  - `matter_id`: The Clio matter ID
  - `page`: Page number (starting at 1)

## Integration with the Document Processing Engine

Document resources integrate with the Document Processing Engine to:

1. **Process documents on demand** - When a document is requested, if it hasn't been processed yet, it's automatically processed and stored in the local database.
2. **Format document content** - Processes document content into a format suitable for Claude's context window.
3. **Ensure security boundaries** - All document access respects Clio's permission model, and no document content is stored outside the system.

## Security Considerations

- All document access is authenticated through Clio's OAuth 2.0 flow
- Documents are only processed and stored locally within the firm's security perimeter
- Access control is enforced at the Clio API level
- No document content leaves the system except through the MCP protocol to Claude
- Document caching follows a secure pattern to prevent unintended exposure

## Example Usage

Claude can access these resources with URIs like:

```
documents://list/all/1
document://12345abc-def6-789f
documents://search/contract%20provisions/1
matter://M12345/documents/1
```

## Performance Considerations

- Documents are processed and chunked on first access
- Processed documents are stored in the local database to avoid repeated processing
- Document chunks are stored with their position information to maintain document structure
- Vector embeddings enable semantic search capabilities
- Rate limiting and throttling is implemented to prevent overloading Clio's API

## Error Handling

The document resources implement comprehensive error handling:

- API errors from Clio are properly captured and reported
- Authentication issues are handled gracefully with clear error messages
- Resource timeouts include helpful recovery information
- Document processing errors are tracked and reported

## Integration with Claude Desktop

These resources are designed to work seamlessly with Claude Desktop through the MCP protocol:

1. Claude requests a list of documents or searches for relevant documents
2. The resource provides document metadata and access URIs
3. Claude requests specific document content using the provided URIs
4. The document content is processed, chunked, and provided to Claude
5. Claude can use this content in its responses with proper citations