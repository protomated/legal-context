# LegalContext Architecture

## System Architecture Overview

LegalContext is built on a modular architecture that creates a secure bridge between law firms' document management systems (Clio) and AI assistants (Claude Desktop) using the Model Context Protocol (MCP).

```mermaid
graph TB
    %% External Systems
    Claude["Claude Desktop<br>MCP Client"]
    Clio["Clio Document<br>Management System"]
    
    %% Main Components
    subgraph "LegalContext Server"
        MCP["MCP Server<br>Component"]
        CL["Clio Integration<br>Layer"]
        DPE["Document<br>Processing Engine"]
        DB[("Document<br>Database")]
        
        %% MCP Components
        subgraph "MCP Components"
            MCPRes["MCP Resources"]
            MCPTools["MCP Tools"]
        end
        
        %% Document Processing Components
        subgraph "Document Processing"
            TE["Text Extractor"]
            CS["Chunking Service"]
            ES["Embedding Service"]
            SS["Search Service"]
        end
    end
    
    %% External Connections
    Claude <-->|MCP/stdio| MCP
    CL <-->|OAuth 2.0/REST| Clio
    
    %% Internal Connections
    MCP <--> MCPRes
    MCP <--> MCPTools
    MCPRes <--> CL
    MCPTools <--> CL
    MCPRes <--> DPE
    MCPTools <--> DPE
    DPE <--> DB
    
    %% Document Processing Connections
    DPE <--> TE
    DPE <--> CS
    DPE <--> ES
    DPE <--> SS
    CL <--> DB
    
    %% Data Flow Annotations
    classDef flowClass stroke-dasharray: 5 5
    class dataFlow flowClass
```

## Component Architecture

### MCP Server Component

The MCP Server is the core component that implements the Model Context Protocol to allow Claude Desktop to access firm documents securely. It manages the connection with Claude and routes requests to the appropriate resources and tools.

```mermaid
classDiagram
    class McpServerService {
        -McpServer server
        -StdioServerTransport transport
        -boolean isConnected
        +initialize()
        +connect()
        +disconnect()
        +getServer()
        +isServerConnected()
    }
    
    class McpResourcesService {
        +registerResources()
        -registerExampleResource()
    }
    
    class McpToolsService {
        +registerTools()
        -registerExampleTool()
    }
    
    class McpOrchestratorService {
        +onModuleInit()
        +onModuleDestroy()
        -setupHealthCheck()
    }
    
    class DocumentResourceService {
        +registerResources()
        -registerDocumentListResource()
        -registerDocumentContentResource()
        -registerDocumentSearchResource()
        -registerMatterDocumentsResource()
    }
    
    class DocumentToolService {
        +registerTools()
        -registerDocumentSearchTool()
        -registerDocumentProcessingTool()
        -registerCitationTool()
        -registerSemanticSearchTool()
        -formatStandardCitation()
        -formatBluebookCitation()
        -formatApaCitation()
    }
    
    McpServerService <-- McpOrchestratorService
    McpResourcesService <-- McpOrchestratorService
    McpToolsService <-- McpOrchestratorService
    DocumentResourceService <-- McpOrchestratorService
    DocumentToolService <-- McpOrchestratorService
```

### Clio Integration Layer

The Clio Integration Layer provides secure, authenticated access to the firm's document management system through Clio's API.

