# Chatbot replication guide

This document is the source-of-truth inventory for the current chatbot in this
repository and the runbook for moving it to a separate Next.js/Vercel project
with its own Neon database.

**Snapshot:** 2026-08-03. Paths below are relative to this repository root.

## 1. What is being replicated

The feature is more than a single API route. It is:

1. A header `Chat` icon.
2. A persistent right-hand sidebar that pushes the application content instead
   of overlaying it.
3. A lazy-loaded `ChatPanel` with streaming replies.
4. OpenAI chat-completions calls with business knowledge and optional live POS
   context.
5. Saved conversations in Neon/Postgres.
6. Optional attachments, spreadsheet context, browser speech recognition, and
   OpenAI text-to-speech.
7. Optional AI Findings and Business Review update actions.

The active implementation is in `src/`. `templates/base/` contains a template
copy, but it is not the canonical source and is partially behind the root
implementation. Copy from `src/` and verify every route in the target project.

## 2. Runtime architecture

```text
src/app/layout.tsx
  └─ AppProviders
      ├─ StoreProvider (one Redux store)
      └─ AuthProvider
          └─ ThemeRegistry
              └─ AppShell
                  ├─ header Chat icon
                  │    └─ ui.chatDrawerOpen / toggleChatDrawer()
                  ├─ main page content
                  └─ persistent right aside
                       └─ dynamic ChatPanel variant="drawer"

ChatPanel
  └─ sendStreamingMessage()
       └─ POST /api/chat
            ├─ session + policy-aware DB client
            ├─ KnowledgeService → system prompt
            ├─ optional daily_z_reports context
            ├─ encrypted DB OpenAI key → env fallback
            └─ OpenAI /v1/chat/completions → SSE

ChatPanel ── RTK Query chatApi ── conversations / voice / findings / review APIs
```

### Right-drawer behavior

The exact shell behavior is implemented in
`src/components/layout/app-shell.tsx`:

- `CHAT_DRAWER_WIDTH = { xs: 320, sm: 400 }`.
- The page is a horizontal flex layout. The main column has `flex: 1` and
  `minWidth: 0`.
- The right aside has width `0` when closed and the responsive width when open.
- The aside is `position: sticky`, `height: 100dvh`, and uses a 220 ms width
  transition. It is hidden with `visibility`, not unmounted.
- The chat panel is dynamically imported with `{ ssr: false }` so browser-only
  speech/audio APIs never execute during server rendering.
- Because the drawer stays mounted, its draft input and local component state
  survive closing and reopening it.
- The header icon uses `aria-label`, `aria-pressed`, a tooltip, and
  `toggleChatDrawer()` from `src/store/ui-slice.ts`.
- On `/ops-chat`, the page copy is hidden while the drawer is open to avoid
  displaying two visible chat panels. The page component is still mounted.

