'use client';

import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  chainLabel,
  fetchPaymentFunds,
  formatNativeWei,
  formatUsdcAtomic,
  type PaymentFundsSnapshot,
} from '@/lib/web3/crypto-payment-funds';
import { formatWalletAddress } from '@/store/wallet-slice';

export interface CryptoPaymentFundsPanelProps {
  walletAddress: string;
  chainId: number;
  usdcContract: string;
  treasury: string;
  requiredUsdc: string;
  /** AppKit connector id — used for gas hard-block policy. */
  connectorId?: string | null;
  /** Called whenever funds evaluation changes so parent can gate Pay. */
  onFundsChange?: (funds: PaymentFundsSnapshot | null) => void;
}

type AppKitFundViews = 'FundWallet' | 'OnRampProviders' | 'WalletReceive';

async function openAppKitFundView(view: AppKitFundViews): Promise<void> {
  const { getAppKit } = await import('@/lib/web3/appkit-client');
  const pending = getAppKit();
  if (!pending) throw new Error('Social wallet is not configured for this deployment.');
  const appkit = await pending;
  await appkit.open({ view });
}

function statusAlert(funds: PaymentFundsSnapshot) {
  switch (funds.status) {
    case 'insufficient_usdc':
      return (
        <Alert severity="warning" variant="outlined">
          Need {formatUsdcAtomic(funds.usdcShortfall)} more USDC on {chainLabel(funds.chainId)} to
          complete this payment. Fund the wallet, then refresh balances.
        </Alert>
      );
    case 'insufficient_gas':
      return (
        <Alert severity="warning" variant="outlined">
          Need ~{formatNativeWei(funds.gasShortfall)} more {funds.nativeSymbol} for network fees on{' '}
          {chainLabel(funds.chainId)}.
        </Alert>
      );
    case 'insufficient_both':
      return (
        <Alert severity="warning" variant="outlined">
          Need {formatUsdcAtomic(funds.usdcShortfall)} more USDC and ~
          {formatNativeWei(funds.gasShortfall)} more {funds.nativeSymbol} for gas.
        </Alert>
      );
    case 'error':
      return (
        <Alert severity="error" variant="outlined">
          {funds.error ?? 'Could not read wallet balances.'}
        </Alert>
      );
    case 'ready':
      return funds.gasShortfall > 0n ? (
        <Alert severity="info" variant="outlined">
          USDC balance covers this purchase. Native {funds.nativeSymbol} looks low — Reown may
          sponsor gas; if the wallet prompts for fees, fund a small amount of{' '}
          {funds.nativeSymbol} first.
        </Alert>
      ) : (
        <Alert severity="success" variant="outlined">
          Wallet has enough USDC for this payment on {chainLabel(funds.chainId)}.
        </Alert>
      );
    case 'loading':
      return null;
    default: {
      const _exhaustive: never = funds.status;
      return _exhaustive;
    }
  }
}

/**
 * Shows linked-wallet USDC + native balances on the payment chain, gates Pay
 * via onFundsChange, and opens AppKit Fund / OnRamp / Receive when short.
 */
export function CryptoPaymentFundsPanel({
  walletAddress,
  chainId,
  usdcContract,
  treasury,
  requiredUsdc,
  connectorId = null,
  onFundsChange,
}: CryptoPaymentFundsPanelProps) {
  const [funds, setFunds] = useState<PaymentFundsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundingBusy, setFundingBusy] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setFundError(null);
    onFundsChange?.(null);
    try {
      const snapshot = await fetchPaymentFunds({
        walletAddress: walletAddress as `0x${string}`,
        chainId,
        usdcContract: usdcContract as `0x${string}`,
        treasury: treasury as `0x${string}`,
        requiredUsdc: BigInt(requiredUsdc),
        connectorId,
      });
      setFunds(snapshot);
      onFundsChange?.(snapshot);
    } catch (err) {
      setFunds(null);
      onFundsChange?.(null);
      setFundError(err instanceof Error ? err.message : 'Could not read balances.');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, chainId, usdcContract, treasury, requiredUsdc, connectorId, onFundsChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openFund = async (view: AppKitFundViews) => {
    setFundingBusy(true);
    setFundError(null);
    try {
      await openAppKitFundView(view);
    } catch (err) {
      setFundError(err instanceof Error ? err.message : 'Could not open funding options.');
    } finally {
      setFundingBusy(false);
    }
  };

  const needsFunding =
    funds != null &&
    (funds.status === 'insufficient_usdc' ||
      funds.status === 'insufficient_gas' ||
      funds.status === 'insufficient_both');

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        bgcolor: 'action.hover',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountBalanceWalletIcon fontSize="small" color="action" />
            <Typography variant="subtitle2">Wallet funds</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={() => void refresh()}
            disabled={loading || fundingBusy}
          >
            Refresh
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {formatWalletAddress(walletAddress)} · {chainLabel(chainId)}
        </Typography>

        {loading && !funds ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={22} />
          </Box>
        ) : funds ? (
          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary">
                USDC balance
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatUsdcAtomic(funds.usdcBalance)} USDC
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Required
              </Typography>
              <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatUsdcAtomic(funds.requiredUsdc)} USDC
              </Typography>
            </Stack>
            {funds.usdcShortfall > 0n ? (
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography variant="body2" color="warning.main">
                  Shortfall
                </Typography>
                <Typography
                  variant="body2"
                  color="warning.main"
                  fontWeight={600}
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatUsdcAtomic(funds.usdcShortfall)} USDC
                </Typography>
              </Stack>
            ) : null}
            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary">
                {funds.nativeSymbol} (gas)
              </Typography>
              <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatNativeWei(funds.nativeBalance)} {funds.nativeSymbol}
                {funds.estimatedGasWei != null
                  ? ` · est. fee ~${formatNativeWei(funds.estimatedGasWei)}`
                  : ''}
              </Typography>
            </Stack>
            {statusAlert(funds)}
          </Stack>
        ) : null}

        {fundError ? (
          <Alert severity="error" variant="outlined">
            {fundError}
          </Alert>
        ) : null}

        {needsFunding || funds?.status === 'error' ? (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Button
              size="small"
              variant="contained"
              disabled={fundingBusy}
              onClick={() => void openFund('FundWallet')}
            >
              Fund wallet
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={fundingBusy}
              onClick={() => void openFund('OnRampProviders')}
            >
              Buy USDC
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={fundingBusy}
              onClick={() => void openFund('WalletReceive')}
            >
              Receive address
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
