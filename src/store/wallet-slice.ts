import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type WalletStatus = 'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  chainId: number | null;
  connectorId: string | null;
  balance: string | null;
  error: string | null;
}

const initialState: WalletState = {
  status: 'disabled',
  address: null,
  chainId: null,
  connectorId: null,
  balance: null,
  error: null,
};

export interface WalletConnectedPayload {
  address: string;
  chainId: number | null;
  connectorId?: string | null;
}

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
      state.status = 'connected';
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.connectorId = action.payload.connectorId ?? null;
      state.error = null;
    },
    walletDisconnected(state) {
      state.status = state.status === 'disabled' ? 'disabled' : 'disconnected';
      state.address = null;
      state.chainId = null;
      state.connectorId = null;
      state.balance = null;
    },
    walletBalanceUpdated(state, action: PayloadAction<string | null>) {
      state.balance = action.payload;
    },
    walletError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const {
  walletEnabled,
  walletConnecting,
  walletConnected,
  walletDisconnected,
  walletBalanceUpdated,
  walletError,
} = walletSlice.actions;

export function formatWalletAddress(address: string | null): string {
  if (!address || address.length < 10) return address ?? '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
