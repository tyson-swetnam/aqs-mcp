#!/usr/bin/env node
/**
 * EPA Air Quality System (AQS) MCP Server
 *
 * This MCP server provides access to the EPA AQS API for querying
 * air quality data, monitor information, and quality assurance data.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import all tool modules
import { signupTools } from './tools/signup.js';
import { listTools } from './tools/lists.js';
import { monitorTools } from './tools/monitors.js';
import { sampleDataTools } from './tools/samples.js';
import { dailyTools } from './tools/daily.js';
import { quarterlyTools } from './tools/quarterly.js';
import { annualTools } from './tools/annual.js';

// Combine all tools
const allTools = [
  ...signupTools,
  ...listTools,
  ...monitorTools,
  ...sampleDataTools,
  ...dailyTools,
  ...quarterlyTools,
  ...annualTools,
];

// Create a map for quick tool lookup
const toolMap = new Map(allTools.map(tool => [tool.name, tool]));

/**
 * Create and configure the MCP server
 */
async function main(): Promise<void> {
  const server = new Server(
    {
      name: 'aqs-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = toolMap.get(name);
    if (!tool) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
    }

    try {
      return await tool.handler(args as Record<string, string>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`[AQS MCP] Server started with ${allTools.length} tools`);
}

// Run the server
main().catch((error) => {
  console.error('[AQS MCP] Fatal error:', error);
  process.exit(1);
});
