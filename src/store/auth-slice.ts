import { createSlice } from '@reduxjs/toolkit';
import type { AuthTier } from '@/lib/page-catalog';
import type { SessionUser } from '@/store/api-types';

export interface AuthState {
  tier: AuthTier;
  user: SessionUser | null;
  bootstrapped: boolean;
  roleCode?: string | null;
  platformAdmin?: boolean;
  groups: string[];
  permissions: string[];
  walletAddress?: string | null;
  walletChainId?: number | null;
}

const initialState: AuthState = {
  tier: 'public',
  user: null,
  bootstrapped: false,
  roleCode: null,
  platformAdmin: false,
  groups: [],
  permissions: [],
  walletAddress: null,
  walletChainId: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(
      state,
      action: {
        payload: {
          tier: AuthTier;
          user: SessionUser | null;
          roleCode?: string | null;
          platformAdmin?: boolean;
          groups?: string[];
          permissions?: string[];
          walletAddress?: string | null;
          walletChainId?: number | null;
        };
      },
    ) {
      state.tier = action.payload.tier;
      state.user = action.payload.user;
      state.roleCode = action.payload.roleCode ?? null;
      state.platformAdmin = action.payload.platformAdmin ?? false;
      state.groups = action.payload.groups ?? [];
      state.permissions = action.payload.permissions ?? [];
      state.walletAddress = action.payload.walletAddress ?? null;
      state.walletChainId = action.payload.walletChainId ?? null;
      state.bootstrapped = true;
    },
    setTier(state, action: { payload: AuthTier }) {
      state.tier = action.payload;
      state.bootstrapped = true;
    },
    resetAuth(state) {
      state.tier = 'public';
      state.user = null;
      state.walletAddress = null;
      state.walletChainId = null;
      state.bootstrapped = true;
    },
    setUserDisplayName(state, action: { payload: string }) {
      if (state.user) state.user.name = action.payload;
    },
  },
});

export const { setSession, setTier, resetAuth, setUserDisplayName } = authSlice.actions;
