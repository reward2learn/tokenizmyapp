# Factory Reown Social Wallet + SIWE Link (TokenizMyApp)

**Status:** Production-proven on `tokenizmyapp.vercel.app` (claim-on-verify deploy `dbd2ed1` and later).

**Canonical user journey:**

1. **Sign in** to the app (Google OAuth → `redruby.session` JWT cookie).
2. **Connect Wallet** (Reown AppKit social Google → embedded / smart-account wallet).
3. **Complete SIWE** (factory nonce → wagmi `signMessage` → `/api/auth/wallet/verify`).
4. Verify success **extends** the JWT with `walletAddress` / `walletChainId` and stops the AppKit “Something went wrong” cascade.

This is **not** “wallet replaces app login.” Reown social login provisions the wallet; **factory SIWE** binds that wallet to the existing session for crypto billing.

Generic AppKit theory (Corrections A–D) lives in [`google-oauth-appkit-setup.md`](./google-oauth-appkit-setup.md). This document is the **TokenizMyApp factory source of truth**, including Corrections E–G learned in production.

---

## Architecture (two auth layers)

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1 — App identity                                      │
│  Google OAuth → jose JWT cookie `redruby.session`            │
│  Claims: sub, email, role, …                                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ required before wallet link
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2 — Wallet binding                                    │
│  Reown AppKit social (Google) → embedded/smart account       │
│  Factory SIWE → claim nonce → extend JWT wallet* claims      │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Who owns it | Cookie / state | Purpose |
|-------|-------------|----------------|---------|
| App sign-in | Factory Google OAuth / relay | `redruby.session` | Dashboard, ops, billing UI |
| Wallet connect | Reown Cloud + AppKit | Wagmi / AppKit account | Embedded EOA or Safe-style smart account |
| Wallet link | Factory `/api/auth/wallet/*` | Same JWT + `walletAddress` | Crypto payments, treasury flows |

**Critical distinction:** ReownAuthentication signs against `api.web3modal.org` to provision the social wallet. That does **not** set `walletAddress` on `redruby.session`. Only `linkFactoryWalletSession()` → factory verify does.

---

## End-to-end sequence (happy path)

```
User already has redruby.session
        │
        ▼
CryptoWalletPanel / WalletConnectButton
        │  getAppKit() → createAppKit + await readyPromise
        │  applyFactorySiwxAfterReady (Correction A + socials)
        ▼
AppKit modal opens (social-only: Google, no wallet list)
        │  Google OAuth popup → embedded wallet address
        ▼
wallet-watcher → walletConnected(address)
        │  auto / manual linkWalletSession()
        ▼
linkFactoryWalletSession()
  1. waitForSiweAppReady()
  2. switchChain → Sepolia (11155111)
  3. GET /api/auth/wallet/nonce?address=0x…
       → server EIP-4361 message (Correction B)
       → best-effort registerSiweNonce (Postgres)
  4. wagmi signMessage({ message })   ← user sees SIWE prompt
  5. POST /api/auth/wallet/verify { message, signature }
       → verifySiweSignature (EOA or EIP-1271 raw sig)
       → claimSiweNonceAfterVerify (Correction E)
       → extendSessionWithWallet → Set-Cookie redruby.session
        ▼
auth slice refresh → walletAddress set → linkStatus linked
```

If verify fails once, link retries up to **2** attempts with a **fresh nonce + re-sign** (never reuse a spent message).

---

## File map (implement from these)

| Concern | Path |
|---------|------|
| Feature flags / social mode | `src/lib/web3/factory-web3-config.ts` |
| Reown project id | `src/lib/web3/reown.ts` |
| SIWE + payment chain constants / RPC | `src/lib/web3/crypto-billing-config.ts` |
| AppKit create + await ready | `src/lib/web3/appkit-client.ts` |
| Correction A SIWX + social re-assert | `src/lib/web3/apply-factory-siwx.ts` |
| AppKit SIWE callbacks | `src/lib/web3/siwe-config.ts` |
| Explicit factory link (authoritative for JWT) | `src/lib/web3/factory-wallet-link.ts` |
| Connect button | `src/components/web3/wallet-connect-button.tsx` |
| Billing UI | `src/components/billing/crypto-wallet-panel.tsx` |
| Redux wallet + link thunk | `src/store/wallet-slice.ts` |
| Auto-link / session sync | `src/store/wallet-listener-middleware.ts` |
| Nonce API | `src/app/api/auth/wallet/nonce/route.ts` |
| Verify API | `src/app/api/auth/wallet/verify/route.ts` |
| Signature verify (EOA + EIP-1271) | `src/lib/auth/wallet-siwe.ts` |
| Durable nonce claim store | `src/lib/auth/siwe-nonce-store.ts` |
| JWT wallet claims | `src/lib/auth/wallet-session.ts` |
| CSP (Reown + Sepolia RPC) | `src/proxy.ts` |
| Tests | `src/lib/auth/wallet-siwe.test.ts` |

