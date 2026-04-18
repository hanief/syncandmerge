# Project: Sync and Merge – Web App Integration Sync Panel

## What This Is
A B2B SaaS frontend for managing bidirectional data sync between a platform and external services (Salesforce, HubSpot, Stripe, Slack, Zendesk, Intercom). Focus is on conflict detection, resolution, and sync history.

## Key Scope
1. **Integrations List** — status (Synced, Syncing, Conflict, Error), last sync time, version
2. **Sync Detail** — summary, Sync Now button, preview of incoming changes
3. **Sync History & Versioning** — past sync events, version tracking, change inspection
4. **Conflict Resolution** — field-level diff, side-by-side local vs external, per-field resolution, merge action

Use @PRD.md for detailed product requirements

## API
- Endpoint: `{API_BASE_URL}/data/sync?application_id={salesforce,hubspot,stripe,slack,zendesk,intercom}`
- Only the **Sync Now** button calls this API. All other data is mocked/simulated.
- Handle errors: 4xx (missing config), 500 (server error), 502 (gateway/integration down)

## Architecture Expectations
- Separate concerns: UI components / business logic / API layer
- State management should cleanly represent: Synced | Syncing | Conflict | Error per integration
- Conflict resolution must be field-level (not record-level)
  
## Technical Constraints
- Frontend only — no backend implementation needed
- Must run in Docker (include `Dockerfile`, minimal setup, ideally single `docker build` + `docker run`)
- Clear separation: UI / business logic / API interaction

## Evaluation Priorities
- Clean architecture and code quality
- Loading and error state handling
- UX for sync flow and conflict resolution
- Readability and consistency — visual polish is secondary

## Design
- Use @DESIGN.md to guide global style
- Use design files in folder design/ containing a folder for each page. On each page, there's design image and React component example that should be used to guide the design and layout on that page. Do not use the React component verbatim, use it only for guidance, inspiration and example. Refer to engineering standard for creating the real component.

## Engineering
- Use @ENGINEERING.md to guide engineering standard.
- The ENGINEERING.md file is not exhaustive of the best practice. If something is not listed on the doc, it still can be used as long as it follows universal best practice engineering standard.