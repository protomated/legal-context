// src/config/validation.schema.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Server configuration
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  // MCP server configuration
  MCP_SERVER_NAME: Joi.string().default('LegalContext Connect'),
  MCP_SERVER_VERSION: Joi.string().default('1.0.0'),

  // Clio API configuration
  CLIO_CLIENT_ID: Joi.string().required(),
  CLIO_CLIENT_SECRET: Joi.string().required(),
  CLIO_REDIRECT_URI: Joi.string().required(),
  CLIO_API_URL: Joi.string().default('https://app.clio.com/api/v4'),

  // Database configuration
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // Security configuration
  ENCRYPTION_KEY: Joi.string().required(),

  // Document processing configuration
  MAX_DOCUMENT_SIZE: Joi.number().default(5 * 1024 * 1024), // 5MB
  CHUNK_SIZE: Joi.number().default(1000),
  CHUNK_OVERLAP: Joi.number().default(200),
});

// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',

  mcpServer: {
    name: process.env.MCP_SERVER_NAME || 'LegalContext Connect',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  },

  clio: {
    clientId: process.env.CLIO_CLIENT_ID,
    clientSecret: process.env.CLIO_CLIENT_SECRET,
    redirectUri: process.env.CLIO_REDIRECT_URI,
    apiUrl: process.env.CLIO_API_URL || 'https://app.clio.com/api/v4',
  },

  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },

  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
  },

  documentProcessing: {
    maxDocumentSize: parseInt(process.env.MAX_DOCUMENT_SIZE, 10) || 5 * 1024 * 1024,
    chunkSize: parseInt(process.env.CHUNK_SIZE, 10) || 1000,
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP, 10) || 200,
  },
});
