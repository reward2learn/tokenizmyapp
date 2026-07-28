'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { SavedConversationsMenu } from '@/components/chat/saved-conversations-menu';
import { getReviewPartDisplayTitle, listNavPages, resolvePage, resolveReviewPart } from '@/lib/page-catalog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDrawerOpen } from '@/store/ui-slice';
import { useListPagesQuery } from '@/store/apis/content-api';
import { useGetBrandConfigQuery } from '@shared/store/apis/brand-config-api';
import { useGetNavigationQuery } from '@/store/apis/navigation-api';
import { NavIcon } from '@/components/shared/nav-icon';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
const DRAWER_WIDTH = 280;
const linkSx = { textDecoration: 'none', color: 'inherit', display: 'inline-flex', width: '100%' };
export function AppShell({ children }) {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const drawerOpen = useAppSelector((s) => s.ui.drawerOpen);
    const { tier, user, groups } = useAppSelector((s) => s.auth);
    useListPagesQuery();
    // Brand config via RTK Query — fallback to tenant env var, then default
    const { data: brandData } = useGetBrandConfigQuery();
    const tenantFallback = getClientTenantConfig().displayName;
    const brandText = brandData?.data?.brandLogoText || tenantFallback || 'My App';
    const brandLogoUrl = brandData?.data?.brandLogoUrl ?? '';
    // DB-driven navigation via RTK Query (fallback: static catalog via listNavPages)
    const groupsParam = encodeURIComponent((groups ?? []).join(','));
    const { data: navData } = useGetNavigationQuery({ tier, groups: groupsParam });
    // Prefer ApiEnvelope `{ success, data: { items } }`; tolerate legacy `{ items }` shape.
    const envelopeItems = navData?.data?.items;
    const legacyItems = navData?.items;
    const dbNavItems = envelopeItems ?? legacyItems;
    const catalogFallback = listNavPages(tier, groups ?? []).map((p) => ({
        id: `static-${p.slug}`,
        parentId: null,
        sortOrder: 0,
        title: p.navLabel ?? p.title,
        path: `/${p.slug}`,
        icon: '',
        authTier: p.authTier,
        requiredGroups: '',
        isVisible: true,
        isDynamic: false,
        isDefault: false,
        children: [],
    }));
    // Use DB nav when the API returned an items array (including empty).
    // Only fall back to the static catalog when the response is missing/malformed.
    const navItems = (dbNavItems !== undefined ? dbNavItems : catalogFallback);
    const closeDrawer = () => dispatch(setDrawerOpen(false));
    const toggleDrawer = () => dispatch(setDrawerOpen(!drawerOpen));
    const isActive = (href) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    /** Resolve breadcrumb trail from the current pathname. */
    const getBreadcrumbs = useCallback((p) => {
        const segments = p.split('/').filter(Boolean);
        const crumbs = [];
        let accumulated = '';
        for (const segment of segments) {
            accumulated += '/' + segment;
            const page = resolvePage(segment);
            if (page) {
                crumbs.push({ label: page.title, href: accumulated });
            }
            else {
                const part = resolveReviewPart(segment);
                if (part) {
                    crumbs.push({ label: getReviewPartDisplayTitle(part.title), href: accumulated });
                }
                else {
                    crumbs.push({
                        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                        href: accumulated,
                    });
                }
            }
        }
        return crumbs;
    }, []);
    const breadcrumbs = useMemo(() => getBreadcrumbs(pathname), [pathname, getBreadcrumbs]);
    /** Search query for filtering nav items inside the drawer. */
    const [searchQuery, setSearchQuery] = useState('');
    /** Recursively filter nav items by search query (match title, keep parent if any child matches). */
    const filterNavItems = useCallback((items, query) => {
        if (!query)
            return items;
        const lower = query.toLowerCase();
        return items.reduce((acc, item) => {
            const matches = item.title.toLowerCase().includes(lower);
            const children = 'children' in item ? item.children ?? [] : [];
            const filteredChildren = children.length > 0 ? filterNavItems(children, query) : [];
            if (matches || filteredChildren.length > 0) {
                acc.push({ ...item, children: filteredChildren });
            }
            return acc;
        }, []);
    }, []);
    const filteredNavItems = useMemo(() => filterNavItems(navItems, searchQuery), [navItems, searchQuery, filterNavItems]);
    /** Track which nav items have their children expanded (keyed by item id). */
    const [expandedNav, setExpandedNav] = useState({});
    const toggleExpanded = useCallback((id) => {
        setExpandedNav((prev) => ({ ...prev, [id]: !prev[id] }));
    }, []);
    /** Recursively render nav items with expand/collapse and hierarchy. */
    const renderNavItems = (items, currentPath, onClose, activeCheck, linkStyle, depth) => {
        return items.map((item) => {
            const href = item.path || '';
            const children = 'children' in item ? item.children ?? [] : [];
            const hasChildren = children.length > 0;
            const isExpanded = expandedNav[item.id] ?? false;
            const isFolder = !href && hasChildren;
            const isActiveItem = href ? activeCheck(href) : false;
            const handleNavClick = () => {
                if (!isFolder)
                    onClose();
            };
            return (_jsxs(Box, { sx: { display: 'inline-flex', flexDirection: 'column', width: '100%' }, children: [_jsxs(ListItemButton, { selected: isActiveItem, onClick: handleNavClick, component: !isFolder && href ? Link : 'div', href: !isFolder && href ? href : undefined, style: !isFolder && href ? linkStyle : undefined, sx: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            width: '100%',
                            pl: 2 + depth * 2,
                            borderLeft: '3px solid transparent',
                            '&.Mui-selected': {
                                borderLeftColor: 'primary.main',
                                bgcolor: 'rgba(235, 61, 40, 0.06)',
                            },
                        }, children: [_jsx(ListItemIcon, { sx: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: item.icon || hasChildren ? 28 : 0,
                                    color: 'text.secondary',
                                    cursor: hasChildren ? 'pointer' : 'default',
                                }, onClick: (e) => {
                                    if (hasChildren) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleExpanded(item.id);
                                    }
                                }, children: item.icon ? (_jsx(NavIcon, { name: item.icon, fontSize: "small" })) : hasChildren ? (isExpanded ? _jsx(ExpandLessIcon, { fontSize: "small" }) : _jsx(ExpandMoreIcon, { fontSize: "small" })) : null }), _jsx(ListItemText, { primary: item.title, sx: { display: 'inline-flex', alignItems: 'center', m: 0 }, slotProps: {
                                    primary: {
                                        variant: hasChildren ? 'subtitle2' : 'body2',
                                        sx: {
                                            fontWeight: hasChildren ? 700 : 400,
                                            color: hasChildren ? 'text.primary' : undefined,
                                        },
                                    },
                                } })] }), hasChildren ? (_jsx(Collapse, { in: isExpanded, timeout: "auto", unmountOnExit: true, children: _jsx(Box, { sx: { ml: 0 }, children: renderNavItems(children, currentPath, onClose, activeCheck, linkStyle, depth + 1) }) })) : null] }, item.id));
        });
    };
    return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', minHeight: '100dvh' }, children: [_jsx(AppBar, { position: "sticky", elevation: 0, color: "transparent", children: _jsxs(Toolbar, { sx: { minHeight: 52 }, children: [_jsx(IconButton, { "aria-label": "Open navigation", onClick: toggleDrawer, sx: { color: 'text.secondary', mr: 1 }, children: _jsx(MenuIcon, {}) }), _jsxs(Link, { href: "/dashboard", style: { ...linkSx, alignItems: 'center', gap: 1 }, children: [brandLogoUrl && (_jsx(Box, { component: "img", src: brandLogoUrl, alt: brandText, sx: { height: 28, width: 'auto', maxWidth: 120, objectFit: 'contain', display: 'block' } })), _jsx(Typography, { variant: "subtitle1", sx: { pl: 1, fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap' }, children: brandText })] }), breadcrumbs.length > 0 && (_jsx(Breadcrumbs, { separator: _jsx(NavigateNextIcon, { fontSize: "small", sx: { color: 'text.disabled' } }), sx: { ml: 2, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }, children: breadcrumbs.map((crumb, idx) => {
                                const isLast = idx === breadcrumbs.length - 1;
                                return isLast ? (_jsx(Typography, { variant: "caption", sx: { color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }, children: crumb.label }, crumb.href)) : (_jsx(Link, { href: crumb.href, style: { textDecoration: 'none', color: 'inherit' }, children: _jsx(Typography, { variant: "caption", sx: {
                                            color: 'text.disabled',
                                            '&:hover': { color: 'text.primary' },
                                            whiteSpace: 'nowrap',
                                        }, children: crumb.label }) }, crumb.href));
                            }) })), _jsx(Box, { sx: { flex: 1 } }), _jsx(Box, { sx: { display: 'flex', alignItems: 'center' }, children: _jsx(SavedConversationsMenu, {}) })] }) }), _jsxs(Drawer, { anchor: "left", open: drawerOpen, onClose: closeDrawer, slotProps: { paper: { sx: { width: DRAWER_WIDTH, maxWidth: '80vw' } } }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, pb: 2 }, children: [_jsx(Avatar, { src: user?.picture ?? undefined, sx: { width: 36, height: 36, bgcolor: 'rgba(235, 61, 40, 0.15)', color: 'primary.main' }, children: user?.name?.[0] ?? 'R' }), _jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: user?.name ?? 'Guest' }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: user?.email ?? `Tier: ${tier}` })] })] }), _jsx(Divider, {}), _jsx(Box, { sx: { px: 2, py: 1 }, children: _jsx(TextField, { placeholder: "Search pages...", variant: "outlined", size: "small", fullWidth: true, value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), slotProps: {
                                input: {
                                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchOutlined, { fontSize: "small", sx: { color: 'text.disabled' } }) })),
                                },
                            }, sx: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.04)',
                                },
                            } }) }), _jsx(List, { sx: { flex: 1, py: 1 }, children: renderNavItems(filteredNavItems, pathname, closeDrawer, isActive, linkSx, 0) }), _jsx(Divider, {}), _jsxs(Box, { sx: { p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }, children: [tier === 'public' ? (_jsx(Button, { component: "a", href: `/api/auth?action=google&redirect=${encodeURIComponent(pathname || '/dashboard')}`, variant: "outlined", size: "small", fullWidth: true, children: "Sign in with Google" })) : (_jsx(Button, { variant: "outlined", size: "small", color: "inherit", fullWidth: true, onClick: () => {
                                    window.location.href = '/api/auth?action=logout';
                                }, children: "Sign out" })), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(Link, { href: "/terms-of-service", style: linkSx, onClick: closeDrawer, children: _jsx(Typography, { variant: "caption", sx: { color: 'text.disabled' }, children: "Terms" }) }), _jsx(Link, { href: "/privacy-policy", style: linkSx, onClick: closeDrawer, children: _jsx(Typography, { variant: "caption", sx: { color: 'text.disabled' }, children: "Privacy" }) })] })] })] }), _jsx(Box, { component: "div", sx: { flex: 1 }, children: children })] }));
}