```mermaid
classDiagram
    class ClioAuthService {
        -Map~string, AuthorizationRequestDto~ stateMap
        +generateAuthorizationUrl()
        +exchangeCodeForToken()
        +refreshToken()
        +getValidAccessToken()
        +revokeToken()
        +getTokenInfo()
        +hasValidToken()
        -generateState()
        -generatePKCE()
    }
    
    class ClioAuthController {
        +login()
        +callback()
        +status()
        +tokens()
        +logout()
    }
    
    class ClioDocumentService {
        -number rateLimitRemaining
        -number rateLimitReset
        +listDocuments()
        +getAllPaginatedDocuments()
        +listFolderContents()
        +getDocument()
        +downloadDocument()
        +getDocumentVersions()
        +uploadDocument()
        +updateDocument()
        +deleteDocument()
        +createFolder()
        +searchDocuments()
        +isRateLimitWarning()
        +getRateLimitInfo()
        -processRateLimitHeaders()
        -checkRateLimit()
        -handleApiError()
        -apiGet()
        -apiPost()
        -apiPut()
        -apiDelete()
    }
    
    class ClioDocumentMetadataService {
        +normalizeDocumentMetadata()
        +getDocumentsByMatter()
        +filterDocuments()
        +getDocumentHierarchy()
        +getDocumentPath()
        +groupDocumentsByCategory()
        +groupDocumentsByProperty()
        +getRecentlyModifiedDocuments()
        +getDocumentsByContentType()
        +findDuplicateDocumentNames()
        +getDocumentMetadataStatistics()
        +batchNormalizeMetadata()
        +searchDocumentMetadata()
        -extractTags()
        -addParentToPath()
    }
    
    class ClioDocumentBatchService {
        +batchDownloadDocuments()
        +batchMoveDocuments()
        +batchUpdateDocuments()
        +fetchDocumentsWithContent()
        +batchCopyDocuments()
        +batchDeleteDocuments()
        +processBatch()
    }
    
    ClioAuthService <-- ClioAuthController
    ClioDocumentService <-- ClioDocumentMetadataService
    ClioDocumentService <-- ClioDocumentBatchService
```

### Document Processing Engine

The Document Processing Engine extracts text from documents, chunks it into manageable segments, generates embeddings for semantic search, and provides search capabilities.

```mermaid
classDiagram
    class DocumentProcessorService {
        +processDocument()
        +searchDocuments()
    }
    
    class TextExtractorService {
        +extract()
        -extractFromPdf()
        -extractFromDocx()
        -extractFromHtml()
        -extractFromRtf()
    }
    
    class ChunkingService {
        +chunk()
        -chunkBySize()
        -chunkByParagraphs()
    }
    
    class EmbeddingService {
        +generateEmbeddings()
        -mockEmbeddingGeneration()
    }
    
    class SearchService {
        +searchSimilar()
        +searchText()
        +searchHybrid()
    }
    
    DocumentProcessorService --> TextExtractorService
    DocumentProcessorService --> ChunkingService
    DocumentProcessorService --> EmbeddingService
    DocumentProcessorService --> SearchService
```

## Data Flow

### Document Access Flow

The following diagram shows the flow of data when Claude requests document content:

```mermaid
sequenceDiagram
    participant Claude as Claude Desktop
    participant MCP as MCP Server
    participant Resources as Document Resources
    participant Processor as Document Processor
    participant Clio as Clio API
    participant Database as Document Database
    
    Claude->>MCP: Request document URI
    MCP->>Resources: Route to document resource
    Resources->>Database: Check if document exists
    
    alt Document exists in database
        Database-->>Resources: Return document
    else Document not in database
        Resources->>Clio: Get document metadata
        Clio-->>Resources: Return metadata
        Resources->>Clio: Download document content
        Clio-->>Resources: Return content
        Resources->>Processor: Process document
        Processor->>Database: Store processed document
        Database-->>Resources: Return processed document
    end
    
    Resources-->>MCP: Return document content
    MCP-->>Claude: Provide document in context window
```

### Document Search Flow

The following diagram shows the flow of data when Claude performs a semantic search:

```mermaid
sequenceDiagram
    participant Claude as Claude Desktop
    participant MCP as MCP Server
    participant Tools as Document Tools
    participant Search as Search Service
    participant Database as Document Database
    
    Claude->>MCP: Call semantic-search tool
    MCP->>Tools: Route to semantic search
    Tools->>Search: Execute search query
    Search->>Database: Run vector similarity search
    Database-->>Search: Return matching chunks
    Search-->>Tools: Return ranked results
    Tools-->>MCP: Format search results
    MCP-->>Claude: Return search results
```

## Security Architecture

LegalContext implements several security layers to ensure document confidentiality and access control:

