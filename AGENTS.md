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
| `OLLAMA_TUNNEL_HOST` | Upstream Mac Studio Ollama base URL for `/api/ollama/[...path]` (default `https://ollama.tokenizin.com`). No proxy auth — path/query/body are forwarded and responses stream through |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Reown AppKit project id (social wallet / SIWE). Optional if `DEFAULT_REOWN_PROJECT_ID` in code is used |
| `NEXT_PUBLIC_WEB3_CONNECT_MODE` | `social` (factory default), `both`, or `injected` |
| `NEXT_PUBLIC_WEB3_SOCIALS` | Comma list, e.g. `google` — surfaces AppKit social providers |
| `NEXT_PUBLIC_WEB3_WALLET_ENABLED` / `NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED` | Set either to `false` to disable factory social wallet UI |
| `POSTGRES_URL` | Also backs durable `siwe_nonces` for factory SIWE claim-on-verify (required on Vercel) |

## Social wallet + SIWE (factory)

**Production journey:** Sign in (`redruby.session`) → Connect Wallet (Reown Google social) → factory SIWE → JWT gains `walletAddress`.

| Resource | Path |
|----------|------|
| Canonical docs | `docs/factory-reown-siwe-wallet-link.md` |
| Corrections A–D background | `docs/google-oauth-appkit-setup.md` |
| Cursor agent skill | `.cursor/skills/reown-siwe-wallet-link/` |

When changing AppKit, SIWE, `/api/auth/wallet/*`, or crypto wallet UI, load the **`reown-siwe-wallet-link`** skill and follow its invariants (await `readyPromise`, claim-on-verify, EIP-1271 raw signatures).

## Code layout

This directory **is** the Next.js application (not a symlink to `website/`).

| Path | Purpose |
|------|---------|
| `src/app/` | App Router pages + API |
| `src/components/` | MUI components |
| `src/store/` | RTK Query + Redux slices |
| `src/lib/auth/` | JWT / OAuth / PIN / SIWE |
| `src/lib/web3/` | Reown AppKit, factory SIWE client, wallet link |
| `zenstack/` | schema.zmodel + generate output |

## OpenCode agents for this app

Use primary agent **`opencoder`**. Delegate with:

```
Task({
  subagent_type: "website-ui",   # or website-nextjs / website-api / website-auth / ...
  description: "short title",
  prompt: "full task for tokenizmyapp/..."
})
```

Wallet / SIWE / AppKit work: prefer **`website-auth`** (+ `website-api` for `/api/auth/wallet/*`) and attach skill **`reown-siwe-wallet-link`**.

Do **not** use `project-manager` for coding tasks (restaurant ops only).
