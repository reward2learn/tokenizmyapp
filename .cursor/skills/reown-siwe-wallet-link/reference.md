# Reown SIWE wallet link — reference

Companion to `SKILL.md`. Read when implementing or deep-debugging.

## Sequence diagram

```
redruby.session (required)
  → getAppKit() awaits readyPromise + applyFactorySiwxAfterReady
  → AppKit open (social Google)
  → walletConnected
  → linkFactoryWalletSession
       switchChain(11155111)
       GET /api/auth/wallet/nonce → { message }
       signMessage(message)
       POST /api/auth/wallet/verify
            verifySiweSignature
            claimSiweNonceAfterVerify
            extendSessionWithWallet → Set-Cookie
  → auth.walletAddress set
```

## Corrections (factory)

| ID | Rule |
|----|------|
| A | Re-apply `mapToSIWX()` after `readyPromise`; Cloud can overwrite callbacks |
| B | Server returns full EIP-4361; client signs that message |
| D | Active `switchChain` to Sepolia before sign |
| E | Claim nonce after valid sig (`claimSiweNonceAfterVerify`); register is best-effort |
| F | Await ready before modal open (social AUTH connector) |
| G | EIP-1271 uses raw signature; EOA-only v-normalize; publicnode Sepolia RPC |

(C in the generic guide is NextAuth cookie naming — factory uses `redruby.session` + `ENCRYPTION_KEY`.)

## Env (factory)

```
NEXT_PUBLIC_REOWN_PROJECT_ID
NEXT_PUBLIC_WEB3_CONNECT_MODE=social
NEXT_PUBLIC_WEB3_SOCIALS=google
NEXT_PUBLIC_WEB3_EMAIL_LOGIN
NEXT_PUBLIC_WEB3_WALLET_ENABLED   # false disables
POSTGRES_URL                      # siwe_nonces
ENCRYPTION_KEY
SEPOLIA_RPC_URL                   # optional; default publicnode
```

## Claim-on-verify algorithm

```
if !fresh(Issued At) → null
if consumeSiweNonce(nonce) → ok
if forceConsumeUnused(nonce) → ok   # ignores expires_at
INSERT used_at=NOW() ON CONFLICT DO NOTHING
  if inserted → ok
  else forceConsumeUnused again (race)
else → null (replay or DB failure)
```

Table auto-created: `siwe_nonces (nonce PK, address, chain_id, domain, expires_at, used_at, created_at)`.

## Signature routing

```
sig length > 132 hex chars (plus 0x)
  → EIP-1271 on Sepolia / preferred / mainnet / Base with RAW sig
else
  → EOA candidates with normalized v (27/28)
```

## Tests

```bash
bun test src/lib/auth/wallet-siwe.test.ts
```

Cover: register/consume once, claim never-registered, force-claim expired pre-register, Issued At / domain parse, EOA v coerce.

## UI entrypoints

- `CryptoWalletPanel` — billing settings; Connect + Link
- `WalletConnectButton` — opens AppKit
- `linkWalletSession` — Redux thunk wrapping `linkFactoryWalletSession`
- On link reject: clear `lastLinkAttemptAddress` for retry

## Smoke checklist

1. Connect Wallet shows Google (not empty)
2. Address appears after OAuth
3. SIWE prompt → sign
4. verify 200 + Set-Cookie
5. UI Linked / `walletAddress` matches
6. Refresh no loop; replay nonce rejected
