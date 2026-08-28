import { encodeFunctionData } from 'viem';
import {
  estimateFeesPerGas,
  estimateGas,
  getBalance,
  readContract,
} from 'wagmi/actions';
import { ERC20_TRANSFER_ABI } from '@/lib/web3/erc20-abi';
import { getWagmiConfig } from '@/lib/web3/wagmi-store';
import { normalizeChainId } from '@/lib/web3/normalize-chain-id';

/** USDC uses 6 decimals. */
export const USDC_DECIMALS = 6;

/**
 * Fallback gas ceiling when estimateGas fails (smart accounts / paymasters).
 * ~65k gas × a generous Base max-fee still fits under this eth wei budget.
 */
export const FALLBACK_GAS_WEI = 200_000_000_000_000n; // 0.0002 ETH

export type PaymentFundsStatus =
  | 'loading'
  | 'ready'
  | 'insufficient_usdc'
  | 'insufficient_gas'
  | 'insufficient_both'
  | 'error';

export interface PaymentFundsSnapshot {
  walletAddress: `0x${string}`;
  chainId: number;
  usdcBalance: bigint;
  nativeBalance: bigint;
  requiredUsdc: bigint;
  estimatedGasWei: bigint | null;
  nativeSymbol: string;
  status: PaymentFundsStatus;
  canPay: boolean;
  usdcShortfall: bigint;
  gasShortfall: bigint;
  error: string | null;
}

export interface FetchPaymentFundsInput {
  walletAddress: `0x${string}`;
  chainId: number;
  usdcContract: `0x${string}`;
  treasury: `0x${string}`;
  requiredUsdc: bigint;
  /** Optional AppKit / wagmi connector id — drives gas hard-block policy. */
  connectorId?: string | null;
}

