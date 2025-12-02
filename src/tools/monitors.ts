/**
 * MCP Tools for EPA AQS API Monitor Queries
 *
 * Provides tools to query air quality monitoring station information
 * by various geographic filters (site, county, state, bounding box, CBSA).
 */

import {
  aqs,
  resolveCredentials,
  validateDateFormat,
  validateDateRange,
} from '../client.js';
import type { Monitor } from '../types.js';

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
  handler: (args: Record<string, unknown>) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }>;
}

/**
 * Format monitor response for MCP output
 */
function formatMonitorResponse(monitors: Monitor[], endpoint: string): string {
  if (monitors.length === 0) {
    return JSON.stringify({
      message: 'No monitors found matching the specified criteria.',
      endpoint,
      count: 0,
    }, null, 2);
  }

  return JSON.stringify({
    endpoint,
    count: monitors.length,
    monitors: monitors.map(m => ({
      state_code: m.state_code,
      county_code: m.county_code,
      site_number: m.site_number,
      parameter_code: m.parameter_code,
      parameter_name: m.parameter_name,
      poc: m.poc,
      latitude: m.latitude,
      longitude: m.longitude,
      first_year_of_data: m.first_year_of_data,
      last_sample_date: m.last_sample_date,
      local_site_name: m.local_site_name,
      city_name: m.city_name,
      cbsa_name: m.cbsa_name,
      measurement_scale: m.measurement_scale,
      monitoring_objective: m.monitoring_objective,
      networks: m.networks,
    })),
  }, null, 2);
}

/**
 * Tool: Get monitors at a specific site
 */
const monitorsBySite: McpTool = {
  name: 'aqs_monitors_by_site',
  description: `Get air quality monitors at a specific monitoring site. Returns detailed information about monitors including location, operational dates, and measurement parameters.

Parameters:
- param: 5-digit AQS parameter code for the pollutant. Common codes:
  - 44201: Ozone (O3)
  - 88101: PM2.5 (Fine Particulate Matter, Local Conditions)
  - 81102: PM10 (Particulate Matter)
  - 42401: Sulfur Dioxide (SO2)
  - 42101: Carbon Monoxide (CO)
  - 42602: Nitrogen Dioxide (NO2)
- bdate/edate: Begin and end dates in YYYYMMDD format (must be same calendar year)
- state: 2-digit FIPS state code (e.g., '06' for California, '36' for New York)
- county: 3-digit FIPS county code (e.g., '037' for Los Angeles County)
- site: 4-digit AQS site number

Note: Email and API key can be provided or will use AQS_EMAIL/AQS_API_KEY environment variables.`,
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email address for API authentication (optional if AQS_EMAIL env var is set)',
      },
      key: {
        type: 'string',
        description: 'API key for authentication (optional if AQS_API_KEY env var is set)',
      },
      param: {
        type: 'string',
        description: '5-digit AQS parameter code (e.g., 44201 for Ozone)',
      },
      bdate: {
        type: 'string',
        description: 'Begin date in YYYYMMDD format',
      },
      edate: {
        type: 'string',
        description: 'End date in YYYYMMDD format (must be same calendar year as bdate)',
      },
      state: {
        type: 'string',
        description: '2-digit FIPS state code (e.g., 06 for California)',
      },
      county: {
        type: 'string',
        description: '3-digit FIPS county code (e.g., 037 for Los Angeles)',
      },
      site: {
        type: 'string',
        description: '4-digit AQS site number',
      },
    },
    required: ['param', 'bdate', 'edate', 'state', 'county', 'site'],
  },
  handler: async (args) => {
    try {
      const { email, key } = resolveCredentials(
        args.email as string | undefined,
        args.key as string | undefined
      );

      const bdate = args.bdate as string;
      const edate = args.edate as string;

      validateDateFormat(bdate, 'bdate');
      validateDateFormat(edate, 'edate');
      validateDateRange(bdate, edate);

      const response = await aqs<Monitor>('monitors/bySite', {
        email,
        key,
        param: args.param as string,
        bdate,
        edate,
        state: args.state as string,
        county: args.county as string,
        site: args.site as string,
      });

      return {
        content: [{
          type: 'text',
          text: formatMonitorResponse(response.Data, 'monitors/bySite'),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: message }, null, 2),
        }],
      };
    }
  },
};

