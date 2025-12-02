/**
 * Sample Data Tools for EPA AQS API
 *
 * These tools provide access to raw sample data from air quality monitors.
 * WARNING: Sample data queries can return very large datasets. It is strongly
 * recommended to limit date ranges (e.g., one week or one month) to avoid
 * timeouts and excessive data transfer.
 */

import {
  aqs,
  resolveCredentials,
  validateDateFormat,
  validateDateRange,
} from '../client.js';
import type { SampleData } from '../types.js';

/**
 * Tool definition interface matching MCP specification
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
 * Common input schema properties for authentication
 */
const authProperties = {
  email: {
    type: 'string',
    description:
      'Email address for API authentication. Optional if AQS_EMAIL environment variable is set.',
  },
  key: {
    type: 'string',
    description:
      'API key for authentication. Optional if AQS_API_KEY environment variable is set.',
  },
};

/**
 * Common input schema properties for date range
 */
const dateProperties = {
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
 * Common input schema properties for parameter
 */
const paramProperty = {
  param: {
    type: 'string',
    description:
      'Parameter code (e.g., 44201 for Ozone, 88101 for PM2.5, 42401 for SO2, 42101 for CO, 42602 for NO2, 81102 for PM10).',
  },
};

/**
 * Common input schema properties for state
 */
const stateProperty = {
  state: {
    type: 'string',
    description: 'Two-digit FIPS state code (e.g., "06" for California, "36" for New York).',
  },
};

/**
 * Common input schema properties for county
 */
const countyProperty = {
  county: {
    type: 'string',
    description: 'Three-digit FIPS county code (e.g., "037" for Los Angeles County).',
  },
};

/**
 * Common input schema properties for site
 */
const siteProperty = {
  site: {
    type: 'string',
    description: 'Four-digit site code identifying the specific monitoring location.',
  },
};

/**
 * Common input schema properties for bounding box
 */
const boxProperties = {
  minlat: {
    type: 'string',
    description: 'Minimum latitude of bounding box (decimal degrees, e.g., "33.0").',
  },
  maxlat: {
    type: 'string',
    description: 'Maximum latitude of bounding box (decimal degrees, e.g., "34.5").',
  },
  minlon: {
    type: 'string',
    description: 'Minimum longitude of bounding box (decimal degrees, e.g., "-118.5").',
  },
  maxlon: {
    type: 'string',
    description: 'Maximum longitude of bounding box (decimal degrees, e.g., "-117.0").',
  },
};

/**
 * Common input schema properties for CBSA
 */
const cbsaProperty = {
  cbsa: {
    type: 'string',
    description:
      'Core Based Statistical Area code (e.g., "31080" for Los Angeles-Long Beach-Anaheim).',
  },
};

/**
 * Format sample data response for output
 */
function formatSampleDataResponse(data: SampleData[], endpoint: string): string {
  if (!data || data.length === 0) {
    return JSON.stringify({
      message: 'No sample data found for the specified parameters.',
      endpoint,
      count: 0,
    });
  }

  return JSON.stringify({
    message: `Retrieved ${data.length} sample data records.`,
    endpoint,
    count: data.length,
    data,
  });
}

/**
 * Tool: Get sample data by site
 */
const sampleDataBySite: McpTool = {
  name: 'aqs_sample_data_by_site',
  description:
    'Get raw sample data for a specific monitoring site. ' +
    'WARNING: Sample data can be very large. Strongly recommend limiting date ranges to one week or one month. ' +
    'Returns individual sample measurements including time, value, units, and quality flags.',
  inputSchema: {
    type: 'object',
    properties: {
      ...authProperties,
      ...paramProperty,
      ...dateProperties,
      ...stateProperty,
      ...countyProperty,
      ...siteProperty,
    },
    required: ['param', 'bdate', 'edate', 'state', 'county', 'site'],
  },
  handler: async (params: Record<string, string>) => {
    const { email, key } = resolveCredentials(params.email, params.key);

    validateDateFormat(params.bdate, 'bdate');
    validateDateFormat(params.edate, 'edate');
    validateDateRange(params.bdate, params.edate);

    const response = await aqs<SampleData>('sampleData/bySite', {
      email,
      key,
      param: params.param,
      bdate: params.bdate,
      edate: params.edate,
      state: params.state,
      county: params.county,
      site: params.site,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: formatSampleDataResponse(response.Data, 'sampleData/bySite'),
        },
      ],
    };
  },
};

/**
 * Tool: Get sample data by county
 */
