/**
 * AQS API Client with rate limiting
 *
 * Handles authentication, rate limiting (5 seconds between requests),
 * and response parsing for all EPA AQS API endpoints.
 */
import type { AqsResponse } from './types.js';
/**
 * Validate that begin and end dates are in the same calendar year
 */
export declare function validateDateRange(bdate: string, edate: string): void;
/**
 * Validate date format (YYYYMMDD)
 */
export declare function validateDateFormat(date: string, fieldName: string): void;
/**
 * Make an authenticated request to the AQS API
 */
export declare function aqs<T>(endpoint: string, params: Record<string, string>): Promise<AqsResponse<T>>;
/**
 * Get default credentials from environment variables
 */
export declare function getDefaultCredentials(): {
    email?: string;
    key?: string;
};
/**
 * Resolve credentials - use provided values or fall back to environment variables
 */
export declare function resolveCredentials(providedEmail?: string, providedKey?: string): {
    email: string;
    key: string;
};
//# sourceMappingURL=client.d.ts.map