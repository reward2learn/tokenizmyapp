'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useGetSessionQuery, authApi } from '@/store/apis/auth-api';
import { sessionWalletMatches } from '@/lib/auth/wallet-session';

const PENDING_SIWE_KEY = 'tokenizmyapp:pendingSiwe';

const SOCIAL_CONNECTORS = new Set(['google', 'apple', 'email', 'x', 'discord', 'github', 'facebook']);

function isSocialWalletConnection(connectorId: string | null): boolean {
  if (!connectorId) return false;
  return SOCIAL_CONNECTORS.has(connectorId.toLowerCase());
}

function clearPendingSiweFlag(): void {
  try {
    sessionStorage.removeItem(PENDING_SIWE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Completes SIWE for social / embedded wallet connections after AppKit connect.
 *
 * ReownAuthentication provisions the wallet but bypasses the factory JWT link.
 * This handler calls SIWXUtil.requestSignMessage() once when a social wallet is
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

  useEffect(() => {
    if (sessionLoading || !bootstrapped || tier === 'public') return;
    if (status !== 'connected' || !address) return;
    if (!isSocialWalletConnection(connectorId)) return;
    if (sessionWalletMatches({ walletAddress: linkedWallet ?? undefined }, address)) {
      clearPendingSiweFlag();
      return;
    }
    if (inFlightRef.current) return;
    if (sessionStorage.getItem(PENDING_SIWE_KEY) === address.toLowerCase()) return;

    inFlightRef.current = true;
    sessionStorage.setItem(PENDING_SIWE_KEY, address.toLowerCase());

    void (async () => {
      try {
        const { SIWXUtil } = await import('@reown/appkit-controllers');
        await SIWXUtil.requestSignMessage();
        await refetch();
        dispatch(authApi.util.invalidateTags(['Session']));
      } catch (err) {
        console.warn('[SocialWalletSIWEHandler] SIWE flow failed:', err);
      } finally {
        inFlightRef.current = false;
        clearPendingSiweFlag();
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
