import { jsx as _jsx } from "react/jsx-runtime";
import { StoreProvider } from '@/components/providers/store-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
export function AppProviders({ children }) {
    return (_jsx(StoreProvider, { children: _jsx(AuthProvider, { children: children }) }));
}
