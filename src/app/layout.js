import { jsx as _jsx } from "react/jsx-runtime";
import '../../style.css';
import { AppProviders } from '@/components/providers/app-providers';
import { ThemeRegistry } from '@/theme/theme-registry';
import { AppShell } from '@/components/layout/app-shell';
import { getTenantConfig } from '@shared/lib/config/tenant';
const tenant = getTenantConfig();
export const metadata = {
    title: tenant.appTitle,
    description: tenant.description,
};
export default function RootLayout({ children }) {
    return (_jsx("html", { lang: "en", suppressHydrationWarning: true, children: _jsx("body", { children: _jsx(AppProviders, { children: _jsx(ThemeRegistry, { children: _jsx(AppShell, { children: children }) }) }) }) }));
}
