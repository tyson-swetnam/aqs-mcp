# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server providing access to the EPA Air Quality System (AQS) API. Enables Claude and other MCP clients to query air quality data, monitor information, and quality assurance data.

## Build & Run Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the MCP server
node dist/index.js

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## Architecture

- **Entry point**: `src/index.ts` - MCP server setup with stdio transport
- **API client**: `src/client.ts` - AQS API wrapper with rate limiting (5s between requests)
- **Tools**: `src/tools/` - MCP tool implementations organized by EPA API category
- **Types**: `src/types.ts` - TypeScript interfaces for API responses

## EPA AQS API Reference

- **Base URL**: `https://aqs.epa.gov/data/api`
- **Auth**: All requests require `email` + `key` parameters
- **Format**: JSON responses with `Header` + `Data` structure

### Key Constraints

- End date must be in same calendar year as begin date
- Max 5 parameters per request
- Rate limit: 10 req/min, 5-second pause between requests

### Common Parameter Codes

| Code | Pollutant |
|------|-----------|
| 44201 | Ozone |
| 88101 | PM2.5 Local |
| 81102 | PM10 |
| 42401 | SO2 |
| 42101 | CO |
| 42602 | NO2 |

### Location Codes

- `state`: 2-digit FIPS (e.g., `06` = California)
- `county`: 3-digit FIPS (e.g., `037` = Los Angeles)
- `site`: 4-digit site code
- Dates: `YYYYMMDD` format

## Environment Variables

- `AQS_EMAIL` - Optional default email for API auth
- `AQS_API_KEY` - Optional default API key

## Workflow Requirements

**Commit after every successful prompt completion.** After completing any task that modifies files:

```bash
git add -A
git commit -m "descriptive message of what was done and why"
```

This ensures:
- All changes are tracked incrementally
- Commit history documents the evolution of the codebase
- Easy to revert specific changes if needed
- Commit messages explain the reasoning behind code decisions