const sampleDataByCounty: McpTool = {
  name: 'aqs_sample_data_by_county',
  description:
    'Get raw sample data for all monitoring sites in a county. ' +
    'WARNING: Sample data can be very large. Strongly recommend limiting date ranges to one week or one month. ' +
    'Returns individual sample measurements from all sites in the specified county.',
  inputSchema: {
    type: 'object',
    properties: {
      ...authProperties,
      ...paramProperty,
      ...dateProperties,
      ...stateProperty,
      ...countyProperty,
    },
    required: ['param', 'bdate', 'edate', 'state', 'county'],
  },
  handler: async (params: Record<string, string>) => {
    const { email, key } = resolveCredentials(params.email, params.key);

    validateDateFormat(params.bdate, 'bdate');
    validateDateFormat(params.edate, 'edate');
    validateDateRange(params.bdate, params.edate);

    const response = await aqs<SampleData>('sampleData/byCounty', {
      email,
      key,
      param: params.param,
      bdate: params.bdate,
      edate: params.edate,
      state: params.state,
      county: params.county,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: formatSampleDataResponse(response.Data, 'sampleData/byCounty'),
        },
      ],
    };
  },
};

/**
 * Tool: Get sample data by state
 */
const sampleDataByState: McpTool = {
  name: 'aqs_sample_data_by_state',
  description:
    'Get raw sample data for all monitoring sites in a state. ' +
    'WARNING: Sample data can be EXTREMELY large for state-level queries. ' +
    'Strongly recommend limiting date ranges to one week or less. ' +
    'Returns individual sample measurements from all sites in the specified state.',
  inputSchema: {
    type: 'object',
    properties: {
      ...authProperties,
      ...paramProperty,
      ...dateProperties,
      ...stateProperty,
    },
    required: ['param', 'bdate', 'edate', 'state'],
  },
  handler: async (params: Record<string, string>) => {
    const { email, key } = resolveCredentials(params.email, params.key);

    validateDateFormat(params.bdate, 'bdate');
    validateDateFormat(params.edate, 'edate');
    validateDateRange(params.bdate, params.edate);

    const response = await aqs<SampleData>('sampleData/byState', {
      email,
      key,
      param: params.param,
      bdate: params.bdate,
      edate: params.edate,
      state: params.state,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: formatSampleDataResponse(response.Data, 'sampleData/byState'),
        },
      ],
    };
  },
};

/**
 * Tool: Get sample data by bounding box
 */
const sampleDataByBox: McpTool = {
  name: 'aqs_sample_data_by_box',
  description:
    'Get raw sample data for all monitoring sites within a geographic bounding box. ' +
    'WARNING: Sample data can be very large depending on box size. ' +
    'Strongly recommend limiting date ranges to one week or one month. ' +
    'Returns individual sample measurements from all sites within the specified coordinates.',
  inputSchema: {
    type: 'object',
    properties: {
      ...authProperties,
      ...paramProperty,
      ...dateProperties,
      ...boxProperties,
    },
    required: ['param', 'bdate', 'edate', 'minlat', 'maxlat', 'minlon', 'maxlon'],
  },
  handler: async (params: Record<string, string>) => {
    const { email, key } = resolveCredentials(params.email, params.key);

    validateDateFormat(params.bdate, 'bdate');
    validateDateFormat(params.edate, 'edate');
    validateDateRange(params.bdate, params.edate);

    const response = await aqs<SampleData>('sampleData/byBox', {
      email,
      key,
      param: params.param,
      bdate: params.bdate,
      edate: params.edate,
      minlat: params.minlat,
      maxlat: params.maxlat,
      minlon: params.minlon,
      maxlon: params.maxlon,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: formatSampleDataResponse(response.Data, 'sampleData/byBox'),
        },
      ],
    };
  },
};

/**
 * Tool: Get sample data by CBSA
 */
const sampleDataByCbsa: McpTool = {
  name: 'aqs_sample_data_by_cbsa',
  description:
    'Get raw sample data for all monitoring sites in a Core Based Statistical Area (CBSA). ' +
    'WARNING: Sample data can be very large for metropolitan areas. ' +
    'Strongly recommend limiting date ranges to one week or one month. ' +
    'Returns individual sample measurements from all sites in the specified CBSA.',
  inputSchema: {
    type: 'object',
    properties: {
      ...authProperties,
      ...paramProperty,
      ...dateProperties,
      ...cbsaProperty,
    },
    required: ['param', 'bdate', 'edate', 'cbsa'],
  },
  handler: async (params: Record<string, string>) => {
    const { email, key } = resolveCredentials(params.email, params.key);

    validateDateFormat(params.bdate, 'bdate');
    validateDateFormat(params.edate, 'edate');
    validateDateRange(params.bdate, params.edate);

    const response = await aqs<SampleData>('sampleData/byCBSA', {
      email,
      key,
      param: params.param,
      bdate: params.bdate,
      edate: params.edate,
      cbsa: params.cbsa,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: formatSampleDataResponse(response.Data, 'sampleData/byCBSA'),
        },
      ],
    };
  },
};

/**
 * Export all sample data tools
 */
export const sampleDataTools: McpTool[] = [
  sampleDataBySite,
  sampleDataByCounty,
  sampleDataByState,
  sampleDataByBox,
  sampleDataByCbsa,
];

export default sampleDataTools;
