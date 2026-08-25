# Adding an AI Provider

Step-by-step guide for wiring a new **OpenAI-compatible** chat provider into TokenizMyApp. Use this document as the source of truth when creating or updating an agent Skill.

> **Prerequisite:** The provider must expose OpenAI-compatible `POST /v1/chat/completions` (and ideally `GET /v1/models`). Non-compatible APIs need a separate adapter and are out of scope for this checklist.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Client UI                                                       │
│  • Config > AI Provider form                                     │
│  • Chat composer model picker                                    │
│  • Ops Admin Create/Edit Tenant AI Providers step                │
│  imports catalog types only (no secrets)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ RTK Query / fetch
┌────────────────────────────▼────────────────────────────────────┐
│  API routes                                                      │
│  • /api/config/ai-provider  (GET/POST catalog + keys)            │
│  • /api/chat (+ providerId/model overrides)                      │
│  • /api/chat/ai-options     (loaded catalog)                     │
│  • /api/admin/tenants/[slug]/ai-provider                         │
│  • /api/admin/ai-models-preview                                  │
│  providerId = string present in loaded/incoming catalog          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  src/lib/ai-providers.ts (server)                                │
│  loadAiProvidersCatalog / saveAiProvidersCatalog                 │
│  seedAiProviderConfig / resolveActiveAiConfig                    │
│  DB secret AI_PROVIDERS_CATALOG → fallback builtin AI_PROVIDERS  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  src/lib/ai-providers-catalog.ts (client-safe)                   │
│  AI_PROVIDER_IDS · AI_PROVIDERS · listProviderModels             │
│  ★ Builtin seed template (not the only runtime catalog)          │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
              Provider HTTPS chat/completions + /models
```

**Runtime catalog:** each tenant/app Neon DB stores an encrypted secret `AI_PROVIDERS_CATALOG` (JSON array of `AiProviderDef`). If missing/invalid, code falls back to the static builtin `AI_PROVIDERS`.

**Wizard + seed:** Create Tenant / Create App collect the full catalog + keys and call `seedAiProviderConfig` (create-tenant) or admin `POST …/ai-provider` with `catalog` (create-app) after the DB exists.

**Design rule:** Chat, content generation, and workbook pipelines call whatever `chatCompletionsUrl` / `apiKey` / `model` `resolveActiveAiConfig()` returns (from the **loaded** catalog). You rarely touch those call sites for a new OpenAI-compatible vendor.

Mirror every **builtin** catalog change in **`templates/base/src/lib/ai-providers-catalog.ts`** so newly provisioned apps ship the same seed template. Per-tenant custom providers live only in DB secrets — no code change required.

---

## `modelsRequireAuth` (security)

`modelsRequireAuth` only gates **our** `listProviderModels()` call — whether we refuse to list models until an API key is present. It does **not** control chat auth; chat always sends `Authorization: Bearer` via `resolveProviderKey()`.

All **builtin** providers set `modelsRequireAuth: true` so admin UI and `/api/chat/ai-options` cannot enumerate upstream model catalogs without BYOK. Upstream APIs that accept unauthenticated `/models` still work when we send Bearer.

Custom catalog rows can set the flag per entry; default new custom providers to `true`.

---

## Checklist (do in order)

### 1. Confirm the provider contract

| Check | Why |
|-------|-----|
| Base URL (e.g. `https://inference-api.example.com/v1`) | Builds `chatCompletionsUrl` + `modelsUrl` |
| Auth header `Authorization: Bearer <key>` | Matches existing `fetch` callers |
| Env var name for the API key | Stored as `keyEnvVar` + `keySecretName` |
| Whether listing should require our key | Sets `modelsRequireAuth` (prefer `true`) |
| Default / recommended model id | Optional `defaultModel` |
| Response shape of `/models` | Builtin filter branch **or** generic embed-exclude default |

Probe live before coding:

```bash
curl -sS "https://…/v1/models" | head
curl -sS -X POST "https://…/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"…","messages":[{"role":"user","content":"ping"}],"max_tokens":16}'
```

