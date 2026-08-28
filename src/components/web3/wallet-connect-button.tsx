'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';
import {
  walletConnectCancelled,
  walletConnecting,
  walletError,
  formatWalletAddress,
} from '@/store/wallet-slice';

/**
 * Connect / account control for the factory Reown social wallet.
 *
 * Renders nothing when web3 is disabled. Safe to mount unconditionally.
 */
export function WalletConnectButton() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { status, address, error } = useAppSelector((state) => state.wallet);

  if (status === 'disabled') return null;

  const openModal = async () => {
    dispatch(walletConnecting());
    try {
      const { getAppKit } = await import('@/lib/web3/appkit-client');
      const pending = getAppKit();
      if (!pending) {
        dispatch(walletError('Social wallet is not configured for this deployment.'));
        return;
      }
      const appkit = await pending;
      await appkit.open();
    } catch (err) {
      dispatch(walletError(err instanceof Error ? err.message : 'Could not open the wallet.'));
    } finally {
      const wallet = store.getState().wallet;
      if (wallet.status === 'connecting') {
        dispatch(walletConnectCancelled());
      }
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
          disabled={status === 'connecting'}
          color={status === 'error' ? 'error' : 'primary'}
        >
          {status === 'connecting' ? 'Connecting…' : 'Connect social wallet'}
        </Button>
      </span>
    </Tooltip>
  );
}
