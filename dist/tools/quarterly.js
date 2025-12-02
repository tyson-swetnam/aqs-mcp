/**
 * MCP tools for EPA AQS Quarterly Summary Data
 *
 * Quarterly summaries aggregate air quality measurements by calendar quarter,
 * providing statistical summaries including observation counts, means, and
 * maximum values for each monitoring site.
 */
import { aqs, resolveCredentials, validateDateRange, validateDateFormat, } from '../client.js';
/**
 * Format the API response for MCP output
 */
function formatResponse(response) {
    return JSON.stringify(response, null, 2);
}
/**
 * Common input schema properties for all quarterly summary tools
 */
const commonProperties = {
    email: {
        type: 'string',
        description: 'Email address for API authentication. Optional if AQS_EMAIL environment variable is set.',
    },
    key: {
        type: 'string',
        description: 'API key for authentication. Optional if AQS_API_KEY environment variable is set.',
    },
    param: {
        type: 'string',
        description: 'Parameter code (pollutant). Common codes: 44201 (Ozone), 88101 (PM2.5), 81102 (PM10), 42401 (SO2), 42101 (CO), 42602 (NO2). Up to 5 comma-separated codes allowed.',
    },
    bdate: {
        type: 'string',
        description: 'Begin date in YYYYMMDD format. Must be in the same calendar year as edate.',
    },
    edate: {
        type: 'string',
        description: 'End date in YYYYMMDD format. Must be in the same calendar year as bdate.',
    },
};
const stateProperty = {
    state: {
        type: 'string',
        description: 'Two-digit FIPS state code (e.g., "06" for California, "36" for New York).',
    },
};
const countyProperty = {
    county: {
        type: 'string',
        description: 'Three-digit FIPS county code (e.g., "037" for Los Angeles County).',
    },
};
const siteProperty = {
    site: {
        type: 'string',
        description: 'Four-digit AQS site number within the county.',
    },
};
/**
 * Tool: Get quarterly summary data at a specific monitoring site
 */
const quarterlySummaryBySite = {
    name: 'aqs_quarterly_summary_by_site',
    description: 'Retrieve quarterly summary data for a specific air quality monitoring site. ' +
        'Quarterly summaries aggregate measurements by calendar quarter, providing ' +
        'observation counts, arithmetic means, and maximum values. Useful for analyzing ' +
        'seasonal patterns and trends at individual monitoring locations.',
    inputSchema: {
        type: 'object',
        properties: {
            ...commonProperties,
            ...stateProperty,
            ...countyProperty,
            ...siteProperty,
        },
        required: ['param', 'bdate', 'edate', 'state', 'county', 'site'],
    },
    handler: async (params) => {
        const { email, key } = resolveCredentials(params.email, params.key);
        validateDateFormat(params.bdate, 'bdate');
        validateDateFormat(params.edate, 'edate');
        validateDateRange(params.bdate, params.edate);
        const response = await aqs('quarterlyData/bySite', {
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
            content: [{ type: 'text', text: formatResponse(response) }],
        };
    },
};
/**
 * Tool: Get quarterly summary data for all sites in a county
 */
const quarterlySummaryByCounty = {
    name: 'aqs_quarterly_summary_by_county',
    description: 'Retrieve quarterly summary data for all air quality monitoring sites in a county. ' +
        'Quarterly summaries aggregate measurements by calendar quarter, providing ' +
        'observation counts, arithmetic means, and maximum values. Useful for comparing ' +
        'air quality across multiple monitoring sites within a county.',
    inputSchema: {
        type: 'object',
        properties: {
            ...commonProperties,
            ...stateProperty,
            ...countyProperty,
        },
        required: ['param', 'bdate', 'edate', 'state', 'county'],
    },
    handler: async (params) => {
        const { email, key } = resolveCredentials(params.email, params.key);
        validateDateFormat(params.bdate, 'bdate');
        validateDateFormat(params.edate, 'edate');
        validateDateRange(params.bdate, params.edate);
        const response = await aqs('quarterlyData/byCounty', {
            email,
            key,
            param: params.param,
            bdate: params.bdate,
            edate: params.edate,
            state: params.state,
            county: params.county,
        });
        return {
            content: [{ type: 'text', text: formatResponse(response) }],
        };
    },
};
/**
 * Tool: Get quarterly summary data for all sites in a state
 */
const quarterlySummaryByState = {
    name: 'aqs_quarterly_summary_by_state',
    description: 'Retrieve quarterly summary data for all air quality monitoring sites in a state. ' +
        'Quarterly summaries aggregate measurements by calendar quarter, providing ' +
        'observation counts, arithmetic means, and maximum values. Useful for statewide ' +
        'air quality analysis and comparing trends across different regions.',
    inputSchema: {
        type: 'object',
        properties: {
            ...commonProperties,
            ...stateProperty,
        },
        required: ['param', 'bdate', 'edate', 'state'],
    },
    handler: async (params) => {
        const { email, key } = resolveCredentials(params.email, params.key);
        validateDateFormat(params.bdate, 'bdate');
        validateDateFormat(params.edate, 'edate');
        validateDateRange(params.bdate, params.edate);
        const response = await aqs('quarterlyData/byState', {
            email,
            key,
            param: params.param,
            bdate: params.bdate,
            edate: params.edate,
            state: params.state,
        });
        return {
            content: [{ type: 'text', text: formatResponse(response) }],
        };
    },
};
/**
 * All quarterly summary tools exported as an array
 */
export const quarterlyTools = [
    quarterlySummaryBySite,
    quarterlySummaryByCounty,
    quarterlySummaryByState,
];
export default quarterlyTools;
//# sourceMappingURL=quarterly.js.map