Minimal shell integration (adapt to the target project's header/layout):

```tsx
const ChatDrawerPanel = dynamic(
  () => import('@/components/chat/chat-panel').then((m) => ({ default: m.ChatPanel })),
  { ssr: false },
);

<Box sx={{ display: 'flex', width: '100%', minHeight: '100dvh' }}>
  <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
  <Box
    component="aside"
    aria-label="AI chat drawer"
    sx={{
      width: chatDrawerOpen ? { xs: 320, sm: 400 } : 0,
      height: '100dvh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
      visibility: chatDrawerOpen ? 'visible' : 'hidden',
      transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
    }}
  >
    <ChatDrawerPanel variant="drawer" />
  </Box>
</Box>
```

## 3. Canonical source inventory

Copy these files as a group. Do not copy only `chat-panel.tsx`.

### Shell, page, and state

| Responsibility | Files |
| --- | --- |
| Root composition | `src/app/layout.tsx`, `src/components/providers/app-providers.tsx`, `src/components/providers/store-provider.tsx` |
| Header and right drawer | `src/components/layout/app-shell.tsx` |
| Drawer state | `src/store/ui-slice.ts` |
| Streaming state/thunk | `src/store/chat-stream-slice.ts` |
| Store registration | `src/store/index.ts`, `src/store/hooks.ts` |
| RTK Query endpoints | `src/store/apis/chat-api.ts` |
| Shared API base | `shared/src/store/base-query.ts` (`/api`, credentials included) |
| Full-page chat route | `src/lib/page-catalog.ts`, `src/app/(app)/[slug]/page.tsx`, `src/components/blocks/stub-blocks.tsx` |
| Saved menu | `src/components/chat/saved-conversations-menu.tsx`, `src/hooks/use-saved-conversations.ts` |

### Chat UI and browser helpers

| Feature | Files |
| --- | --- |
| Main panel | `src/components/chat/chat-panel.tsx` |
| Voice profile selector | `src/components/chat/voice-profile-menu.tsx`, `src/lib/chat/tts-voices.ts` |
| Voice conversation orchestration | `src/hooks/use-voice-conversation.ts` |
| Speech Recognition support | `src/lib/chat/speech-recognition.ts`, `src/lib/chat/check-microphone.ts`, `src/lib/chat/voice-transcript.ts` |
| TTS preference | `src/hooks/use-tts-voice-preference.ts` |
| File limits/types/prompt descriptions | `src/lib/chat/attachments.ts` |
| Browser file reader | `src/lib/chat/read-attachment.ts` |
| Conversation sanitization | `src/lib/chat/conversation-messages.ts` |
| SSE parser | `src/lib/chat/sse-parser.ts` |
| Session tool definitions/execution | `src/lib/chat/session-tools.ts`, `src/lib/chat/chat-with-session-tools.ts` |
| Spreadsheet/page context | `src/lib/sheet-prompt.ts`, `src/store/sheet-viewer-slice.ts`, `src/store/apis/sheet-data-api.ts` |

### Server routes and domain services

| Endpoint/service | File |
| --- | --- |
| Main chat, streaming, conversations, voice | `src/app/api/chat/route.ts` |
| AI Findings CRUD | `src/app/api/chat/ai-findings/route.ts` |
| AI Findings replacement | `src/app/api/chat/ai-findings/save-batch/route.ts` |
| Finding summarization | `src/app/api/chat/summarize-finding/route.ts` |
| Business Review update | `src/app/api/chat/update-review/route.ts` |
| Admin conversation management | `src/app/api/admin/conversations/route.ts` |
| OpenAI key status/save/delete | `src/app/api/config/openai-key/route.ts` |
| Web-search setting | `src/app/api/config/settings/route.ts`, `src/domain/config/app-settings-service.ts` |
| OpenAI key resolution | `src/lib/openai.ts`, `src/lib/secrets.ts`, `src/lib/crypto.ts` |
| Model selection | `src/lib/chat/chat-model.ts` |
| DB client | `src/lib/db.ts` |
| Conversation bootstrap | `src/lib/db-migrate.ts`, `scripts/ensure-conversations.ts` |
| Knowledge loading/prompt | `src/domain/knowledge/knowledge-service.ts`, `src/domain/knowledge/knowledge-seed.ts` |
| Review update implementation | `src/domain/ai-content/chat-review-updater.ts` |
| Auth/session guards | `src/lib/auth/jwt.ts`, `src/lib/auth/session.ts`, `src/lib/auth/guards.ts`, `src/proxy.ts` |

### Tests that document expected behavior

```text
src/components/chat/chat-panel.test.tsx
src/store/chat-stream-slice.test.ts
src/lib/chat/sse-parser.test.ts
src/lib/chat/attachments.test.ts
src/lib/chat/conversation-messages.test.ts
src/lib/chat/session-tools.test.ts
src/lib/chat/chat-with-session-tools.test.ts
src/lib/chat/chat-model.test.ts
src/lib/chat/voice-transcript.test.ts
src/app/api/chat/ai-findings/route.test.ts
src/app/api/chat/update-review/route.test.ts
```

## 4. Dependencies

The target project must already be a compatible Next.js app or must install the
following. Keep the versions aligned with the source project where possible.

### Required for the full current implementation

| Package | Why it is needed |
| --- | --- |
| `next` | App Router, dynamic import, route handlers, `useSearchParams` |
| `react`, `react-dom` | Client components and providers |
| `@mui/material` | Drawer shell, fields, menus, dialogs, cards, controls |
| `@mui/icons-material` | Chat, send, attachment, voice, drawer icons |
| `@emotion/react`, `@emotion/styled` | MUI runtime peer dependencies |
| `@reduxjs/toolkit`, `react-redux` | `uiSlice`, streaming slice, RTK Query cache/mutations |
| `zod` | Server request validation |
| `xlsx` | Browser-side CSV/XLS/XLSX parsing |
| `@prisma/client`, `prisma` | Neon/Postgres data access and generated client |
| `zenstack`, `@zenstackhq/runtime` | Policy-aware generated DB client used by the app |
| `pg` | The key population script and some server/workflow helpers |
| `jose` | JWT session verification used by protected chat actions |
| `@mui/material-nextjs` | MUI/Next.js theme registry used by the root layout |
| local shared package/aliases | `@shared/store/base-query`, tenant config, shared types |

The active chat path does **not** import the `openai` npm package or the OpenAI
SDK. It calls OpenAI with server-side `fetch()` and a Bearer token. The existing
`@ai-sdk/openai` and `ai` packages are used by other application features and
are not required for the core `/api/chat` completion call.

Useful versions in this repository are recorded in `package.json`, including
Next `^16.2.9`, React `^19.0.0`, Prisma `6.12.0`, ZenStack runtime `2.22.3`,
RTK `^2.6.0`, and Zod `^3.24.0`.
The MUI set is `@mui/material ^9.1.2`, `@mui/icons-material ^9.1.1`, and
`@mui/material-nextjs ^9.1.1` with Emotion `^11.14.x`.

The supplied seed command is Bun-based. Install Bun in the operator/CI image,
or run the same TypeScript file with the target project's approved `tsx`/Node
runner. The repository root `tsconfig.json` excludes `scripts/**`, so validate
the seed file separately rather than assuming `bun run type-check` covers it.

### Optional dependencies by feature

- Voice input uses browser `SpeechRecognition`/`webkitSpeechRecognition`; no
  npm speech package is required.
- Voice output uses browser `Audio` plus the OpenAI TTS endpoint.
- Spreadsheet/page attachment context needs `xlsx` and the sheet viewer APIs.
- Review updates need the Business Review/Executive Summary models and content
  services.
- AI Findings need `knowledge_snippets` and the dashboard Findings block.
- Web search needs the configured OpenAI search-capable model and
  `app_settings.web_search_enabled`.

## 5. Environment variables and Vercel configuration

Set these as **server-side** variables in the target Vercel project. Never use a
`NEXT_PUBLIC_` prefix for a database URL, encryption key, or OpenAI key.

| Variable | Required | Purpose |
| --- | --- | --- |
| `POSTGRES_URL` | Yes for the current Prisma/build/bootstrap files | Target Neon connection string; the seed script also accepts `DATABASE_URL` |
| `DATABASE_URL` | Only after adapting the current build/bootstrap code | Prisma client fallback used by `src/lib/db.ts`; not sufficient by itself for the current build script and conversation bootstrap |
| `ENCRYPTION_KEY` | Yes | 64 hexadecimal characters / 32 bytes; encrypts DB secrets and signs sessions |
| `OPENAI_API_KEY` | Optional fallback | Runtime fallback if the encrypted DB secret is absent |
| `OPENAI_CHAT_MODEL` | Optional | Primary streaming model; fallback is `OPENAI_MODEL`, then `gpt-4o-mini` |
| `OPENAI_MODEL` | Optional | Legacy primary-model fallback |
| `OPENAI_CHAT_STREAM_MODEL` | Optional | Safe text model if a configured model contains `realtime` |
| `OPENAI_WEB_SEARCH_MODEL` | Optional | Search model; fallback `gpt-4o-mini-search-preview` |
| `OPENAI_TTS_MODEL` | Optional | TTS model; fallback `tts-1` |
| `OPENAI_BASE_URL` | Optional | OpenAI-compatible base URL; default `https://api.openai.com/v1` |
| `NEXT_PUBLIC_TENANT_SLUG` | Usually yes | Tenant identity used by branding and transcript names |
| `SETUP_TOKEN` | If using setup/auth bootstrap | Protects setup key endpoints |
| Google OAuth variables | If using Google login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_PROJECT_ID`, optional auth/token URIs |

The database key is resolved in this order:

```text
secrets.key_name = 'OPENAI_API_KEY' (AES-256-GCM decrypted with ENCRYPTION_KEY)
  → process.env.OPENAI_API_KEY
  → no key / friendly configuration response
```

Use the supplied script in Section 8 to populate the first source. If the
target app uses a different encryption key from the one used by the script,
decryption will fail even though the database row exists.

Configure the variables for every Vercel environment that should run the bot:
Development, Preview, and Production. A Neon branch/database used by Preview
must have its own matching `POSTGRES_URL` and an `ENCRYPTION_KEY` that was used
to encrypt its secret.

## 6. Database prerequisites

The current app assumes a separate Neon database per deployed tenant. The chat
tables do not consistently carry a tenant discriminator, so using one shared
database without adding tenant scoping is unsafe.

### Minimum tables

| Table | Chat usage | Required columns |
| --- | --- | --- |
| `secrets` | Encrypted OpenAI key | `key_name` PK, `encrypted_value`, `iv`, `auth_tag`, `created_at`, `updated_at` |
| `conversations` | Saved chat history | `id` serial PK, `user_name`, `owner_sub`, `title`, `messages` JSONB, `message_count`, `archived`, timestamps |
| `knowledge_snippets` | Business context and AI Findings | `id`, unique `key`, `content` text, `category` |
| `app_settings` | Web-search flag and tenant/brand settings | `id` PK, `web_search_enabled`, tenant/brand columns, `updated_at` |

### Tables needed for full parity

- `business_review_parts` and the Executive Summary knowledge snippet for review
  update actions.
- `user_accounts`, `roles`, `security_groups`, and `user_groups` for protected
  actions and capability checks.
- `daily_z_reports` for live actuals context.
- The generated ZenStack models in `zenstack/schema.zmodel` and its generated
  Prisma schema/client.

### Bootstrap sequence in a new project

1. Copy the relevant models from `zenstack/schema.zmodel`, including all models
   referenced by the copied `DbClient` and auth services.
2. Generate the policy-aware client:

   ```bash
   bunx zenstack generate --schema zenstack/schema.zmodel
   bunx prisma db push --schema zenstack/prisma/schema.prisma
   ```

   Use a reviewed migration process instead of `--accept-data-loss` for a
   production database. The current build script uses `prisma db push`; that is
   convenient for a new Neon database but is not a substitute for migrations.
3. Run the conversation bootstrap if the target does not already create it:

   ```bash
   bun run scripts/ensure-conversations.ts
   ```

4. Ensure `app_settings` exists by running the settings service during app
   bootstrap or by calling the settings endpoint as an authorized admin.
5. Seed `knowledge_snippets` with tenant-specific business documents. The
   fallback in `src/domain/knowledge/knowledge-seed.ts` is Red Ruby-specific
   and should not be used unchanged for another business.
6. Run the OpenAI key script from Section 8 after the target DB and encryption
   key are ready.

The provided key script only creates/upserts `secrets`; it deliberately does
not pretend to create the rest of the application schema. It uses a
parameterized `pg` bootstrap connection so it can run before a generated
Prisma client exists; runtime application queries still use the target
project's chosen Prisma/ZenStack or database layer.

For production schema management, create and commit migrations in the target
project instead of mutating the database from every Vercel build:

```bash
# New database, after generating zenstack/prisma/schema.prisma
bunx prisma migrate dev --schema zenstack/prisma/schema.prisma --name chatbot-init

# Production/CI deploy step
bunx prisma migrate deploy --schema zenstack/prisma/schema.prisma
```

Then keep the Vercel build focused on client generation and `next build`.
The current `scripts/vercel-build.sh` uses
`prisma db push --accept-data-loss`, which is acceptable only for a disposable
new database and should not be copied unchanged for an existing production
Neon database.

## 7. Server request and response contracts

### `POST /api/chat`

Request:

```json
{
  "message": "How are we tracking?",
  "history": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ],
  "attachments": [
    {
      "name": "sales.csv",
      "mimeType": "text/csv",
      "size": 1234,
      "kind": "spreadsheet",
      "extractedText": "..."
    }
  ],
  "stream": true
}
```

Current behavior:

- `message` is trimmed and required.
- Only the last six user/assistant history messages reach OpenAI; system
  history supplied by the browser is discarded.
- Database context is fetched when the message contains configured KPI/data
  keywords. It reads recent `daily_z_reports` and a current-month aggregate.
- The knowledge system prompt is assembled from DB snippets, with seeded
  fallback content when the table is empty.
- `maxDuration` is 60 seconds.
- The current route accepts anonymous chat requests. Decide whether that is
  acceptable before replication; the safer default is to require a session.

Streaming response is `text/event-stream` with `data:` JSON lines:

```text
data: {"choices":[{"delta":{"content":"Hello"}}]}

