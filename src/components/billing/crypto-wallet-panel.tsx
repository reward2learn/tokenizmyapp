'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { WalletConnectButton } from '@/components/web3/wallet-connect-button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  disconnectWalletSession,
  formatWalletAddress,
  linkWalletSession,
  walletLinkReset,
  walletSessionLinked,
} from '@/store/wallet-slice';

/**
 * Settings → Billing / Personal — social wallet for crypto payments (Phase 4+).
 *
 * Stripe cards remain the default rail; this panel links the Reown embedded
 * wallet used for USDC top-ups and prepaid plan packs.
 */
export function CryptoWalletPanel({
  title = 'Crypto wallet',
  description = 'Connect with Google to pay with USDC via your embedded wallet. Required before crypto checkout.',
}: {
  title?: string;
  description?: string;
}) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const {
    status,
    address,
    connectorId,
    error,
    linkStatus,
    linkError,
    disconnectStatus,
    disconnectError,
  } = useAppSelector((state) => state.wallet);

  const isLinked = walletSessionLinked(auth, address);
  const isConnected = status === 'connected' && Boolean(address);
  const hasWalletBinding = isConnected || Boolean(auth.walletAddress);
  const isBusy = linkStatus === 'linking' || disconnectStatus === 'disconnecting';

  const handleLinkWallet = () => {
    dispatch(walletLinkReset());
    void dispatch(linkWalletSession());
  };

  const handleDisconnectWallet = () => {
    void dispatch(disconnectWalletSession());
  };

  if (status === 'disabled') {
    return (
      <Alert severity="info">
        Social wallet is not enabled on this deployment. Set{' '}
        <code>NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED=true</code> or{' '}
        <code>NEXT_PUBLIC_WEB3_WALLET_ENABLED=true</code> on the factory Vercel project, then redeploy.
      </Alert>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <WalletConnectButton />
          {isConnected && address ? (
            <Typography variant="body2" color="text.secondary">
              Connected{connectorId ? ` via ${connectorId}` : ''}: {formatWalletAddress(address)}
            </Typography>
          ) : auth.walletAddress ? (
            <Typography variant="body2" color="text.secondary">
              Linked: {formatWalletAddress(auth.walletAddress)}
            </Typography>
          ) : null}
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {linkError && linkStatus === 'error' ? <Alert severity="error">{linkError}</Alert> : null}
        {disconnectError && disconnectStatus === 'error' ? (
          <Alert severity="error">{disconnectError}</Alert>
        ) : null}

        {isConnected ? (
          isLinked ? (
            <Stack spacing={1.5}>
              <Alert severity="success" variant="outlined">
                Wallet connected and linked to your account for crypto payments.
              </Alert>
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={handleDisconnectWallet}
                  disabled={isBusy}
                >
                  {disconnectStatus === 'disconnecting' ? 'Disconnecting…' : 'Disconnect wallet'}
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Alert severity="warning" variant="outlined">
                Wallet connected via Google — one more signature links it to your account for USDC
                top-ups. (The Google sign-in above only provisions the embedded wallet.)
              </Alert>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleLinkWallet}
                  disabled={isBusy}
                >
                  {linkStatus === 'linking' ? 'Waiting for signature…' : 'Link wallet for payments'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={handleDisconnectWallet}
                  disabled={isBusy}
                >
                  {disconnectStatus === 'disconnecting' ? 'Disconnecting…' : 'Disconnect wallet'}
                </Button>
              </Box>
            </Stack>
          )
        ) : hasWalletBinding ? (
          <Stack spacing={1.5}>
            <Alert severity="info" variant="outlined">
              A wallet is linked to your account but not connected in this browser. Disconnect to
              remove it, or connect again above.
            </Alert>
            <Box>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={handleDisconnectWallet}
                disabled={isBusy}
              >
                {disconnectStatus === 'disconnecting' ? 'Disconnecting…' : 'Disconnect wallet'}
              </Button>
            </Box>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
