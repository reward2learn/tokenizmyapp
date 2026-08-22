'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
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
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import dynamic from 'next/dynamic';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import BrightnessAutoOutlined from '@mui/icons-material/BrightnessAutoOutlined';
import type { ReactNode } from 'react';
import { SavedConversationsMenu } from '@/components/chat/saved-conversations-menu';
import { HeaderCredits } from '@/components/billing/header-credits';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { listNavPages } from '@/lib/page-catalog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openSettingsDialog, setChatDrawerOpen, setDrawerOpen, toggleChatDrawer } from '@/store/ui-slice';
import { useListPagesQuery } from '@/store/apis/content-api';
import { useGetBrandConfigQuery } from '@shared/store/apis/brand-config-api';
import { useGetNavigationQuery } from '@/store/apis/navigation-api';
import { NavIcon } from '@/components/shared/nav-icon';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import { effectiveUserGroups } from '@/lib/auth/jwt';
import { useUserAvatarUrl } from '@/lib/auth/use-user-avatar-url';
import { useThemeMode } from '@/theme/theme-registry';
import type { ThemeMode } from '@/theme/design-tokens';

const DRAWER_WIDTH = 280;
/** Right-side AI chat drawer — persistent (pushes the main container, no overlay). */
const CHAT_DRAWER_WIDTH = { xs: 320, sm: 400 };

// Lazy-load the chat panel so the shell stays light; it renders in the drawer.
const ChatDrawerPanel = dynamic(
  () => import('@/components/chat/chat-panel').then((m) => ({ default: m.ChatPanel })),
  { ssr: false },
);

const THEME_MODE_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' },
];

