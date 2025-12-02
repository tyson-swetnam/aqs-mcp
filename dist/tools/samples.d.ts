/**
 * Sample Data Tools for EPA AQS API
 *
 * These tools provide access to raw sample data from air quality monitors.
 * WARNING: Sample data queries can return very large datasets. It is strongly
 * recommended to limit date ranges (e.g., one week or one month) to avoid
 * timeouts and excessive data transfer.
 */
/**
 * Tool definition interface matching MCP specification
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
 * Export all sample data tools
 */
export declare const sampleDataTools: McpTool[];
export default sampleDataTools;
//# sourceMappingURL=samples.d.ts.map