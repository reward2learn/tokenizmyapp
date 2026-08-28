# Crypto billing test checklist (Phase 6 / Phase 7)

Manual verification for dual-rail billing (Stripe + USDC) on the factory app and deployed tenants. Run in a browser with DevTools → Network + Console open.

## Prerequisites

- Factory / tenant: `CRYPTO_TREASURY_ADDRESS` and `CRYPTO_PAYMENTS_ENABLED=true`
  - **Preferred:** Ops Admin → Edit Tenant → **Crypto Payments** step → enable + paste treasury → Save Changes (pushes Vercel + seeds tenant DB)
  - Or set the same vars manually on the Vercel project
- `NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED=true` (pushed with the crypto-env route)
- Social wallet linked via SIWE (Billing → Payment Methods → connect + sign-in prompt)
- Test wallet funded with USDC on Sepolia (dev) or Base (prod)

## Credit top-up (Phase 4)

1. **Dual-rail dialog** — Billing or Chat blocked-credits flow opens **Card (Stripe) | Crypto (USDC)** toggle.
2. **Stripe path** — Card top-up completes; credits appear on balance (confirm + webhook).
3. **Crypto path** — Requires linked wallet; intent shows treasury + exact USDC amount.
4. **On-chain pay** — USDC transfer succeeds; confirm grants credits idempotently (refresh does not double-grant).
5. **Wrong amount / wallet** — Confirm rejects tx that does not match intent.

## Prepaid plan (Phase 5)

6. **New subscription rail** — Plan checkout offers Stripe monthly vs USDC prepaid (1/3/6/12 mo).
7. **Stripe blocked when subscribed** — Org with active Stripe subscription cannot start crypto prepaid (API 400).
8. **Prepaid fulfillment** — After USDC pay: plan active, `currentPeriodEnd` extended, credits = monthly × months.
9. **Stacking** — Second prepaid purchase before expiry extends `currentPeriodEnd` (does not reset early).

## Prepaid expiry (Phase 6)

10. **Paid-through banner** — Plan tab shows “USDC prepaid plan — Paid through {date}” when no Stripe sub.
11. **Expiring soon** — Banner warns within 7 days of `currentPeriodEnd`.
12. **Entitlement lapse** — After period end, paid features gate to Free even before cron (via `getPlanForOrg`).
13. **Reconcile on billing read** — Opening Settings → Billing downgrades expired crypto-only orgs to Free in DB.
14. **Nightly cron** — `/api/cron/dunning` batch downgrades expired crypto-only orgs (check logs).

## SIWE / wallet (Phases 2–3)

15. **Linked wallet required** — Crypto top-up/plan APIs return 403 without JWT `walletAddress`.
16. **SIWE after social connect** — Connect Google → single SIWE prompt → session includes wallet.

## Idempotency & security

17. **Tx replay** — Same `(chainId, txHash, logIndex)` cannot mint twice.
18. **Intent expiry** — Pending intents reject confirm after TTL (~30 min).
19. **Platform admin** — Crypto plan routes require platform admin (factory control plane).

## Stripe coexistence

20. **Default rail** — Stripe remains default; crypto opt-in only when web3 enabled.
21. **Monthly recurring** — Stripe owns auto-renew; crypto is prepaid-only (no recurring USDC).
