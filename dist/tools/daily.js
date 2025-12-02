/**
 * MCP tools for EPA AQS API daily summary data endpoints
 *
 * Daily summary data provides aggregated statistics for each day including
 * arithmetic mean, maximum values, observation counts, and AQI values.
 */
import { aqs, resolveCredentials, validateDateRange, validateDateFormat, } from '../client.js';
/**
 * Common input schema properties for authentication
 */
const authProperties = {
    email: {
        type: 'string',
        description: 'Email address registered with EPA AQS API. Optional if AQS_EMAIL environment variable is set.',
    },
    key: {
        type: 'string',
        description: 'API key from EPA AQS. Optional if AQS_API_KEY environment variable is set.',
    },
};
/**
 * Common input schema properties for date range and parameter
 */
const dateRangeProperties = {
    param: {
        type: 'string',
        description: 'Parameter code (e.g., 44201 for Ozone, 88101 for PM2.5, 42401 for SO2, 42101 for CO, 42602 for NO2). Multiple codes can be comma-separated (max 5).',
    },
    bdate: {
        type: 'string',
        description: 'Begin date in YYYYMMDD format (e.g., 20230101).',
    },
    edate: {
        type: 'string',
        description: 'End date in YYYYMMDD format (e.g., 20230131). Must be in the same calendar year as bdate.',
    },
};
/**
 * Common required fields for date range queries
 */
const dateRangeRequired = ['param', 'bdate', 'edate'];
/**
 * Format response data for MCP output
 */
function formatResponse(data, endpoint) {
    if (data.length === 0) {
        return JSON.stringify({
            message: 'No data found for the specified query parameters.',
            endpoint,
            rowCount: 0,
        }, null, 2);
    }
    return JSON.stringify({
        endpoint,
        rowCount: data.length,
        data,
    }, null, 2);
}
/**
 * Tool: aqs_daily_summary_by_site
 * Get daily summary data at a specific monitoring site
 */
const dailySummaryBySite = {
    name: 'aqs_daily_summary_by_site',
    description: 'Get daily summary air quality data for a specific monitoring site. Daily summaries include arithmetic mean, maximum values, observation counts, and AQI values for each day. Requires state FIPS code (2-digit), county FIPS code (3-digit), and site number (4-digit).',
    inputSchema: {
        type: 'object',
        properties: {
            ...authProperties,
            ...dateRangeProperties,
            state: {
                type: 'string',
                description: 'Two-digit state FIPS code (e.g., 06 for California, 36 for New York).',
            },
            county: {
                type: 'string',
                description: 'Three-digit county FIPS code (e.g., 037 for Los Angeles County).',
            },
            site: {
                type: 'string',
                description: 'Four-digit site number within the county.',
            },
        },
        required: [...dateRangeRequired, 'state', 'county', 'site'],
    },
    handler: async (params) => {
        const { email, key } = resolveCredentials(params.email, params.key);
        validateDateFormat(params.bdate, 'bdate');
        validateDateFormat(params.edate, 'edate');
        validateDateRange(params.bdate, params.edate);
        const response = await aqs('dailyData/bySite', {
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
                    type: 'text',
                    text: formatResponse(response.Data, 'dailyData/bySite'),
                },
            ],
        };
    },
};
/**
 * Tool: aqs_daily_summary_by_county
 * Get daily summary data for all sites in a county
 */
const dailySummaryByCounty = {
    name: 'aqs_daily_summary_by_county',
    description: 'Get daily summary air quality data for all monitoring sites in a county. Daily summaries include arithmetic mean, maximum values, observation counts, and AQI values for each day. Requires state FIPS code (2-digit) and county FIPS code (3-digit).',
    inputSchema: {
        type: 'object',
        properties: {
            ...authProperties,
            ...dateRangeProperties,
            state: {
                type: 'string',
                description: 'Two-digit state FIPS code (e.g., 06 for California, 36 for New York).',
            },
            county: {
                type: 'string',
                description: 'Three-digit county FIPS code (e.g., 037 for Los Angeles County).',
            },
        },
        required: [...dateRangeRequired, 'state', 'county'],
    },
    handler: async (params) => {
        const { email, key } = resolveCredentials(params.email, params.key);
        validateDateFormat(params.bdate, 'bdate');
        validateDateFormat(params.edate, 'edate');
        validateDateRange(params.bdate, params.edate);
        const response = await aqs('dailyData/byCounty', {
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
                    type: 'text',
                    text: formatResponse(response.Data, 'dailyData/byCounty'),
                },
            ],
        };
    },
};
/**
 * Tool: aqs_daily_summary_by_state
 * Get daily summary data for all sites in a state
 */
