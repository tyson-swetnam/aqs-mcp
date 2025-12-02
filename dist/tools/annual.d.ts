/**
 * MCP tools for EPA AQS Annual Summary Data
 *
 * Annual summaries provide yearly aggregated statistics including:
 * - Arithmetic mean and standard deviation
 * - Maximum values (1st through 4th)
 * - Percentiles (10th, 50th, 75th, 90th, 95th, 98th, 99th)
 * - Observation counts and data completeness
 * - Primary and secondary exceedance counts
 * - Exceptional data and null data counts
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
 * Export all annual summary tools
 */
export declare const annualTools: McpTool[];
export default annualTools;
//# sourceMappingURL=annual.d.ts.map