/**
 * Tool: Get monitors in a county
 */
const monitorsByCounty: McpTool = {
  name: 'aqs_monitors_by_county',
  description: `Get all air quality monitors in a county. Returns detailed information about monitors including location, operational dates, and measurement parameters.

Parameters:
- param: 5-digit AQS parameter code for the pollutant. Common codes:
  - 44201: Ozone (O3)
  - 88101: PM2.5 (Fine Particulate Matter, Local Conditions)
  - 81102: PM10 (Particulate Matter)
  - 42401: Sulfur Dioxide (SO2)
  - 42101: Carbon Monoxide (CO)
  - 42602: Nitrogen Dioxide (NO2)
- bdate/edate: Begin and end dates in YYYYMMDD format (must be same calendar year)
- state: 2-digit FIPS state code (e.g., '06' for California, '36' for New York)
- county: 3-digit FIPS county code (e.g., '037' for Los Angeles County)

Note: Email and API key can be provided or will use AQS_EMAIL/AQS_API_KEY environment variables.`,
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email address for API authentication (optional if AQS_EMAIL env var is set)',
      },
      key: {
        type: 'string',
        description: 'API key for authentication (optional if AQS_API_KEY env var is set)',
      },
      param: {
        type: 'string',
        description: '5-digit AQS parameter code (e.g., 44201 for Ozone)',
      },
      bdate: {
        type: 'string',
        description: 'Begin date in YYYYMMDD format',
      },
      edate: {
        type: 'string',
        description: 'End date in YYYYMMDD format (must be same calendar year as bdate)',
      },
      state: {
        type: 'string',
        description: '2-digit FIPS state code (e.g., 06 for California)',
      },
      county: {
        type: 'string',
        description: '3-digit FIPS county code (e.g., 037 for Los Angeles)',
      },
    },
    required: ['param', 'bdate', 'edate', 'state', 'county'],
  },
  handler: async (args) => {
    try {
      const { email, key } = resolveCredentials(
        args.email as string | undefined,
        args.key as string | undefined
      );

      const bdate = args.bdate as string;
      const edate = args.edate as string;

      validateDateFormat(bdate, 'bdate');
      validateDateFormat(edate, 'edate');
      validateDateRange(bdate, edate);

      const response = await aqs<Monitor>('monitors/byCounty', {
        email,
        key,
        param: args.param as string,
        bdate,
        edate,
        state: args.state as string,
        county: args.county as string,
      });

      return {
        content: [{
          type: 'text',
          text: formatMonitorResponse(response.Data, 'monitors/byCounty'),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: message }, null, 2),
        }],
      };
    }
  },
};

/**
 * Tool: Get monitors in a state
 */
