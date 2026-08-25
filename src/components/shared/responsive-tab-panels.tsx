'use client';

/**
 * ResponsiveTabPanels — desktop Tabs, mobile Accordion.
 *
 * Below `breakpoint` (default `md`), each tab becomes an accordion section with
 * single top-level expansion matching tab exclusivity. Nested `children` render
 * as inner accordions (mobile) or nested Tabs (desktop). Optional `content` on a
 * parent with children is shown as a preamble above the nested panels.
 */

import { useCallback, useState, type ReactNode } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';

export type ResponsiveTabItem = {
  id: string;
  label: ReactNode;
  /** Panel body when this item has no children, or preamble when it does. */
  content?: ReactNode;
  /** Optional nested subtabs — rendered as nested Tabs / Accordions. */
  children?: ResponsiveTabItem[];
  disabled?: boolean;
};

export type ResponsiveTabPanelsProps = {
  items: ResponsiveTabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Below this breakpoint use accordion. Default `md`. */
  breakpoint?: 'sm' | 'md';
  /**
   * Controlled nested selection keyed by parent id.
   * When omitted, nested panels keep local state (default: first child).
   */
  nestedValues?: Record<string, string>;
  onNestedChange?: (parentId: string, childId: string) => void;
  ariaLabel?: string;
  tabsSx?: SxProps<Theme>;
  panelSx?: SxProps<Theme>;
  /** When true (default), desktop tabs get a bottom divider. */
  showDivider?: boolean;
};

