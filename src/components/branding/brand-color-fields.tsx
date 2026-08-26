'use client';

import { useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PaletteIcon from '@mui/icons-material/Palette';

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

function isValidHex(c: string): boolean {
  return HEX_REGEX.test(c);
}

export interface BrandColorFieldsProps {
  primaryColor: string;
  secondaryColor: string;
  onPrimaryChange: (value: string) => void;
  onSecondaryChange: (value: string) => void;
  /** Show large swatch row labeled THEME COLORS above the editors. */
  showSwatches?: boolean;
}

interface HexColorInputProps {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
  helperText?: string;
}

/** Hex text field with a clickable swatch + palette button that opens the native color picker. */
function HexColorInput({ label, value, fallback, onChange, helperText }: HexColorInputProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const valid = isValidHex(value);
  const displayColor = valid ? value : fallback;

  const openPicker = () => pickerRef.current?.click();

  return (
    <Box sx={{ flex: 1, position: 'relative' }}>
      <TextField
        label={label}
        placeholder={fallback}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        size="small"
        error={value.length > 0 && !valid}
        helperText={value.length > 0 && !valid ? 'Invalid hex color (e.g. #eb3d28)' : helperText}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title="Open color picker">
                  <IconButton
                    size="small"
                    onClick={openPicker}
                    aria-label={`Pick ${label}`}
                    sx={{ p: 0.25 }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        bgcolor: displayColor,
                        border: '2px solid',
                        borderColor: 'divider',
                        boxShadow: 1,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Open color picker">
                  <IconButton size="small" onClick={openPicker} aria-label={`Pick ${label} with palette`}>
                    <PaletteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
      />
      {/* Native picker — opens the browser color dialog (saturation square + hue slider + RGB). */}
      <input
        ref={pickerRef}
        type="color"
        value={displayColor}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
    </Box>
  );
}

/**
 * Primary / secondary brand color editors — hex field + native color picker + optional swatches.
 */
export function BrandColorFields({
  primaryColor,
  secondaryColor,
  onPrimaryChange,
  onSecondaryChange,
  showSwatches = false,
}: BrandColorFieldsProps) {
  const primaryPickerRef = useRef<HTMLInputElement>(null);
  const secondaryPickerRef = useRef<HTMLInputElement>(null);
  const primaryValid = isValidHex(primaryColor);
  const secondaryValid = isValidHex(secondaryColor);
  const primaryDisplay = primaryValid ? primaryColor : '#eb3d28';
  const secondaryDisplay = secondaryValid ? secondaryColor : '#0af9fe';

  return (
    <Stack spacing={2}>
      {showSwatches ? (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }}>
            THEME COLORS
          </Typography>
          <Stack direction="row" sx={{ gap: 3, mb: 1 }}>
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption">Primary</Typography>
              <Tooltip title="Open color picker">
                <IconButton
                  onClick={() => primaryPickerRef.current?.click()}
                  aria-label="Pick primary color"
                  sx={{ p: 0 }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: primaryDisplay,
                      border: '3px solid',
                      borderColor: 'background.paper',
                      boxShadow: 2,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {primaryColor}
              </Typography>
              <input
                ref={primaryPickerRef}
                type="color"
                value={primaryDisplay}
                onChange={(e) => onPrimaryChange(e.target.value)}
                tabIndex={-1}
                aria-hidden
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />
            </Stack>
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption">Secondary</Typography>
              <Tooltip title="Open color picker">
                <IconButton
                  onClick={() => secondaryPickerRef.current?.click()}
                  aria-label="Pick secondary color"
                  sx={{ p: 0 }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: secondaryDisplay,
                      border: '3px solid',
                      borderColor: 'background.paper',
                      boxShadow: 2,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {secondaryColor}
              </Typography>
              <input
                ref={secondaryPickerRef}
                type="color"
                value={secondaryDisplay}
                onChange={(e) => onSecondaryChange(e.target.value)}
                tabIndex={-1}
                aria-hidden
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />
            </Stack>
          </Stack>
        </Box>
      ) : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <HexColorInput
          label="Primary Color"
          value={primaryColor}
          fallback="#eb3d28"
          onChange={onPrimaryChange}
          helperText="Used for buttons, links, and highlights"
        />
        <HexColorInput
          label="Secondary Color"
          value={secondaryColor}
          fallback="#0af9fe"
          onChange={onSecondaryChange}
          helperText="Used for accents and secondary elements"
        />
      </Stack>
    </Stack>
  );
}

/** Build FormData for brand-config color sync. */
export function brandColorFormData(primaryColor: string, secondaryColor: string): FormData {
  const formData = new FormData();
  formData.append('brandPrimaryColor', primaryColor);
  formData.append('brandSecondaryColor', secondaryColor);
  return formData;
}
