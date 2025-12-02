# EPA Air Quality System (AQS) MCP Server - Planning Document

## Overview

This document outlines the plan to build an MCP (Model Context Protocol) server that provides access to the EPA Air Quality System (AQS) API. The server will allow Claude and other MCP clients to query air quality data, monitor information, and quality assurance data from the EPA's comprehensive air quality database.

## API Reference

- **Base URL**: `https://aqs.epa.gov/data/api`
- **Documentation**: https://aqs.epa.gov/aqsweb/documents/data_api.html
- **Format**: JSON only
- **Authentication**: Email + API Key (obtained via signup endpoint)

## Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | TypeScript | Type safety, excellent MCP SDK support |
| Runtime | Node.js | Native MCP SDK compatibility |
| MCP SDK | `@modelcontextprotocol/sdk` | Official Anthropic SDK |
| HTTP Client | `fetch` (native) | Built-in, no dependencies |
| Build Tool | `tsc` | Simple TypeScript compilation |

## Project Structure

```
aqs-mcp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Entry point, MCP server setup
│   ├── client.ts             # AQS API client wrapper
│   ├── tools/
│   │   ├── signup.ts         # Account/key management
│   │   ├── metadata.ts       # API status and field info
│   │   ├── lists.ts          # Reference data (states, counties, etc.)
│   │   ├── monitors.ts       # Monitor queries
│   │   ├── samples.ts        # Sample data queries
│   │   ├── daily.ts          # Daily summary queries
│   │   ├── quarterly.ts      # Quarterly summary queries
│   │   ├── annual.ts         # Annual summary queries
│   │   └── qa.ts             # Quality assurance tools
│   └── types.ts              # TypeScript interfaces
└── README.md
```

## MCP Tools to Implement

### Phase 1: Core Infrastructure & Authentication

1. **`aqs_signup`**
   - Register for API key
   - Parameters: `email`
   - Returns: Confirmation message (key sent via email)

2. **`aqs_is_available`**
   - Check if API is operational
   - Parameters: `email`, `key`
   - Returns: API status

### Phase 2: Reference Data (Lists)

3. **`aqs_list_states`**
   - Get all state FIPS codes
   - Parameters: `email`, `key`

4. **`aqs_list_counties`**
   - Get counties by state
   - Parameters: `email`, `key`, `state`

5. **`aqs_list_sites`**
   - Get monitoring sites by county
   - Parameters: `email`, `key`, `state`, `county`

6. **`aqs_list_cbsas`**
   - Get Core Based Statistical Areas
   - Parameters: `email`, `key`

7. **`aqs_list_parameter_classes`**
   - Get parameter classification groups
   - Parameters: `email`, `key`

8. **`aqs_list_parameters`**
   - Get parameters within a class
   - Parameters: `email`, `key`, `class`

### Phase 3: Monitor Information

9. **`aqs_monitors_by_site`**
   - Parameters: `email`, `key`, `param`, `bdate`, `edate`, `state`, `county`, `site`

10. **`aqs_monitors_by_county`**
    - Parameters: `email`, `key`, `param`, `bdate`, `edate`, `state`, `county`

11. **`aqs_monitors_by_state`**
    - Parameters: `email`, `key`, `param`, `bdate`, `edate`, `state`

12. **`aqs_monitors_by_box`**
    - Parameters: `email`, `key`, `param`, `bdate`, `edate`, `minlat`, `maxlat`, `minlon`, `maxlon`

13. **`aqs_monitors_by_cbsa`**
    - Parameters: `email`, `key`, `param`, `bdate`, `edate`, `cbsa`

### Phase 4: Sample Data

14. **`aqs_sample_data_by_site`**
15. **`aqs_sample_data_by_county`**
16. **`aqs_sample_data_by_state`**
17. **`aqs_sample_data_by_box`**
18. **`aqs_sample_data_by_cbsa`**

### Phase 5: Summary Data

19. **`aqs_daily_summary_by_site`**
20. **`aqs_daily_summary_by_county`**
21. **`aqs_daily_summary_by_state`**
22. **`aqs_daily_summary_by_box`**
23. **`aqs_daily_summary_by_cbsa`**

