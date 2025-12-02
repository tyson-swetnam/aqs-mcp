/**
 * MCP Tools for EPA AQS API Reference Data (List Endpoints)
 *
 * These tools provide access to reference data for looking up
 * state codes, county codes, monitoring sites, CBSAs, and parameters.
 */
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
        content: Array<{
            type: 'text';
            text: string;
        }>;
    }>;
}
/**
 * Export all list tools as an array
 */
export declare const listTools: McpTool[];
export default listTools;
//# sourceMappingURL=lists.d.ts.map