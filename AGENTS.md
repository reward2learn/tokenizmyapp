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