### 2. Register in the builtin catalog (optional if only adding via wizard)

**Prefer Ops Admin → Create/Edit Tenant → AI Providers** to add a custom OpenAI-compatible backend without a deploy. Use this section when the provider should ship as a **builtin seed** for all new tenants.

**Files (keep in sync):**

- `src/lib/ai-providers-catalog.ts`
- `templates/base/src/lib/ai-providers-catalog.ts`

**a. Add the id to `AI_PROVIDER_IDS`:**

```ts
export const AI_PROVIDER_IDS = [
  'openai',
  'vercel-ai-gateway',
  'opencode-zen',
  'nous-research', // ← new builtin
] as const;
```

`AiProviderId` is the builtin union only. Runtime / DB ids are `string` on `AiProviderDef.id`.

**b. Append an `AiProviderDef` to `AI_PROVIDERS`:**

```ts
{
  id: 'example-provider',
  label: 'Example Provider',
  keySecretName: 'EXAMPLE_API_KEY',
  keyEnvVar: 'EXAMPLE_API_KEY',
  keyPlaceholder: 'sk-…',
  chatCompletionsUrl: 'https://api.example.com/v1/chat/completions',
  modelsUrl: 'https://api.example.com/v1/models',
  modelsRequireAuth: true,
  docsUrl: 'https://docs.example.com',
  defaultModel: 'example-model-v1',
},
```

**c. Optional `listProviderModels` switch case** for specialized filtering. Unknown/custom ids use the generic chat-model filter (exclude embed) — no `never` trap.

### 3. Re-export / type wiring (usually already done)

| File | Expectation |
|------|-------------|
| `src/lib/ai-providers.ts` | `loadAiProvidersCatalog`, `seedAiProviderConfig`, re-exports |
| `templates/base/src/lib/ai-providers.ts` | Same |
| `src/store/apis/config-api.ts` | `AiProviderStatus.catalog?`, provider ids as `string` |
| `templates/base/src/store/apis/config-api.ts` | Same |

### 4. API validation

Routes accept `catalog: AiProviderDef[]` and `providerId: string` that must exist in the **saved or incoming** catalog (see `ai-provider-def-schema.ts`). Preview may pass a full `provider` def for wizards before DB save.

| Route | Purpose |
|-------|---------|
| `src/app/api/config/ai-provider/route.ts` | Self-service catalog + key + activate |
| `src/app/api/admin/tenants/[slug]/ai-provider/route.ts` | Platform admin → tenant/app DB |
| `src/app/api/admin/ai-models-preview/route.ts` | Wizard key preview (optional inline def) |
| `src/app/api/chat/route.ts` | Per-request `providerId` override (string) |
| `src/app/api/chat/ai-options/route.ts` | Lists from `loadAiProvidersCatalog()` |

### 5. Billing / analytics (recommended)

| File | Change |
|------|--------|
| `src/lib/billing/credit-rates.ts` | Add `RATE_CARD` rows for known model ids |
| `src/domain/billing/credit-analytics.ts` | Extend `inferProvider()` heuristics if needed |

### 6. Environment & secrets

1. Add the env var to local `.env` / Vercel (fallback when no DB key).
2. Save catalog + key via **Config → AI Provider**, Ops Admin tenant/app AI Providers step, or Create Tenant seed.
3. Resolution order: **DB secret → env var** (`resolveProviderKey`).

No Prisma migration — catalog + keys reuse the `secrets` table (`AI_PROVIDERS_CATALOG`, each `keySecretName`, `AI_ACTIVE_PROVIDER`, `AI_ACTIVE_MODEL`).

### 7. Activate for chat

1. Open Config or Ops Admin → tenant/app → **AI Providers**.
2. Edit catalog rows if needed, paste API key, **Load models**, pick active provider/model, **Save**.
3. In chat, use the composer picker; overrides send `providerId` + `model` on `POST /api/chat`. With `modelsRequireAuth: true`, unconfigured providers show as unconfigured until a key exists.

---

## Worked example: Mac Studio Ollama (factory proxy)

