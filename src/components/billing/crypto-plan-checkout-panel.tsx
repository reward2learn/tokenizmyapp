'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { switchChain, waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import type { PlanId } from '@/lib/billing/plans';
import { getPlan, planAiCreditsPerMonth } from '@/lib/billing/plans';
import type { CryptoPlanPrepaidMonths } from '@/lib/web3/crypto-billing-config';
import { ERC20_TRANSFER_ABI } from '@/lib/web3/erc20-abi';
import { getWagmiConfig } from '@/lib/web3/wagmi-store';
import {
  useConfirmCryptoPlanPurchaseMutation,
  useCreateCryptoPlanIntentMutation,
} from '@/store/apis/organization-api';
import { useAppSelector } from '@/store/hooks';
import { formatWalletAddress } from '@/store/wallet-slice';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';

function chainLabel(chainId: number): string {
  if (chainId === 8453) return 'Base';
  if (chainId === 11_155_111) return 'Sepolia';
  return `Chain ${chainId}`;
}

function formatUsdc(amountUsdc: string): string {
  const value = Number(amountUsdc) / 1_000_000;
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export interface CryptoPlanCheckoutPanelProps {
  orgId: string;
  planId: PlanId;
  prepaidMonths: CryptoPlanPrepaidMonths;
  onDone: () => void;
  onCancel: () => void;
}

export function CryptoPlanCheckoutPanel({
  orgId,
  planId,
  prepaidMonths,
  onDone,
  onCancel,
}: CryptoPlanCheckoutPanelProps) {
  const plan = getPlan(planId);
  const monthlyCredits = planAiCreditsPerMonth(plan, 'monthly');
  const linkedWallet = useAppSelector((state) => state.auth.walletAddress);
  const connectedAddress = useAppSelector((state) => state.wallet.address);
  const [createIntent, { data, isLoading, error }] = useCreateCryptoPlanIntentMutation();
  const [confirmPurchase] = useConfirmCryptoPlanPurchaseMutation();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [creditsGranted, setCreditsGranted] = useState(0);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);

  const intent = data?.data ?? null;
  const walletReady =
    linkedWallet &&
    connectedAddress &&
    linkedWallet.toLowerCase() === connectedAddress.toLowerCase();

  useEffect(() => {
    if (!walletReady) return;
    createIntent({ orgId, planId, prepaidMonths }).catch(() => null);
  }, [createIntent, orgId, planId, prepaidMonths, walletReady]);

  const handlePay = async () => {
    if (!intent || !walletReady) return;
    const wagmiConfig = getWagmiConfig();
    if (!wagmiConfig) {
      setPayError('Wallet is not ready. Refresh and try again.');
      return;
    }

    setPaying(true);
    setPayError(null);

    try {
      await switchChain(wagmiConfig, { chainId: intent.chainId });

      const hash = await writeContract(wagmiConfig, {
        address: intent.usdcContract as `0x${string}`,
        abi: ERC20_TRANSFER_ABI,
        functionName: 'transfer',
        args: [intent.treasury as `0x${string}`, BigInt(intent.amountUsdc)],
        chainId: intent.chainId,
      });

      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: intent.chainId });

      const confirmed = await confirmPurchase({
        orgId,
        intentId: intent.intentId,
        txHash: hash,
      }).unwrap();

      setCreditsGranted(confirmed.data.creditsGranted);
      setPeriodEnd(confirmed.data.periodEnd);
      setSucceeded(true);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'The USDC payment could not be completed.');
    } finally {
      setPaying(false);
    }
  };

  if (!walletReady) {
    return (
      <>
        <DialogContent>
          <Alert severity="warning">
            Link your social wallet in Billing settings before paying with USDC.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Close</Button>
        </DialogActions>
      </>
    );
  }

  if (succeeded) {
    return (
      <>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            {plan.label} prepaid for {prepaidMonths} month{prepaidMonths === 1 ? '' : 's'} — active
            now.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {creditsGranted > 0
              ? `${creditsGranted} AI credits were added (${monthlyCredits}/mo × ${prepaidMonths}).`
              : 'Plan entitlements are active.'}
            {periodEnd ? ` Paid through ${new Date(periodEnd).toLocaleDateString()}.` : null}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDone} variant="contained">
            Done
          </Button>
        </DialogActions>
      </>
    );
  }

  if (isLoading || !intent) {
    return (
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          {error ? (
            <Alert severity="error">
              Could not start crypto checkout. Crypto may not be configured on this deployment.
            </Alert>
          ) : (
            <BrandedLoadingIndicator />
          )}
        </Box>
      </DialogContent>
    );
  }

  return (
    <>
      <DialogContent>
        {payError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {payError}
          </Alert>
        ) : null}
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {plan.label} — {prepaidMonths} month{prepaidMonths === 1 ? '' : 's'} prepaid (
            {formatMoney(intent.priceCents)}) for{' '}
            <strong>{formatUsdc(intent.amountUsdc)} USDC</strong> on {chainLabel(intent.chainId)}.
          </Typography>
          <Alert severity="info" variant="outlined">
            Send exactly {formatUsdc(intent.amountUsdc)} USDC from{' '}
            {formatWalletAddress(linkedWallet)}. Recurring billing stays on Stripe if you switch
            later.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={paying}>
          Cancel
        </Button>
        <Button
          onClick={handlePay}
          variant="contained"
          disabled={paying}
          startIcon={paying ? <CircularProgress size={16} /> : undefined}
        >
          {paying ? 'Confirming…' : `Pay ${formatUsdc(intent.amountUsdc)} USDC`}
        </Button>
      </DialogActions>
    </>
  );
}
