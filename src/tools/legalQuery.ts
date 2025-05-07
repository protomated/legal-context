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
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */

/**
 * Legal Query Tool
 *
 * This module implements the MCP tool for handling legal queries.
 * It categorizes queries by type and provides appropriate responses.
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../logger";
import { config } from "../config";
import { existsSync } from "fs";
import { getLegalContextFilePath } from "../utils/paths";

// File path for storing query counter data in the .legalcontext directory
const QUERY_COUNTER_FILE = getLegalContextFilePath("query_counter.json");

// Daily query counter for free tier limitation
let queryCount = 0;
let queryDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

/**
 * Load query counter data from file
 */
function loadQueryCounter() {
  try {
    if (existsSync(QUERY_COUNTER_FILE)) {
      const data = Bun.file(QUERY_COUNTER_FILE);
      const counterData = JSON.parse(data.toString());
      queryCount = counterData.count || 0;
      queryDate = counterData.date || new Date().toISOString().split('T')[0];
      logger.debug(`Loaded query counter from file: ${queryCount} queries on ${queryDate}`);
    } else {
      logger.debug("No query counter file found, using default values");
    }
  } catch (error) {
    logger.error("Error loading query counter from file:", error);
    // Continue with default values if file can't be read
  }
}

/**
 * Save query counter data to file
 */
async function saveQueryCounter() {
  try {
    const counterData = {
      count: queryCount,
      date: queryDate
    };
    await Bun.write(QUERY_COUNTER_FILE, JSON.stringify(counterData, null, 2));
    logger.debug(`Saved query counter to file: ${queryCount} queries on ${queryDate}`);
  } catch (error) {
    logger.error("Error saving query counter to file:", error);
  }
}

// Initialize counter from file on module load
loadQueryCounter();

// Query type categories
type QueryCategory =
  | "document_summarization"
  | "legal_research"
  | "document_search"
  | "contract_analysis"
  | "legal_advice"
  | "unknown";

/**
 * Register the legal query tool with the MCP server
 */
export function registerLegalQueryTool(server: McpServer): void {
  logger.info("Registering legal query tool...");

  server.tool(
    "legal_query", // Tool name used by Claude
    "Process natural language legal queries and provide relevant information from the firm's legal knowledge base.",
    { // Input schema validation using Zod
      query: z.string().describe("The natural language legal query from the user."),
    },
    async ({ query }) => { // Handler function receiving validated arguments
      logger.info(`Received legal query: ${query}`);

      // Check and update daily query count for free tier limitation
      const today = new Date().toISOString().split('T')[0];
      if (today !== queryDate) {
        // Reset counter for new day
        queryCount = 0;
        queryDate = today;
        logger.debug("Reset daily query counter for new day");
      }

      // Check if we've exceeded the daily query limit
      if (queryCount >= config.maxQueriesPerDay) {
        logger.warn(`Daily query limit (${config.maxQueriesPerDay}) exceeded`);
        return {
          content: [{
            type: "text",
            text: `You have reached the daily limit of ${config.maxQueriesPerDay} queries for the free tier. Please try again tomorrow or upgrade to the premium version.`
          }],
          isError: true,
        };
      }

      // Increment query counter
      queryCount++;
      logger.debug(`Query count for today: ${queryCount}/${config.maxQueriesPerDay}`);

      try {
        // Categorize the query
        const category = categorizeQuery(query);
        logger.info(`Query categorized as: ${category}`);

        // Generate appropriate context based on query category
        const context = generateQueryContext(query, category);

        // Return the augmented context for Claude to respond to
        return {
          content: [{
            type: "text",
            text: context
          }]
        };
      } catch (error) {
        logger.error("Error processing legal query:", error);
        return {
          content: [{ type: "text", text: "An error occurred while processing your query." }],
          isError: true,
        };
      }
    }
  );

  logger.info("Legal query tool registered successfully");
}

/**
 * Categorize a legal query based on its content
 */
function categorizeQuery(query: string): QueryCategory {
  // Convert query to lowercase for easier matching
  const q = query.toLowerCase();

  // Document summarization
  if (
    q.includes("summarize") ||
    q.includes("summary") ||
    q.includes("key points") ||
    q.includes("main provisions") ||
    (q.includes("settlement agreement") && q.includes("acme corp")) ||
    (q.includes("employment contract") && q.includes("template"))
  ) {
    return "document_summarization";
  }

  // Legal research
  if (
    q.includes("precedent") ||
    q.includes("case") ||
    q.includes("research") ||
    q.includes("find relevant") ||
    (q.includes("data privacy") && q.includes("healthcare")) ||
    (q.includes("intellectual property") && q.includes("disputes"))
  ) {
    return "legal_research";
  }

  // Document search
  if (
    q.includes("find document") ||
    q.includes("search for") ||
    q.includes("locate") ||
    q.includes("find all") ||
    (q.includes("non-compete") && q.includes("drafted")) ||
    (q.includes("merger") && q.includes("acquisition"))
  ) {
    return "document_search";
  }

  // Contract analysis
  if (
    q.includes("analyze") ||
    q.includes("analysis") ||
    q.includes("review") ||
    q.includes("risk") ||
    q.includes("clause") ||
    (q.includes("software licensing") && q.includes("agreements")) ||
    (q.includes("johnson contract") && q.includes("risk"))
  ) {
    return "contract_analysis";
  }

  // Legal advice
  if (
    q.includes("advice") ||
    q.includes("prepare") ||
    q.includes("argument") ||
    q.includes("strategy") ||
    q.includes("approach") ||
    (q.includes("arguments") && q.includes("smith litigation")) ||
    (q.includes("documentation") && q.includes("trademark registration"))
  ) {
    return "legal_advice";
  }

  // Default case
  return "unknown";
}