data: {"type":"chat_action","action":"save_conversation"}

data: {"error":"The AI service returned an error."}

data: [DONE]
```

`src/lib/chat/sse-parser.ts` converts these into token, action, error, and done
events. The Redux thunk appends tokens to the blank assistant message created
when sending starts.

### Other endpoints

| Method and path | Purpose | Current authorization |
| --- | --- | --- |
| `POST /api/chat?resource=voice` | OpenAI TTS; body `{ text, voice?, speed? }`, max text 5,000 chars | No route guard in current implementation |
| `GET /api/chat?resource=conversations&limit=20` | List saved conversations, max 50 | No route guard in current implementation |
| `GET /api/chat?resource=conversations&id=123` | Load one conversation | No route guard in current implementation |
| `POST /api/chat?resource=conversations` | Save `{ title?, messages[] }` | No route guard in current implementation |
| `PATCH /api/chat?resource=conversations&id=123&archived=true` | Archive/unarchive | Weak owner/admin check; rows with null `owner_sub` are not fully protected |
| `GET /api/chat/ai-findings` | Read Findings | Session required |
| `POST /api/chat/ai-findings` | Add one Finding | Write-auth required |
| `DELETE /api/chat/ai-findings?ids=a,b` | Delete selected/all Findings | Write-auth required |
| `POST /api/chat/ai-findings/save-batch` | Replace all Findings | Write-auth required |
| `POST /api/chat/summarize-finding` | `gpt-4o-mini` 2–3 sentence summary | Write-auth required |
| `POST /api/chat/update-review` | Rewrite review or Executive Summary | Write-auth required |
| `GET /api/config/openai-key` | Key configured/source status, never plaintext | `config:write` |
| `POST /api/config/openai-key` | Admin UI encrypted key save | `config:write` |
| `DELETE /api/config/openai-key` | Remove DB key | `config:write` |
| `GET/PATCH /api/config/settings` | Read/update web-search flag | `settings:write` for update |

The proxy also rewrites `/api/voice` to the voice resource and
`/api/conversations` to the conversation resource. Copy those rewrites if the
target UI or external clients use the aliases.

## 8. Populate the OpenAI key in the new Neon database

The repository now includes:

```text
scripts/seed-chatbot-openai-key.ts
```

and the package shortcut:

```bash
bun run seed:chatbot-key
```

The script:

1. Reads `POSTGRES_URL` (or `DATABASE_URL` when run standalone).
2. Reads `CHATBOT_OPENAI_API_KEY` (or `OPENAI_API_KEY`).
3. Requires a 64-character hexadecimal `ENCRYPTION_KEY`.
4. Creates `secrets` if it does not exist.
5. Encrypts the key with AES-256-GCM.
6. Upserts `key_name = 'OPENAI_API_KEY'`.
7. Reads the encrypted columns back and performs a decrypt round trip with the
   supplied `ENCRYPTION_KEY`.
8. Prints only the key name and timestamp, never the plaintext or encrypted
   value.

Run it against the **new target Neon database** from a secure shell or CI
environment. Prefer Vercel's encrypted environment settings or a CI secret
manager. For a local interactive Bash session, read the values without putting
them in shell history:

```bash
read -r -p 'Target Neon URL: ' POSTGRES_URL
read -r -s -p 'ENCRYPTION_KEY: ' ENCRYPTION_KEY; printf '\n'
read -r -s -p 'OpenAI API key: ' CHATBOT_OPENAI_API_KEY; printf '\n'
export POSTGRES_URL ENCRYPTION_KEY CHATBOT_OPENAI_API_KEY

