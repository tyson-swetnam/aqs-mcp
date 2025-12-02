/**
 * Phase 1 MCP Tools: Signup and API availability
 *
 * These tools handle EPA AQS API registration and health checks.
 */

import { aqs, resolveCredentials } from '../client.js';

/**
 * MCP Tool interface definition
 */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }>;
}

/**
 * Response from signup endpoint
 */
interface SignupResponse {
  status: string;
  message?: string;
}

/**
 * Response from isAvailable endpoint
 */
interface IsAvailableResponse {
  status: string;
}

/**
 * Tool: aqs_signup
 *
 * Register for an EPA AQS API key. The API key will be sent to the
 * provided email address.
 */
export const signupTool: McpTool = {
  name: 'aqs_signup',
  description:
    'Register for an EPA Air Quality System (AQS) API key. ' +
    'Provide your email address and an API key will be sent to you. ' +
    'This key is required for all other AQS API operations.',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email address where the API key will be sent',
      },
    },
    required: ['email'],
  },
  handler: async (args) => {
    const email = args.email as string;

    if (!email || typeof email !== 'string') {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Email address is required for API key registration.',
          },
        ],
      };
    }

    // Validate email format (basic check)
    if (!email.includes('@') || !email.includes('.')) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Please provide a valid email address.',
          },
        ],
      };
    }

    try {
      const response = await aqs<SignupResponse>('signup', { email });

      // The signup endpoint returns status in Header
      const header = response.Header?.[0];
      const status = header?.status || 'Unknown';

      if (status === 'Success' || status.toLowerCase().includes('success')) {
        return {
          content: [
            {
              type: 'text',
              text:
                `API key registration successful!\n\n` +
                `An API key has been sent to: ${email}\n\n` +
                `Please check your email (including spam folder) for the API key. ` +
                `Once received, you can use it with the AQS_API_KEY environment variable ` +
                `or pass it directly to API calls.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Signup response: ${JSON.stringify(response, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: `Error during signup: ${errorMessage}`,
          },
        ],
      };
    }
  },
};

/**
 * Tool: aqs_is_available
 *
 * Check if the EPA AQS API is operational and responding to requests.
 */
export const isAvailableTool: McpTool = {
  name: 'aqs_is_available',
  description:
    'Check if the EPA Air Quality System (AQS) API is operational. ' +
    'This is a health check endpoint that verifies the API is responding. ' +
    'Credentials are optional - uses environment variables (AQS_EMAIL, AQS_API_KEY) as fallback.',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description:
          'Email address for API authentication (optional, falls back to AQS_EMAIL env var)',
      },
      key: {
        type: 'string',
        description:
          'API key for authentication (optional, falls back to AQS_API_KEY env var)',
      },
    },
  },
  handler: async (args) => {
    try {
      // Resolve credentials from args or environment
      const { email, key } = resolveCredentials(
        args.email as string | undefined,
        args.key as string | undefined
      );

      const response = await aqs<IsAvailableResponse>('metaData/isAvailable', {
        email,
        key,
      });

      const header = response.Header?.[0];
      const status = header?.status || 'Unknown';

      if (status === 'Success' || status.toLowerCase().includes('success')) {
        return {
          content: [
            {
              type: 'text',
              text:
                `EPA AQS API Status: AVAILABLE\n\n` +
                `The API is operational and responding to requests.\n` +
                `Request time: ${header?.request_time || 'N/A'}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text:
              `EPA AQS API Status: ${status}\n\n` +
              `Response: ${JSON.stringify(response, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Check if it's a credentials error
      if (
        errorMessage.includes('Email is required') ||
        errorMessage.includes('API key is required')
      ) {
        return {
          content: [
            {
              type: 'text',
              text:
                `Credentials required: ${errorMessage}\n\n` +
                `Provide email and key parameters, or set AQS_EMAIL and AQS_API_KEY environment variables.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text:
              `EPA AQS API Status: UNAVAILABLE or ERROR\n\n` +
              `Error: ${errorMessage}`,
          },
        ],
      };
    }
  },
};

/**
 * All signup-related tools exported as an array
 */
export const signupTools: McpTool[] = [signupTool, isAvailableTool];

export default signupTools;
