'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ConstructionIcon from '@mui/icons-material/Construction';
import { CHAT_COMPOSER_TOOLS, type ChatComposerTool, type ChatComposerToolDef } from '@/lib/chat/session-tools';

export interface ComposerToolPickerProps {
  /**
   * Tools offered on this surface — already filtered by the caller, which knows
   * the route and the viewer's role (see availableComposerTools).
   */
  tools: ChatComposerToolDef[];
  activeTool: ChatComposerTool | null;
  onChange: (tool: ChatComposerTool | null) => void;
  iconButtonSx?: object;
}

/**
 * Tool selector for the chat composer.
 *
 * Picking a tool sets `activeTool` on the next chat request, which attaches the
 * matching function tool server-side. Without it the assistant only gets tools
 * when the message text happens to match a phrasing heuristic — fine for "start
 * a new chat", useless for "build me a template", where the admin's intent is
 * the selection itself rather than any particular wording.
 *
 * Selection is sticky until cleared, because building a template usually takes
 * several turns (supply a URL, review, adjust) and re-picking each turn would
 * be tedious.
 */
export function ComposerToolPicker({ tools, activeTool, onChange, iconButtonSx }: ComposerToolPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const active = tools.find((t) => t.id === activeTool) ?? null;

  const close = () => setAnchorEl(null);

  // Nothing to pick from — on a tenant surface every tool is admin-only, so
  // the button would open an empty menu.
  if (tools.length === 0) return null;

  return (
    <>
      <Tooltip title={active ? `Tool: ${active.label}` : 'Use a tool'}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Select a chat tool"
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          color={active ? 'primary' : 'default'}
          sx={iconButtonSx}
        >
          <ConstructionIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem
          selected={!activeTool}
          onClick={() => {
            onChange(null);
            close();
          }}
        >
          <ListItemText primary="No tool" secondary="Normal chat" />
        </MenuItem>

        {tools.map((tool) => (
          <MenuItem
            key={tool.id}
            selected={tool.id === activeTool}
            onClick={() => {
              onChange(tool.id);
              close();
            }}
            sx={{ maxWidth: 340 }}
          >
            <ListItemText
              primary={tool.label}
              secondary={tool.description}
              slotProps={{ secondary: { sx: { whiteSpace: 'normal' } } }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/** Inline badge shown above the composer while a tool is armed. */
export function ActiveToolBadge({
  activeTool,
  onClear,
}: {
  activeTool: ChatComposerTool | null;
  onClear: () => void;
}) {
  const active = CHAT_COMPOSER_TOOLS.find((t) => t.id === activeTool);
  if (!active) return null;

  return (
    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Chip
        icon={<ConstructionIcon />}
        label={active.label}
        size="small"
        color="primary"
        onDelete={onClear}
      />
      <Typography variant="caption" color="text.secondary">
        {active.description}
      </Typography>
    </Box>
  );
}
