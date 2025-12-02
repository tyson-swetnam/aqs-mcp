# EPA Air Quality System (AQS) MCP Server

An MCP (Model Context Protocol) server that provides access to the EPA Air Quality System API. This server enables Claude and other MCP clients to query air quality data, monitor information, and quality assurance data from the EPA's comprehensive air quality database.

## Features

- **31 MCP tools** covering all major AQS API endpoints
- Rate limiting (5 seconds between requests) to comply with API guidelines
- Date validation (same calendar year requirement)
- Credential resolution from parameters or environment variables
- Comprehensive error handling

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aqs-mcp.git
cd aqs-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Getting an API Key

1. Use the `aqs_signup` tool with your email address
2. Check your email for the API key

### Environment Variables (Optional)

Set these to avoid passing credentials with every request:

```bash
export AQS_EMAIL="your.email@example.com"
export AQS_API_KEY="your-api-key"
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "aqs": {
      "command": "node",
      "args": ["/absolute/path/to/aqs-mcp/dist/index.js"],
      "env": {
        "AQS_EMAIL": "your.email@example.com",
        "AQS_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

### Authentication & Status

| Tool | Description |
|------|-------------|
| `aqs_signup` | Register for an API key (sent via email) |
| `aqs_is_available` | Check if the API is operational |

### Reference Data (Lists)

| Tool | Description |
|------|-------------|
| `aqs_list_states` | Get all US state FIPS codes |
| `aqs_list_counties` | Get counties in a state |
| `aqs_list_sites` | Get monitoring sites in a county |
| `aqs_list_cbsas` | Get Core Based Statistical Areas |
| `aqs_list_parameter_classes` | Get parameter classification groups |
| `aqs_list_parameters` | Get parameters within a class |

### Monitor Queries

| Tool | Description |
|------|-------------|
| `aqs_monitors_by_site` | Get monitors at a specific site |
| `aqs_monitors_by_county` | Get monitors in a county |
| `aqs_monitors_by_state` | Get monitors in a state |
| `aqs_monitors_by_box` | Get monitors in a lat/lon bounding box |
| `aqs_monitors_by_cbsa` | Get monitors in a CBSA |

### Sample Data

| Tool | Description |
|------|-------------|
| `aqs_sample_data_by_site` | Get raw sample data at a site |
| `aqs_sample_data_by_county` | Get raw sample data for a county |
| `aqs_sample_data_by_state` | Get raw sample data for a state |
| `aqs_sample_data_by_box` | Get raw sample data in a bounding box |
| `aqs_sample_data_by_cbsa` | Get raw sample data for a CBSA |

### Daily Summaries

| Tool | Description |
|------|-------------|
| `aqs_daily_summary_by_site` | Daily summary at a site |
| `aqs_daily_summary_by_county` | Daily summary for a county |
| `aqs_daily_summary_by_state` | Daily summary for a state |
| `aqs_daily_summary_by_box` | Daily summary in a bounding box |
| `aqs_daily_summary_by_cbsa` | Daily summary for a CBSA |

### Quarterly Summaries

| Tool | Description |
|------|-------------|
| `aqs_quarterly_summary_by_site` | Quarterly summary at a site |
| `aqs_quarterly_summary_by_county` | Quarterly summary for a county |
| `aqs_quarterly_summary_by_state` | Quarterly summary for a state |

### Annual Summaries

| Tool | Description |
|------|-------------|
| `aqs_annual_summary_by_site` | Annual summary at a site |
| `aqs_annual_summary_by_county` | Annual summary for a county |
| `aqs_annual_summary_by_state` | Annual summary for a state |
| `aqs_annual_summary_by_box` | Annual summary in a bounding box |
| `aqs_annual_summary_by_cbsa` | Annual summary for a CBSA |

## Common Parameter Codes

| Code | Pollutant |
|------|-----------|
| 44201 | Ozone |
| 88101 | PM2.5 Local |
| 88502 | PM2.5 FRM/FEM |
| 81102 | PM10 |
| 42401 | SO2 |
| 42101 | CO |
| 42602 | NO2 |

## Location Codes

| Parameter | Format | Example | Description |
|-----------|--------|---------|-------------|
| `state` | 2-digit FIPS | `06` | California |
| `county` | 3-digit FIPS | `037` | Los Angeles County |
| `site` | 4-digit | `0001` | Site number |
| `cbsa` | 5-digit | `31080` | LA Metro Area |

## Date Format

All dates use `YYYYMMDD` format (e.g., `20240101` for January 1, 2024).

**Important**: Begin and end dates must be in the same calendar year.

## Example Usage

Query daily ozone data for Los Angeles County in January 2024:

```json
{
  "name": "aqs_daily_summary_by_county",
  "arguments": {
    "state": "06",
    "county": "037",
    "param": "44201",
    "bdate": "20240101",
    "edate": "20240131"
  }
}
```

## Testing

Test with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## API Constraints

- **Rate Limit**: 10 requests per minute (server enforces 5-second delay)
- **Max Parameters**: 5 parameter codes per request
- **Date Range**: Must be within same calendar year
- **Data Volume**: Large queries may timeout; use smaller date ranges

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Run directly
node dist/index.js
```

## License

MIT

## Links

- [EPA AQS API Documentation](https://aqs.epa.gov/aqsweb/documents/data_api.html)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
