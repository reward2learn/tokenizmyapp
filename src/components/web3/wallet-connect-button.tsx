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
};

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
    // Retry even if a prior open left status stuck on "connecting".
    dispatch(walletConnecting());
    try {
      const { getAppKit } = await import('@/lib/web3/appkit-client');
      const pending = getAppKit();
      if (!pending) {
        dispatch(walletError('Social wallet is not configured for this deployment.'));
        return;
      }
      const appkit = (await pending) as AppKitLike;

      // When the user clicks from the "connected" Chip, the AppKit session may
      // still be live — sync Redux and bail.  But when Redux says
      // disconnected/connecting (i.e. the user explicitly asked to connect),
      // do NOT trust a stale getAccount() — always try to open the modal.
      // AppKit can report isConnected=true from IndexedDB while the provider
      // is actually dead (e.g. after a disconnect + reload where IndexedDB
      // wasn't fully cleared).  Opening the modal forces AppKit to reconcile.
      if (status === 'connected' && syncConnectedAccount(dispatch, appkit)) return;

      // Explicit Connect view: default open() can target Account when JWT is linked
      // and appear to do nothing (button stuck on Connecting…).
      await appkit.open({ view: 'Connect' });

      // Give the modal a beat to mount; if it never opened, unlock the button.
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (syncConnectedAccount(dispatch, appkit)) return;
      if (!appkit.getState?.()?.open) {
        dispatch(walletConnectCancelled());
      }
    } catch (err) {
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
