/**
 * MCP tools for EPA AQS Quarterly Summary Data
 *
 * Quarterly summaries aggregate air quality measurements by calendar quarter,
 * providing statistical summaries including observation counts, means, and
 * maximum values for each monitoring site.
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
 * All quarterly summary tools exported as an array
 */
export declare const quarterlyTools: McpTool[];
export default quarterlyTools;
//# sourceMappingURL=quarterly.d.ts.map