Self-hosted models on the Mac Studio are exposed through the **factory** app (not each tenant):

| Field | Value |
|-------|--------|
| Provider id | `ollama-studio` (custom catalog row) |
| Chat | `https://tokenizmyapp.vercel.app/api/ollama/v1/chat/completions` |
| Models | `https://tokenizmyapp.vercel.app/api/ollama/v1` **or** `…/v1/models` |
| Key secret / env | `TOKENIZMYAPP_API_KEY` (must match factory `OLLAMA_PROXY_API_KEY` or `TOKENIZMYAPP_API_KEY`) |
| Factory env | `OLLAMA_BASE_URL` → public tunnel to Studio `:11434` |

Curated Studio model ids live in `src/lib/ollama-proxy.ts` (`STUDIO_OLLAMA_MODELS`). Chat rewrites `ollama/<tag>` → `<tag>` before forwarding to Ollama.

---

## Worked example: Nous Research (builtin)

| Field | Value |
|-------|--------|
| Provider id | `nous-research` |
| Base URL | `https://inference-api.nousresearch.com/v1` |
| Chat | `…/v1/chat/completions` |
| Models | `…/v1/models` (listing still requires our key when `modelsRequireAuth: true`) |
| Env / secret | `NOUSRE_SEARCH_API_KEY` |
| Default model | `tencent/hy3:free` |
| Docs | https://portal.nousresearch.com |

---

## What you usually do **not** need to change

- `src/lib/chat/chat-with-session-tools.ts` — already parameterized by URL/key/model
- Content / CMS / workbook generators — they call `resolveActiveAiConfig()`
- Chat SSE parsing — OpenAI chunk shape
- Prisma / ZenStack schema

**Exceptions (new adapter work):**

- Non–OpenAI-compatible request/response shapes
- Special auth (e.g. x402 payment headers instead of Bearer)
- Provider-specific reasoning fields that must surface in UI

---

## Verification

```bash
# Unit
bunx vitest run src/lib/ai-providers-health.test.ts src/lib/billing/credit-rates.test.ts

# Manual
# 1. Config / Edit Tenant AI Providers lists catalog (builtin or DB)
# 2. Save key → models load from /models (requires key)
# 3. Activate → chat completes with that model
# 4. Composer picker can override provider/model for one turn
# 5. Create Tenant AI Providers step seeds catalog into new Neon DB
```

---

## Skill authoring notes

1. **Trigger:** “add AI provider”, “wire OpenAI-compatible inference”, “new chatbot backend”.
2. **Hard requirements:** edit both `src/` and `templates/base/` catalogs for **builtins**; use DB catalog / wizard for tenant-specific backends; never ship API keys to the browser.
3. **Stop and ask** when the API is not OpenAI-compatible, or when auth is not Bearer API-key based.
4. **Link** this file: `docs/add-ai-provider.md`.

---

## File index (quick reference)

| Path | Role |
|------|------|
| `src/lib/ai-providers-catalog.ts` | Builtin seed + model list filters |
| `templates/base/src/lib/ai-providers-catalog.ts` | Tenant template mirror |
| `src/lib/ai-providers.ts` | Catalog load/save/seed + resolution |
| `src/lib/ai-provider-def-schema.ts` | Zod validation for catalog entries |
| `src/store/apis/config-api.ts` | Client types + RTK endpoints |
| `src/components/ops-admin/tenant-ai-providers-config-step.tsx` | Full catalog wizard UI |
| `src/components/ops-admin/tenant-wizard.tsx` | Create Tenant AI Providers step |
| `src/components/config/ai-provider-form.tsx` | Self-service UI |
| `src/components/chat/composer-model-picker.tsx` | Chat picker |
| `src/app/api/chat/route.ts` | Chat + overrides |
| `src/app/api/chat/ai-options/route.ts` | Picker options (loaded catalog) |
| `src/lib/billing/credit-rates.ts` | Per-model credit rates |
| `src/domain/billing/credit-analytics.ts` | Provider inference for analytics |