/**
 * Generate appropriate context for a query based on its category
 */
function generateQueryContext(query: string, category: QueryCategory): string {
  // Base prompt template
  let prompt = `
Based on the relevant legal documents and resources available in the firm's knowledge base, please ${getActionVerb(category)} the following query:

USER QUERY:
${query}

APPLICABLE CONTEXT:
`;

  // Add category-specific context
  switch (category) {
    case "document_summarization":
      // Check for specific document references
      if (query.toLowerCase().includes("acme corp") && query.toLowerCase().includes("settlement")) {
        prompt += `
This request relates to the Settlement Agreement with Acme Corp. The agreement contains the following key points:

1. Settlement amount of $1.2 million to be paid in 3 installments
2. Non-disclosure agreement covering all settlement terms
3. Mutual release of all claims
4. Non-disparagement clause for both parties  
5. Implementation of new safety protocols by Acme Corp
6. Cooperation on joint press statement
7. Dismissal of all pending litigation with prejudice

SOURCE: legal://documents/settlement-agreements/acme-corp
`;
      } else if (query.toLowerCase().includes("employment contract") && query.toLowerCase().includes("template")) {
        prompt += `
This request relates to our standard Employment Contract Template. The template contains these main provisions:

1. Employment terms (at-will employment status)
2. Compensation structure (salary, bonus, equity)
3. Benefits package (health insurance, retirement, PTO)
4. Intellectual property assignment
5. Confidentiality requirements
6. Non-solicitation of employees or customers
7. Dispute resolution process (arbitration)
8. Termination conditions and severance

SOURCE: legal://documents/employment-contracts/template
`;
      } else {
        prompt += `
This is a document summarization request. In a full implementation, LegalContext would retrieve the relevant document from the Clio document management system and provide it as context here. For now, this is a placeholder response.

Please note that the free tier is limited to ${config.maxQueriesPerDay} queries per day and ${config.maxDocuments} indexed documents. Current query count: ${queryCount}/${config.maxQueriesPerDay}.
`;
      }
      break;

    case "legal_research":
      // Check for specific research topics
      if (query.toLowerCase().includes("data privacy") && query.toLowerCase().includes("healthcare")) {
        prompt += `
This request relates to data privacy cases in the healthcare sector. Our firm has handled several relevant cases:

1. Smith v. Medical Systems Inc. (2023) - Established requirements for patient data handling
2. Healthcare Analytics Partners v. FTC (2022) - Clarified scope of "de-identified" data
3. Patient Rights Alliance v. Hospital Network (2021) - Set standards for consent mechanisms
4. United States v. MedTech Solutions (2020) - Criminal penalties for data breaches
5. HIPAA Compliance Board v. CloudMed (2023) - Cloud storage security requirements

SOURCE: legal://case-law/data-privacy
`;
      } else if (query.toLowerCase().includes("intellectual property") && query.toLowerCase().includes("disputes")) {
        prompt += `
This request relates to intellectual property dispute cases. Our firm has the following relevant precedents:

1. TechInnovate v. GlobalSoft (2022) - Software patent infringement standards
2. Creative Studios v. Content Aggregators (2021) - Digital content copyright protection
3. BioResearch v. PharmaCorp (2023) - Pharmaceutical patent licensing disputes
4. Design Elements v. UI Frameworks (2022) - UI/UX design patent scope
5. TrademarkHolder v. Domain Registrars (2021) - Domain name trademark conflicts

SOURCE: legal://case-law/intellectual-property
`;
      } else {
        prompt += `
This is a legal research request. In a full implementation, LegalContext would search through your firm's case database and precedent library to provide relevant cases and legal analyses as context here. For now, this is a placeholder response.

Please note that the free tier is limited to ${config.maxQueriesPerDay} queries per day. Current query count: ${queryCount}/${config.maxQueriesPerDay}.
`;
      }
      break;

    case "document_search":
      if (query.toLowerCase().includes("non-compete")) {
        prompt += `
This request relates to non-compete agreements. The firm has drafted several such agreements in the last year, including:

1. TechCorp Senior Executive Agreement (May 2024)
2. SalesForce Regional Manager Contract (March 2024)
3. BioResearch Scientist Employment Terms (January 2024)
4. Consulting Firm Partner Agreement (November 2023)
5. Healthcare Administrator Contract (August 2023)

SOURCE: legal://documents/non-compete-agreements
`;
      } else if (query.toLowerCase().includes("merger") && (query.toLowerCase().includes("acquisition") || query.toLowerCase().includes("acquisitions"))) {
        prompt += `
This request relates to merger and acquisition contracts with technology companies. The firm has the following M&A contracts in its repository:

1. TechStart Acquisition by MegaCorp (April 2024)
2. Cloud Services Merger Agreement (February 2024)
3. FinTech Platform Acquisition Terms (December 2023)
4. Hardware Manufacturer Merger Documents (October 2023)
5. SaaS Provider Acquisition Agreement (August 2023)

SOURCE: legal://documents/merger-acquisitions
`;
      } else {
        prompt += `
This is a document search request. In a full implementation, LegalContext would search through your Clio document management system to find relevant documents matching these criteria. For now, this is a placeholder response.

Please note that the free tier is limited to ${config.maxQueriesPerDay} queries per day and ${config.maxDocuments} indexed documents. Current query count: ${queryCount}/${config.maxQueriesPerDay}.
`;
      }
      break;

    case "contract_analysis":
      if (query.toLowerCase().includes("software licensing")) {
        prompt += `
This request relates to software licensing agreements. Common clauses in our software licensing agreements include:

1. License grant scope (user limits, subsidiaries, etc.)
2. Usage restrictions (no reverse engineering, etc.)
3. Intellectual property ownership provisions
4. Service Level Agreements (SLAs) with uptime guarantees
5. Limited warranty and disclaimer of implied warranties
6. Limitation of liability with liability caps
7. Indemnification for IP infringement claims
8. Term and termination rights
9. Data security and privacy obligations
10. Governing law and dispute resolution

SOURCE: legal://documents/software-licensing
`;
      } else if (query.toLowerCase().includes("johnson contract") && query.toLowerCase().includes("risk")) {
        prompt += `
This request relates to the Johnson Service Agreement. Analysis of the risks in this contract reveals:

1. Service scope with ambiguous deliverables timeline
2. Payment terms with net-60 instead of standard net-30
3. Limited liability cap at fee amount only
4. Broad indemnification requirements for our client
5. Unilateral termination rights for Johnson Corp
6. Inconsistent governing law provisions
7. Missing confidentiality provisions for shared IP
8. Automatic renewal without notification period

SOURCE: legal://documents/client-contracts/johnson
`;
      } else {
        prompt += `
This is a contract analysis request. In a full implementation, LegalContext would retrieve the specific contract from your Clio document management system and analyze its clauses, terms, and potential risks. For now, this is a placeholder response.

Please note that the free tier is limited to ${config.maxQueriesPerDay} queries per day. Current query count: ${queryCount}/${config.maxQueriesPerDay}.
`;
      }
      break;

    case "legal_advice":
      if (query.toLowerCase().includes("smith litigation")) {
        prompt += `
This request relates to the Smith litigation case. Based on our previous cases, successful arguments have included:

1. Statute of limitations defense successfully employed in similar cases
2. Evidence of written modification to original agreement
3. Industry standard practices around delivery timelines
4. Documented communication showing implied acceptance of modified terms
5. Precedent cases establishing burden of proof for misrepresentation claims
6. Expert testimony on market conditions affecting performance capability

SOURCE: legal://case-law/precedents/smith-litigation
`;
      } else if (query.toLowerCase().includes("trademark registration")) {
        prompt += `
This request relates to trademark registration documentation requirements. Typical documentation we require from clients includes:

1. Clear specimen showing trademark in use in commerce
2. Description of all goods/services covered by the mark
3. Date of first use in commerce (with supporting evidence)
4. Signed declaration of ownership and good faith belief in rights
5. Results of preliminary trademark search
6. Identification of any potential conflicts or similar marks
7. Entity formation documents (if registering as a business)
8. Foreign registration documents (if claiming priority)

SOURCE: legal://documents/client-documentation
`;
      } else {
        prompt += `
This is a legal advice preparation request. In a full implementation, LegalContext would search through your case history, document templates, and legal research to help prepare advice for this specific situation. For now, this is a placeholder response.

Please note that the free tier is limited to ${config.maxQueriesPerDay} queries per day. Current query count: ${queryCount}/${config.maxQueriesPerDay}.
`;
      }
      break;

    case "unknown":
    default:
      prompt += `
The query type could not be specifically categorized. In a full implementation, LegalContext would perform a general search across all document categories and legal resources. For now, this is a placeholder response.

Please note that the free tier is limited to ${config.maxQueriesPerDay} queries per day. Current query count: ${queryCount}/${config.maxQueriesPerDay}.
`;
      break;
  }

  // Add citation information for Claude
  prompt += `

CITATION INFORMATION:
When responding, please cite any documents or cases referenced using the SOURCE information provided.
`;

  return prompt;
}

/**
 * Get an appropriate action verb for the query category
 */
function getActionVerb(category: QueryCategory): string {
  switch (category) {
    case "document_summarization":
      return "summarize and explain";
    case "legal_research":
      return "research and report on";
    case "document_search":
      return "find and list documents relevant to";
    case "contract_analysis":
      return "analyze and evaluate";
    case "legal_advice":
      return "provide informed insights on";
    case "unknown":
    default:
      return "respond to";
  }
}
