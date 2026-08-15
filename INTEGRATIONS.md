# Integration — HubSpot CRM

All secrets live **only** in Vercel environment variables (server-side).

## Environment variables (Vercel project: `vyravo-ai-crm`)

| Variable | Required | Purpose |
|---|---|---|
| `HUBSPOT_ACCESS_TOKEN` | Yes, for sync | HubSpot private app token. Scopes: `crm.objects.contacts.read/write`, `crm.objects.deals.read/write` (+ `crm.schemas.contacts.read/write` to auto-create `vyravo_*` custom fields — without it the sync falls back to standard fields only). |

## What syncs when

| CRM action | HubSpot effect |
|---|---|
| Create lead (`POST /api/leads`) | Contact created or updated (deduped by email) + deal created at the mapped stage, associated to the contact |
| Edit lead (`PATCH /api/leads/:id`) | Contact properties updated |
| Move pipeline stage (`PATCH /api/leads/:id/stage`) | Associated deal moved to the mapped stage |

## Stage mapping (local → HubSpot deal stage label)

| CRM stage | HubSpot stage |
|---|---|
| new | Prospecting |
| qualified | Qualification |
| discovery_scheduled | Qualification |
| discovery_completed | Qualification |
| proposal_sent | Proposal Sent |
| negotiation | Negotiation |
| won | Closed Won |
| lost | Closed Lost |

Stages are resolved **by label** from the account's default pipeline at runtime. If a label doesn't exist, that sync step is skipped gracefully (the local CRM is never blocked).

## Field mapping

Standard: `firstname`, `lastname`, `email`, `phone`, `company`, `website`, `country`
Custom (auto-created when the token allows): `vyravo_industry`, `vyravo_company_size`, `vyravo_budget_range`, `vyravo_timeline`, `vyravo_lead_score`, `vyravo_lead_category`, `vyravo_challenges`, `vyravo_goals`, `vyravo_source`

## Graceful degradation

If `HUBSPOT_ACCESS_TOKEN` is missing, everything keeps working locally and API responses report `hubspot.configured: false`. The New Lead form surfaces sync success/failure in the UI.
