/**
 * Phase 1 MCP Tools: Signup and API availability
 *
 * These tools handle EPA AQS API registration and health checks.
 */
/**
 * MCP Tool interface definition
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
    handler: (args: Record<string, unknown>) => Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
    }>;
}
/**
 * Tool: aqs_signup
 *
 * Register for an EPA AQS API key. The API key will be sent to the
 * provided email address.
 */
export declare const signupTool: McpTool;
/**
 * Tool: aqs_is_available
 *
 * Check if the EPA AQS API is operational and responding to requests.
 */
export declare const isAvailableTool: McpTool;
/**
 * All signup-related tools exported as an array
 */
export declare const signupTools: McpTool[];
export default signupTools;
//# sourceMappingURL=signup.d.ts.map