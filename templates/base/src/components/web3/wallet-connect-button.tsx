'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { walletConnecting, walletError, formatWalletAddress } from '@/store/wallet-slice';

/**
 * Connect / account control for the Reown wallet.
 *
 * Renders nothing when the wallet capability is off, which is the common case —
 * only templates whose `capabilities.web3Wallet.enabled` is true deploy with
 * the env vars that switch it on. Safe to mount unconditionally in a layout.
 *
 * All state comes from the `wallet` slice, kept current by store/wallet-watcher.ts.
 * This component never talks to AppKit except to open its modal.
 */
export function WalletConnectButton() {
  const dispatch = useAppDispatch();
  const { status, address, error } = useAppSelector((state) => state.wallet);

  if (status === 'disabled') return null;

  const openModal = async () => {
    dispatch(walletConnecting());
    try {
      const { getAppKit } = await import('@/lib/web3/appkit-client');
      const pending = getAppKit();
      if (!pending) {
        dispatch(walletError('Wallet is not configured for this app.'));
        return;
      }
      const appkit = await pending;
      // The account subscription in wallet-watcher.ts moves the slice to
      // "connected"; opening the modal only surfaces the UI.
      await appkit.open();
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
    <Tooltip title={error ?? 'Sign in with Google, Apple or email — no seed phrase'}>
      <span>
        <Button
          onClick={openModal}
          startIcon={<AccountBalanceWalletIcon />}
          variant="outlined"
          size="small"
          disabled={status === 'connecting'}
          color={status === 'error' ? 'error' : 'primary'}
        >
          {status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
        </Button>
      </span>
    </Tooltip>
  );
}
