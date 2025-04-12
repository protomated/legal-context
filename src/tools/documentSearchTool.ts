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

/**
 * Register document search tools with the MCP server
 */
export function registerDocumentSearchTools(server: McpServer): void {
  logger.info("Registering document search tools...");
  
  // Document Search Tool
  server.tool(
    "documentSearch",
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
        // This is a placeholder implementation
        // In future stories, we'll implement actual document search logic
        
        // For now, return placeholder data based on query keywords
        let response = "No documents found matching the specified criteria.";
        
        if (query.toLowerCase().includes("non-compete") || (documentType && documentType.toLowerCase().includes("non-compete"))) {
          response = `
Document Search Results for "non-compete agreements drafted in the last year":

1. TechCorp Senior Executive Agreement
   Document Type: Non-Compete Agreement
   Date: May 15, 2024
   Client: TechCorp Inc.
   Key Terms: 2-year duration, North America geographic scope, Technology sector limitations
   URL: legal://documents/non-compete-agreements/techcorp-executive

2. SalesForce Regional Manager Contract
   Document Type: Non-Compete Agreement
   Date: March 3, 2024
   Client: SalesForce Solutions LLC
   Key Terms: 18-month duration, Eastern US geographic scope, CRM sector limitations
   URL: legal://documents/non-compete-agreements/salesforce-manager

3. BioResearch Scientist Employment Terms
   Document Type: Non-Compete Agreement with IP Assignment
   Date: January 22, 2024
   Client: BioResearch Innovations Inc.
   Key Terms: 3-year duration, Global geographic scope, Specific research field limitations
   URL: legal://documents/non-compete-agreements/bioresearch-scientist

4. Consulting Firm Partner Agreement
   Document Type: Non-Compete and Non-Solicitation Agreement
   Date: November 8, 2023
   Client: Strategic Consulting Partners
   Key Terms: 1-year duration, Client-specific restrictions, No geographic limitations
   URL: legal://documents/non-compete-agreements/consulting-partner

5. Healthcare Administrator Contract
   Document Type: Non-Compete Agreement
   Date: August 30, 2023
   Client: Regional Healthcare Systems
   Key Terms: 2-year duration, 50-mile radius geographic scope, Healthcare admin limitations
   URL: legal://documents/non-compete-agreements/healthcare-admin
`;
        } else if (query.toLowerCase().includes("merger") && 
                (query.toLowerCase().includes("acquisition") || 
                 query.toLowerCase().includes("acquisitions"))) {
          response = `
Document Search Results for "merger and acquisition contracts with technology companies":

1. TechStart Acquisition by MegaCorp
   Document Type: Share Purchase Agreement
   Date: April 2, 2024
   Parties: MegaCorp Inc. (Buyer), TechStart Innovations Inc. (Target), Founders (Sellers)
   Transaction Value: $85M
   Key Terms: 20% earnout over 3 years, Founder retention incentives, IP warranty package
   URL: legal://documents/merger-acquisitions/techstart-megacorp
   
2. Cloud Services Merger Agreement
   Document Type: Merger Agreement
   Date: February 17, 2024
   Parties: CloudTech Inc., ServerSolutions LLC
   Transaction Value: $120M (all-stock transaction)
   Key Terms: Equal board representation, Technology integration plan, Customer transition terms
   URL: legal://documents/merger-acquisitions/cloudtech-server
   
3. FinTech Platform Acquisition Terms
   Document Type: Asset Purchase Agreement
   Date: December 9, 2023
   Parties: Global Payments Inc. (Buyer), PaymentInnovations (Seller)
   Transaction Value: $45M plus performance incentives
   Key Terms: API transition support, Customer contract assignments, Regulatory approvals
   URL: legal://documents/merger-acquisitions/fintech-global
   
4. Hardware Manufacturer Merger Documents
   Document Type: Merger Agreement with Ancillary Documents
   Date: October 21, 2023
   Parties: PrecisionHardware Corp., TechComponents Inc.
   Transaction Value: $250M (cash and stock)
   Key Terms: Manufacturing facility integration, Supply chain commitments, Patent cross-licensing
   URL: legal://documents/merger-acquisitions/precision-techcomponents
   
5. SaaS Provider Acquisition Agreement
   Document Type: Stock Purchase Agreement
   Date: August 5, 2023
   Parties: Enterprise Solutions Inc. (Buyer), CloudSaaS LLC (Target)
   Transaction Value: $65M
   Key Terms: Customer retention incentives, Product roadmap commitments, SLA guarantees
   URL: legal://documents/merger-acquisitions/saas-enterprise
`;
        }
        
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
    "documentMetadata",
    {
      documentId: z.string().describe("The ID of the document to get metadata for.")
    },
    async ({ documentId }) => {
      logger.info(`Getting document metadata: ${documentId}`);
      
      try {
        // This is a placeholder implementation
        // In future stories, we'll implement actual document metadata retrieval
        
        // For now, return placeholder data based on documentId
        let response = "Document metadata not available for the specified document.";
        
        if (documentId === "techstart-megacorp") {
          response = `
Document Metadata for TechStart Acquisition by MegaCorp:

Basic Information:
- Document Type: Share Purchase Agreement
- Creation Date: April 2, 2024
- Last Modified: April 10, 2024
- File Format: PDF
- Size: 8.2 MB
- Pages: 124
- Language: English
- Version: Final (v3.2)

Classification:
- Primary Category: Mergers & Acquisitions
- Secondary Categories: Technology, Corporate, IP
- Confidentiality: High (Restricted Access)
- Retention Period: 10 years (permanent archival)

Related Parties:
- MegaCorp Inc. (Buyer)
- TechStart Innovations Inc. (Target)
- TechStart Founders (Sellers)
- MegaCorp Legal Department (Internal)
- Smith & Johnson LLP (External Counsel)

Associated Documents:
- Due Diligence Report (March 15, 2024)
- IP Assignment Schedule (April 2, 2024)
- Escrow Agreement (April 2, 2024)
- Board Resolution - MegaCorp (March 28, 2024)
- Board Resolution - TechStart (March 27, 2024)

Access History:
- Downloaded by: Sarah Chen (Partner) on April 12, 2024
- Viewed by: Mark Johnson (Associate) on April 8, 2024
- Shared with: Client Portal on April 3, 2024
`;
        }
        
        return {
          content: [{ type: "text", text: response }]
        };
      } catch (error) {
        logger.error("Error getting document metadata:", error);
        return {
          content: [{ type: "text", text: "An error occurred while retrieving document metadata." }],
          isError: true,
        };
      }
    }
  );
  
  logger.info("Document search tools registered successfully");
}