24. **`aqs_quarterly_summary_by_site`**
25. **`aqs_quarterly_summary_by_county`**
26. **`aqs_quarterly_summary_by_state`**

27. **`aqs_annual_summary_by_site`**
28. **`aqs_annual_summary_by_county`**
29. **`aqs_annual_summary_by_state`**
30. **`aqs_annual_summary_by_box`**
31. **`aqs_annual_summary_by_cbsa`**

### Phase 6: Quality Assurance (Optional/Advanced)

32-46. **QA tools** for blanks, collocated assessments, flow rate verifications, PEP audits, etc.

## API Constraints to Handle

| Constraint | Implementation |
|------------|----------------|
| End date must be same year as begin date | Validate before request |
| Max 5 parameters per request | Validate `param` array length |
| Rate limit: 10 req/min, 5s between | Built-in request throttling |
| Max ~1M rows recommended | Document in tool descriptions |

## Implementation Steps

### Step 1: Project Initialization
- [ ] Initialize npm project
- [ ] Install dependencies (`@modelcontextprotocol/sdk`)
- [ ] Configure TypeScript
- [ ] Create project structure

### Step 2: Core Client
- [ ] Implement AQS API client class
- [ ] Handle authentication (email + key in all requests)
- [ ] Implement rate limiting (5-second delay between requests)
- [ ] Parse JSON responses (header + data structure)
- [ ] Error handling for 400 responses

### Step 3: Type Definitions
- [ ] Define TypeScript interfaces for all response types
- [ ] Define common parameter types (state codes, date formats)

### Step 4: MCP Server Setup
- [ ] Initialize MCP server with stdio transport
- [ ] Register all tools with proper schemas
- [ ] Implement tool handlers

### Step 5: Tool Implementation (by phase)
- [ ] Phase 1: Signup & availability
- [ ] Phase 2: Reference lists
- [ ] Phase 3: Monitors
- [ ] Phase 4: Sample data
- [ ] Phase 5: Summary data
- [ ] Phase 6: QA tools (stretch goal)

### Step 6: Testing & Documentation
- [ ] Manual testing with MCP Inspector
- [ ] Write README with usage instructions
- [ ] Document required environment setup

## Common Parameters Reference

| Parameter | Format | Example | Description |
|-----------|--------|---------|-------------|
| `email` | string | `user@example.com` | Registered email |
| `key` | string | `bluebronze42` | API key from signup |
| `state` | 2-digit FIPS | `06` | State code (California) |
| `county` | 3-digit FIPS | `037` | County code (Los Angeles) |
| `site` | 4-digit | `0001` | Site code |
| `param` | 5-digit | `44201` | Parameter code (Ozone) |
| `bdate` | YYYYMMDD | `20240101` | Begin date |
| `edate` | YYYYMMDD | `20240331` | End date |
| `cbsa` | 5-digit | `31080` | CBSA code (LA metro) |

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

## Configuration

The server will accept credentials via:
1. **Tool parameters** (required for each call)
2. **Environment variables** (optional defaults):
   - `AQS_EMAIL`
   - `AQS_API_KEY`

## Example Usage

```typescript
// Tool call example
{
  "name": "aqs_daily_summary_by_county",
  "arguments": {
    "email": "user@example.com",
    "key": "your-api-key",
    "state": "06",
    "county": "037",
    "param": "44201",
    "bdate": "20240101",
    "edate": "20240331"
  }
}
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API rate limiting | Implement 5-second delay between requests |
| Large data responses | Document row limits, suggest date range constraints |
| API key exposure | Never log keys, use environment variables |
| Date validation errors | Validate same-year constraint client-side |

## Success Criteria

1. All Phase 1-5 tools implemented and functional
2. Proper error handling for API errors
3. Rate limiting prevents 429 responses
4. Clear tool descriptions for LLM understanding
5. Works with Claude Code and other MCP clients

## Next Steps

1. Review and approve this plan
2. Begin Phase 1 implementation
3. Iterate based on testing feedback
