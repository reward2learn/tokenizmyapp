import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { linkFactoryWalletSession } from '@/lib/web3/factory-wallet-link';
import { disconnectFactoryWallet } from '@/lib/web3/factory-wallet-disconnect';
import type { AuthState } from '@/store/auth-slice';

export type WalletStatus = 'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error';
export type WalletLinkStatus = 'idle' | 'linking' | 'linked' | 'error';
export type WalletDisconnectStatus = 'idle' | 'disconnecting' | 'error';

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  chainId: number | null;
  connectorId: string | null;
  balance: string | null;
  error: string | null;
  linkStatus: WalletLinkStatus;
  linkError: string | null;
  disconnectStatus: WalletDisconnectStatus;
  disconnectError: string | null;
  /** Last address we attempted to link — avoids repeat auto-link loops. */
  lastLinkAttemptAddress: string | null;
  /** Set when OAuth returns ?auth=success — triggers one auto-link attempt. */
  authRedirectPending: boolean;
}

const initialState: WalletState = {
  status: 'disabled',
  address: null,
  chainId: null,
  connectorId: null,
  balance: null,
  error: null,
  linkStatus: 'idle',
  linkError: null,
  disconnectStatus: 'idle',
  disconnectError: null,
  lastLinkAttemptAddress: null,
  authRedirectPending: false,
};

export interface WalletConnectedPayload {
  address: string;
  chainId: number | null;
  connectorId?: string | null;
}

export const linkWalletSession = createAsyncThunk<
  { address: string },
  void,
  { rejectValue: string }
>('wallet/linkSession', async (_arg, { rejectWithValue }) => {
  try {
    return await linkFactoryWalletSession();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Could not link wallet.');
  }
});

export const disconnectWalletSession = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('wallet/disconnectSession', async (_arg, { rejectWithValue, dispatch }) => {
  try {
    await disconnectFactoryWallet();
    dispatch(walletDisconnected());
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Could not disconnect wallet.');
  }
});

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    walletEnabled(state) {
      if (state.status === 'disabled') state.status = 'disconnected';
    },
    walletConnecting(state) {
      state.status = 'connecting';
      state.error = null;
    },
    walletConnected(state, action: PayloadAction<WalletConnectedPayload>) {
      const nextAddress = action.payload.address.toLowerCase();
      const addressChanged = state.address?.toLowerCase() !== nextAddress;
      state.status = 'connected';
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.connectorId = action.payload.connectorId ?? null;
      state.error = null;
      if (addressChanged) {
        state.linkStatus = 'idle';
        state.linkError = null;
      }
    },
    walletDisconnected(state) {
      state.status = state.status === 'disabled' ? 'disabled' : 'disconnected';
      state.address = null;
      state.chainId = null;
      state.connectorId = null;
      state.balance = null;
      state.linkStatus = 'idle';
      state.linkError = null;
      state.disconnectStatus = 'idle';
      state.disconnectError = null;
      state.lastLinkAttemptAddress = null;
    },
    walletBalanceUpdated(state, action: PayloadAction<string | null>) {
      state.balance = action.payload;
    },
    walletError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    walletAuthRedirectDetected(state) {
      state.authRedirectPending = true;
    },
    walletAuthRedirectCleared(state) {
      state.authRedirectPending = false;
    },
    walletLinkReset(state) {
      state.linkStatus = 'idle';
      state.linkError = null;
      state.lastLinkAttemptAddress = null;
    },
    walletLinkConfirmed(state) {
      state.linkStatus = 'linked';
      state.linkError = null;
      state.authRedirectPending = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(linkWalletSession.pending, (state) => {
        state.linkStatus = 'linking';
        state.linkError = null;
        if (state.address) state.lastLinkAttemptAddress = state.address.toLowerCase();
      })
      .addCase(linkWalletSession.fulfilled, (state) => {
        state.linkStatus = 'linked';
        state.linkError = null;
        state.authRedirectPending = false;
      })
      .addCase(linkWalletSession.rejected, (state, action) => {
        state.linkStatus = 'error';
        state.linkError = action.payload ?? action.error.message ?? 'Could not link wallet.';
      })
      .addCase(disconnectWalletSession.pending, (state) => {
        state.disconnectStatus = 'disconnecting';
        state.disconnectError = null;
      })
      .addCase(disconnectWalletSession.fulfilled, (state) => {
        state.disconnectStatus = 'idle';
        state.disconnectError = null;
        state.linkStatus = 'idle';
        state.linkError = null;
        state.authRedirectPending = false;
      })
      .addCase(disconnectWalletSession.rejected, (state, action) => {
        state.disconnectStatus = 'error';
        state.disconnectError =
          action.payload ?? action.error.message ?? 'Could not disconnect wallet.';
      });
  },
});

export const {
  walletEnabled,
  walletConnecting,
  walletConnected,
  walletDisconnected,
  walletBalanceUpdated,
  walletError,
  walletAuthRedirectDetected,
  walletAuthRedirectCleared,
  walletLinkReset,
  walletLinkConfirmed,
} = walletSlice.actions;

export function formatWalletAddress(address: string | null): string {
  if (!address || address.length < 10) return address ?? '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function walletSessionLinked(
  auth: Pick<AuthState, 'walletAddress'>,
  walletAddress: string | null | undefined,
): boolean {
  if (!auth.walletAddress || !walletAddress) return false;
  return auth.walletAddress.toLowerCase() === walletAddress.toLowerCase();
}
