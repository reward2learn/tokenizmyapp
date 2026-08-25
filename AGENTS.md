# TokenizMyApp — Root Config App

## Overview

The **TokenizMyApp Root Config App** is the tenant factory — the control plane where business owners configure their application. When `NEXT_PUBLIC_TENANT_SLUG=tokenizmyapp`, the app enables the admin/creation UI instead of the regular business dashboard.

## Architecture

```
tokenizmyapp.vercel.app  (Root Config App)
  ├── Tenant Creation Wizard
  ├── Tenant Registry (DB)
  ├── Template Selection (incl. Multi-App Suite)
  └── Vercel Deploy Integration

redrubybali.vercel.app   (Tenant App — deployed via factory)
  ├── Business Dashboard
  ├── Financial Review
  ├── AI Chat
  └── Ops Admin
```

## Local Development

```bash
cd tokenizmyapp
bun install
bun run dev          # Starts on localhost:3000
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_TENANT_SLUG` | Always `tokenizmyapp` for this app |
| `POSTGRES_URL` | Neon database connection |
| `ENCRYPTION_KEY` | JWT + AES-256-GCM encryption |
| `GOOGLE_RELAY_SECRET` | Shared HMAC secret for the Google OAuth relay (factory + every tenant app). Enables dynamic per-app Google sign-in — Google removed the OAuth client API, so apps sign in via the factory's single registered callback instead of per-app redirect URIs |
| `GOOGLE_RELAY_REDIRECT_URI` | Factory relay callback pushed to tenant apps (default `https://tokenizmyapp.vercel.app/api/auth/google-relay-callback`). Set to override the factory domain |
| `SEC_USER_AGENT` | Descriptive User-Agent for SEC EDGAR filings (AI Credits Calculator). Identification only (not a mailbox). Factory seeded via CLI: `TokenizMyApp AI Credits Calculator alex@tokenizin.com`. Tenants: calculator button → `POST /api/admin/tenants/[slug]/sec-user-agent` with `{OrgName} AI Credits Calculator admin@{slug}.com`. Without it, SEC scrapes are skipped |
| `COMPANIES_HOUSE_API_KEY` | Optional Companies House API key for UK filings enrichment. Without it, UK filings are skipped |
| `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` | Factory Vercel API access — used to mirror `STRIPE_PRICE_*` after catalog Stripe sync (DB remains source of truth) |
| `OLLAMA_BASE_URL` | Public HTTPS base URL of the Mac Studio Ollama tunnel (no trailing slash). Powers `/api/ollama/v1/*` — e.g. `https://….trycloudflare.com`. Without it, model listing still works (curated catalog) but chat completions return 503 |
| `OLLAMA_PROXY_API_KEY` | Preferred Bearer key for `/api/ollama/v1/*`. Store the same value as the tenant’s Studio provider API key (`TOKENIZMYAPP_API_KEY` secret) |
| `TOKENIZMYAPP_API_KEY` | Fallback accepted Bearer key for the Ollama proxy (matches AI Providers key secret name for TokenizMyApp-Studio-AI) |

## Code layout

This directory **is** the Next.js application (not a symlink to `website/`).

| Path | Purpose |
|------|---------|
| `src/app/` | App Router pages + API |
| `src/components/` | MUI components |
| `src/store/` | RTK Query + Redux slices |
| `src/lib/auth/` | JWT / OAuth / PIN |
| `zenstack/` | schema.zmodel + generate output |

## OpenCode agents for this app

Use primary agent **`opencoder`**. Delegate with:

```
Task({
  subagent_type: "website-ui",   # or website-nextjs / website-api / ...
  description: "short title",
  prompt: "full task for tokenizmyapp/..."
})
```

Do **not** use `project-manager` for coding tasks (restaurant ops only).
