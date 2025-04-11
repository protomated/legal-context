# Document Tools for MCP

## Overview

This module implements the tools part of the MCP (Model Context Protocol) integration required for document management and search. Document tools allow Claude to search, process, and cite documents from the law firm's Clio document management system.

## Document Tools

The following MCP tools are implemented in this module:

### 1. Document Search Tool
- **Name**: `search-documents`
- **Description**: Searches for documents in Clio by keyword
- **Parameters**:
  - `query`: The search query text
  - `matter_id` (optional): Filter by matter ID
  - `limit` (optional): Maximum number of results to return (default: 10)

### 2. Document Processing Tool
- **Name**: `process-document` 
- **Description**: Process a document for use in Claude's context
- **Parameters**:
  - `document_id`: The Clio document ID to process
  - `force_refresh` (optional): Whether to force reprocessing even if already processed

### 3. Citation Generation Tool
- **Name**: `generate-citation`
- **Description**: Generates a citation for a document in various formats
- **Parameters**:
  - `document_id`: The Clio document ID to cite
  - `format` (optional): Citation format to use (standard, bluebook, apa)
  - `section` (optional): Section or page to cite specifically

### 4. Semantic Search Tool
- **Name**: `semantic-search`
- **Description**: Performs semantic search on documents using vector embeddings
- **Parameters**:
  - `query`: The search query text
  - `matter_id` (optional): Filter by matter ID
  - `search_type` (optional): Type of search (semantic, hybrid, text)
  - `limit` (optional): Maximum number of results to return (default: 5)

## Integration with the Document Processing Engine

Document tools integrate with the Document Processing Engine to:

1. **Process documents on demand** - Enable just-in-time document processing
2. **Search across document content** - Find relevant information in all document types
3. **Generate proper citations** - Ensure all document references are properly cited
4. **Perform semantic search** - Find conceptually similar content using vector embeddings

## Security Considerations

- All document access through tools is authenticated via Clio's OAuth 2.0 flow
- Document processing happens entirely within the firm's security perimeter
- Search queries are executed locally against processed documents
- No document content is transmitted outside the system except through MCP to Claude
- Performance throttling prevents API abuse

## Example Usage

Claude can use these tools to:

1. **Find relevant documents**:
   ```
   I need to search for documents related to the Johnson contract
   ```

2. **Process specific documents**:
   ```
   Please process document abc-123-def to use it in our discussion
   ```

3. **Generate citations**:
   ```
   Generate a Bluebook citation for document xyz-789 section 3.2
   ```

4. **Search semantically**:
   ```
   Find documents discussing implied warranties even if they don't use those exact terms
   ```

## Performance Considerations

- Document processing is computationally intensive but happens only once per document
- Semantic search uses vector operations which scale with document volume
- Throttling prevents overwhelming the Clio API with too many requests
- Rate limiting on citation generation prevents abuse

## Error Handling

The document tools implement comprehensive error handling:

- API errors from Clio are captured and reported appropriately
- Authentication issues are handled gracefully
- Processing errors include diagnostic information
- Search with no results provides helpful alternative suggestions

## Integration with Claude Desktop

These tools are designed to work seamlessly with Claude Desktop through the MCP protocol:

1. Claude calls the tools with appropriate parameters
2. The tool performs the requested operation
3. Results are returned in a format optimized for Claude's context window
4. Claude can use the results in its responses with proper attributions

## Citation Formats

The citation tool supports multiple formats:

1. **Standard**: Simple citation with document name, ID, and date
2. **Bluebook**: Legal citation format following simplified Bluebook rules
3. **APA**: Academic citation format for documents and legal materials

Each format properly includes document metadata, matter references, and specific sections when provided.