// src/config/configuration.ts
export default () => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const dbPort = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432;
  const maxDocSize = process.env.MAX_DOCUMENT_SIZE ? parseInt(process.env.MAX_DOCUMENT_SIZE, 10) : 5 * 1024 * 1024;
  const chunkSize = process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE, 10) : 1000;
  const chunkOverlap = process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP, 10) : 200;

  return {
    port,
    environment: process.env.NODE_ENV || 'development',

    mcpServer: {
      name: process.env.MCP_SERVER_NAME || 'LegalContext Connect',
      version: process.env.MCP_SERVER_VERSION || '1.0.0',
    },

    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: dbPort,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      name: process.env.DATABASE_NAME || 'legalcontext',
    },

    security: {
      encryptionKey: process.env.ENCRYPTION_KEY || 'development-key',
    },

    clio: {
      clientId: process.env.CLIO_CLIENT_ID,
      clientSecret: process.env.CLIO_CLIENT_SECRET,
      redirectUri: process.env.CLIO_REDIRECT_URI || 'http://127.0.0.1:3000/clio/auth/callback',
      apiUrl: process.env.CLIO_API_URL || 'https://app.clio.com/api/v4',
    },

    documentProcessing: {
      maxDocumentSize: maxDocSize,
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    },
  };
};
