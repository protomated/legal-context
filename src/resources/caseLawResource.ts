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
 * Case Law Resource
 *
 * This module implements MCP resources for accessing case law and precedents.
 * It provides access to legal precedents and case history.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../logger";

/**
 * Register case law resources with the MCP server
 */
export function registerCaseLawResources(server: McpServer): void {
  logger.info("Registering case law resources...");

  // Sample case law categories for placeholder implementation
  const caseLawCategories = [
    "data-privacy",
    "intellectual-property",
    "employment",
    "contracts",
    "corporate"
  ];

  // Register a case law categories resource that lists available categories
  server.resource(
    "case_law_categories - Browse available legal precedent categories",
    "legal://case-law",
    async (uri) => {
      logger.info(`Resource requested: ${uri.href}`);

      return {
        contents: [{
          uri: uri.href,
          text: `Available case law categories: ${caseLawCategories.join(", ")}`
        }]
      };
    }
  );

  // Register a dynamic resource for case law categories
  server.resource(
    "case_law_category - Access legal precedents from a specific category",
    new ResourceTemplate("legal://case-law/{category}", { list: async () => {
      return caseLawCategories.map(category => ({ href: `legal://case-law/${category}` }));
    }}),
    async (uri, { category }) => {
      logger.info(`Resource requested: ${uri.href} (category: ${category})`);

      // This is a placeholder implementation
      // In the future, this will query the actual case law from Clio or other sources

      let description = "Placeholder case law collection";

      // Customize description based on case law category
      switch (category) {
        case "data-privacy":
          description = `
            # Data Privacy Cases in Healthcare Sector
            
            ## Key Precedents:
            
            1. Smith v. Medical Systems Inc. (2023) - Established requirements for patient data handling
            2. Healthcare Analytics Partners v. FTC (2022) - Clarified scope of "de-identified" data
            3. Patient Rights Alliance v. Hospital Network (2021) - Set standards for consent mechanisms
            4. United States v. MedTech Solutions (2020) - Criminal penalties for data breaches
            5. HIPAA Compliance Board v. CloudMed (2023) - Cloud storage security requirements
          `;
          break;
        case "intellectual-property":
          description = `
            # Intellectual Property Dispute Precedents
            
            ## Notable Cases:
            
            1. TechInnovate v. GlobalSoft (2022) - Software patent infringement standards
            2. Creative Studios v. Content Aggregators (2021) - Digital content copyright protection
            3. BioResearch v. PharmaCorp (2023) - Pharmaceutical patent licensing disputes
            4. Design Elements v. UI Frameworks (2022) - UI/UX design patent scope
            5. TrademarkHolder v. Domain Registrars (2021) - Domain name trademark conflicts
          `;
          break;
        case "employment":
          description = `
            # Employment Law Cases
            
            ## Key Precedents:
            
            1. Employee Association v. Tech Conglomerate (2023) - Remote work classification
            2. Sales Representative v. Commission-Based Corp (2022) - Variable compensation disputes
            3. Executive v. Board of Directors (2021) - Severance obligations case
            4. Labor Union v. Manufacturing Inc (2022) - Workers' rights in automated environments
            5. Contractor Alliance v. Gig Economy Platform (2023) - Independent contractor classification
          `;
          break;
        case "contracts":
          description = `
            # Contract Law Precedents
            
            ## Notable Cases:
            
            1. SaaS Provider v. Enterprise Customer (2023) - Service level agreement enforcement
            2. Manufacturer v. Supply Chain Partner (2022) - Force majeure interpretation post-pandemic
            3. Consulting Firm v. Project Client (2021) - Scope creep and change order requirements
            4. Software Licensee v. Developer (2022) - Open source compliance requirements
            5. API Consumer v. Platform Provider (2023) - API terms of service modifications
          `;
          break;
        case "corporate":
          description = `
            # Corporate Law Cases
            
            ## Key Precedents:
            
            1. Minority Shareholders v. Board (2023) - Fiduciary duty in acquisition decisions
            2. Investment Group v. Startup Founders (2022) - Preferred stock rights interpretation
            3. Regulatory Authority v. Corporate Disclosures (2021) - Environmental reporting requirements
            4. Merger Partners v. Antitrust Commission (2022) - Market competition analysis standards
            5. Corporate Officers v. D&O Insurance (2023) - Coverage scope for data breach claims
          `;
          break;
        default:
          description = `Collection of ${category.replace(/-/g, " ")} legal precedents.`;
      }

      return {
        contents: [{
          uri: uri.href,
          text: description
        }]
      };
    }
  );

  // Register a specific resource for the Smith litigation
  server.resource(
    "smith_litigation - Smith v. Regional Distributor Inc. case analysis",
    "legal://case-law/precedents/smith-litigation",
    async (uri) => {
      logger.info(`Resource requested: ${uri.href}`);

      return {
        contents: [{
          uri: uri.href,
          text: `
            # Smith Litigation Case Analysis
            
            ## Case Background:
            Smith v. Regional Distributor Inc. involves breach of contract and misrepresentation claims.
            
            ## Previous Arguments:
            
            1. Statute of limitations defense successfully employed in similar cases
            2. Evidence of written modification to original agreement
            3. Industry standard practices around delivery timelines
            4. Documented communication showing implied acceptance of modified terms
            5. Precedent cases establishing burden of proof for misrepresentation claims
            6. Expert testimony on market conditions affecting performance capability
            
            ## Current Status:
            Case is in discovery phase with depositions scheduled for next month.
          `
        }]
      };
    }
  );

  logger.info("Case law resources registered successfully");
}
