'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { WalletConnectButton } from '@/components/web3/wallet-connect-button';
import { requestWalletLink } from '@/lib/web3/request-wallet-link';
import { authApi } from '@/store/apis/auth-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatWalletAddress } from '@/store/wallet-slice';

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
  const { status, address, connectorId, error } = useAppSelector((state) => state.wallet);
  const linkedWallet = useAppSelector((state) => state.auth.walletAddress);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const isLinked =
    Boolean(linkedWallet && address && linkedWallet.toLowerCase() === address.toLowerCase());

  useEffect(() => {
    if (isLinked) setLinkError(null);
  }, [isLinked]);

  const handleLinkWallet = async () => {
    setLinking(true);
    setLinkError(null);
    try {
      await requestWalletLink();
      dispatch(authApi.util.invalidateTags(['Session']));
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Could not link wallet.');
    } finally {
      setLinking(false);
    }
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
          {status === 'connected' && address ? (
            <Typography variant="body2" color="text.secondary">
              Connected{connectorId ? ` via ${connectorId}` : ''}: {formatWalletAddress(address)}
            </Typography>
          ) : null}
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {linkError ? <Alert severity="error">{linkError}</Alert> : null}

        {status === 'connected' && address ? (
          isLinked ? (
            <Alert severity="success" variant="outlined">
              Wallet connected and linked to your account for crypto payments.
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              <Alert severity="warning" variant="outlined">
                Wallet connected but not linked yet. Sign the one-time message to enable USDC
                top-ups.
              </Alert>
              <Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleLinkWallet}
                  disabled={linking}
                >
                  {linking ? 'Waiting for signature…' : 'Link wallet for payments'}
                </Button>
              </Box>
            </Stack>
          )
        ) : null}
      </Stack>
    </Paper>
  );
}
