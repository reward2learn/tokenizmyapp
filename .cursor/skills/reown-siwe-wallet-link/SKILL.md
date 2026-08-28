---
name: reown-siwe-wallet-link
description: >-
  Implements and debugs TokenizMyApp factory Reown AppKit social wallet connect
  plus factory SIWE link that extends redruby.session with walletAddress.
  Use when working on Connect Wallet, SIWE, AppKit, Reown Google social login,
  /api/auth/wallet/nonce or verify, EIP-1271 smart accounts, Invalid or expired
  nonce, empty Connect Wallet modal, or Google/AppKit “Something went wrong”.
---

# Reown social wallet + factory SIWE

## Current product truth

**Journey:** Sign in (app JWT) → Connect Wallet (Reown Google social) → complete SIWE → `walletAddress` on `redruby.session`.

ReownAuthentication provisions the embedded/smart-account wallet. It does **not** bind the factory session. Only factory verify (`linkFactoryWalletSession` → `POST /api/auth/wallet/verify`) sets `walletAddress`.

Production reference: `docs/factory-reown-siwe-wallet-link.md` (Corrections E–G). Generic AppKit theory: `docs/google-oauth-appkit-setup.md` (A–D).

## When this skill applies

- Adding or changing wallet connect / SIWE / AppKit on the **factory** app
- Verify failures: signature, nonce, empty modal, AppKit error cascade
- Porting the pattern to another app **with the same two-layer auth model**

## Non-negotiable invariants

1. **App session first** — verify returns 401 without `redruby.session`.
2. **Await AppKit `readyPromise`** before `open()` / returning `getAppKit()` (empty modal otherwise).
3. **Re-apply SIWX** after ready via `OptionsController.setSIWX(factorySiweClient.mapToSIWX())` + `signalSiweAppReady()` + `getMessageParams`.
4. **Server builds EIP-4361 message**; client signs that string only.
5. **SIWE chain = Sepolia `11155111`**; actively `switchChain` before sign.
6. **Claim nonce after valid signature** (`claimSiweNonceAfterVerify`) — do not rely on register-then-consume alone on Vercel.
7. **EOA:** normalize `v` to 27/28. **Smart account / long sig:** EIP-1271 with **raw** signature (never normalize first).
8. **Sepolia RPC** default `https://ethereum-sepolia-rpc.publicnode.com` (not `rpc.sepolia.org`).
9. **`enableEmbedded` stays false** — social wallets use `reownAuthentication` + `socials`, not that flag.
10. Factory `verifyMessage` **throws** on HTTP failure (re-prompt); do not only `return false`.

## Code map (edit these)

| Task | Files |
|------|--------|
| Flags / social mode | `src/lib/web3/factory-web3-config.ts` |
| AppKit + ready await | `src/lib/web3/appkit-client.ts` |
| Correction A | `src/lib/web3/apply-factory-siwx.ts` |
| SIWE callbacks | `src/lib/web3/siwe-config.ts` |
| JWT link flow | `src/lib/web3/factory-wallet-link.ts` |
| Nonce / verify APIs | `src/app/api/auth/wallet/nonce/route.ts`, `verify/route.ts` |
| Sig + helpers | `src/lib/auth/wallet-siwe.ts` |
| Durable claim store | `src/lib/auth/siwe-nonce-store.ts` |
| Session extend | `src/lib/auth/wallet-session.ts` |
| Redux link | `src/store/wallet-slice.ts`, `wallet-listener-middleware.ts` |
| UI | `src/components/web3/wallet-connect-button.tsx`, `billing/crypto-wallet-panel.tsx` |
| CSP | `src/proxy.ts` |

## Agent workflow

Copy and track:

```
SIWE / wallet task:
- [ ] Read docs/factory-reown-siwe-wallet-link.md (relevant section)
- [ ] Confirm layer: app JWT vs Reown provision vs factory SIWE link
- [ ] Change only files in the code map unless explicitly expanding scope
- [ ] Preserve Corrections A–G invariants above
- [ ] Run: bun test src/lib/auth/wallet-siwe.test.ts
- [ ] Smoke checklist: connect → sign → verify 200 → walletAddress on session
```

### Debugging order

1. Network: `/api/auth/wallet/nonce` then `/verify` status + JSON `error`.
2. Classify: **401** session → **400 signature** → **400 nonce** → client/AppKit.
3. Signature: EOA vs smart account (sig length > 132 hex → EIP-1271 path).
4. Nonce: confirm `POSTGRES_URL` and claim path, not in-memory Map assumptions.
5. Empty modal: readyPromise / social-only / `enableEmbedded`.

## Do not

- Replace app Google OAuth with “wallet-only” login unless explicitly requested.
- Normalize `v` before EIP-1271 / Safe verification.
- Set `enableEmbedded: true` to “enable social wallets.”
- Trust Cloud `reownAuthentication` alone without re-applying factory SIWX.
- Return `false` from factory `verifyMessage` on verify failure (throw instead).
- Document PRESTIX NextAuth cookie names as the factory cookie (`redruby.session` is correct here).

## Progressive disclosure

- Full sequence, env table, failure map: [reference.md](reference.md)
- Human-facing deep dive: `docs/factory-reown-siwe-wallet-link.md`
- Corrections A–D background: `docs/google-oauth-appkit-setup.md`
