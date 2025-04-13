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
 * Test script for query limit functionality
 *
 * This script tests the query limit functionality in the legalQuery tool.
 * It simulates multiple queries and verifies that the counter is incremented
 * and persisted correctly, and that queries are rejected after the limit is reached.
 */

import { existsSync } from "fs";
import { config } from "../config";
import { logger } from "../logger";

// File path for query counter data
const QUERY_COUNTER_FILE = "./query_counter.json";

// Function to read the current counter value from file
async function readCounterFile() {
  if (existsSync(QUERY_COUNTER_FILE)) {
    try {
      const data = await Bun.file(QUERY_COUNTER_FILE).text();
      // Clean the data to ensure it's valid JSON
      const cleanData = data.trim().replace(/[%\x00-\x1F\x7F-\x9F]/g, '');
      return JSON.parse(cleanData);
    } catch (error) {
      logger.error("Error parsing counter file:", error);
      return null;
    }
  }
  return null;
}

// Function to simulate a query
async function simulateQuery(queryText: string) {
  // Import dynamically to avoid circular dependencies
  const { registerLegalQueryTool } = await import("../tools/legalQuery");

  // Create a mock MCP server with a handler capture
  let capturedHandler: any = null;
  const mockServer = {
    tool: (_name: string, _description: string, _schema: any, handler: any) => {
      // Capture the handler
      capturedHandler = handler;
    }
  };

  // Register the tool which will capture the handler
  registerLegalQueryTool(mockServer as any);

  // Call the captured handler with the query
  if (typeof capturedHandler === 'function') {
    return await capturedHandler({ query: queryText });
  }

  throw new Error("Failed to capture handler function");
}

// Main test function
async function runTest() {
  logger.info("Starting query limit test");

  // Delete existing counter file to start fresh
  if (existsSync(QUERY_COUNTER_FILE)) {
    Bun.write(QUERY_COUNTER_FILE, "");
    logger.info("Deleted existing counter file");
  }

  // Run queries up to the limit
  const maxQueries = config.maxQueriesPerDay;
  logger.info(`Testing with max queries: ${maxQueries}`);

  for (let i = 1; i <= maxQueries + 1; i++) {
    logger.info(`Simulating query ${i}/${maxQueries + 1}`);

    const result = await simulateQuery(`Test query ${i}`);
    const counterData = await readCounterFile();

    if (i <= maxQueries) {
      // Should succeed
      if (result.isError) {
        logger.error(`Query ${i} failed unexpectedly: ${result.content[0].text}`);
      } else {
        logger.info(`Query ${i} succeeded as expected`);
      }

      // Check counter file
      if (counterData) {
        logger.info(`Counter file shows: ${counterData.count} queries on ${counterData.date}`);
        if (counterData.count !== i) {
          logger.error(`Counter mismatch: expected ${i}, got ${counterData.count}`);
        }
      } else {
        logger.error("Counter file not found or invalid");
      }
    } else {
      // Should fail (over limit)
      if (result.isError) {
        logger.info(`Query ${i} failed as expected (over limit): ${result.content[0].text}`);
      } else {
        logger.error(`Query ${i} succeeded unexpectedly despite being over limit`);
      }
    }
  }

  logger.info("Query limit test completed");
}

// Run the test
runTest().catch(error => {
  logger.error("Test failed with error:", error);
});
