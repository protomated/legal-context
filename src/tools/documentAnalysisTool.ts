/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */
/**
 * Document Analysis Tool
 *
 * This module implements specialized MCP tools for analyzing legal documents.
 * It provides functionality for contract analysis and document summarization.
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../logger";

/**
 * Register document analysis tools with the MCP server
 */
export function registerDocumentAnalysisTools(server: McpServer): void {
  logger.info("Registering document analysis tools...");

  // Contract Risk Analysis Tool
  server.tool(
    "contract_risk_analysis",
    "Analyzes legal contracts to identify potential risks, liabilities, and non-standard clauses with severity ratings.",
    {
      contractId: z.string().describe("The ID of the contract to analyze."),
      riskThreshold: z.number().optional().describe("Optional risk threshold level (1-5)."),
    },
    async ({ contractId, riskThreshold }) => {
      logger.info(`Analyzing contract risks: ${contractId}, threshold: ${riskThreshold || 'default'}`);

      try {
        // This is a placeholder implementation
        // In future stories, we'll implement actual contract analysis logic

        // For now, return placeholder data based on contractId
        let response = "Contract risk analysis not available for the specified contract.";

        if (contractId === "johnson") {
          response = `
Contract Risk Analysis for Johnson Service Agreement:

1. CRITICAL RISK: Service scope has ambiguous deliverables timeline with no specific milestones
2. HIGH RISK: Payment terms with net-60 (our standard is net-30)
3. HIGH RISK: Limited liability cap at fee amount only, below our standard minimum
4. HIGH RISK: Broad indemnification requirements expose client to third-party claims
5. MEDIUM RISK: Unilateral termination rights for Johnson Corp with minimal notice
6. MEDIUM RISK: Inconsistent governing law provisions between sections
7. MEDIUM RISK: Missing confidentiality provisions for shared intellectual property
8. LOW RISK: Automatic renewal without notification period

Risk Score: 78/100 (High Risk)

Recommendations:
- Renegotiate service scope with specific deliverable dates
- Request standard net-30 payment terms
- Increase liability cap to at least 2x contract value
- Limit indemnification to direct third-party IP claims only
- Equalize termination rights with standard 30-day notice
- Standardize governing law to our preferred jurisdiction
- Add confidentiality clause with 3-year post-termination protection
- Add 30-day renewal notification requirement
`;
        } else if (contractId === "software-licensing") {
          response = `
Common Risk Factors in Our Software Licensing Agreements:

1. License Scope: Often contains vague language around authorized users
2. IP Ownership: 40% of agreements have unclear ownership of derivative works
3. Warranty: Most contain limited warranties below industry standard
4. Liability: 70% have acceptable liability caps, but 30% have inadequate protection
5. Support Terms: Frequently missing clear SLA definitions
6. Exit Terms: Often lacks proper data migration provisions
7. Force Majeure: Standard clauses but pandemic-specific language still absent in older templates

Industry Comparison:
- Our liability caps average 2x annual fees (industry standard is 3x)
- Our warranty periods average 60 days (industry standard is 90 days) 
- Our termination notice averages 30 days (industry standard is 60 days)

Improvement Recommendations:
- Update user definition templates to include clear affiliate/subsidiary language
- Implement standard 90-day warranty language across templates
- Increase standard liability caps to 3x annual fees
- Add detailed SLA metrics with specific remedy paths
- Develop standard exit/transition assistance language
`;
        }

        // Create citation metadata for the contract
        const citationMetadata = {
          query: `Contract risk analysis for ${contractId}`,
          document: {
            documentId: contractId,
            documentName: contractId === "johnson" ? "Johnson Service Agreement" :
                         (contractId === "software-licensing" ? "Software Licensing Agreement" : contractId),
            uri: `legal://contracts/${contractId}`,
            relevance: 100,
            type: "contract"
          }
        };

        // Return the response and citation metadata as a CallToolResult
        return {
          content: [
            // Include the response as TextContent
            {
              type: "text",
              text: response
            },
            // Include citation metadata as structured data
            {
              type: "text",
              text: JSON.stringify(citationMetadata, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error("Error analyzing contract:", error);
        return {
          content: [{ type: "text", text: "An error occurred while analyzing the contract." }],
          isError: true,
        };
      }
    }
  );

  // Document Summarization Tool
  server.tool(
    "document_summarization",
    "Creates concise summaries of legal documents highlighting key provisions, terms, and important details.",
    {
      documentId: z.string().describe("The ID of the document to summarize."),
      maxLength: z.number().optional().describe("Maximum summary length in words."),
    },
    async ({ documentId, maxLength }) => {
      logger.info(`Summarizing document: ${documentId}, max length: ${maxLength || 'default'}`);

      try {
        // This is a placeholder implementation
        // In future stories, we'll implement actual document summarization logic

        // For now, return placeholder data based on documentId
        let response = "Document summary not available for the specified document.";

        if (documentId === "acme-settlement") {
          response = `
Document Summary: Settlement Agreement with Acme Corp

This settlement agreement between our client and Acme Corporation resolves the product liability litigation (case #CV-2023-1234). 

Key terms include:
- Settlement amount: $1.2 million paid in 3 installments (45, 90, and 180 days)
- Mutual non-disclosure covering all settlement terms and negotiations
- Complete mutual release of all current and future claims related to the incident
- Non-disparagement provisions with specific language about social media
- Acme's agreement to implement revised safety protocols within 60 days
- Joint press release with pre-approved language
- Dismissal of all pending litigation with prejudice within 14 days of signing

The agreement was executed on March 15, 2024, and the first payment of $400,000 was received on April 30, 2024. The second payment of $400,000 is due by July 15, 2024.
`;
        } else if (documentId === "employment-template") {
          response = `
Document Summary: Standard Employment Contract Template (v3.2)

This is our current standard employment contract template (last revised January 2024), used for all non-executive employee hiring.

Main provisions include:
- Employment terms: Establishes at-will employment status and reporting structure
- Compensation: Details base salary, bonus eligibility (if applicable), equity components, and payment schedule
- Benefits: Outlines health insurance, 401(k) matching, PTO policy (3 weeks + 10 holidays), and supplemental benefits
- IP assignment: Comprehensive assignment of all work product and innovations
- Confidentiality: Protects company information with 5-year post-employment term
- Non-solicitation: 12-month prohibition on soliciting employees or customers
- Dispute resolution: Mandatory arbitration with specified provider and cost-sharing
- Termination: Procedures for voluntary/involuntary termination and severance eligibility

Note that this template should be used with the supplemental state-specific addenda when hiring in CA, NY, MA, or WA due to specific state law requirements.
`;
        }

        // Create citation metadata for the document
        const citationMetadata = {
          query: `Document summary for ${documentId}`,
          document: {
            documentId: documentId,
            documentName: documentId === "acme-settlement" ? "Settlement Agreement with Acme Corp" :
                         (documentId === "employment-template" ? "Standard Employment Contract Template (v3.2)" : documentId),
            uri: `legal://documents/${documentId}`,
            relevance: 100,
            type: "legal_document",
            created: documentId === "acme-settlement" ? "2024-03-15" : "2024-01-01",
            category: documentId === "acme-settlement" ? "settlement" : "template"
          }
        };

        // Return the response and citation metadata as a CallToolResult
        return {
          content: [
            // Include the response as TextContent
            {
              type: "text",
              text: response
            },
            // Include citation metadata as structured data
            {
              type: "text",
              text: JSON.stringify(citationMetadata, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error("Error summarizing document:", error);
        return {
          content: [{ type: "text", text: "An error occurred while summarizing the document." }],
          isError: true,
        };
      }
    }
  );

  logger.info("Document analysis tools registered successfully");
}
