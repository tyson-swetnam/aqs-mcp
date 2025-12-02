/**
 * MCP Tools for EPA AQS API Reference Data (List Endpoints)
 *
 * These tools provide access to reference data for looking up
 * state codes, county codes, monitoring sites, CBSAs, and parameters.
 */

import { aqs, resolveCredentials } from '../client.js';
import type { State, County, Site, Cbsa, ParameterClass, Parameter } from '../types.js';

/**
 * Tool definition type for MCP
 */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required?: string[];
  };
  handler: (args: Record<string, string>) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }>;
}

/**
 * Helper to format API response as text content
 */
function formatResponse<T>(data: T[]): { content: Array<{ type: 'text'; text: string }> } {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Tool: aqs_list_states
 * Get all US state FIPS codes
 */
const listStatesTool: McpTool = {
  name: 'aqs_list_states',
  description:
    'Get a list of all US states with their 2-digit FIPS codes. ' +
    'Use this to look up state codes for other AQS API queries. ' +
    'Example: California = "06", Texas = "48", New York = "36".',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Registered email address for AQS API. Optional if AQS_EMAIL env var is set.',
      },
      key: {
        type: 'string',
        description: 'AQS API key. Optional if AQS_API_KEY env var is set.',
      },
    },
  },
  handler: async (args) => {
    const { email, key } = resolveCredentials(args.email, args.key);
    const response = await aqs<State>('list/states', { email, key });
    return formatResponse(response.Data);
  },
};

/**
 * Tool: aqs_list_counties
 * Get counties within a state
 */
const listCountiesTool: McpTool = {
  name: 'aqs_list_counties',
  description:
    'Get a list of counties within a state with their 3-digit FIPS codes. ' +
    'Use this to look up county codes for county-level AQS API queries. ' +
    'Example: Los Angeles County, CA = "037", Harris County, TX = "201".',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Registered email address for AQS API. Optional if AQS_EMAIL env var is set.',
      },
      key: {
        type: 'string',
        description: 'AQS API key. Optional if AQS_API_KEY env var is set.',
      },
      state: {
        type: 'string',
        description: '2-digit FIPS state code (e.g., "06" for California, "48" for Texas).',
      },
    },
    required: ['state'],
  },
  handler: async (args) => {
    const { email, key } = resolveCredentials(args.email, args.key);
    const response = await aqs<County>('list/countiesByState', {
      email,
      key,
      state: args.state,
    });
    return formatResponse(response.Data);
  },
};

/**
 * Tool: aqs_list_sites
 * Get monitoring sites within a county
 */
const listSitesTool: McpTool = {
  name: 'aqs_list_sites',
  description:
    'Get a list of air quality monitoring sites within a county with their 4-digit site codes. ' +
    'Use this to look up site codes for site-level AQS API queries. ' +
    'Requires both state and county codes.',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Registered email address for AQS API. Optional if AQS_EMAIL env var is set.',
      },
      key: {
        type: 'string',
        description: 'AQS API key. Optional if AQS_API_KEY env var is set.',
      },
      state: {
        type: 'string',
        description: '2-digit FIPS state code (e.g., "06" for California).',
      },
      county: {
        type: 'string',
        description: '3-digit FIPS county code (e.g., "037" for Los Angeles County).',
      },
    },
    required: ['state', 'county'],
  },
  handler: async (args) => {
    const { email, key } = resolveCredentials(args.email, args.key);
    const response = await aqs<Site>('list/sitesByCounty', {
      email,
      key,
      state: args.state,
      county: args.county,
    });
    return formatResponse(response.Data);
  },
};

/**
 * Tool: aqs_list_cbsas
 * Get Core Based Statistical Areas
 */
const listCbsasTool: McpTool = {
  name: 'aqs_list_cbsas',
  description:
    'Get a list of Core Based Statistical Areas (CBSAs) with their codes. ' +
    'CBSAs are metropolitan and micropolitan statistical areas defined by the US Census. ' +
    'Use CBSA codes for regional air quality queries. ' +
    'Example: Los Angeles-Long Beach-Anaheim = "31080", New York-Newark-Jersey City = "35620".',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Registered email address for AQS API. Optional if AQS_EMAIL env var is set.',
      },
      key: {
        type: 'string',
        description: 'AQS API key. Optional if AQS_API_KEY env var is set.',
      },
    },
  },
  handler: async (args) => {
    const { email, key } = resolveCredentials(args.email, args.key);
    const response = await aqs<Cbsa>('list/cbsas', { email, key });
    return formatResponse(response.Data);
  },
};

/**
 * Tool: aqs_list_parameter_classes
 * Get parameter classification groups
 */
const listParameterClassesTool: McpTool = {
  name: 'aqs_list_parameter_classes',
  description:
    'Get a list of parameter classification groups (e.g., "CRITERIA", "AIR TOXICS", "METEOROLOGICAL"). ' +
    'Use the class name to query parameters within that class using aqs_list_parameters. ' +
    'Common classes: CRITERIA (criteria pollutants like ozone, PM2.5), ' +
    'AIR TOXICS (hazardous air pollutants), METEOROLOGICAL (weather data).',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Registered email address for AQS API. Optional if AQS_EMAIL env var is set.',
      },
      key: {
        type: 'string',
        description: 'AQS API key. Optional if AQS_API_KEY env var is set.',
      },
    },
  },
  handler: async (args) => {
    const { email, key } = resolveCredentials(args.email, args.key);
    const response = await aqs<ParameterClass>('list/classes', { email, key });
    return formatResponse(response.Data);
  },
};

/**
 * Tool: aqs_list_parameters
 * Get parameters within a class
 */
const listParametersTool: McpTool = {
  name: 'aqs_list_parameters',
  description:
    'Get a list of parameters (pollutants/measurements) within a parameter class. ' +
    'Returns parameter codes and names. Use these codes in data queries. ' +
    'Common parameter codes: 44201 (Ozone), 88101 (PM2.5 Local), 81102 (PM10), ' +
    '42401 (SO2), 42101 (CO), 42602 (NO2). ' +
    'Use aqs_list_parameter_classes first to get available class names.',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Registered email address for AQS API. Optional if AQS_EMAIL env var is set.',
      },
      key: {
        type: 'string',
        description: 'AQS API key. Optional if AQS_API_KEY env var is set.',
      },
      pc: {
        type: 'string',
        description:
          'Parameter class name (e.g., "CRITERIA", "AIR TOXICS", "METEOROLOGICAL"). ' +
          'Use aqs_list_parameter_classes to get available classes.',
      },
    },
    required: ['pc'],
  },
  handler: async (args) => {
    const { email, key } = resolveCredentials(args.email, args.key);
    const response = await aqs<Parameter>('list/parametersByClass', {
      email,
      key,
      pc: args.pc,
    });
    return formatResponse(response.Data);
  },
};

/**
 * Export all list tools as an array
 */
export const listTools: McpTool[] = [
  listStatesTool,
  listCountiesTool,
  listSitesTool,
  listCbsasTool,
  listParameterClassesTool,
  listParametersTool,
];

export default listTools;
