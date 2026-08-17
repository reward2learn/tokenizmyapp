import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Wallet connection state (Reown AppKit).
 *
 * Lives in the store rather than in component state or a React context of its
 * own: the connect button, the account chip in the header and any token-gated
 * block all read the same connection, and they are not in one subtree. AppKit
 * keeps its own internal state, but it is a third-party store — mirroring the
 * parts the app actually renders into Redux keeps the rest of the app reading
 * from a single place and means a component does not have to be inside the
 * AppKit provider just to know whether someone is signed in.
 *
 * Only serializable, non-sensitive fields belong here. No signer, no provider
 * object, no private key material — those stay inside AppKit.
 */

export type WalletStatus = 'disabled' | 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WalletState {
  status: WalletStatus;
  /** Checksummed EVM address, or null when not connected. */
  address: string | null;
  /** Chain id the wallet is currently on. */
  chainId: number | null;
  /** How the user signed in, when AppKit reports it (e.g. "google", "apple", "email"). */
  connectorId: string | null;
  /** Formatted native balance, only populated when showBalances is on. */
  balance: string | null;
  /** Last connection error, surfaced next to the connect button. */
  error: string | null;
}

const initialState: WalletState = {
  // Starts "disabled" rather than "disconnected": most deployments have no
  // wallet at all, and the provider flips this to "disconnected" on mount only
  // when the capability is actually configured. UI keyed off "disabled" then
  // renders nothing without needing to read env vars itself.
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
    /** Called by the provider once the wallet capability is confirmed available. */
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

/** Shorten an address for display: 0x1234…abcd. */
export function formatWalletAddress(address: string | null): string {
  if (!address || address.length < 10) return address ?? '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
