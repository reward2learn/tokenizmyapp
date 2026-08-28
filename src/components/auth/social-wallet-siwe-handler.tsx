'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useGetSessionQuery, authApi } from '@/store/apis/auth-api';
import { sessionWalletMatches } from '@/lib/auth/wallet-session';
import { requestWalletLink } from '@/lib/web3/request-wallet-link';

const SOCIAL_CONNECTORS = new Set(['google', 'apple', 'email', 'x', 'discord', 'github', 'facebook']);

function isSocialWalletConnection(connectorId: string | null): boolean {
  if (!connectorId) return false;
  return SOCIAL_CONNECTORS.has(connectorId.toLowerCase());
}

/**
 * Completes SIWE for social / embedded wallet connections after AppKit connect.
 *
 * ReownAuthentication provisions the wallet but bypasses the factory JWT link.
 * This handler calls SIWXUtil.requestSignMessage() when a social wallet is
 * connected and the JWT lacks a matching walletAddress claim.
 *
 * @see docs/google-oauth-appkit-setup.md Phase 5
 */
export function SocialWalletSIWEHandler() {
  const dispatch = useAppDispatch();
  const { tier, bootstrapped, walletAddress: linkedWallet } = useAppSelector((s) => s.auth);
  const { status, address, connectorId } = useAppSelector((s) => s.wallet);
  const { isLoading: sessionLoading, refetch } = useGetSessionQuery(undefined, {
    skip: !bootstrapped || tier === 'public',
  });

  const inFlightRef = useRef(false);
  const lastAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionLoading || !bootstrapped || tier === 'public') return;
    if (status !== 'connected' || !address) return;
    if (!isSocialWalletConnection(connectorId)) return;
    if (sessionWalletMatches({ walletAddress: linkedWallet ?? undefined }, address)) return;
    if (inFlightRef.current) return;

    const addressKey = address.toLowerCase();
    if (lastAttemptRef.current === addressKey) return;

    inFlightRef.current = true;
    lastAttemptRef.current = addressKey;

    void (async () => {
      try {
        await requestWalletLink();
        await refetch();
        dispatch(authApi.util.invalidateTags(['Session']));
      } catch (err) {
        console.warn('[SocialWalletSIWEHandler] SIWE flow failed:', err);
        // Allow manual retry from settings — reset guard when user reconnects.
        lastAttemptRef.current = null;
      } finally {
        inFlightRef.current = false;
      }
    })();
  }, [
    sessionLoading,
    bootstrapped,
    tier,
    status,
    address,
    connectorId,
    linkedWallet,
    refetch,
    dispatch,
  ]);

  return null;
}
