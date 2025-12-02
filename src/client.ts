/**
 * AQS API Client with rate limiting
 *
 * Handles authentication, rate limiting (5 seconds between requests),
 * and response parsing for all EPA AQS API endpoints.
 */

import type { AqsResponse } from './types.js';

const AQS_BASE_URL = 'https://aqs.epa.gov/data/api';
const RATE_LIMIT_MS = 5000; // 5 seconds between requests

let lastRequestTime = 0;

/**
 * Sleep for specified milliseconds
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enforce rate limiting between API requests
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_MS && lastRequestTime > 0) {
    const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
    console.error(`[AQS] Rate limiting: waiting ${waitTime}ms before next request`);
    await sleep(waitTime);
  }

  lastRequestTime = Date.now();
}

/**
 * Validate that begin and end dates are in the same calendar year
 */
export function validateDateRange(bdate: string, edate: string): void {
  const beginYear = bdate.substring(0, 4);
  const endYear = edate.substring(0, 4);

  if (beginYear !== endYear) {
    throw new Error(
      `Begin date (${bdate}) and end date (${edate}) must be in the same calendar year. ` +
      `Got years ${beginYear} and ${endYear}.`
    );
  }
}

/**
 * Validate date format (YYYYMMDD)
 */
export function validateDateFormat(date: string, fieldName: string): void {
  if (!/^\d{8}$/.test(date)) {
    throw new Error(
      `${fieldName} must be in YYYYMMDD format. Got: ${date}`
    );
  }

  const year = parseInt(date.substring(0, 4), 10);
  const month = parseInt(date.substring(4, 6), 10);
  const day = parseInt(date.substring(6, 8), 10);

  if (month < 1 || month > 12) {
    throw new Error(`${fieldName} has invalid month: ${month}`);
  }

  if (day < 1 || day > 31) {
    throw new Error(`${fieldName} has invalid day: ${day}`);
  }

  if (year < 1900 || year > 2100) {
    throw new Error(`${fieldName} has invalid year: ${year}`);
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params: Record<string, string>): string {
  const url = new URL(`${AQS_BASE_URL}/${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  }

  return url.toString();
}

/**
 * Make an authenticated request to the AQS API
 */
export async function aqs<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<AqsResponse<T>> {
  await enforceRateLimit();

  const url = buildUrl(endpoint, params);

  // Log to stderr for debugging (won't interfere with stdio transport)
  console.error(`[AQS] Requesting: ${endpoint}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as AqsResponse<T>;

    // Check for API-level errors
    if (data.Header && data.Header.length > 0) {
      const header = data.Header[0];
      if (header.status === 'Failed') {
        throw new Error(`AQS API Error: ${JSON.stringify(header)}`);
      }
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AQS API request failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get default credentials from environment variables
 */
export function getDefaultCredentials(): { email?: string; key?: string } {
  return {
    email: process.env.AQS_EMAIL,
    key: process.env.AQS_API_KEY,
  };
}

/**
 * Resolve credentials - use provided values or fall back to environment variables
 */
export function resolveCredentials(
  providedEmail?: string,
  providedKey?: string
): { email: string; key: string } {
  const defaults = getDefaultCredentials();

  const email = providedEmail || defaults.email;
  const key = providedKey || defaults.key;

  if (!email) {
    throw new Error('Email is required. Provide it as a parameter or set AQS_EMAIL environment variable.');
  }

  if (!key) {
    throw new Error('API key is required. Provide it as a parameter or set AQS_API_KEY environment variable.');
  }

  return { email, key };
}
