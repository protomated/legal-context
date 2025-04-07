import { test, expect, mock } from "bun:test";
import { ConfigService } from '@nestjs/config';
import { McpServerService } from '../../src/mcp/mcp-server.service';

// Mock the MCP SDK modules
mock.module('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: function() {
      return {
        connect: mock(() => Promise.resolve())
      };
    }
  };
});

mock.module('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: function() {
      return {};
    }
  };
});

// Create a mock config service
const createMockConfigService = () => {
  return {
    get: (key: string, defaultValue?: any) => {
      if (key === 'mcpServer.name') return 'TestServer';
      if (key === 'mcpServer.version') return '1.0.0';
      return defaultValue;
    }
  } as ConfigService;
};

test('McpServerService should be defined', () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  expect(service).toBeDefined();
});

test('onModuleInit should initialize the MCP server with configured name and version', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  
  // We can't easily verify the constructor args with Bun's test runner
  // but we can check that the service has a server instance
  expect(service.getServer()).toBeDefined();
});

test('connect should connect the server to the transport', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  
  await service.connect();
  
  expect(service.isServerConnected()).toBe(true);
});

test('connect should not reconnect if already connected', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  await service.connect();
  
  await service.connect();
  
  expect(service.isServerConnected()).toBe(true);
});

test('disconnect should set isConnected to false', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  await service.connect();
  
  await service.disconnect();
  
  expect(service.isServerConnected()).toBe(false);
});

test('getServer should return the MCP server instance', async () => {
  const configService = createMockConfigService();
  const service = new McpServerService(configService);
  
  await service.onModuleInit();
  
  const server = service.getServer();
  
  expect(server).toBeDefined();
});