export function formatUsdcAtomic(amount: bigint | string, fractionDigits = 2): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const asNumber = Number(value) / 10 ** USDC_DECIMALS;
  return asNumber.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatNativeWei(amount: bigint, decimals = 18, fractionDigits = 6): string {
  const asNumber = Number(amount) / 10 ** decimals;
  if (!Number.isFinite(asNumber)) return '0';
  return asNumber.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

export function chainLabel(chainId: number): string {
  if (chainId === 8453) return 'Base';
  if (chainId === 11_155_111) return 'Sepolia';
  if (chainId === 1) return 'Ethereum';
  return `Chain ${chainId}`;
}

/**
 * Decide whether missing native ETH/gas should hard-block Pay.
 *
 * Social / Reown embedded wallets often use a paymaster (sponsored gas).
 * Injected EOAs (MetaMask, etc.) typically need the user to hold ETH.
 *
 * @param connectorId — e.g. `google`, `github`, `injected`, `metaMask`
 */
export function shouldRequireNativeGas(connectorId: string | null | undefined): boolean {
  // TODO: Implement gas-gate policy for your wallet mix.
  // Suggested approach:
  // - return false for social / email / Reown auth providers (sponsored gas)
  // - return true for injected / browser extension wallets
  // Keep this function pure — no network calls.
  void connectorId;
  return false;
}

/**
 * Policy: can this wallet cover the USDC transfer + native gas?
 *
 * Reown social / smart accounts often sponsor gas — treat missing native as a
 * soft warning only when `requireNativeGas` is false (default).
 */
export function evaluatePaymentFunds(input: {
  usdcBalance: bigint;
  nativeBalance: bigint;
  requiredUsdc: bigint;
  estimatedGasWei: bigint | null;
  /** When true, block Pay if native balance cannot cover estimated gas. */
  requireNativeGas?: boolean;
}): Pick<
  PaymentFundsSnapshot,
  'status' | 'canPay' | 'usdcShortfall' | 'gasShortfall'
> {
  const requireNativeGas = input.requireNativeGas ?? false;
  const gasNeeded = input.estimatedGasWei ?? FALLBACK_GAS_WEI;
  const usdcShortfall =
    input.usdcBalance >= input.requiredUsdc ? 0n : input.requiredUsdc - input.usdcBalance;
  const gasShortfall =
    input.nativeBalance >= gasNeeded ? 0n : gasNeeded - input.nativeBalance;

  const missingUsdc = usdcShortfall > 0n;
  const missingGas = gasShortfall > 0n;

  if (missingUsdc && missingGas && requireNativeGas) {
    return {
      status: 'insufficient_both',
      canPay: false,
      usdcShortfall,
      gasShortfall,
    };
  }
  if (missingUsdc) {
    return {
      status: 'insufficient_usdc',
      canPay: false,
      usdcShortfall,
      gasShortfall,
    };
  }
  if (missingGas && requireNativeGas) {
    return {
      status: 'insufficient_gas',
      canPay: false,
      usdcShortfall,
      gasShortfall,
    };
  }

  return {
    status: 'ready',
    canPay: true,
    usdcShortfall,
    gasShortfall,
  };
}

async function estimateTransferGasWei(input: {
  walletAddress: `0x${string}`;
  chainId: number;
  usdcContract: `0x${string}`;
  treasury: `0x${string}`;
  requiredUsdc: bigint;
}): Promise<bigint | null> {
  const wagmiConfig = getWagmiConfig();
  if (!wagmiConfig) return null;

  try {
    const data = encodeFunctionData({
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [input.treasury, input.requiredUsdc],
    });
    const [gasUnits, fees] = await Promise.all([
      estimateGas(wagmiConfig, {
        account: input.walletAddress,
        to: input.usdcContract,
        data,
        chainId: input.chainId,
      }),
      estimateFeesPerGas(wagmiConfig, { chainId: input.chainId }),
    ]);
    const feePerGas = fees.maxFeePerGas ?? fees.gasPrice;
    if (feePerGas == null) return FALLBACK_GAS_WEI;
    return gasUnits * feePerGas;
  } catch {
    return FALLBACK_GAS_WEI;
  }
}

/** Read USDC + native balances and evaluate whether Pay can proceed. */
export async function fetchPaymentFunds(
  input: FetchPaymentFundsInput,
): Promise<PaymentFundsSnapshot> {
  const chainId = normalizeChainId(input.chainId);
  if (chainId == null) {
    return {
      walletAddress: input.walletAddress,
      chainId: 0,
      usdcBalance: 0n,
      nativeBalance: 0n,
      requiredUsdc: input.requiredUsdc,
      estimatedGasWei: null,
      nativeSymbol: 'ETH',
      status: 'error',
      canPay: false,
      usdcShortfall: input.requiredUsdc,
      gasShortfall: 0n,
      error: 'Invalid payment chain id.',
    };
  }

  const wagmiConfig = getWagmiConfig();
  if (!wagmiConfig) {
    return {
      walletAddress: input.walletAddress,
      chainId,
      usdcBalance: 0n,
      nativeBalance: 0n,
      requiredUsdc: input.requiredUsdc,
      estimatedGasWei: null,
      nativeSymbol: 'ETH',
      status: 'error',
      canPay: false,
      usdcShortfall: input.requiredUsdc,
      gasShortfall: 0n,
      error: 'Wallet is not ready. Refresh and try again.',
    };
  }

  try {
    const [usdcBalance, native, estimatedGasWei] = await Promise.all([
      readContract(wagmiConfig, {
        address: input.usdcContract,
        abi: ERC20_TRANSFER_ABI,
        functionName: 'balanceOf',
        args: [input.walletAddress],
        chainId,
      }),
      getBalance(wagmiConfig, {
        address: input.walletAddress,
        chainId,
      }),
      estimateTransferGasWei({ ...input, chainId }),
    ]);

    const evaluation = evaluatePaymentFunds({
      usdcBalance,
      nativeBalance: native.value,
      requiredUsdc: input.requiredUsdc,
      estimatedGasWei,
      requireNativeGas: shouldRequireNativeGas(input.connectorId),
    });

    return {
      walletAddress: input.walletAddress,
      chainId,
      usdcBalance,
      nativeBalance: native.value,
      requiredUsdc: input.requiredUsdc,
      estimatedGasWei,
      nativeSymbol: native.symbol || 'ETH',
      ...evaluation,
      error: null,
    };
  } catch (err) {
    return {
      walletAddress: input.walletAddress,
      chainId,
      usdcBalance: 0n,
      nativeBalance: 0n,
      requiredUsdc: input.requiredUsdc,
      estimatedGasWei: null,
      nativeSymbol: 'ETH',
      status: 'error',
      canPay: false,
      usdcShortfall: input.requiredUsdc,
      gasShortfall: 0n,
      error: err instanceof Error ? err.message : 'Could not read wallet balances.',
    };
  }
}

export function isTreasurySameAsWallet(
  treasury: string | null | undefined,
  wallet: string | null | undefined,
): boolean {
  if (!treasury || !wallet) return false;
  return treasury.toLowerCase() === wallet.toLowerCase();
}