const monitorsByState: McpTool = {
  name: 'aqs_monitors_by_state',
  description: `Get all air quality monitors in a state. Returns detailed information about monitors including location, operational dates, and measurement parameters.

Parameters:
- param: 5-digit AQS parameter code for the pollutant. Common codes:
  - 44201: Ozone (O3)
  - 88101: PM2.5 (Fine Particulate Matter, Local Conditions)
  - 81102: PM10 (Particulate Matter)
  - 42401: Sulfur Dioxide (SO2)
  - 42101: Carbon Monoxide (CO)
  - 42602: Nitrogen Dioxide (NO2)
- bdate/edate: Begin and end dates in YYYYMMDD format (must be same calendar year)
- state: 2-digit FIPS state code (e.g., '06' for California, '36' for New York, '04' for Arizona)

Note: Email and API key can be provided or will use AQS_EMAIL/AQS_API_KEY environment variables.`,
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email address for API authentication (optional if AQS_EMAIL env var is set)',
      },
      key: {
        type: 'string',
        description: 'API key for authentication (optional if AQS_API_KEY env var is set)',
      },
      param: {
        type: 'string',
        description: '5-digit AQS parameter code (e.g., 44201 for Ozone)',
      },
      bdate: {
        type: 'string',
        description: 'Begin date in YYYYMMDD format',
      },
      edate: {
        type: 'string',
        description: 'End date in YYYYMMDD format (must be same calendar year as bdate)',
      },
      state: {
        type: 'string',
        description: '2-digit FIPS state code (e.g., 06 for California)',
      },
    },
    required: ['param', 'bdate', 'edate', 'state'],
  },
  handler: async (args) => {
    try {
      const { email, key } = resolveCredentials(
        args.email as string | undefined,
        args.key as string | undefined
      );

      const bdate = args.bdate as string;
      const edate = args.edate as string;

      validateDateFormat(bdate, 'bdate');
      validateDateFormat(edate, 'edate');
      validateDateRange(bdate, edate);

      const response = await aqs<Monitor>('monitors/byState', {
        email,
        key,
        param: args.param as string,
        bdate,
        edate,
        state: args.state as string,
      });

      return {
        content: [{
          type: 'text',
          text: formatMonitorResponse(response.Data, 'monitors/byState'),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: message }, null, 2),
        }],
      };
    }
  },
};

/**
 * Tool: Get monitors in a bounding box
 */
const monitorsByBox: McpTool = {
  name: 'aqs_monitors_by_box',
  description: `Get all air quality monitors within a latitude/longitude bounding box. Useful for querying monitors in a geographic region that may span multiple states or counties.

Parameters:
- param: 5-digit AQS parameter code for the pollutant. Common codes:
  - 44201: Ozone (O3)
  - 88101: PM2.5 (Fine Particulate Matter, Local Conditions)
  - 81102: PM10 (Particulate Matter)
  - 42401: Sulfur Dioxide (SO2)
  - 42101: Carbon Monoxide (CO)
  - 42602: Nitrogen Dioxide (NO2)
- bdate/edate: Begin and end dates in YYYYMMDD format (must be same calendar year)
- minlat: Minimum latitude of bounding box (decimal degrees, e.g., 33.0)
- maxlat: Maximum latitude of bounding box (decimal degrees, e.g., 35.0)
- minlon: Minimum longitude of bounding box (decimal degrees, e.g., -118.5)
- maxlon: Maximum longitude of bounding box (decimal degrees, e.g., -117.0)

Example bounding box for Los Angeles area: minlat=33.5, maxlat=34.5, minlon=-118.8, maxlon=-117.5

Note: Email and API key can be provided or will use AQS_EMAIL/AQS_API_KEY environment variables.`,
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email address for API authentication (optional if AQS_EMAIL env var is set)',
      },
      key: {
        type: 'string',
        description: 'API key for authentication (optional if AQS_API_KEY env var is set)',
      },
      param: {
        type: 'string',
        description: '5-digit AQS parameter code (e.g., 44201 for Ozone)',
      },
      bdate: {
        type: 'string',
        description: 'Begin date in YYYYMMDD format',
      },
      edate: {
        type: 'string',
        description: 'End date in YYYYMMDD format (must be same calendar year as bdate)',
      },
      minlat: {
        type: 'string',
        description: 'Minimum latitude of bounding box in decimal degrees',
      },
      maxlat: {
        type: 'string',
        description: 'Maximum latitude of bounding box in decimal degrees',
      },
      minlon: {
        type: 'string',
        description: 'Minimum longitude of bounding box in decimal degrees',
      },
      maxlon: {
        type: 'string',
        description: 'Maximum longitude of bounding box in decimal degrees',
      },
    },
    required: ['param', 'bdate', 'edate', 'minlat', 'maxlat', 'minlon', 'maxlon'],
  },
  handler: async (args) => {
    try {
      const { email, key } = resolveCredentials(
        args.email as string | undefined,
        args.key as string | undefined
      );

      const bdate = args.bdate as string;
      const edate = args.edate as string;

      validateDateFormat(bdate, 'bdate');
      validateDateFormat(edate, 'edate');
      validateDateRange(bdate, edate);

      const response = await aqs<Monitor>('monitors/byBox', {
        email,
        key,
        param: args.param as string,
        bdate,
        edate,
        minlat: args.minlat as string,
        maxlat: args.maxlat as string,
        minlon: args.minlon as string,
        maxlon: args.maxlon as string,
      });

      return {
        content: [{
          type: 'text',
          text: formatMonitorResponse(response.Data, 'monitors/byBox'),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: message }, null, 2),
        }],
      };
    }
  },
};