const dailySummaryByState = {
    name: 'aqs_daily_summary_by_state',
    description: 'Get daily summary air quality data for all monitoring sites in a state. Daily summaries include arithmetic mean, maximum values, observation counts, and AQI values for each day. Requires state FIPS code (2-digit). Note: This can return large amounts of data.',
    inputSchema: {
        type: 'object',
        properties: {
            ...authProperties,
            ...dateRangeProperties,
            state: {
                type: 'string',
                description: 'Two-digit state FIPS code (e.g., 06 for California, 36 for New York).',
            },
        },
        required: [...dateRangeRequired, 'state'],
    },
    handler: async (params) => {
        const { email, key } = resolveCredentials(params.email, params.key);
        validateDateFormat(params.bdate, 'bdate');
        validateDateFormat(params.edate, 'edate');
        validateDateRange(params.bdate, params.edate);
        const response = await aqs('dailyData/byState', {
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
                    type: 'text',
                    text: formatResponse(response.Data, 'dailyData/byState'),
                },
            ],
        };
    },
};
/**
 * Tool: aqs_daily_summary_by_box
 * Get daily summary data within a geographic bounding box
 */
const dailySummaryByBox = {
    name: 'aqs_daily_summary_by_box',
    description: 'Get daily summary air quality data for all monitoring sites within a geographic bounding box. Daily summaries include arithmetic mean, maximum values, observation counts, and AQI values for each day. Specify the bounding box using minimum and maximum latitude/longitude coordinates.',
    inputSchema: {
        type: 'object',
        properties: {
            ...authProperties,
            ...dateRangeProperties,
            minlat: {
                type: 'string',
                description: 'Minimum latitude of the bounding box (southern boundary). Range: -90 to 90.',
            },
            maxlat: {
                type: 'string',
                description: 'Maximum latitude of the bounding box (northern boundary). Range: -90 to 90.',
            },
            minlon: {
                type: 'string',
                description: 'Minimum longitude of the bounding box (western boundary). Range: -180 to 180.',
            },
            maxlon: {
                type: 'string',
                description: 'Maximum longitude of the bounding box (eastern boundary). Range: -180 to 180.',
            },
        },
        required: [
            ...dateRangeRequired,
            'minlat',
            'maxlat',
            'minlon',
            'maxlon',
        ],
    },
    handler: async (params) => {
        const { email, key } = resolveCredentials(params.email, params.key);
        validateDateFormat(params.bdate, 'bdate');
        validateDateFormat(params.edate, 'edate');
        validateDateRange(params.bdate, params.edate);
        const response = await aqs('dailyData/byBox', {
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
                    type: 'text',
                    text: formatResponse(response.Data, 'dailyData/byBox'),
                },
            ],
        };
    },
};
/**
 * Tool: aqs_daily_summary_by_cbsa
 * Get daily summary data for a Core Based Statistical Area
 */
const dailySummaryByCbsa = {
    name: 'aqs_daily_summary_by_cbsa',
    description: 'Get daily summary air quality data for all monitoring sites in a Core Based Statistical Area (CBSA). CBSAs are metropolitan or micropolitan statistical areas defined by the US Office of Management and Budget. Daily summaries include arithmetic mean, maximum values, observation counts, and AQI values for each day.',
    inputSchema: {
        type: 'object',
        properties: {
            ...authProperties,
            ...dateRangeProperties,
            cbsa: {
                type: 'string',
                description: 'Core Based Statistical Area code (e.g., 16980 for Chicago, 31080 for Los Angeles).',
            },
        },
        required: [...dateRangeRequired, 'cbsa'],
    },
    handler: async (params) => {
        const { email, key } = resolveCredentials(params.email, params.key);
        validateDateFormat(params.bdate, 'bdate');
        validateDateFormat(params.edate, 'edate');
        validateDateRange(params.bdate, params.edate);
        const response = await aqs('dailyData/byCBSA', {
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
                    type: 'text',
                    text: formatResponse(response.Data, 'dailyData/byCBSA'),
                },
            ],
        };
    },
};
/**
 * Export all daily summary tools
 */
export const dailyTools = [
    dailySummaryBySite,
    dailySummaryByCounty,
    dailySummaryByState,
    dailySummaryByBox,
    dailySummaryByCbsa,
];
//# sourceMappingURL=daily.js.map