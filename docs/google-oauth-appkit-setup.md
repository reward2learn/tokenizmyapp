# Google OAuth Social Wallet Sign-In with Reown AppKit

This guide explains how to integrate **Google OAuth social wallet sign-in** into a new application using Reown AppKit (`@reown/appkit` v1.8.x + wagmi). It is written to be generic: every phase is directly applicable to any app.

> **TokenizMyApp factory (current production):** the live journey is **Sign in (app JWT) → Connect Wallet (Reown Google social) → factory SIWE → `walletAddress` on `redruby.session`**. That two-layer model, Corrections **E–G** (claim-on-verify, await `readyPromise`, EIP-1271 raw signatures), and the exact file map are documented in [`factory-reown-siwe-wallet-link.md`](./factory-reown-siwe-wallet-link.md). Agent skill: `.cursor/skills/reown-siwe-wallet-link/`. Prefer that doc when changing the factory billing wallet. This guide remains the generic Corrections **A–D** background; PRESTIX paths in the final section are historical.

The flow combines three pieces:

1. **AppKit social login** — Reown's embedded wallet: the user clicks the Google button, completes OAuth in a popup, and AppKit provisions an embedded (social) EOA/smart-account wallet.
2. **SIWE (Sign-In With Ethereum)** — the embedded wallet signs an EIP-4361 message; your backend verifies the signature.
3. **JWS session cookie** — on successful verification, the server issues or **extends** a signed session cookie (jose), restoring the session on refresh.

> **Note:** This guide was cross-validated against production AppKit v1.8.x social sign-in. Corrections **A–D** inline are hard-won findings — bake them in from the start. Factory-specific Corrections **E–G** are only in [`factory-reown-siwe-wallet-link.md`](./factory-reown-siwe-wallet-link.md).

## Flow Overview

End-to-end, the flow looks like this:

1. User opens the app and clicks **Continue with Google** in the AppKit modal.
2. Google OAuth popup completes; Reown provisions an **embedded wallet** for the social profile and creates a local AppKit account.
3. AppKit finishes initialization (`readyPromise` resolves) and the app **re-applies its own SIWX/SIWE mapping** over AppKit's defaults (Correction A).
4. AppKit calls `getNonce()` → your server generates a fresh nonce and returns the **full EIP-4361 message** (Correction B).
5. The wallet signs the server-returned message (AppKit prompts the user; the wallet chain is actively switched to the SIWE target chain first if needed — Correction D).
6. AppKit calls `verifyMessage()` → your server verifies the signature, resolves/creates the user, and creates a `WalletSession` with a **UNIQUE nonce**.
7. The server sets a **JWS cookie** (`__Secure-next-auth.session-token` / `next-auth.session-token`), 30-day expiry (Correction C).
8. On refresh, `getSession()` returns the valid session from the cookie/DB — **no re-prompt**.

## Phase 0 — Prerequisites