function ThemeModeIcon({ mode }: { mode: ThemeMode }) {
  switch (mode) {
    case 'light':
      return <LightModeOutlined fontSize="small" />;
    case 'dark':
      return <DarkModeOutlined fontSize="small" />;
    case 'system':
      return <BrightnessAutoOutlined fontSize="small" />;
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

function themeModeLabel(mode: ThemeMode): string {
  switch (mode) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'system':
      return 'System';
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

const linkSx = { textDecoration: 'none', color: 'inherit', display: 'inline-flex', width: '100%' };

/** DB-driven nav item shape from GET /api/navigation */
interface DbNavItem {
  id: string;
  parentId: string | null;
  sortOrder: number;
  title: string;
  path: string;
  icon: string;
  authTier: string;
  requiredGroups: string;
  isVisible: boolean;
  isDynamic: boolean;
  isDefault: boolean;
  children: DbNavItem[];
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const drawerOpen = useAppSelector((s) => s.ui.drawerOpen);
  const chatDrawerOpen = useAppSelector((s) => s.ui.chatDrawerOpen);
  const { tier, user, groups, platformAdmin, bootstrapped } = useAppSelector((s) => s.auth);
  const avatarUrl = useUserAvatarUrl();
  const navGroups = useMemo(
    () => effectiveUserGroups(groups, platformAdmin),
    [groups, platformAdmin],
  );
  const { themeMode, setThemeMode } = useThemeMode();
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<HTMLElement | null>(null);
  const { refetch: refetchPages } = useListPagesQuery();

  // Brand config via RTK Query — fallback to tenant env var, then default
  const { data: brandData } = useGetBrandConfigQuery();
  const tenantFallback = getClientTenantConfig().displayName;
  const brandText = brandData?.data?.brandLogoText || tenantFallback || 'My App';
  const brandLogoUrl = brandData?.data?.brandLogoUrl ?? '';

  // DB-driven navigation via RTK Query (fallback: static catalog via listNavPages)
  const groupsParam = encodeURIComponent(navGroups.join(','));
  const { data: navData, refetch: refetchNavigation } = useGetNavigationQuery(
    { tier, groups: groupsParam },
    { skip: !bootstrapped, refetchOnMountOrArgChange: true },
  );
  // Prefer ApiEnvelope `{ success, data: { items } }`; tolerate legacy `{ items }` shape.
  const envelopeItems = navData?.data?.items as DbNavItem[] | undefined;
  const legacyItems = (navData as { items?: DbNavItem[] } | undefined)?.items;
  const dbNavItems = envelopeItems ?? legacyItems;

  const catalogFallback = listNavPages(tier, navGroups).map((p) => ({
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
    children: [] as DbNavItem[],
  }));

  // Use DB nav when the API returned an items array (including empty).
  // Only fall back to the static catalog when the response is missing/malformed.
  const navItems = (dbNavItems !== undefined ? dbNavItems : catalogFallback) as DbNavItem[];

  const logoHref = useMemo((): Route => {
    const findDefault = (items: DbNavItem[]): string | null => {
      for (const item of items) {
        if (item.isDefault && item.path) return item.path;
        const childDefault = findDefault(item.children ?? []);
        if (childDefault) return childDefault;
      }
      return null;
    };
    return (findDefault(navItems) ?? '/') as Route;
  }, [navItems]);
  const closeDrawer = () => dispatch(setDrawerOpen(false));
  const openDrawer = useCallback(() => {
    dispatch(setDrawerOpen(true));
    // Refresh nav tree (server reconciles duplicates) + page catalog on every open.
    void refetchNavigation();
    void refetchPages();
  }, [dispatch, refetchNavigation, refetchPages]);
  const toggleDrawer = () => {
    if (drawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && href !== '/dashboard' && pathname.startsWith(href));

  /** Search query for filtering nav items inside the drawer. */
  const [searchQuery, setSearchQuery] = useState('');

  /** Recursively filter nav items by search query (match title, keep parent if any child matches). */
  const filterNavItems = useCallback(
    (items: (DbNavItem | (DbNavItem & { _isCatalog?: boolean }))[], query: string): (DbNavItem | (DbNavItem & { _isCatalog?: boolean }))[] => {
      if (!query) return items;
      const lower = query.toLowerCase();
      return items.reduce<(DbNavItem | (DbNavItem & { _isCatalog?: boolean }))[]>((acc, item) => {
        const matches = item.title.toLowerCase().includes(lower);
        const children = 'children' in item ? (item as DbNavItem).children ?? [] : [];
        const filteredChildren = children.length > 0 ? filterNavItems(children, query) : [];
        if (matches || filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren } as DbNavItem & { _isCatalog?: boolean });
        }
        return acc;
      }, []);
    },
    [],
  );

  const filteredNavItems = useMemo(
    () => filterNavItems(navItems, searchQuery),
    [navItems, searchQuery, filterNavItems],
  );

  /** Track which nav items have their children expanded (keyed by item id). */
  const [expandedNav, setExpandedNav] = useState<Record<string, boolean>>({});

  const toggleExpanded = useCallback((id: string) => {
    setExpandedNav((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /** Recursively render nav items with expand/collapse and hierarchy. */
  const renderNavItems = (
    items: (DbNavItem | (DbNavItem & { _isCatalog?: boolean }))[],
    currentPath: string,
    onClose: () => void,
    activeCheck: (href: string) => boolean,
    linkStyle: Record<string, unknown>,
    depth: number,
  ): ReactNode[] => {
    return items.map((item) => {
      const href = item.path || '';
      const children = 'children' in item ? (item as DbNavItem).children ?? [] : [];
      const hasChildren = children.length > 0;
      const isExpanded = expandedNav[item.id] ?? false;
      const isFolder = !href && hasChildren;
      const isActiveItem = href ? activeCheck(href) : false;

      const handleNavClick = () => {
        if (!isFolder) onClose();
      };

      return (
        <Box key={item.id} sx={{ display: 'inline-flex', flexDirection: 'column', width: '100%' }}>
          <ListItemButton
            selected={isActiveItem}
            onClick={handleNavClick}
            component={!isFolder && href ? Link : 'div'}
            href={!isFolder && href ? (href as Route) : undefined}
            style={!isFolder && href ? linkStyle : undefined}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              width: '100%',
              pl: 2 + depth * 2,
              borderLeft: '3px solid transparent',
              '&.Mui-selected': {
                borderLeftColor: 'primary.main',
                bgcolor: 'rgba(235, 61, 40, 0.06)',
              },
            }}
          >
            {/* Icon — custom nav icon OR expand/collapse chevron */}
            <ListItemIcon
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: item.icon || hasChildren ? 28 : 0,
                color: 'text.secondary',
                cursor: hasChildren ? 'pointer' : 'default',
              }}
              onClick={(e: React.MouseEvent) => {
                if (hasChildren) {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpanded(item.id);
                }
              }}
            >
              {item.icon ? (
                <NavIcon name={item.icon} fontSize="small" />
              ) : hasChildren ? (
                isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
              ) : null}
            </ListItemIcon>
            {/* Title text — clicking navigates (if path set) and closes drawer */}
            <ListItemText
              primary={item.title}
              sx={{ display: 'inline-flex', alignItems: 'center', m: 0 }}
              slotProps={{
                primary: {
                  variant: hasChildren ? 'subtitle2' : 'body2',
                  sx: {
                    fontWeight: hasChildren ? 700 : 400,
                    color: hasChildren ? 'text.primary' : undefined,
                  },
                },
              }}
            />
          </ListItemButton>
          {hasChildren ? (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ ml: 0 }}>
                {renderNavItems(children, currentPath, onClose, activeCheck, linkStyle, depth + 1)}
              </Box>
            </Collapse>
          ) : null}
        </Box>
      );
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100dvh', alignItems: 'stretch' }}>
      {/* Main column: app header + page content (shrinks when the chat
          drawer opens — push, never overlay) */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar sx={{ minHeight: 52, pt: 'env(safe-area-inset-top, 0px)' }}>
          {/* Hamburger toggle — left aligned */}
          <IconButton
            aria-label="Open navigation"
            onClick={toggleDrawer}
            sx={{ color: 'text.secondary', mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo image + brand text always visible side by side */}
          <Link href={logoHref} style={{ ...linkSx, alignItems: 'center', gap: 1 }}>
            {brandLogoUrl && (
              <Box
                component="img"
                src={brandLogoUrl}
                alt={brandText}
                sx={{ height: 28, width: 'auto', maxWidth: 120, objectFit: 'contain', display: 'block' }}
              />
            )}
            <Typography
              variant="subtitle1"
              sx={{ pl: 1, fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap' }}
            >
              {brandText}
            </Typography>
          </Link>

          {/* Theme mode menu */}
          <Tooltip title={`Theme: ${themeModeLabel(themeMode)}`}>
            <IconButton
              aria-label="Change theme"
              aria-haspopup="menu"
              aria-expanded={themeMenuAnchor ? 'true' : undefined}
              onClick={(e) => setThemeMenuAnchor(e.currentTarget)}
              sx={{ color: 'text.secondary', mr: 1 }}
            >
              <ThemeModeIcon mode={themeMode} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={themeMenuAnchor}
            open={Boolean(themeMenuAnchor)}
            onClose={() => setThemeMenuAnchor(null)}
            slotProps={{ paper: { sx: { minWidth: 160 } } }}
          >
            {THEME_MODE_OPTIONS.map((option) => (
              <MenuItem
                key={option.mode}
                selected={themeMode === option.mode}
                onClick={() => {
                  setThemeMode(option.mode);
                  setThemeMenuAnchor(null);
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Right-aligned controls */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Balance first: it is the number that decides whether the next
                generation runs, so it reads before the tools that spend it. */}
            <HeaderCredits />
            <SavedConversationsMenu />
            <Tooltip title={chatDrawerOpen ? 'Close AI chat' : 'Open AI chat'}>
              <IconButton
                aria-label={chatDrawerOpen ? 'Close AI chat drawer' : 'Open AI chat drawer'}
                aria-pressed={chatDrawerOpen}
                onClick={() => dispatch(toggleChatDrawer())}
                sx={{ color: chatDrawerOpen ? 'primary.main' : 'text.secondary', mr: 0.5 }}
              >
                <ChatIcon />
              </IconButton>
            </Tooltip>
            
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{ paper: { sx: { width: DRAWER_WIDTH, maxWidth: '80vw' } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: { xs: 2, md: 2.5 }, pb: { xs: 1.5, md: 2 } }}>
          <Avatar
            src={avatarUrl}
            sx={{ width: 36, height: 36, bgcolor: 'rgba(235, 61, 40, 0.15)', color: 'primary.main' }}
          >
            {user?.name?.[0] ?? 'R'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name ?? 'Guest'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email ?? `Tier: ${tier}`}
            </Typography>
          </Box>
          {/*
            A sibling of the name/email column, not an overlay on top of it.
            Absolutely positioning it inside that column put the button over the
            display name, so a long name rendered underneath the icon.

            Hidden for signed-out visitors: Settings is Google-tier, and an
            entry point that only ever opens a sign-in prompt is noise next to
            the "Sign in with Google" button already at the foot of the drawer.
          */}
          {tier !== 'public' && (
            <Tooltip title="Settings">
              <IconButton
                aria-label="Open settings"
                onClick={() => dispatch(openSettingsDialog({ section: 'general' }))}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              >
                <SettingsOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            placeholder="Search pages..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'action.hover',
              },
            }}
          />
        </Box>
        <List sx={{ flex: 1, py: 1 }}>
          {renderNavItems(filteredNavItems, pathname, closeDrawer, isActive, linkSx, 0)}
        </List>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, pb: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}>
          {tier === 'public' ? (
            <Button
              component="a"
              href={`/api/auth?action=google&redirect=${encodeURIComponent(pathname || '/')}`}
              variant="outlined"
              size="small"
              fullWidth
            >
              Sign in with Google
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              fullWidth
              onClick={() => {
                window.location.href = '/api/auth?action=logout';
              }}
            >
              Sign out
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/terms-of-service" style={linkSx} onClick={closeDrawer}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Terms
            </Typography>
          </Link>
          <Link href="/privacy-policy" style={linkSx} onClick={closeDrawer}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Privacy
            </Typography>
          </Link>
          </Box>
        </Box>
      </Drawer>

        {/* Main content — shrinks when the chat drawer opens (push, never overlay) */}
        <Box
          component="div"
          sx={{
            flex: 1,
            minWidth: 0,
            // On /ops-chat the page already renders the chat — hide it while the
            // drawer is open so the conversation is not duplicated.
            display: chatDrawerOpen && pathname === '/ops-chat' ? 'none' : 'block',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Right-side AI chat drawer — always exactly the window height
          (sticky, spans header + content) and persistent: its width push
          shrinks the main column instead of overlaying. Mounted always so the
          conversation + draft input survive open/close. kgk  */}
      <Box
        component="aside"
        aria-label="AI chat drawer"
        sx={{
          width: chatDrawerOpen ? CHAT_DRAWER_WIDTH : 0,
          flexShrink: 0,
          height: '100dvh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          visibility: chatDrawerOpen ? 'visible' : 'hidden',
          transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            flexShrink: 0,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}>
            AI Chat
          </Typography>
          <Tooltip title="Close AI chat">
            <IconButton
              size="small"
              aria-label="Close AI chat drawer"
              onClick={() => dispatch(setChatDrawerOpen(false))}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ChatDrawerPanel variant="drawer" />
        </Box>
      </Box>

      {/* Settings, over the current page. Mounted at the shell so the drawer's
          cog and the header's billing controls all reach the same instance;
          the Modal renders null while closed, so nothing inside it fetches
          until someone opens it. */}
      <SettingsDialog />
    </Box>
  );
}
