'use client';

import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { switchChain, waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { CryptoPaymentFundsPanel } from '@/components/billing/crypto-payment-funds-panel';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import type { PlanId } from '@/lib/billing/plans';
import { getPlan, planAiCreditsPerMonth } from '@/lib/billing/plans';
import type { CryptoPlanPrepaidMonths } from '@/lib/web3/crypto-billing-config';
import {
  chainLabel,
  formatUsdcAtomic,
  isTreasurySameAsWallet,
  type PaymentFundsSnapshot,
} from '@/lib/web3/crypto-payment-funds';
import { ERC20_TRANSFER_ABI } from '@/lib/web3/erc20-abi';
import { normalizeChainId } from '@/lib/web3/normalize-chain-id';
import { getWagmiConfig } from '@/lib/web3/wagmi-store';
import {
  useConfirmCryptoPlanPurchaseMutation,
  useCreateCryptoPlanIntentMutation,
} from '@/store/apis/organization-api';
import { useAppSelector } from '@/store/hooks';
import { formatWalletAddress, isCryptoWalletReadyForPayment } from '@/store/wallet-slice';

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
  const wallet = useAppSelector((state) => state.wallet);
  const [createIntent, { data, isLoading, error }] = useCreateCryptoPlanIntentMutation();
  const [confirmPurchase] = useConfirmCryptoPlanPurchaseMutation();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [creditsGranted, setCreditsGranted] = useState(0);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [funds, setFunds] = useState<PaymentFundsSnapshot | null>(null);

  const intent = data?.data ?? null;
  const walletReady = isCryptoWalletReadyForPayment(
    { walletAddress: linkedWallet },
    wallet,
  );
  const treasuryMisconfigured =
    intent != null && isTreasurySameAsWallet(intent.treasury, linkedWallet);

  const handleFundsChange = useCallback((next: PaymentFundsSnapshot | null) => {
    setFunds(next);
  }, []);

  useEffect(() => {
    if (!walletReady) return;
    createIntent({ orgId, planId, prepaidMonths }).catch(() => null);
  }, [createIntent, orgId, planId, prepaidMonths, walletReady]);

  const handlePay = async () => {
    if (!intent || !walletReady || !funds?.canPay || treasuryMisconfigured) return;
    const wagmiConfig = getWagmiConfig();
    if (!wagmiConfig) {
      setPayError('Wallet is not ready. Refresh and try again.');
      return;
    }

    const chainId = normalizeChainId(intent.chainId);
    if (chainId == null) {
      setPayError('Invalid payment chain. Contact support.');
      return;
    }

    setPaying(true);
    setPayError(null);

    try {
      await switchChain(wagmiConfig, { chainId });

      const hash = await writeContract(wagmiConfig, {
        address: intent.usdcContract as `0x${string}`,
        abi: ERC20_TRANSFER_ABI,
        functionName: 'transfer',
        args: [intent.treasury as `0x${string}`, BigInt(intent.amountUsdc)],
        chainId,
      });

      await waitForTransactionReceipt(wagmiConfig, { hash, chainId });

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

  const payDisabled =
    paying || !funds?.canPay || funds.status === 'loading' || treasuryMisconfigured;

  return (
    <>
      <DialogContent>
        {payError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {payError}
          </Alert>
        ) : null}
        {treasuryMisconfigured ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Platform treasury is set to your wallet address. Fix CRYPTO_TREASURY_ADDRESS before
            paying with USDC.
          </Alert>
        ) : null}
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {plan.label} — {prepaidMonths} month{prepaidMonths === 1 ? '' : 's'} prepaid (
            {formatMoney(intent.priceCents)}) for{' '}
            <strong>{formatUsdcAtomic(intent.amountUsdc)} USDC</strong> on{' '}
            {chainLabel(intent.chainId)}.
          </Typography>

          {linkedWallet ? (
            <CryptoPaymentFundsPanel
              walletAddress={linkedWallet}
              chainId={intent.chainId}
              usdcContract={intent.usdcContract}
              treasury={intent.treasury}
              requiredUsdc={intent.amountUsdc}
              connectorId={wallet.connectorId}
              onFundsChange={handleFundsChange}
            />
          ) : null}

          <Alert severity="info" variant="outlined">
            Send exactly {formatUsdcAtomic(intent.amountUsdc)} USDC from{' '}
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
          disabled={payDisabled}
          startIcon={paying ? <CircularProgress size={16} /> : undefined}
        >
          {paying
            ? 'Confirming…'
            : funds && !funds.canPay
              ? 'Insufficient funds'
              : `Pay ${formatUsdcAtomic(intent.amountUsdc)} USDC`}
        </Button>
      </DialogActions>
    </>
  );
}