```mermaid
graph TD
    subgraph "Security Layers"
        OAuth["OAuth 2.0 with PKCE"]-->RBAC["Role-Based Access Control"]-->Local["Local Document Processing"]-->Secure["Secure Storage"]-->Audit["Audit Logging"]-->Token["Token Management"]-->RL["Rate Limiting"]-->CW["Controlled Context Window"]-->Citations["Citation Tracking"]
    end
```

### Security Components

1. **OAuth 2.0 with PKCE** - All access to Clio's API is authenticated using OAuth 2.0 flow with PKCE for enhanced security.

2. **Role-Based Access Control** - Document access respects the permission model defined in Clio.

3. **Local Document Processing** - All document processing occurs locally within the firm's security perimeter.

4. **Secure Storage** - Document content and metadata are stored securely in the local database.

5. **Audit Logging** - All document access and operations are logged for audit purposes.

6. **Token Management** - Access tokens are securely stored and refreshed when needed.

7. **Rate Limiting** - API calls are rate-limited to prevent abuse and overloading.

8. **Controlled Context Window** - Only specifically requested documents are provided to Claude.

9. **Citation Tracking** - All information provided to Claude includes source citations for verification.

## Deployment Architecture

LegalContext can be deployed in various configurations based on the firm's needs:

```mermaid
graph TB
    subgraph "Deployment Options"
        direction LR
        
        subgraph "On-Premises"
            OP_LC["LegalContext"]-->OP_DB[("PostgreSQL")]
            OP_CD["Claude Desktop"]-->OP_LC
        end
        
        subgraph "Hybrid"
            H_LC["LegalContext"]-->H_DB[("PostgreSQL")]
            H_CD["Claude Desktop"]-->H_LC
            H_LC-->|"API Calls"|CLIO["Clio Cloud"]
        end
        
        subgraph "Cloud"
            C_LC["LegalContext"]
            C_CD["Claude Desktop"]-->C_LC
            C_LC-->CLIO2["Clio Cloud"]
            C_LC-->C_DB[("PostgreSQL")]
        end
    end
```

## Database Schema

The database schema is designed to efficiently store and retrieve documents and their embeddings:

```mermaid
erDiagram
    DOCUMENT ||--o{ DOCUMENT_CHUNK : has
    DOCUMENT_CHUNK ||--|| DOCUMENT_VECTOR : has
    OAUTH_TOKEN |o--o| DOCUMENT : accessed_by
    
    DOCUMENT {
        uuid id PK
        string title
        string clioId
        string mimeType
        jsonb metadata
        datetime createdAt
        datetime updatedAt
    }
    
    DOCUMENT_CHUNK {
        uuid id PK
        uuid documentId FK
        text content
        int startIndex
        int endIndex
    }
    
    DOCUMENT_VECTOR {
        uuid id PK
        uuid chunkId FK
        number[] embedding
    }
    
    OAUTH_TOKEN {
        uuid id PK
        string accessToken
        string refreshToken
        datetime expiresAt
        string scope
        string userId
        string organizationId
        datetime createdAt
        datetime updatedAt
    }
```

## Module Organization

The codebase is organized into several NestJS modules:

```mermaid
graph TB
    subgraph "Module Structure"
        App["AppModule"]-->Config["ConfigModule"]
        App-->MCP["McpModule"]
        App-->Clio["ClioModule"]
        App-->DB["DatabaseModule"]
        App-->DP["DocumentProcessingModule"]
        
        MCP-->MCPComponents["MCP Components"]
        Clio-->ClioComponents["Clio Components"]
        DB-->Entities["Database Entities"]
        DP-->DocProcessingComponents["Document Processing Components"]
    end
```

## Technologies Used

- **Runtime**: Bun (for high performance JavaScript/TypeScript execution)
- **Framework**: NestJS (for modular architecture and dependency injection)
- **Language**: TypeScript (for type safety and developer experience)
- **Database**: PostgreSQL with pgvector extension (for vector similarity search)
- **API Integration**: OAuth 2.0, REST (for Clio API interaction)
- **Protocol**: MCP - Model Context Protocol (for standardized AI interaction)
