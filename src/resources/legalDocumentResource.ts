/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Legal Document Resource
 * 
 * This module implements MCP resources for accessing legal documents.
 * It provides access to documents stored in the Clio system.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../logger";

/**
 * Register legal document resources with the MCP server
 */
export function registerLegalDocumentResources(server: McpServer): void {
  logger.info("Registering legal document resources...");
  
  // Sample document types for placeholder implementation
  const documentTypes = [
    "settlement-agreements",
    "employment-contracts",
    "non-compete-agreements",
    "intellectual-property",
    "merger-acquisitions",
    "software-licensing",
    "case-documents",
    "client-documentation"
  ];
  
  // Register a document collection resource that lists available document types
  server.resource(
    "document-types",
    "legal://document-types",
    async (uri) => {
      logger.info(`Resource requested: ${uri.href}`);
      
      return {
        contents: [{
          uri: uri.href,
          text: `Available document types: ${documentTypes.join(", ")}`
        }]
      };
    }
  );
  
  // Register a dynamic resource for document types
  server.resource(
    "document-type",
    new ResourceTemplate("legal://documents/{type}", { list: async () => {
      return documentTypes.map(type => ({ href: `legal://documents/${type}` }));
    }}),
    async (uri, { type }) => {
      logger.info(`Resource requested: ${uri.href} (type: ${type})`);
      
      // This is a placeholder implementation
      // In the future, this will query the actual documents from Clio
      
      let description = "Placeholder document collection";
      
      // Customize description based on document type
      switch (type) {
        case "settlement-agreements":
          description = "Collection of settlement agreements including recent Acme Corp settlement.";
          break;
        case "employment-contracts":
          description = "Employment contract templates and signed agreements with various provisions.";
          break;
        case "non-compete-agreements":
          description = "Non-compete agreements drafted in the last year for various clients.";
          break;
        case "intellectual-property":
          description = "Intellectual property documents including patents, trademarks, and copyright registrations.";
          break;
        case "merger-acquisitions":
          description = "Merger and acquisition contracts with technology companies and other sectors.";
          break;
        case "software-licensing":
          description = "Software licensing agreements with various clauses and provisions.";
          break;
        case "case-documents":
          description = "Case documents including the Smith litigation and consumer data privacy cases.";
          break;
        case "client-documentation":
          description = "Client documentation requirements for various legal processes including trademark registration.";
          break;
        default:
          description = `Collection of ${type.replace(/-/g, " ")} documents.`;
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: description
        }]
      };
    }
  );
  
  // Register a specific document resource for the Acme Corp settlement
  server.resource(
    "acme-settlement",
    "legal://documents/settlement-agreements/acme-corp",
    async (uri) => {
      logger.info(`Resource requested: ${uri.href}`);
      
      return {
        contents: [{
          uri: uri.href,
          text: `
            # Settlement Agreement with Acme Corp
            
            ## Key Points:
            
            1. Settlement amount of $1.2 million to be paid in 3 installments
            2. Non-disclosure agreement covering all settlement terms
            3. Mutual release of all claims
            4. Non-disparagement clause for both parties
            5. Implementation of new safety protocols by Acme Corp
            6. Cooperation on joint press statement
            7. Dismissal of all pending litigation with prejudice
          `
        }]
      };
    }
  );
  
  // Register a specific document resource for employment contract template
  server.resource(
    "employment-template",
    "legal://documents/employment-contracts/template",
    async (uri) => {
      logger.info(`Resource requested: ${uri.href}`);
      
      return {
        contents: [{
          uri: uri.href,
          text: `
            # Standard Employment Contract Template
            
            ## Main Provisions:
            
            1. Employment terms (at-will employment status)
            2. Compensation structure (salary, bonus, equity)
            3. Benefits package (health insurance, retirement, PTO)
            4. Intellectual property assignment
            5. Confidentiality requirements
            6. Non-solicitation of employees or customers
            7. Dispute resolution process (arbitration)
            8. Termination conditions and severance
          `
        }]
      };
    }
  );
  
  // Register a specific document resource for the Johnson contract
  server.resource(
    "johnson-contract",
    "legal://documents/client-contracts/johnson",
    async (uri) => {
      logger.info(`Resource requested: ${uri.href}`);
      
      return {
        contents: [{
          uri: uri.href,
          text: `
            # Johnson Service Agreement
            
            ## Key Clauses:
            
            1. Service scope with ambiguous deliverables timeline
            2. Payment terms with net-60 instead of standard net-30
            3. Limited liability cap at fee amount only
            4. Broad indemnification requirements for our client
            5. Unilateral termination rights for Johnson Corp
            6. Inconsistent governing law provisions
            7. Missing confidentiality provisions for shared IP
            8. Automatic renewal without notification period
          `
        }]
      };
    }
  );
  
  logger.info("Legal document resources registered successfully");
}
