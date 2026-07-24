# TokenizMyApp — Root Config App

## Overview

The **TokenizMyApp Root Config App** is the tenant factory — the control plane where business owners configure their application. When `NEXT_PUBLIC_TENANT_SLUG=tokenizmyapp`, the app enables the admin/creation UI instead of the regular business dashboard.

## Architecture

```
tokenizmyapp.vercel.app  (Root Config App)
  ├── Tenant Creation Wizard
  ├── Tenant Registry (DB)
  ├── Template Selection
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

## Shared Code

The `tokenizmyapp` directory shares code with `website/` via symlinks:
- `src/` → `../website/src/`
- `zenstack/` → `../website/zenstack/`
- `scripts/` → `../website/scripts/`

This ensures both apps stay in sync. Feature development happens in `website/`.