bun run seed:chatbot-key

unset POSTGRES_URL ENCRYPTION_KEY CHATBOT_OPENAI_API_KEY
```

Do not commit these values, put them in a `NEXT_PUBLIC_` variable, or paste
them into this document. After deployment, use the target Admin/Config UI or a
protected request to verify status only. The expected data is equivalent to:

```json
{ "configured": true, "source": "db" }
```

Never query or log `encrypted_value`, `iv`, or `auth_tag` outside controlled
database troubleshooting.

## 9. Step-by-step replication into another Vercel project

### Step 1 — Create isolated infrastructure

1. Create the destination Vercel project.
2. Create a dedicated Neon project/database (or branch for Preview).
3. Add `POSTGRES_URL`, `ENCRYPTION_KEY`, tenant identity, and auth variables to
   the correct Vercel environments.
4. Make sure the destination `ENCRYPTION_KEY` is available both to the key seed
   script and to the deployed app.

### Step 2 — Prepare the Next.js project

1. Use a compatible App Router Next.js project.
2. Install the packages in Section 4.
3. Copy the source files in Section 3, preserving the `@/*` alias or changing
   imports consistently.
4. Copy the Redux provider and add `chatStream` and `chatApi` to the target
   store. Add `ui.chatDrawerOpen` and its reducers to the UI slice.
5. Ensure the target's shared `baseQuery` uses `baseUrl: '/api'` and
   `credentials: 'include'`.

### Step 3 — Add the UI entry points

1. Add the header Chat icon and dispatch `toggleChatDrawer()`.
2. Add the persistent right aside from Section 2 to the root shell.
3. Dynamically import `ChatPanel` with `ssr: false`.
4. Make sure the root layout wraps the shell in Redux, auth, and MUI theme
   providers.
5. Add `/ops-chat` (or the target route) and register a `chat_panel` block if
   the target uses a catalog/dynamic-page system.

### Step 4 — Add server functionality

1. Copy `/api/chat/route.ts` and the supporting chat/domain files.
2. Copy the Findings, summarize, review, config, and admin routes only for the
   optional features the target will expose.
3. Copy `src/lib/db.ts`, the generated Prisma client, and the relevant ZenStack
   models, or adapt the route to the target's existing database layer.
4. Copy the auth session/proxy/guard behavior. Do not assume a cookie from the
   source project will work in the destination domain.
5. Add any proxy rewrites used by the client (`/api/voice`,
   `/api/conversations`).

### Step 5 — Initialize Neon

1. Generate the Prisma/ZenStack client.
2. Apply the schema to the new database.
3. Create/verify `conversations`, `knowledge_snippets`, `app_settings`, and
   `secrets`.
4. Seed target-specific knowledge snippets and, if applicable, POS/review
   tables.
5. Run `bun run seed:chatbot-key` with the target Neon URL and encryption key.

### Step 6 — Configure AI behavior

1. Select a model that supports `/v1/chat/completions` streaming. Do not set a
   `gpt-realtime-*` model as the streaming model.
2. Set `OPENAI_CHAT_MODEL` or accept the `gpt-4o-mini` fallback.
3. If using web search, set the search model and enable the DB setting.
4. If using voice, set `OPENAI_TTS_MODEL` and verify browser microphone/audio
   permissions.
5. Replace the Red Ruby fallback knowledge and monthly targets with the
   destination business context.

### Step 7 — Build and deploy

1. Ensure the build generates the Prisma client before `next build`.
2. Do not use a production `prisma db push --accept-data-loss` workflow without
   a backup and explicit approval.
3. Deploy to Vercel.
4. Confirm the route is running in the Node.js runtime if the target DB driver
   or generated Prisma client requires it.

### Step 8 — Verify end to end

1. Sign in if the target protects the chat route.
2. Click the header Chat icon; confirm the aside opens from the right and the
   main content shrinks rather than being covered.
3. Close and reopen; confirm the draft remains.
4. Send a short message; confirm token-by-token rendering and `[DONE]` handling.
5. Send a KPI question; confirm live DB context is present.
6. Save, reload, and open a conversation from the Saved menu.
7. Upload a small CSV/XLSX and an image; verify spreadsheet text and image
   handling.
8. Test voice only in a browser that exposes Speech Recognition and after
   granting microphone permission.
9. Test Findings/review actions only with an authorized account.
10. Check Vercel logs for errors without logging secrets or full attachment
    payloads.

## 10. Feature details to preserve

### Prompt and live data

`KnowledgeService.buildSystemPrompt()` loads all DB snippets ordered by key. It
falls back to `KNOWLEDGE_SEED_SNIPPETS` when no DB rows are available. The
builder:

- prioritizes `overview`, `strategy`, `metrics`, `actions`, and `risks`;
- caps individual snippets at 1,500 characters;
- caps non-core categories at 1,000 combined characters;
- appends hardcoded monthly targets;
- adds IDR formatting, data-driven answer, BEP, and margin instructions; and
- caps the system prompt at 18,000 characters.

For large prompts, `/api/chat/route.ts` runs a map/reduce context pass with
`gpt-4o-mini` before the final completion. The current implementation uses
hardcoded `MONTHLY_TARGETS_SEED` values for comparisons rather than querying the
`monthly_targets` table.

Database context is deliberately keyword-triggered. It reads up to seven recent
`daily_z_reports` rows and current-month totals when the message includes terms
such as `revenue`, `EBITDA`, `KPI`, `tracking`, `actual`, `target`, `trend`,
`guests`, `covers`, or `performance`.

### Attachments

`src/lib/chat/attachments.ts` defines the current limits:

- 15 MB maximum selected file size;
- 4 MB maximum raw file size embedded as base64;
- 20,000 characters maximum extracted spreadsheet text;
- images under the embed limit become OpenAI `image_url` parts;
- CSV/XLS/XLSX are parsed in the browser with `xlsx`;
- PDF/TXT metadata is sent, but their contents are not extracted by the current
  reader; and
- saved conversation payloads are sanitized and oversized base64 is removed.

### Voice

- Speech recognition is browser-provided, continuous, interim, and `en-US`.
- A message is sent after approximately two seconds of silence.
- The assistant TTS route returns base64 MP3 data; it is not an OpenAI Realtime
  websocket implementation.
- Voice profiles are `alloy`, `echo`, `fable`, `onyx`, `nova`, and `shimmer`.
- Preferences use local storage keys `redruby.ttsVoice`,
  `redruby.assistantVoiceVolume`, and `redruby.assistantVoiceMuted`.

### Session tools

The server exposes OpenAI function tools only when the user explicitly asks to
manage the session. Tools are:

```text
new_chat_session
clear_conversation
close_conversation
save_conversation
update_review_documents
```

Tool results can emit client actions in the SSE stream. The client queues them
in `chatStream.pendingSessionActions` and processes them after streaming ends.

The current `update_review_documents` implementation calls
`fetch('/api/chat/update-review')` from server-side tool execution. Relative
URLs are not guaranteed to work in a Vercel server runtime; use an absolute
origin or call the review service directly before relying on this tool in the
destination project.

## 11. Security and replication warnings

These are current behaviors to review, not hidden guarantees:

1. The main chat, voice, and conversation handlers currently allow anonymous
   requests. Add `requireSession`/rate limiting before exposing sensitive
   business data publicly.
2. Anonymous conversation listing can expose non-archived rows. Require a
   session and filter by `owner_sub` for non-admin users.
3. The session-tool save path does not currently set `ownerSub`, while the
   direct UI save path does. Fix this before treating ownership checks as a
   complete boundary.
4. AI Findings are stored as one global JSON array under
   `knowledge_snippets.key = 'ai_findings'`; they are not tenant/user scoped.
5. Separate Neon databases provide the current tenant isolation. If the target
   shares a database, add tenant IDs and enforce them in every query.
6. `OPENAI_BASE_URL` is honored by the normal chat completion helper, but some
   map/reduce, TTS, summarization, and review calls use a hardcoded OpenAI URL.
7. A 4 MiB raw attachment can become roughly 5.3 MiB of base64 plus JSON,
   exceeding Vercel's typical 4.5 MiB function request limit. Lower the embed
   limit, enforce aggregate request limits server-side, or upload files to
   object storage before scaling this feature.
8. The selected review-section slug is currently included in a text summary;
   the default review route may update all review documents. Verify this action
   before copying it as a precise section editor.
9. `getOpenAiKeyStatus()` reports that a DB row exists; it does not decrypt the
   row. The seed script does a round-trip check, but a deployed smoke test must
   still send a real short chat request.
10. Do not expose `OPENAI_API_KEY`, `ENCRYPTION_KEY`, or `POSTGRES_URL` to the
   browser. The DB status endpoint must return status only.
11. Do not copy the Red Ruby-specific fallback prompt or business numbers into a
   new tenant without replacing them.

## 12. Validation checklist

Run from the target project after adapting imports and schema:

```bash
bun run type-check
bun run lint
bun run test
bun run enforce:redux
bun run build
```

At minimum, retain tests for the SSE parser, streaming reducer, attachment
limits, conversation sanitization, model selection, route validation, and
authorization. Add an integration test that mocks OpenAI and verifies:

```text
POST /api/chat with stream=true
  → token events are emitted
  → [DONE] is emitted
  → no API key appears in the response or logs
```