- A [Reown Cloud](https://cloud.reown.com) project with a **projectId**. This is the `NEXT_PUBLIC_PROJECT_ID` value used by AppKit and wagmi.
- **Google enabled under "Social & Email"** in the Reown Cloud dashboard (`Your Project → Settings → Social & Email → Social Logins → Google`). AppKit surfaces the Google button only when this is enabled server-side by Reown.
- **CRITICAL — register the OAuth redirect/callback URI in BOTH places:**
  - **Reown Cloud dashboard:** add your app's origin (e.g. `https://app.example.com`) to the allowed redirect/callback URIs (`Your Project → Settings → Domain / Callback URLs`). If this is missing, the Google popup opens but the OAuth callback never completes — the single most common cause of "social login never completes".
  - **Google Cloud Console:** in the OAuth client used by Reown for your project, add the **matching authorized redirect URI** (the same origin). The two registrations must agree; a mismatch manifests as `redirect_uri_mismatch` in the popup.
- **Environment variables from [Phase 6](#phase-6--environment-variables) are prerequisites for Phases 2–5.** In particular, `NEXT_PUBLIC_PROJECT_ID`, `NEXTAUTH_SECRET`/`AUTH_SECRET`, and `DATABASE_URL` are required before the client and server code below will function. Set them up first.

## Phase 1 — Dependencies

Install (versions shown are the validated production set):

```bash
bun add @reown/appkit@^1.8.x @reown/appkit-adapter-wagmi@^1.8.x @reown/appkit-siwe@^1.8.x \
  wagmi@^3 viem@^2.x siwe@^3.0.0 jose@^6.x
```

| Package | Version | Purpose |
|---------|---------|---------|
| `@reown/appkit` | `^1.8.x` | Modal, embedded wallet, social login UI |
| `@reown/appkit-adapter-wagmi` | `^1.8.x` | Wagmi adapter for AppKit |
| `@reown/appkit-siwe` | `^1.8.x` | `createSIWEConfig`, `formatMessage` (CAIP-122) |
| `wagmi` | `^3` (or `>= 2.19.5`) | React hooks + `switchChain` / `getAccount` |
| `viem` | `^2.x` | Chain definitions, `verifyMessage` (EIP-1271/6492) |
| `siwe` | `^3.0.0` | EIP-4361 parsing and EOA verification (v3 API — **not** v4) |
| `jose` | `^6.x` | JWS signing of the session cookie |
| `@reown/appkit-controllers` | (peer) | `OptionsController`, `SIWXUtil`, `ChainController` — needed to re-apply your SIWX mapping (Correction A) |

> **Note:** The AppKit wagmi adapter's peer range allows `wagmi >= 2.19.5`; the production reference resolves to **wagmi 3.x** (3.6.14). Write `wagmi ^3` (or `>= 2.19.5`) — do **not** pin to `^2.x`, which can resolve below the adapter's supported floor.

> **Note:** `siwe` must be v3 (`^3.0.0`). The v4 API removed helpers this flow relies on; do not upgrade it in lockstep with other packages.

If your app ships a module that initializes AppKit eagerly, also add a **pre-import crash guard** (see the reference implementation note about `src/lib/appkit-patch.ts` in [Production Notes](#production-notes--prestix-reference-implementation)) — it must run **before** any AppKit module import.

## Phase 2 — Client: AppKit Initialization

Create the AppKit modal once, on the client. The essential options:

```ts
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from 'viem/chains';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, sepolia],
  projectId,
  ssr: true,
});

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, sepolia],
  projectId,
  defaultNetwork: sepolia, // SIWE target chain by default
  enableNetworkSwitch: true,
  metadata: {
    name: 'Your App',
    description: 'App description',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://app.example.com',
    icons: ['https://app.example.com/icon.png'],
  },
  features: {
    socials: ['google'],          // surfaces the Google button
    reownAuthentication: true,    // REQUIRED for social/embedded flow
    legalCheckbox: true,
    email: true,                  // optional
  },
  siweConfig,                     // your SIWE config from Phase 3
});
```

Key points:

- **`features.socials: ['google']`** — controls which social providers appear. Google must also be enabled in the Reown Cloud dashboard (Phase 0).
- **`metadata.url`** must be `window.location.origin` (fall back to your canonical URL for SSR). WalletConnect and Reown's OAuth use it to validate the page origin.
- **`siweConfig` is always registered**, even when you enable `reownAuthentication`. This is the hook your verify endpoint relies on.

### Correction A (critical) — Re-apply your SIWX mapping after AppKit is ready

> **Correction A:** With ReownAuthentication active, AppKit's init **replaces your custom `siweConfig` callbacks** with its own ReownAuthentication implementation. If you do nothing, `verifyMessage` is **never called** and sign-in silently breaks.

This applies not only when you set `reownAuthentication: true` locally — **Reown Cloud remote config can enable ReownAuthentication and overwrite your SIWE mapping even if your local config has it off**. Treat **"always re-apply your SIWX mapping after AppKit is ready"** as the durable invariant, regardless of your local `reownAuthentication` value:

```ts
const ready = (modal as unknown as { readyPromise?: Promise<unknown> }).readyPromise;
if (ready) {
  void ready.then(async () => {
    // 1. Re-apply YOUR SIWX config (OptionsController.setSIWX with your callbacks)
    applyYourSiwxToAppKit(); // your equivalent of the reference applyPrestixSiwxToAppKit()

    // 2. Signal the app is ready — gates getNonce so it never fires before providers are initialised
    signalSiweAppReady();

    // 3. Initialise SIWX with your config so session checks use YOUR callbacks
    SIWXUtil.initializeIfEnabled(ChainController.getActiveCaipAddress());
  });
}
```

Your SIWX config should override `signMessage` with a **wagmi-only signer**. Do not implement a `window.ethereum` fallback — in this stack it was removed deliberately; all signing routes through wagmi exclusively.

## Phase 3 — SIWE Callbacks

Build your config with `createSIWEConfig` from `@reown/appkit-siwe`. Each callback maps to one server endpoint:

### `getNonce`

- Fire a **server call** to your nonce endpoint (Phase 4).
- The server returns `{ message, nonce, expiresAt }` — the client **signs the server-returned message** (Correction B; the server message is authoritative).
- **Correction D — chain handling must be ACTIVE, not silent:**

```ts
// If the wallet reports mainnet, actively switch the wallet to the SIWE target chain
// BEFORE requesting the signature — the wallet UI and the signed message must never disagree.
if (chainId === MAINNET_CHAIN_ID) {
  try {
    await switchChain(wagmiConfig, { chainId: sepolia.id });
    await new Promise((resolve) => setTimeout(resolve, 600)); // let state propagate
    chainId = SEPOLIA_CHAIN_ID;
  } catch {
    throw new Error('SIWE requires the testnet chain. Please switch your wallet and try again.');
  }
}

// All OTHER unexpected chains are coerced through an allowlist resolver.
// The signed message ALWAYS uses the allowlist-resolved chain.
const finalChainId = resolveAllowedChainId(chainId);
```

  - If the wallet is on mainnet and the user **declines** the switch, **abort** with a clear error — do not proceed with a mismatched chain.
  - Every other unexpected/unlisted chain is coerced via an allowlist resolver (e.g. `resolvePrestixSiweChainId` in the reference). The signed message must always match the allowlist-resolved chain ID.

### `createMessage`

```ts
createMessage: ({ address, ...args }) => formatMessage(args, address),
```

Use `formatMessage` from `@reown/appkit-siwe` — it produces the canonical **CAIP-122** message. Do **not** hand-roll the string; byte-exact format matters for verification and audit.

### `verifyMessage`

- POST `{ message, signature, nonce, chainId }` to your verify endpoint (Phase 4).
- Validate input shape and signature format client-side first (`/^0x[a-fA-F0-9]{130,}$/` — lenient by design, see Phase 4).
- Return `true` only on a successful server response; return `false` (with logging) on any failure so AppKit surfaces the error instead of hanging.
- **Session-restoration detection:** ReownAuthentication calls `verifyMessage` during init with token-restoration payloads that have **no fresh `Nonce:` line**. Skip verification in those cases (or short-circuit to the existing DB session) — otherwise you get "Failed to verify message" cascades and infinite re-prompt loops.

### `getSession`

- Server session check (cookie + DB). **Add an in-flight guard** so concurrent calls (AppKit can fire several during init) don't both return `null` and both trigger the SIWE flow.
- **Skip SIWE when a valid DB session already exists** for the connected wallet — return that session instead.

### `onSignIn` / `signOut`

- `onSignIn`: persist any session token returned by verify, invalidate the session cache, update client state.
- `signOut`: call your server sign-out, clear client session state **and all stale flags** (see Gotchas), then disconnect the wallet.

### Client hydration guard

Never fire the SIWE trigger while the persisted client session is still hydrating:

```ts
if (sessionStatus === 'loading') return; // session is hydrating — do not conclude "no session"
```

This single guard prevents the most common false-negative: `useSession()` briefly reports no session during rehydration, which otherwise triggers a spurious SIWE prompt.

## Phase 4 — Server: Nonce + Verify

### Nonce endpoint (`GET` + `POST`)

- **Rate limit: 10 requests/min/IP** (in-memory per instance — see the security table note).
- Accepts optional `address` / `chainId` query/body parameters for logging and chain resolution.
- Returns:

```json
{
  "message": "<full EIP-4361 message>",
  "nonce": "a3f9...",
  "expiresAt": "2026-08-20T12:00:00.000Z"
}
```

- **Correction B — the FULL EIP-4361 message is generated SERVER-side:**
  - `domain` from the **`Host` header** (never a hardcoded constant),
  - `uri` from the **request origin**,
  - `chainId` **allowlist-resolved** server-side,
  - `nonce = randomBytes(16).toString('hex')` (32 hex chars),
  - expiry ~15 minutes.
- Instruct your client: **the client signs the server-returned message** (authoritative). Never let the client assemble the message and submit it for verification later.

### Verify endpoint (`POST`)

- **Rate limit: 5 requests/min/IP.**
- Body: `{ message, signature, nonce, chainId, walletInfo }`.
- **Signature format gate** — `^0x[a-fA-F0-9]{130,}$`. This is **lenient by design**: EIP-6492/EIP-1271 (smart-account) wrapped signatures are much longer than 130 hex chars but still pure hex. Reject anything that fails the gate before any verification work.
  - Route by **smart-account detection** (`isSmartAccountSignature`): smart-account signatures go to **viem-only verification** — **never normalize** them.
  - **Only normalize the EOA v-recovery byte** (to 27/28) — and only for standard 65-byte EOA signatures (130–132 hex chars).
- **`looksLikeSiweMessage` gate** — reject JSON payloads / non-SIWE bodies with a **400 before any verification** is attempted.
- **EOA path:** `siwe.verify()` (recover the address from the message+signature, compare with the message address).
- **Fallback path:** `viem.verifyMessage()` for **EIP-1271 / EIP-6492** (smart accounts), with **cross-chain retry mainnet ↔ Sepolia** (and any other unlisted chain retried on Sepolia).
- **Byte-exact EIP-191 hashing:** normalize line endings (`\r\n` → `\n`) but use **`.trimStart()` ONLY** — never trim the end. Trailing whitespace is part of the signed bytes; trimming it changes the hash and breaks verification.
- **Session-restoration detection:** skip verification when the message has **no fresh `Nonce:` line** (ReownAuthentication calls `addSession` during init). Without this check you get "Failed to verify message" cascades and infinite re-prompt loops.
- **User resolution:** find-or-create the user by wallet address; if the social profile has an email and the session user has no wallet, **link** the wallet to that profile.
- **Session creation:** create a `WalletSession` row with a **UNIQUE nonce** (replay protection — a second attempt with the same nonce must fail or be idempotently short-circuited, never create a second session), **30-day expiry**, and the **message + signature stored for audit**.
- **Correction C — cookie semantics (NextAuth-compatible convention):**
  - Cookie value: **JWS via jose** (sign, do not encrypt).
  - Cookie name: `__Secure-next-auth.session-token` when secure, else `next-auth.session-token` (`getSessionCookieName()`).
  - `secure` flag derived from **`NEXTAUTH_URL.startsWith('https://')`**, falling back to the **`VERCEL`** env — **NEVER from `NODE_ENV`** (E2E runs production builds over plain HTTP; a secure cookie is silently dropped and the session never restores).
  - **`NEXTAUTH_SECRET`/`AUTH_SECRET` is MANDATORY** — the verify endpoint returns 500 without it.
  - `sameSite: 'lax'`, `httpOnly: true`, `maxAge: 30 * 24 * 60 * 60` (30 days).

### Optional: self-hosted ReownAuthentication

If you want DB-backed sessions behind AppKit's own auth (instead of only your SIWE path):

- Implement **`/auth/v1/authenticate`** and **`/auth/v1/me`** on your origin.
- Set **`NEXT_PUBLIC_W3M_API_URL`** to your origin (e.g. `https://app.example.com`).
- **Run the reown-auth patch script after `bun install`** (in the reference: `scripts/patch-reown-auth.js`, patches the installed `ReownAuthentication.js` to use your origin + SIWE guard). Without the patch: **"Forbidden: Nonce mismatch"** on social/email login.

## Phase 5 — Client: Social Wallet Handler

ReownAuthentication handles the Google popup and embedded wallet provisioning, but it **bypasses your custom SIWE flow** for the session. A dedicated component detects social connections and completes the missing SIWE step:

```tsx
function SocialWalletSIWEHandler() {
  const { data: session, status: sessionStatus } = useSession();
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    // Hydration guard: never trigger SIWE while the persisted session is still hydrating
    if (sessionStatus === 'loading') return;

    const isSocialWallet = detectSocialOrEmbeddedConnection(); // local-storage indicators, account type

    if (!isSocialWallet) return;

    const hasSessionForWallet = checkSessionForWallet(address); // session cache / server check

    if (isConnected && address && !hasSessionForWallet) {
      triggerSiweFlow(address); // AppKit SIWE prompt -> getNonce -> sign -> verify
    }
  }, [sessionStatus, address, isConnected]);

  return null;
}
```

Behavior contract:

1. **Detect** a social/embedded connection: `useAppKitAccount` plus local-storage indicators (Reown auth tokens, embedded-wallet markers). Regular EOA/wallet-connect connections are left to AppKit's own SIWE.
2. **Check the session for that wallet address** (session cache first, then server).
3. **Trigger the SIWE flow only when no session exists** for the wallet.
4. **Hydration guard:** `if (sessionStatus === 'loading') return` — never fire while the persisted session is hydrating.
5. **Stale-flag cleanup on ALL code paths** — including early returns: remove `just-signed-in`, `just-signed-out`, and pending-nonce markers in `finally` blocks and every early exit, or a stale flag from a previous session causes skipped prompts / phantom re-prompts.
6. **Post-sign-in session cache** — after `verifyMessage` succeeds, cache the session for the wallet address so subsequent mounts don't re-prompt (avoids modal hangs where AppKit waits on a session that already exists).

## Phase 6 — Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_PROJECT_ID` | ✅ | Reown Cloud project ID (AppKit + wagmi + WalletConnect) |
| `NEXT_PUBLIC_HOST` | ✅ (prod) | Canonical public origin; fallback for `metadata.url` / nonce domain |
| `NEXT_PUBLIC_W3M_API_URL` | ✅ | Your origin when self-hosting ReownAuthentication (`/auth/v1/*`) |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | ✅ | JWS signing secret; **verify endpoint 500s without it** |
| `NEXTAUTH_URL` | ✅ (prod) | Canonical URL; also derives the cookie `secure` flag |
| `DATABASE_URL` | ✅ | Postgres connection for users + `WalletSession` rows |
| `SIWE_ENABLED` | optional | Master switch for the SIWE flow (`false` disables signature requirement); sync a `NEXT_PUBLIC_SIWE_ENABLED` client copy |
| `NEXT_PUBLIC_SIWE` / `NEXT_PUBLIC_ENABLE_SIWE` | optional | Legacy/alternate client-side SIWE switches (all honored, any `false` disables) |
| `NEXT_PUBLIC_<CHAIN>_RPC_URL` | recommended | Per-chain RPC URLs for viem verification / retries (mainnet, sepolia, …) |

> **Note — API key security:** provider API keys must **never** be client-exposed. Do not add `NEXT_PUBLIC_*_API_KEY` variables; server-side keys are read server-only and should be stored encrypted in your database, never in plain env vars readable by the client bundle.

## Phase 7 — Test Checklist

Run these against a real browser session (DevTools → Network + Application tabs):

1. **Social connect:** Modal shows the Google button; clicking it completes OAuth and an **embedded wallet address** appears in `useAppKitAccount` / the account view.
2. **Single prompt:** The SIWE signature prompt fires **exactly once** per fresh connection (no double prompts from the handler + AppKit racing).
3. **Cookie set:** After signing, the Network tab shows a `Set-Cookie` header for `next-auth.session-token` (or `__Secure-…` on HTTPS) on the verify response.
4. **Refresh → no re-prompt:** Reload the page; the session restores via `getSession()` and **no SIWE prompt appears**.
5. **Sign-out → prompt returns:** Sign out, refresh — the SIWE prompt returns on the next connect attempt (stale flags cleaned).
6. **EIP-1271 smart-account path:** Connect a smart-account (or embedded smart-account) wallet; the signature verifies through the viem fallback (watch server logs for `verifyWithViem`), not the EOA path.
7. **Nonce replay rejected:** Reuse a previously used nonce in a second verify call; the server rejects it (UNIQUE constraint) and no second session is created.
8. **Chain match:** With the wallet on mainnet, the wallet UI shows the switch to Sepolia and the signed message's `Chain ID:` line equals the wallet's chain after the switch (no silent mismatch).

## Security Controls

| Control | Mechanism | Notes |
|---------|-----------|-------|
| Replay prevention | `WalletSession.nonce` UNIQUE constraint | Same nonce cannot mint a second session; duplicate create is idempotent-short-circuited |
| XSS | `httpOnly` session cookie | Token never readable by client JS |
| CSRF | `sameSite: 'lax'` | Cross-site POSTs won't carry the cookie |
| Brute force | Rate limits: nonce **10/min**, verify **5/min**, session creation **10/min** (per IP) | See note below on scope |
| Message integrity | Byte-exact EIP-191 hashing — `.trimStart()` only; line-ending normalization | Trimming the end changes the hash and breaks verification |
| Payload gate | `looksLikeSiweMessage` rejects JSON/non-SIWE bodies with 400 | Prevents garbage/abuse from reaching verification |
| Signature gate | `^0x[a-fA-F0-9]{130,}$` before any verification | Lenient for EIP-6492/1271 wrappers; rejects junk early |
| Signing integrity | Client signs the **server-returned** message (Correction B) | Prevents client-side message forgery |

> **Note:** The rate limiters are **in-memory per server instance** — they throttle a single instance's exposure but are **not** a global limit across serverless replicas. Do not treat them as a distributed anti-abuse control; pair them with a production-grade external limiter if you need global enforcement.

## Gotchas

- **Infinite SIWE re-prompt loop.** Two root causes: (a) the hydration race — `useSession()` reports `loading`/`unauthenticated` before rehydration completes, the handler concludes "no session" and fires SIWE; (b) stale flags from a previous sign-in/sign-out. Fix: hydration guard (`if (sessionStatus === 'loading') return`) + session cache + the server-side session-restoration detection (skip verify when no fresh `Nonce:` line).
- **Stale window/sessionStorage flags.** `just-signed-in`, `just-signed-out`, pending-nonce, and wallet-address markers must be **cleaned on ALL code paths — including early returns** (use `finally`). A leftover flag either skips a needed prompt or triggers a phantom one on the next session.
- **Silent chain coercion creates cache conflicts.** If the client silently signs a message for a different chain than the wallet UI shows, session caches keyed by (wallet, chain) disagree and the session never restores. Switch the chain **actively** (Correction D); the wallet UI and signed message must always agree.
- **ReownAuthentication override.** Local `reownAuthentication: false` does NOT protect you — Reown Cloud remote config can enable ReownAuthentication and replace your SIWE callbacks. Always re-apply your SIWX mapping on `readyPromise` (Correction A), and/or disable Reown Authentication in the dashboard at `dashboard.reown.com → Your Project → Settings → Features`.
- **CSP allowances for the Reown embedded iframe.** If your app ships a Content-Security-Policy, the embedded wallet runs in an iframe — allow `frame-src` for the Reown auth origins and `connect-src` for their API endpoints, or social login fails with a silent CSP violation in the console.
- **Mobile vs desktop popup behavior.** On desktop the Google OAuth flow runs in a popup window; on mobile it typically redirects/fullscreens. Test both — popup blockers can silently kill the desktop flow, and the redirect path must preserve the OAuth callback URI you registered in Phase 0.

## Production Notes — TokenizMyApp factory (current)

**Canonical implementation:** this repository (`tokenizmyapp/`). Full walkthrough: [`factory-reown-siwe-wallet-link.md`](./factory-reown-siwe-wallet-link.md). Agent skill: `.cursor/skills/reown-siwe-wallet-link/`.

| Guide concept | Factory file |
|---------------|--------------|
| AppKit init, social-only, await `readyPromise` (A, F) | `src/lib/web3/appkit-client.ts` |
| Re-apply SIWX + social features (A) | `src/lib/web3/apply-factory-siwx.ts` |
| SIWE callbacks (B); throw on verify fail | `src/lib/web3/siwe-config.ts` |
| Explicit JWT wallet link + re-sign retry | `src/lib/web3/factory-wallet-link.ts` |
| Nonce API — server message, best-effort register (B, E) | `src/app/api/auth/wallet/nonce/route.ts` |
| Verify — EIP-1271 raw, claim-on-verify, extend JWT (E, G) | `src/app/api/auth/wallet/verify/route.ts` |
| Signature + claim helpers | `src/lib/auth/wallet-siwe.ts`, `siwe-nonce-store.ts` |
| Session cookie wallet claims | `src/lib/auth/wallet-session.ts` (`redruby.session`) |
| Billing UI | `src/components/billing/crypto-wallet-panel.tsx` |
| CSP / publicnode Sepolia | `src/proxy.ts` |

Factory differences from the generic “wallet IS the session” narrative:

- App identity is already in **`redruby.session`**; SIWE **extends** it with `walletAddress`.
- Replay protection is **`siwe_nonces` claim-on-verify**, not a separate NextAuth `WalletSession` table.
- Cookie secret is **`ENCRYPTION_KEY`**, not `NEXTAUTH_SECRET`.

### Historical — PRESTIX (`prestix.app-1/`)

Earlier reference that informed Corrections A–D (NextAuth-style cookie naming). Prefer the factory map above for new work.

| Guide concept | Historical file (`prestix.app-1/…`) |
|---------------|-------------------------------------|
| AppKit + SIWX | `src/lib/appkit.ts`, `src/lib/auth/apply-prestix-siwx.ts` |
| SIWE callbacks | `src/lib/siwe-config.ts` |
| Nonce / verify | `src/app/api/auth/wallet/nonce/route.ts`, `verify/route.ts` |
| Social handler | `src/components/auth/SocialWalletSIWEHandler.tsx` |