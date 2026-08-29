'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { normalizeChainId } from '@/lib/web3/normalize-chain-id';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  walletConnecting,
  walletConnected,
  walletConnectCancelled,
  walletError,
  formatWalletAddress,
} from '@/store/wallet-slice';

type AppKitLike = {
  open: (opts?: { view?: string }) => Promise<void>;
  getAccount?: () => {
    isConnected?: boolean;
    address?: string;
    embeddedWalletInfo?: { authProvider?: string | null };
  };
  getChainId?: () => number | string | undefined;
  getState?: () => { open?: boolean };
  disconnect?: () => Promise<void>;
};

/** Race a promise against a timeout. Rejects after `ms` if the promise hasn't settled. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

function syncConnectedAccount(
  dispatch: ReturnType<typeof useAppDispatch>,
  appkit: AppKitLike,
): boolean {
  const account = appkit.getAccount?.();
  if (!account?.isConnected || !account.address) return false;
  dispatch(
    walletConnected({
      address: account.address,
      chainId: normalizeChainId(appkit.getChainId?.()),
      connectorId: account.embeddedWalletInfo?.authProvider ?? null,
    }),
  );
  return true;
}

/**
 * Connect / account control for the factory Reown social wallet.
 *
 * Renders nothing when web3 is disabled. Safe to mount unconditionally.
 * Modal close without connect is handled by store/wallet-watcher.ts.
 */
export function WalletConnectButton() {
  const dispatch = useAppDispatch();
  const { status, address, error } = useAppSelector((state) => state.wallet);

  if (status === 'disabled') return null;

  const openModal = async () => {
    console.log('[wallet-btn] openModal clicked, current status:', status);
    // Retry even if a prior open left status stuck on "connecting".
    dispatch(walletConnecting());
    try {
      const { getAppKit, resetAppKit } = await import('@/lib/web3/appkit-client');
      const pending = getAppKit();
      console.log('[wallet-btn] getAppKit returned:', pending ? 'Promise' : 'null');
      if (!pending) {
        dispatch(walletError('Social wallet is not configured for this deployment.'));
        return;
      }
      // Guard against the AppKit init promise hanging (stale IndexedDB, readyPromise stuck).
      let appkit: AppKitLike;
      try {
        appkit = await withTimeout(pending, 15_000) as AppKitLike;
      } catch (timeoutErr) {
        console.error('[wallet-btn] AppKit init timed out, resetting singleton:', timeoutErr);
        resetAppKit();
        dispatch(walletError('Wallet initialization timed out. Please try again.'));
        return;
      }
      console.log('[wallet-btn] appkit resolved, getAccount:', JSON.stringify(appkit.getAccount?.()));
      console.log('[wallet-btn] appkit.getState:', JSON.stringify(appkit.getState?.()));
      console.log('[wallet-btn] appkit has <w3m-modal>:', !!document.querySelector('w3m-modal'));

      // When the user clicks from the "connected" Chip, the AppKit session may
      // still be live — sync Redux and bail.  But when Redux says
      // disconnected/connecting (i.e. the user explicitly asked to connect),
      // do NOT trust a stale getAccount() — always try to open the modal.
      // AppKit can report isConnected=true from IndexedDB while the provider
      // is actually dead (e.g. after a disconnect + reload where IndexedDB
      // wasn't fully cleared).  Opening the modal forces AppKit to reconcile.
      if (status === 'connected' && syncConnectedAccount(dispatch, appkit)) {
        console.log('[wallet-btn] syncConnectedAccount returned true, bailing');
        return;
      }

      // Explicit Connect view: default open() can target Account when JWT is linked
      // and appear to do nothing (button stuck on Connecting…).
      console.log('[wallet-btn] calling appkit.open({ view: "Connect" })...');
      const openStart = Date.now();
      // Guard against open() hanging — AppKit internal state can deadlock with
      // stale IndexedDB sessions. If open() doesn't complete in 5s, treat as failed.
      try {
        await withTimeout(appkit.open({ view: 'Connect' }), 5_000);
      } catch (openErr) {
        console.error('[wallet-btn] appkit.open timed out:', openErr);
        dispatch(walletError('Wallet modal failed to open. Please try again.'));
        return;
      }
      console.log('[wallet-btn] appkit.open resolved in', Date.now() - openStart, 'ms');
      console.log('[wallet-btn] appkit.getState after open:', JSON.stringify(appkit.getState?.()));

      // Give the modal a beat to mount; if it never opened, unlock the button.
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log('[wallet-btn] after 600ms wait, getAccount:', JSON.stringify(appkit.getAccount?.()));
      console.log('[wallet-btn] after 600ms wait, <w3m-modal>:', !!document.querySelector('w3m-modal'));
      const modalEl = document.querySelector('w3m-modal');
      if (modalEl) {
        console.log('[wallet-btn] w3m-modal open attr:', modalEl.getAttribute('open'));
        console.log('[wallet-btn] w3m-modal style display:', window.getComputedStyle(modalEl).display);
        console.log('[wallet-btn] w3m-modal shadowRoot:', !!modalEl.shadowRoot);
      }
      if (syncConnectedAccount(dispatch, appkit)) return;
      if (!appkit.getState?.()?.open) {
        console.log('[wallet-btn] modal not open, dispatching walletConnectCancelled');
        dispatch(walletConnectCancelled());
      }
    } catch (err) {
      console.error('[wallet-btn] ERROR:', err);
      dispatch(walletError(err instanceof Error ? err.message : 'Could not open the wallet.'));
    }
  };

  if (status === 'connected' && address) {
    return (
      <Chip
        icon={<AccountBalanceWalletIcon />}
        label={formatWalletAddress(address)}
        onClick={openModal}
        variant="outlined"
        size="small"
        sx={{ fontVariantNumeric: 'tabular-nums' }}
      />
    );
  }

  return (
    <Tooltip title={error ?? 'Sign in with Google — embedded wallet, no seed phrase'}>
      <span>
        <Button
          onClick={openModal}
          startIcon={<AccountBalanceWalletIcon />}
          variant="outlined"
          size="small"
          // Keep clickable while "connecting" so a stuck state can be retried.
          color={status === 'error' ? 'error' : 'primary'}
        >
          {status === 'connecting' ? 'Connecting…' : 'Connect social wallet'}
        </Button>
      </span>
    </Tooltip>
  );
}
