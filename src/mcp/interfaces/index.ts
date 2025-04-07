/**
 * Resource content item returned by MCP resources
 */
export interface ResourceContentItem {
  uri: string;
  text: string;
}

/**
 * Resource response returned by MCP resource handlers
 */
export interface ResourceResponse {
  contents: ResourceContentItem[];
}

/**
 * Tool content item type for text responses
 */
export interface ToolTextContent {
  type: 'text';
  text: string;
}

/**
 * Tool response returned by MCP tool handlers
 */
export interface ToolResponse {
  content: ToolTextContent[];
  isError?: boolean;
}

/**
 * Server information used to initialize the MCP server
 */
export interface ServerInfo {
  name: string;
  version: string;
}