/**
 * Tool: Get monitors in a Core Based Statistical Area (CBSA)
 */
const monitorsByCbsa: McpTool = {
  name: 'aqs_monitors_by_cbsa',
  description: `Get all air quality monitors in a Core Based Statistical Area (CBSA). CBSAs are metropolitan or micropolitan statistical areas defined by the Office of Management and Budget.

Parameters:
- param: 5-digit AQS parameter code for the pollutant. Common codes:
  - 44201: Ozone (O3)
  - 88101: PM2.5 (Fine Particulate Matter, Local Conditions)
  - 81102: PM10 (Particulate Matter)
  - 42401: Sulfur Dioxide (SO2)
  - 42101: Carbon Monoxide (CO)
  - 42602: Nitrogen Dioxide (NO2)
- bdate/edate: Begin and end dates in YYYYMMDD format (must be same calendar year)
- cbsa: 5-digit CBSA code. Examples:
  - 31080: Los Angeles-Long Beach-Anaheim, CA
  - 35620: New York-Newark-Jersey City, NY-NJ-PA
  - 16980: Chicago-Naperville-Elgin, IL-IN-WI
  - 19100: Dallas-Fort Worth-Arlington, TX
  - 26420: Houston-The Woodlands-Sugar Land, TX
  - 38060: Phoenix-Mesa-Chandler, AZ

Note: Email and API key can be provided or will use AQS_EMAIL/AQS_API_KEY environment variables.`,
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email address for API authentication (optional if AQS_EMAIL env var is set)',
      },
      key: {
        type: 'string',
        description: 'API key for authentication (optional if AQS_API_KEY env var is set)',
      },
      param: {
        type: 'string',
        description: '5-digit AQS parameter code (e.g., 44201 for Ozone)',
      },
      bdate: {
        type: 'string',
        description: 'Begin date in YYYYMMDD format',
      },
      edate: {
        type: 'string',
        description: 'End date in YYYYMMDD format (must be same calendar year as bdate)',
      },
      cbsa: {
        type: 'string',
        description: '5-digit CBSA code (e.g., 31080 for Los Angeles metro area)',
      },
    },
    required: ['param', 'bdate', 'edate', 'cbsa'],
  },
  handler: async (args) => {
    try {
      const { email, key } = resolveCredentials(
        args.email as string | undefined,
        args.key as string | undefined
      );

      const bdate = args.bdate as string;
      const edate = args.edate as string;

      validateDateFormat(bdate, 'bdate');
      validateDateFormat(edate, 'edate');
      validateDateRange(bdate, edate);

      const response = await aqs<Monitor>('monitors/byCBSA', {
        email,
        key,
        param: args.param as string,
        bdate,
        edate,
        cbsa: args.cbsa as string,
      });

      return {
        content: [{
          type: 'text',
          text: formatMonitorResponse(response.Data, 'monitors/byCBSA'),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: message }, null, 2),
        }],
      };
    }
  },
};

/**
 * Export all monitor tools as an array
 */
export const monitorTools: McpTool[] = [
  monitorsBySite,
  monitorsByCounty,
  monitorsByState,
  monitorsByBox,
  monitorsByCbsa,
];

export default monitorTools;
