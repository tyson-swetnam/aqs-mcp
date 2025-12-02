/**
 * MCP tools for EPA AQS Annual Summary Data
 *
 * Annual summaries provide yearly aggregated statistics including:
 * - Arithmetic mean and standard deviation
 * - Maximum values (1st through 4th)
 * - Percentiles (10th, 50th, 75th, 90th, 95th, 98th, 99th)
 * - Observation counts and data completeness
 * - Primary and secondary exceedance counts
 * - Exceptional data and null data counts
 */

import type { AnnualSummary } from '../types.js';
import {
  aqs,
  resolveCredentials,
  validateDateFormat,
  validateDateRange,
} from '../client.js';

/**
 * MCP Tool definition interface
 */
interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
  handler: (params: Record<string, string>) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }>;
}

/**
 * Common input schema properties for credentials
 */
const credentialProperties = {
  email: {
    type: 'string',
    description:
      'Email address registered with the AQS API. If not provided, uses AQS_EMAIL environment variable.',
  },
  key: {
    type: 'string',
    description:
      'API key for AQS access. If not provided, uses AQS_API_KEY environment variable.',
  },
};

/**
 * Common input schema properties for date range and parameter
 */
const dateRangeProperties = {
  param: {
    type: 'string',
    description:
      'Parameter code for the pollutant (e.g., "44201" for Ozone, "88101" for PM2.5, "42401" for SO2, "42101" for CO, "42602" for NO2, "81102" for PM10). Up to 5 comma-separated codes allowed.',
  },
  bdate: {
    type: 'string',
    description:
      'Begin date in YYYYMMDD format. Must be in the same calendar year as edate.',
  },
  edate: {
    type: 'string',
    description:
      'End date in YYYYMMDD format. Must be in the same calendar year as bdate.',
  },
};

/**
 * Helper function to format the API response as text
 */
function formatResponse(
  data: AnnualSummary[],
  rowCount: number | undefined
): string {
  if (!data || data.length === 0) {
    return 'No annual summary data found for the specified criteria.';
  }

  const summary = {
    recordCount: data.length,
    reportedRows: rowCount,
    data: data,
  };

  return JSON.stringify(summary, null, 2);
}

/**
 * Common handler logic for annual summary endpoints
 */
async function handleAnnualRequest(
  endpoint: string,
  params: Record<string, string>,
  locationParams: Record<string, string>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    // Resolve credentials
    const { email, key } = resolveCredentials(params.email, params.key);

    // Validate dates
    validateDateFormat(params.bdate, 'bdate');
    validateDateFormat(params.edate, 'edate');
    validateDateRange(params.bdate, params.edate);

    // Build request parameters
    const requestParams: Record<string, string> = {
      email,
      key,
      param: params.param,
      bdate: params.bdate,
      edate: params.edate,
      ...locationParams,
    };

    // Make API request
    const response = await aqs<AnnualSummary>(endpoint, requestParams);

    // Format and return response
    const text = formatResponse(response.Data, response.Header?.[0]?.rows);

    return {
      content: [{ type: 'text', text }],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
    };
  }
}

/**
 * Tool: Get annual summary data at a specific monitoring site
 */
const annualSummaryBySite: McpTool = {
  name: 'aqs_annual_summary_by_site',
  description:
    'Get annual summary data for a specific EPA air quality monitoring site. Annual summaries include yearly statistics such as arithmetic mean, standard deviation, maximum values, percentiles (10th through 99th), observation counts, data completeness metrics, and exceedance counts for primary and secondary NAAQS standards.',
  inputSchema: {
    type: 'object',
    properties: {
      ...credentialProperties,
      ...dateRangeProperties,
      state: {
        type: 'string',
        description:
          '2-digit FIPS state code (e.g., "06" for California, "36" for New York).',
      },
      county: {
        type: 'string',
        description:
          '3-digit FIPS county code (e.g., "037" for Los Angeles County).',
      },
      site: {
        type: 'string',
        description: '4-digit AQS site number within the county.',
      },
    },
    required: ['param', 'bdate', 'edate', 'state', 'county', 'site'],
  },
  handler: async (params) => {
    return handleAnnualRequest('annualData/bySite', params, {
      state: params.state,
      county: params.county,
      site: params.site,
    });
  },
};

/**
 * Tool: Get annual summary data for a county
 */