function labelNode(label: ReactNode): ReactNode {
  if (typeof label === 'string' || typeof label === 'number') {
    return (
      <Typography component="span" variant="subtitle2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    );
  }
  return label;
}

function resolveNestedValue(
  parent: ResponsiveTabItem,
  nestedValues: Record<string, string> | undefined,
): string | null {
  const kids = parent.children;
  if (!kids || kids.length === 0) return null;
  const selected = nestedValues?.[parent.id];
  if (selected && kids.some((c) => c.id === selected)) return selected;
  return kids[0].id;
}

function useNestedSelection(
  nestedValues: Record<string, string> | undefined,
  onNestedChange: ((parentId: string, childId: string) => void) | undefined,
): [Record<string, string>, (parentId: string, childId: string) => void] {
  const [local, setLocal] = useState<Record<string, string>>({});
  const merged = { ...local, ...nestedValues };

  const setNested = useCallback(
    (parentId: string, childId: string) => {
      if (onNestedChange) {
        onNestedChange(parentId, childId);
      }
      // Keep local fallback so uncontrolled (or partially controlled) parents still update.
      if (!nestedValues || nestedValues[parentId] === undefined) {
        setLocal((prev) => ({ ...prev, [parentId]: childId }));
      }
    },
    [nestedValues, onNestedChange],
  );

  return [merged, setNested];
}

function NestedDesktopTabs({
  parent,
  nestedValue,
  onNestedChange,
  panelSx,
}: {
  parent: ResponsiveTabItem;
  nestedValue: string;
  onNestedChange: (childId: string) => void;
  panelSx?: SxProps<Theme>;
}) {
  const kids = parent.children ?? [];
  const active = kids.find((c) => c.id === nestedValue) ?? kids[0];

  return (
    <Box>
      <Tabs
        value={nestedValue}
        onChange={(_, next: string) => onNestedChange(next)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label={`${typeof parent.label === 'string' ? parent.label : parent.id} subtabs`}
        sx={{ mb: 2, minHeight: 36, borderBottom: 1, borderColor: 'divider' }}
      >
        {kids.map((child) => (
          <Tab
            key={child.id}
            value={child.id}
            label={child.label}
            disabled={child.disabled}
            sx={{ minHeight: 36 }}
          />
        ))}
      </Tabs>
      {active ? <Box sx={panelSx}>{active.content}</Box> : null}
    </Box>
  );
}

function NestedMobileAccordions({
  parent,
  nestedValue,
  onNestedChange,
  panelSx,
}: {
  parent: ResponsiveTabItem;
  nestedValue: string;
  onNestedChange: (childId: string) => void;
  panelSx?: SxProps<Theme>;
}) {
  const kids = parent.children ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {kids.map((child) => {
        const expanded = child.id === nestedValue;
        return (
          <Accordion
            key={child.id}
            expanded={expanded}
            disabled={child.disabled}
            onChange={(_, isExpanded) => {
              if (isExpanded) onNestedChange(child.id);
            }}
            disableGutters
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&:before': { display: 'none' },
              bgcolor: 'action.hover',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`nested-tab-panel-${parent.id}-${child.id}`}
              id={`nested-tab-summary-${parent.id}-${child.id}`}
            >
              {labelNode(child.label)}
            </AccordionSummary>
            <AccordionDetails
              id={`nested-tab-panel-${parent.id}-${child.id}`}
              role="region"
              aria-labelledby={`nested-tab-summary-${parent.id}-${child.id}`}
              sx={{ pt: 0, ...((panelSx as object) ?? {}) }}
            >
              {expanded ? child.content : null}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

type PanelsViewProps = {
  items: ResponsiveTabItem[];
  value: string;
  onChange: (id: string) => void;
  nestedMap: Record<string, string>;
  setNested: (parentId: string, childId: string) => void;
  ariaLabel?: string;
  tabsSx?: SxProps<Theme>;
  panelSx?: SxProps<Theme>;
  showDivider?: boolean;
};

function DesktopTabs({
  items,
  value,
  onChange,
  nestedMap,
  setNested,
  ariaLabel,
  tabsSx,
  panelSx,
  showDivider,
}: PanelsViewProps) {
  const active = items.find((item) => item.id === value) ?? items[0];
  const nestedValue = active ? resolveNestedValue(active, nestedMap) : null;

  return (
    <Box>
      <Tabs
        value={value}
        onChange={(_, next: string) => onChange(next)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label={ariaLabel}
        sx={{
          ...(showDivider !== false
            ? { borderBottom: 1, borderColor: 'divider', px: 1 }
            : { px: 1 }),
          ...((tabsSx as object) ?? {}),
        }}
      >
        {items.map((item) => (
          <Tab key={item.id} value={item.id} label={item.label} disabled={item.disabled} />
        ))}
      </Tabs>
      <Box sx={{ p: { xs: 2, md: 3 }, ...((panelSx as object) ?? {}) }}>
        {active?.content ? <Box sx={{ mb: active.children ? 2 : 0 }}>{active.content}</Box> : null}
        {active?.children && nestedValue ? (
          <NestedDesktopTabs
            parent={active}
            nestedValue={nestedValue}
            onNestedChange={(childId) => setNested(active.id, childId)}
            panelSx={panelSx}
          />
        ) : null}
      </Box>
    </Box>
  );
}

function MobileAccordions({
  items,
  value,
  onChange,
  nestedMap,
  setNested,
  ariaLabel,
  panelSx,
}: PanelsViewProps) {
  return (
    <Box
      role="navigation"
      aria-label={ariaLabel}
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      {items.map((item) => {
        const expanded = item.id === value;
        const nestedValue = resolveNestedValue(item, nestedMap);

        return (
          <Accordion
            key={item.id}
            expanded={expanded}
            disabled={item.disabled}
            onChange={(_, isExpanded) => {
              if (isExpanded) onChange(item.id);
            }}
            disableGutters
            elevation={0}
            square
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:before': { display: 'none' },
              bgcolor: 'background.paper',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`responsive-tab-panel-${item.id}`}
              id={`responsive-tab-summary-${item.id}`}
            >
              {labelNode(item.label)}
            </AccordionSummary>
            <AccordionDetails
              id={`responsive-tab-panel-${item.id}`}
              role="region"
              aria-labelledby={`responsive-tab-summary-${item.id}`}
              sx={{ px: 2, pb: 2, pt: 0, ...((panelSx as object) ?? {}) }}
            >
              {expanded ? (
                <>
                  {item.content ? (
                    <Box sx={{ mb: item.children ? 2 : 0 }}>{item.content}</Box>
                  ) : null}
                  {item.children && nestedValue ? (
                    <NestedMobileAccordions
                      parent={item}
                      nestedValue={nestedValue}
                      onNestedChange={(childId) => setNested(item.id, childId)}
                      panelSx={panelSx}
                    />
                  ) : null}
                </>
              ) : null}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

/**
 * Renders horizontal MUI Tabs on desktop and a single-expand Accordion list on
 * mobile. Nested `children` on an item become nested Tabs / Accordions.
 */
export function ResponsiveTabPanels(props: ResponsiveTabPanelsProps) {
  const theme = useTheme();
  const breakpoint = props.breakpoint ?? 'md';
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));
  const [nestedMap, setNested] = useNestedSelection(props.nestedValues, props.onNestedChange);

  if (props.items.length === 0) return null;

  const shared: PanelsViewProps = {
    items: props.items,
    value: props.value,
    onChange: props.onChange,
    nestedMap,
    setNested,
    ariaLabel: props.ariaLabel,
    tabsSx: props.tabsSx,
    panelSx: props.panelSx,
    showDivider: props.showDivider,
  };

  return isMobile ? <MobileAccordions {...shared} /> : <DesktopTabs {...shared} />;
}