---

## Step-by-step implementation checklist

Use this when porting the pattern or debugging a broken deploy.

### Step 0 — Reown Cloud + Google

- [ ] Reown Cloud project with projectId (factory default may live in `DEFAULT_REOWN_PROJECT_ID`).
- [ ] **Social & Email → Google** enabled.
- [ ] Allowed origins include `https://tokenizmyapp.vercel.app` and `http://localhost:3000` (fix typos like `htts://`).
- [ ] Do not rely on Cloud alone for SIWE — factory SIWX is re-applied after ready (Correction A).

### Step 1 — Environment

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | AppKit project (optional if default baked in) |
| `NEXT_PUBLIC_WEB3_CONNECT_MODE` | `social` (recommended), `both`, or `injected` |
| `NEXT_PUBLIC_WEB3_SOCIALS` | e.g. `google` or `google,apple` |
| `NEXT_PUBLIC_WEB3_EMAIL_LOGIN` | `true` / `false` |
| `NEXT_PUBLIC_WEB3_WALLET_ENABLED` | set `false` only to disable |
| `NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED` | client rail visibility |
| `POSTGRES_URL` | Durable `siwe_nonces` table (required on Vercel) |
| `ENCRYPTION_KEY` | JWT signing for `redruby.session` |
| `SEPOLIA_RPC_URL` | Optional override; default `https://ethereum-sepolia-rpc.publicnode.com` |
| `BASE_RPC_URL` | Payment chain RPC when verifying Base |

### Step 2 — AppKit init (never open before ready)

```ts
// src/lib/web3/appkit-client.ts — pattern
const appkit = createAppKit({
  siweConfig: factorySiweConfig,
  enableWallets: !socialOnly,       // false in social mode
  allWallets: socialOnly ? 'HIDE' : 'SHOW',
  features: {
    socials: ['google'],
    reownAuthentication: true,      // required for Google social wallet
    email: /* config */,
  },
  // Do NOT set enableEmbedded: true — that skips mounting <w3m-modal>
});

await applyFactorySiwxAfterReady(Promise.resolve(appkit));
// Only then return the instance / allow open()
```

**Correction F — empty Connect Wallet modal:** `createAppKit()` returns before `readyPromise`. Social-only UI needs the AUTH connector. Opening early → empty body while `getWallets` still 200s. Always `await readyPromise` (via `applyFactorySiwxAfterReady`) before callers use the modal.

### Step 3 — Re-apply SIWX after ready (Correction A)

```ts
// src/lib/web3/apply-factory-siwx.ts
OptionsController.setSIWX(factorySiweClient.mapToSIWX());
signalSiweAppReady();
await SIWXUtil.initializeIfEnabled(ChainController.getActiveCaipAddress());
// Also re-assert socials / reownAuthentication against Cloud remote config
```

`getMessageParams` on the SIWE client is **required** when remapping — without it AppKit throws `Failed to get message params!`.

### Step 4 — Server nonce (Correction B)

`GET /api/auth/wallet/nonce?address=0x…`

- Build full EIP-4361 with `siwe` `SiweMessage` (`domain` from `Host`, `uri` from origin).
- `chainId` = `SIWE_CHAIN_ID` (Sepolia `11155111`).
- Return `{ message, nonce, expiresAt, chainId }`.
- `registerSiweNonce` is **best-effort**; log failures but still return the message (verify will claim).

Client must **sign the server `message`**, not a client-assembled string.

### Step 5 — Factory link (not only AppKit SIWE)

```ts
// src/lib/web3/factory-wallet-link.ts — pattern
await switchChain(wagmiConfig, { chainId: SIWE_CHAIN_ID });
const message = await fetchServerSiweMessage(address);
const signature = await signMessage(wagmiConfig, { message });
await verifyFactorySiwe(message, signature); // POST /api/auth/wallet/verify
```

