# Document Indexing & Semantic Search

This document explains how to use and test the document indexing and semantic search features in LegalContext.

## Overview

LegalContext now includes a powerful document indexing system that enables semantic search across your legal documents. Unlike traditional keyword search, semantic search understands the meaning behind your query and returns documents that are conceptually similar, even if they don't contain the exact keywords.

The document indexing system:
- Processes documents from Clio
- Splits them into meaningful chunks
- Generates vector embeddings using a local embedding model
- Stores these embeddings in LanceDB (a vector database)
- Enables semantic search across your document collection

## How It Works

1. **Document Processing**: Documents are retrieved from Clio and processed to extract their text content.
   - PDF and DOCX files are processed locally using `office-text-extractor` to extract plain text
   - Text is cleaned to remove excessive whitespace and control characters
2. **Text Chunking**: Documents are split into smaller chunks using an advanced recursive text chunking algorithm that preserves the semantic meaning of paragraphs. The algorithm intelligently splits text based on multiple separator types (paragraphs, sentences, etc.) to create optimal chunks for embedding.
3. **Embedding Generation**: Each chunk is converted into a vector embedding using Transformers.js with the `Xenova/all-MiniLM-L6-v2` model. This model provides a good balance of quality and performance, generating 384-dimensional embeddings that capture the semantic meaning of the text.
4. **Vector Storage**: These embeddings are stored in LanceDB, a local vector database optimized for similarity search.
5. **Semantic Search**: When you search, your query is converted to an embedding and compared against all document chunks to find the most similar content.

## Using Document Indexing & Semantic Search

### Indexing Documents

Before you can perform semantic search, you need to index your documents. There are two ways to do this:

#### 1. Using Claude Desktop

You can ask Claude to index a specific document by providing its ID:

```
Can you index the document with ID 12345 for semantic search?
```

Claude will use the `index_document` tool to process and index the document.

#### 2. Using the API

For programmatic indexing, you can use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/documents/index \
  -H "Content-Type: application/json" \
  -d '{"documentId": "12345"}'
```

### Performing Semantic Search

#### 1. Using Claude Desktop

You can ask Claude to search for documents using natural language:

```
Can you find documents related to non-compete agreements in the healthcare industry?
```

Claude will use the `semantic_document_search` tool to find relevant documents based on the semantic meaning of your query.

#### 2. Using the API

For programmatic search, you can use the API endpoint:

```bash
curl -X GET http://localhost:3000/api/documents/search \
  -H "Content-Type: application/json" \
  -d '{"query": "non-compete agreements in healthcare", "limit": 5}'
```

### RAG-Based Queries (Retrieval-Augmented Generation)

LegalContext now supports RAG-based queries, which combine semantic search with prompt augmentation to provide more accurate and grounded responses.

#### How RAG Works in LegalContext

1. **Retrieval**: When you ask a question, the system retrieves relevant document chunks from the vector database using semantic search.
2. **Augmentation**: These chunks are formatted into a context string and combined with your query in a prompt template.
3. **Generation**: Claude uses this augmented prompt to generate a response that's grounded in your firm's documents.

#### Using RAG Queries with Claude Desktop

You can use RAG by asking Claude questions about your documents:

```
What are the key provisions in our settlement agreement with Acme Corp?
```

Claude will use the `rag_query` tool to:
1. Retrieve relevant document chunks
2. Format them into a context string
3. Create an augmented prompt
4. Generate a response based on the retrieved information

#### Benefits of RAG

- **Grounded Responses**: Answers are based directly on your firm's documents
- **Reduced Hallucinations**: Claude is less likely to make up information
- **Source Citations**: Responses can include references to source documents
- **Contextual Understanding**: Claude can understand the specific context of your legal documents

## Testing the Feature

To test the document indexing and semantic search functionality:

1. **Start the LegalContext server**:
   ```bash
   bun start
   ```

2. **Index a sample document**:
   - First, find a document ID from your Clio account:
     ```bash
     bun run check:clio
     ```
   - Then, index the document:
     ```bash
     curl -X POST http://localhost:3000/api/documents/index \
       -H "Content-Type: application/json" \
       -d '{"documentId": "YOUR_DOCUMENT_ID"}'
     ```

3. **Perform a semantic search**:
   ```bash
   curl -X GET http://localhost:3000/api/documents/search \
     -H "Content-Type: application/json" \
     -d '{"query": "YOUR_SEARCH_QUERY"}'
   ```

4. **Test with Claude Desktop**:
   - Open Claude Desktop
   - Ask a question that requires document search, such as:
     ```
     What documents do we have related to intellectual property rights?
     ```
   - Claude should use the semantic search tool to find relevant documents

## Troubleshooting

### Common Issues

1. **No documents found in search results**:
   - Make sure you've indexed documents before searching
   - Try a different search query that might match your indexed documents
   - Check the server logs for any errors during indexing

2. **Indexing fails**:
   - Verify that the document ID exists in Clio
   - Check that the document format is supported
   - Ensure the document is not empty

3. **LanceDB errors**:
   - Make sure the LanceDB directory is writable
   - Check that you have sufficient disk space
   - Verify that the LANCEDB_DB_PATH environment variable is set correctly

### Viewing Index Statistics

You can view statistics about your document index using:

```bash
curl -X GET http://localhost:3000/api/documents/index/stats
```

This will show you how many documents and chunks are currently indexed.

## Performance Considerations

- The initial embedding model loading may take a few seconds
- Large documents may take longer to process and index
- The free tier is limited to 100 documents
- Consider indexing documents during off-hours for large collections

## Security Notes

- All document processing happens locally within your network
- No document content is sent to external services
- Embeddings are stored locally in the LanceDB database
- The system respects Clio's existing security permissions
