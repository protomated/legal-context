// src/config/validation.schema.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Server configuration
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  // MCP server configuration
  MCP_SERVER_NAME: Joi.string().default('LegalContext Connect'),
  MCP_SERVER_VERSION: Joi.string().default('1.0.0'),

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
