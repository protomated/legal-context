/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Document Search Tool
 *
 * This module implements MCP tools for searching legal documents.
 * It provides functionality for finding documents by various criteria.
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../logger";
import { getClioApiClient, ClioDocument } from "../clio";
import { processDocument } from "../documents/documentProcessor";

/**
 * Register document search tools with the MCP server
 */
export function registerDocumentSearchTools(server: McpServer): void {
  logger.info("Registering document search tools...");

  // Document Search Tool
  server.tool(
    "document_search",
    "Searches through the firm's document management system for legal documents matching specified criteria.",
    {
      query: z.string().describe("The search query for finding documents."),
      documentType: z.string().optional().describe("Optional document type filter."),
      dateRange: z.object({
        start: z.string().optional(),
        end: z.string().optional()
      }).optional().describe("Optional date range filter."),
      client: z.string().optional().describe("Optional client name filter.")
    },
    async ({ query, documentType, dateRange, client }) => {
      logger.info(`Searching documents: ${query}, type: ${documentType || 'all'}, dateRange: ${JSON.stringify(dateRange || {})}, client: ${client || 'all'}`);

      try {
        // Get the Clio API client
        const clioApiClient = getClioApiClient();

        // Check if Clio API client is initialized
        if (!await clioApiClient.initialize()) {
          logger.warn("Clio API client not initialized. Using placeholder data.");
          return {
            content: [{
              type: "text",
              text: "Clio integration is not authenticated. Please visit the authentication URL to connect with Clio."
            }],
            isError: true,
          };
        }

        // Search for documents in Clio
        logger.info(`Searching Clio documents with query: ${query}`);
        const searchResults = await clioApiClient.listDocuments(1, 10, query);

        // Check if any documents were found
        if (!searchResults.data || searchResults.data.length === 0) {
          return {
            content: [{ type: "text", text: "No documents found matching the specified criteria." }]
          };
        }

        // Format the search results
        let response = `Document Search Results for "${query}":\n\n`;

        searchResults.data.forEach((doc, index) => {
          response += `${index + 1}. ${doc.name}\n`;
          response += `   Document ID: ${doc.id}\n`;
          response += `   Created: ${new Date(doc.created_at).toLocaleDateString()}\n`;
          response += `   Updated: ${new Date(doc.updated_at).toLocaleDateString()}\n`;

          if (doc.content_type) {
            response += `   Type: ${doc.content_type}\n`;
          }

          if (doc.category) {
            response += `   Category: ${doc.category}\n`;
          }

          if (doc.parent_folder && doc.parent_folder.name) {
            response += `   Folder: ${doc.parent_folder.name}\n`;
          }

          if (doc.size) {
            response += `   Size: ${Math.round(doc.size / 1024)} KB\n`;
          }

          response += `   URL: legal://documents/${doc.id}\n\n`;
        });

        // Add pagination info
        const totalDocuments = searchResults.meta.paging.total_entries;
        const totalPages = searchResults.meta.paging.total_pages;
        const currentPage = searchResults.meta.paging.page;

        response += `Showing ${searchResults.data.length} of ${totalDocuments} documents (Page ${currentPage} of ${totalPages})`;

        return {
          content: [{ type: "text", text: response }]
        };
      } catch (error) {
        logger.error("Error searching documents:", error);
        return {
          content: [{ type: "text", text: "An error occurred while searching for documents." }],
          isError: true,
        };
      }
    }
  );

  // Document Metadata Tool
  server.tool(
    "document_metadata",
    "Retrieves comprehensive metadata information about a specific legal document.",
    {
      documentId: z.string().describe("The ID of the document to get metadata for.")
    },
    async ({ documentId }) => {
      logger.info(`Getting document metadata: ${documentId}`);

      try {
        // Get the Clio API client
        const clioApiClient = getClioApiClient();

        // Check if Clio API client is initialized
        if (!await clioApiClient.initialize()) {
          logger.warn("Clio API client not initialized. Using placeholder data.");
          return {
            content: [{
              type: "text",
              text: "Clio integration is not authenticated. Please visit the authentication URL to connect with Clio."
            }],
            isError: true,
          };
        }

        // Get document metadata from Clio
        logger.info(`Retrieving Clio document metadata for ID: ${documentId}`);

        try {
          const documentData = await clioApiClient.getDocument(documentId);
          const document = documentData.data;

          // Format the document metadata
          let response = `Document Metadata for ${document.name}:\n\n`;

          response += `Basic Information:\n`;
          response += `- Document ID: ${document.id}\n`;
          response += `- UUID: ${document.uuid}\n`;
          response += `- Name: ${document.name}\n`;

          if (document.content_type) {
            response += `- Content Type: ${document.content_type}\n`;
          }

          if (document.category) {
            response += `- Category: ${document.category}\n`;
          }

          if (document.date) {
            response += `- Document Date: ${document.date}\n`;
          }

          if (document.size) {
            response += `- Size: ${Math.round(document.size / 1024)} KB\n`;
          }

          response += `- Created: ${new Date(document.created_at).toLocaleString()}\n`;
          response += `- Last Modified: ${new Date(document.updated_at).toLocaleString()}\n`;

          if (document.parent_folder) {
            response += `\nLocation:\n`;
            response += `- Parent Folder: ${document.parent_folder.name} (ID: ${document.parent_folder.id})\n`;
          }

          // Add download link
          response += `\nActions:\n`;
          response += `- Download URL: legal://documents/${document.id}/download\n`;

          return {
            content: [{ type: "text", text: response }]
          };
        } catch (docError) {
          // If document not found or other API error
          logger.error(`Error retrieving document metadata for ID ${documentId}:`, docError);
          return {
            content: [{ type: "text", text: `Document with ID "${documentId}" not found or not accessible.` }]
          };
        }
      } catch (error) {
        logger.error("Error getting document metadata:", error);
        return {
          content: [{ type: "text", text: "An error occurred while retrieving document metadata." }],
          isError: true,
        };
      }
    }
  );

  // Document Content Tool
  server.tool(
    "document_content",
    "Retrieves and displays the full content of a legal document with statistics and metadata summary.",
    {
      documentId: z.string().describe("The ID of the document to retrieve content for.")
    },
    async ({ documentId }) => {
      logger.info(`Retrieving document content: ${documentId}`);

      try {
        // Get the document content using the document processor
        const processedDocument = await processDocument(documentId);

        // Format the response
        let response = `Document Content: ${processedDocument.name}\n\n`;

        // Add metadata summary
        response += `Metadata Summary:\n`;
        response += `- Document ID: ${processedDocument.id}\n`;
        response += `- Size: ${processedDocument.metadata.size ? Math.round(processedDocument.metadata.size / 1024) + ' KB' : 'Unknown'}\n`;
        if (processedDocument.metadata.contentType) {
          response += `- Type: ${processedDocument.metadata.contentType}\n`;
        }
        response += `- Created: ${new Date(processedDocument.metadata.created).toLocaleDateString()}\n`;
        response += `- Updated: ${new Date(processedDocument.metadata.updated).toLocaleDateString()}\n`;

        // Add document content
        response += `\nDocument Content:\n`;
        response += `----------------------------------------\n`;

        // Limit content length for display
        const maxContentLength = 10000; // Limit to 10,000 characters
        const contentPreview = processedDocument.text.length > maxContentLength
          ? processedDocument.text.substring(0, maxContentLength) + '... [Content truncated, full content available for processing]'
          : processedDocument.text;

        response += contentPreview;
        response += `\n----------------------------------------\n`;

        // Add content stats
        response += `\nContent Statistics:\n`;
        response += `- Total Characters: ${processedDocument.text.length}\n`;
        response += `- Word Count (approx): ${processedDocument.text.split(/\s+/).length}\n`;

        return {
          content: [{ type: "text", text: response }]
        };
      } catch (error) {
        logger.error("Error retrieving document content:", error);
        return {
          content: [{ type: "text", text: "An error occurred while retrieving document content." }],
          isError: true,
        };
      }
    }
  );

  logger.info("Document search tools registered successfully");
}
