'use client';

import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
  const primaryValid = isValidHex(primaryColor);
  const secondaryValid = isValidHex(secondaryColor);

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
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: primaryValid ? primaryColor : '#eb3d28',
                  border: '3px solid',
                  borderColor: 'background.paper',
                  boxShadow: 2,
                }}
              />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {primaryColor}
              </Typography>
            </Stack>
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption">Secondary</Typography>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: secondaryValid ? secondaryColor : '#0af9fe',
                  border: '3px solid',
                  borderColor: 'background.paper',
                  boxShadow: 2,
                }}
              />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {secondaryColor}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      ) : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Primary Color"
            placeholder="#eb3d28"
            value={primaryColor}
            onChange={(e) => onPrimaryChange(e.target.value)}
            fullWidth
            size="small"
            error={primaryColor.length > 0 && !primaryValid}
            helperText={
              primaryColor.length > 0 && !primaryValid
                ? 'Invalid hex color'
                : 'Used for buttons, links, and highlights'
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 0.5,
                        bgcolor: primaryValid ? primaryColor : '#eb3d28',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
          <input
            type="color"
            value={primaryValid ? primaryColor : '#eb3d28'}
            onChange={(e) => onPrimaryChange(e.target.value)}
            style={{
              width: '100%',
              height: 32,
              marginTop: 4,
              padding: 0,
              border: '1px solid var(--mui-palette-divider, #ccc)',
              borderRadius: 6,
              background: 'none',
              cursor: 'pointer',
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <TextField
            label="Secondary Color"
            placeholder="#0af9fe"
            value={secondaryColor}
            onChange={(e) => onSecondaryChange(e.target.value)}
            fullWidth
            size="small"
            error={secondaryColor.length > 0 && !secondaryValid}
            helperText={
              secondaryColor.length > 0 && !secondaryValid
                ? 'Invalid hex color'
                : 'Used for accents and secondary elements'
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 0.5,
                        bgcolor: secondaryValid ? secondaryColor : '#0af9fe',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
          <input
            type="color"
            value={secondaryValid ? secondaryColor : '#0af9fe'}
            onChange={(e) => onSecondaryChange(e.target.value)}
            style={{
              width: '100%',
              height: 32,
              marginTop: 4,
              padding: 0,
              border: '1px solid var(--mui-palette-divider, #ccc)',
              borderRadius: 6,
              background: 'none',
              cursor: 'pointer',
            }}
          />
        </Box>
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