Wire UI via `linkWalletSession` thunk + `CryptoWalletPanel`. Clear `lastLinkAttemptAddress` on link **reject** so retries work.

### Step 6 — Verify: signature then claim (Corrections E + G)

Order in `POST /api/auth/wallet/verify`:

1. Require existing `redruby.session` (401 otherwise).
2. Gates: `looksLikeSiweMessage`, fresh `Nonce:` line, signature format `^0x[a-fA-F0-9]{130,}$`.
3. Session-restoration payloads (no `Nonce:`) → short-circuit success (no re-prompt loop).
4. `verifySiweSignature`:
   - **EOA:** normalize `v` to 27/28 candidates.
   - **Smart account / long sig:** EIP-1271 via public client with **RAW** signature (never normalize `v` first — Safe `GS026`).
   - Sepolia RPC must work (`publicnode`, not dead `rpc.sepolia.org`).
5. **`claimSiweNonceAfterVerify`** (Correction E):
   - Gate on SIWE `Issued At` freshness (~15m).
   - Consume pre-registered unused row **or** force-consume unused row ignoring bad `expires_at` **or** `INSERT … used_at=NOW() ON CONFLICT DO NOTHING`.
   - Replay of same nonce → fail.
6. `extendSessionWithWallet` → `Set-Cookie` with `walletAddress` / `walletChainId`.

**Correction E — serverless nonce:** Register-then-consume across Vercel lambdas is fragile. After a cryptographically valid signature, **claim** the nonce on first use. PK / `used_at` blocks replay.

**Correction G — EIP-1271:** Social Google often yields a Safe-style smart account. Normalize-only-EOA; pass raw bytes to `verifyMessage` on-chain.

### Step 7 — CSP

Allow Reown / WalletConnect hosts and Sepolia RPC in `src/proxy.ts` `connect-src` / `frame-src` (include `https://ethereum-sepolia-rpc.publicnode.com`).

### Step 8 — Client SIWE config behavior

In `siwe-config.ts` `verifyMessage`:

- No fresh nonce / CAIP chain id / placeholder address → return `true` (Reown internal paths).
- Factory verify failure → **`throw`** (not `return false`) so AppKit re-prompts instead of failing closed into “Something went wrong.”

---

## Success criteria (production smoke test)

1. Signed-in user opens Connect Wallet → Google button visible (not empty modal).
2. After Google, AppKit shows an address.
3. SIWE prompt appears; user signs.
4. Network: `POST /api/auth/wallet/verify` → **200** `{ success: true, address, chainId }`.
5. Response `Set-Cookie` updates `redruby.session`.
6. UI shows Linked / `auth.walletAddress` matches connected address (case-insensitive).
7. Refresh → session still has wallet; no infinite SIWE loop.
8. Replaying the same `{ message, signature }` → **400 Invalid or expired nonce**.

---

## Failure → cause map

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Empty Connect Wallet shell | `open()` before `readyPromise` | Await `applyFactorySiwxAfterReady` |
| Google popup then “Something went wrong” | Factory verify 400 cascading into AppKit | Check verify body; throw on failure + claim-on-verify |
| Signature verification failed | EOA normalize applied to Safe sig; dead Sepolia RPC | Raw EIP-1271 + publicnode RPC |
| Invalid or expired nonce | Cross-lambda Map / failed register | `claimSiweNonceAfterVerify` + `POSTGRES_URL` |
| Failed to get message params | SIWX remap without `getMessageParams` | Add params on `createSIWEConfig` |
| Modal never mounts | `enableEmbedded: true` | Keep `false` |
| Link never retries | `lastLinkAttemptAddress` stuck | Clear on `linkWalletSession.rejected` |

---

## Security summary

| Control | Mechanism |
|---------|-----------|
| App auth required | Verify returns 401 without session |
| Replay | `siwe_nonces` PK + `used_at` claim |
| Freshness | SIWE `Issued At` window on claim |
| Message integrity | Server-built message; `.trimStart()` only |
| Smart accounts | EIP-1271 raw signature |
| Rate limits | Per-instance nonce 10/min, verify 5/min (not global) |

---

## Related docs

- [`google-oauth-appkit-setup.md`](./google-oauth-appkit-setup.md) — generic Corrections A–D + PRESTIX history
- Agent skill: `.cursor/skills/reown-siwe-wallet-link/SKILL.md`
