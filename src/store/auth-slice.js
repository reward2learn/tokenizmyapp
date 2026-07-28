import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    tier: 'public',
    user: null,
    bootstrapped: false,
    roleCode: null,
    platformAdmin: false,
    groups: [],
    permissions: [],
};
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSession(state, action) {
            state.tier = action.payload.tier;
            state.user = action.payload.user;
            state.roleCode = action.payload.roleCode ?? null;
            state.platformAdmin = action.payload.platformAdmin ?? false;
            state.groups = action.payload.groups ?? [];
            state.permissions = action.payload.permissions ?? [];
            state.bootstrapped = true;
        },
        setTier(state, action) {
            state.tier = action.payload;
            state.bootstrapped = true;
        },
        resetAuth(state) {
            state.tier = 'public';
            state.user = null;
            state.bootstrapped = true;
        },
    },
});
export const { setSession, setTier, resetAuth } = authSlice.actions;
