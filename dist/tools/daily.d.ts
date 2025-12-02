/**
 * MCP tools for EPA AQS API daily summary data endpoints
 *
 * Daily summary data provides aggregated statistics for each day including
 * arithmetic mean, maximum values, observation counts, and AQI values.
 */
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
        content: Array<{
            type: 'text';
            text: string;
        }>;
    }>;
}
/**
 * Export all daily summary tools
 */
export declare const dailyTools: McpTool[];
export {};
//# sourceMappingURL=daily.d.ts.map