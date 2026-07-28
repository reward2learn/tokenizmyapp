import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
export default function NotFound() {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: 'system-ui, sans-serif', background: '#0f0f14', color: '#e0e0e0' }, children: [_jsx("h1", { style: { fontSize: '4rem', margin: 0, color: '#eb3d28' }, children: "404" }), _jsx("p", { style: { fontSize: '1.25rem', margin: '1rem 0' }, children: "This page could not be found." }), _jsx(Link, { href: "/dashboard", style: { color: '#0af9fe', textDecoration: 'none', fontSize: '1rem' }, children: "Back to Dashboard" })] }));
}
