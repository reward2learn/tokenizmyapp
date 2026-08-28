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
import type { CreditPack } from '@/lib/billing/plans';
import { ERC20_TRANSFER_ABI } from '@/lib/web3/erc20-abi';
import { getWagmiConfig } from '@/lib/web3/wagmi-store';
import {
  useConfirmCryptoTopUpMutation,
  useCreateCryptoTopUpIntentMutation,
} from '@/store/apis/organization-api';
import { useAppSelector } from '@/store/hooks';
import { formatWalletAddress, isCryptoWalletReadyForPayment } from '@/store/wallet-slice';
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

export interface CryptoTopUpPanelProps {
  orgId: string;
  packId: string;
  pack: CreditPack;
  totalCredits: number;
  onDone: () => void;
  onCancel: () => void;
}

export function CryptoTopUpPanel({
  orgId,
  packId,
  pack,
  totalCredits,
  onDone,
  onCancel,
}: CryptoTopUpPanelProps) {
  const linkedWallet = useAppSelector((state) => state.auth.walletAddress);
  const wallet = useAppSelector((state) => state.wallet);
  const connectedAddress = wallet.address;
  const [createIntent, { data, isLoading, error }] = useCreateCryptoTopUpIntentMutation();
  const [confirmTopUp] = useConfirmCryptoTopUpMutation();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [credited, setCredited] = useState(false);
  const [balanceAvailable, setBalanceAvailable] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const intent = data?.data ?? null;
  const walletReady = isCryptoWalletReadyForPayment(
    { walletAddress: linkedWallet },
    wallet,
  );

  useEffect(() => {
    if (!walletReady) return;
    createIntent({ orgId, packId }).catch(() => null);
  }, [createIntent, orgId, packId, walletReady]);

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

      setTxHash(hash);
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: intent.chainId });

      const confirmed = await confirmTopUp({
        orgId,
        intentId: intent.intentId,
        txHash: hash,
      }).unwrap();

      setBalanceAvailable(confirmed.data.balance.available);
      setCredited(true);
      setSucceeded(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'The USDC payment could not be completed.';
      setPayError(message);
    } finally {
      setPaying(false);
    }
  };

  if (!walletReady) {
    return (
      <>
        <DialogContent>
          <Alert severity="warning">
            Link your social wallet in Billing settings before paying with USDC. Connect with
            Google, then complete the sign-in prompt to link the wallet to your account.
          </Alert>
          {connectedAddress && !linkedWallet ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Wallet connected ({formatWalletAddress(connectedAddress)}) but not yet linked — look
              for the SIWE sign-in prompt.
            </Typography>
          ) : null}
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
            {credited ? 'Payment received — credits added.' : 'Payment received.'}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {credited && balanceAvailable != null
              ? `${totalCredits} credits from ${pack.label} are on your balance (now ${balanceAvailable} available).`
              : `${totalCredits} credits from ${pack.label} will appear once confirmation finishes.`}
          </Typography>
          {txHash ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Transaction: {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </Typography>
          ) : null}
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
              Could not start crypto payment. Configure Crypto Payments on the factory
              tenant (Ops Admin → Edit → Crypto Payments + treasury address) or set
              CRYPTO_TREASURY_ADDRESS / CRYPTO_PAYMENTS_ENABLED on Vercel.
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
            {pack.label} — {totalCredits} credits for{' '}
            <strong>{formatUsdc(intent.amountUsdc)} USDC</strong> on {chainLabel(intent.chainId)}.
          </Typography>
          <Alert severity="info" variant="outlined">
            Send exactly {formatUsdc(intent.amountUsdc)} USDC from{' '}
            {formatWalletAddress(linkedWallet)} to the platform treasury. Your wallet will prompt
            for approval.
          </Alert>
          <Typography variant="caption" color="text.secondary">
            Treasury: {formatWalletAddress(intent.treasury)} · Reference: {intent.reference}
          </Typography>
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