const annualSummaryByCounty: McpTool = {
  name: 'aqs_annual_summary_by_county',
  description:
    'Get annual summary data for all monitoring sites in a county. Annual summaries include yearly statistics such as arithmetic mean, standard deviation, maximum values, percentiles (10th through 99th), observation counts, data completeness metrics, and exceedance counts for primary and secondary NAAQS standards.',
  inputSchema: {
    type: 'object',
    properties: {
      ...credentialProperties,
      ...dateRangeProperties,
      state: {
        type: 'string',
        description:
          '2-digit FIPS state code (e.g., "06" for California, "36" for New York).',
      },
      county: {
        type: 'string',
        description:
          '3-digit FIPS county code (e.g., "037" for Los Angeles County).',
      },
    },
    required: ['param', 'bdate', 'edate', 'state', 'county'],
  },
  handler: async (params) => {
    return handleAnnualRequest('annualData/byCounty', params, {
      state: params.state,
      county: params.county,
    });
  },
};

/**
 * Tool: Get annual summary data for a state
 */
const annualSummaryByState: McpTool = {
  name: 'aqs_annual_summary_by_state',
  description:
    'Get annual summary data for all monitoring sites in a state. Annual summaries include yearly statistics such as arithmetic mean, standard deviation, maximum values, percentiles (10th through 99th), observation counts, data completeness metrics, and exceedance counts for primary and secondary NAAQS standards.',
  inputSchema: {
    type: 'object',
    properties: {
      ...credentialProperties,
      ...dateRangeProperties,
      state: {
        type: 'string',
        description:
          '2-digit FIPS state code (e.g., "06" for California, "36" for New York, "48" for Texas).',
      },
    },
    required: ['param', 'bdate', 'edate', 'state'],
  },
  handler: async (params) => {
    return handleAnnualRequest('annualData/byState', params, {
      state: params.state,
    });
  },
};

/**
 * Tool: Get annual summary data within a bounding box
 */
const annualSummaryByBox: McpTool = {
  name: 'aqs_annual_summary_by_box',
  description:
    'Get annual summary data for all monitoring sites within a geographic bounding box defined by latitude/longitude coordinates. Annual summaries include yearly statistics such as arithmetic mean, standard deviation, maximum values, percentiles (10th through 99th), observation counts, data completeness metrics, and exceedance counts for primary and secondary NAAQS standards.',
  inputSchema: {
    type: 'object',
    properties: {
      ...credentialProperties,
      ...dateRangeProperties,
      minlat: {
        type: 'string',
        description:
          'Minimum latitude of the bounding box in decimal degrees (e.g., "33.0").',
      },
      maxlat: {
        type: 'string',
        description:
          'Maximum latitude of the bounding box in decimal degrees (e.g., "34.5").',
      },
      minlon: {
        type: 'string',
        description:
          'Minimum longitude of the bounding box in decimal degrees. Use negative values for western hemisphere (e.g., "-118.5").',
      },
      maxlon: {
        type: 'string',
        description:
          'Maximum longitude of the bounding box in decimal degrees. Use negative values for western hemisphere (e.g., "-117.0").',
      },
    },
    required: [
      'param',
      'bdate',
      'edate',
      'minlat',
      'maxlat',
      'minlon',
      'maxlon',
    ],
  },
  handler: async (params) => {
    return handleAnnualRequest('annualData/byBox', params, {
      minlat: params.minlat,
      maxlat: params.maxlat,
      minlon: params.minlon,
      maxlon: params.maxlon,
    });
  },
};

/**
 * Tool: Get annual summary data for a Core Based Statistical Area (CBSA)
 */
const annualSummaryByCbsa: McpTool = {
  name: 'aqs_annual_summary_by_cbsa',
  description:
    'Get annual summary data for all monitoring sites within a Core Based Statistical Area (CBSA), which represents metropolitan and micropolitan statistical areas. Annual summaries include yearly statistics such as arithmetic mean, standard deviation, maximum values, percentiles (10th through 99th), observation counts, data completeness metrics, and exceedance counts for primary and secondary NAAQS standards.',
  inputSchema: {
    type: 'object',
    properties: {
      ...credentialProperties,
      ...dateRangeProperties,
      cbsa: {
        type: 'string',
        description:
          'Core Based Statistical Area code (e.g., "31080" for Los Angeles-Long Beach-Anaheim).',
      },
    },
    required: ['param', 'bdate', 'edate', 'cbsa'],
  },
  handler: async (params) => {
    return handleAnnualRequest('annualData/byCBSA', params, {
      cbsa: params.cbsa,
    });
  },
};

/**
 * Export all annual summary tools
 */
export const annualTools: McpTool[] = [
  annualSummaryBySite,
  annualSummaryByCounty,
  annualSummaryByState,
  annualSummaryByBox,
  annualSummaryByCbsa,
];

export default annualTools;
