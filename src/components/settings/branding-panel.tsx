'use client';

import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

interface BrandingPanelProps {
  orgId: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
  customCss?: string;
  onUpdate: (data: {
    logoUrl?: string;
    backgroundImageUrl?: string;
    backgroundVideoUrl?: string;
    customCss?: string;
  }) => Promise<void>;
}

/**
 * Organization branding — customize the tenant app's appearance.
 *
 * Allows uploading logo, background image/video, and custom CSS.
 */
export function BrandingPanel({
  orgId,
  logoUrl,
  backgroundImageUrl,
  backgroundVideoUrl,
  customCss,
  onUpdate,
}: BrandingPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoInput, setLogoInput] = useState('');
  const [bgImageInput, setBgImageInput] = useState('');
  const [bgVideoInput, setBgVideoInput] = useState('');
  const [cssContent, setCssContent] = useState(customCss || '');

  const handleLogoUpload = useCallback(async () => {
    if (!logoInput.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await onUpdate({ logoUrl: logoInput.trim() });
      setLogoInput('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [logoInput, onUpdate]);

  const handleBgImageUpload = useCallback(async () => {
    if (!bgImageInput.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await onUpdate({ backgroundImageUrl: bgImageInput.trim() });
      setBgImageInput('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [bgImageInput, onUpdate]);

  const handleBgVideoUpload = useCallback(async () => {
    if (!bgVideoInput.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await onUpdate({ backgroundVideoUrl: bgVideoInput.trim() });
      setBgVideoInput('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [bgVideoInput, onUpdate]);

  const handleCssSave = useCallback(async () => {
    setUploading(true);
    setError(null);
    try {
      await onUpdate({ customCss: cssContent });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [cssContent, onUpdate]);

  const handleCssDownload = useCallback(() => {
    if (!customCss) return;
    const blob = new Blob([customCss], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orgId}-style.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [customCss, orgId]);

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Typography variant="h6">Branding</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Logo */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Logo
        </Typography>
        {logoUrl && (
          <Box
            component="img"
            src={logoUrl}
            alt="Logo"
            sx={{ maxWidth: 200, maxHeight: 100, mb: 1, border: '1px solid', borderColor: 'divider', p: 1 }}
          />
        )}
        <TextField
          size="small"
          fullWidth
          placeholder="https://example.com/logo.png or data:image/png;base64,..."
          value={logoInput}
          onChange={(e) => setLogoInput(e.target.value)}
          disabled={uploading}
          slotProps={{
            input: {
              endAdornment: logoInput && (
                <Button size="small" onClick={handleLogoUpload} disabled={uploading}>
                  {uploading ? <CircularProgress size={20} /> : 'Upload'}
                </Button>
              ),
            },
          }}
        />
      </Box>

      <Divider />

      {/* Background Image */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Background Image
        </Typography>
        {backgroundImageUrl && (
          <Box
            component="img"
            src={backgroundImageUrl}
            alt="Background"
            sx={{ maxWidth: '100%', maxHeight: 150, mb: 1, border: '1px solid', borderColor: 'divider' }}
          />
        )}
        <TextField
          size="small"
          fullWidth
          placeholder="https://example.com/bg.jpg"
          value={bgImageInput}
          onChange={(e) => setBgImageInput(e.target.value)}
          disabled={uploading}
          slotProps={{
            input: {
              endAdornment: bgImageInput && (
                <Button size="small" onClick={handleBgImageUpload} disabled={uploading}>
                  {uploading ? <CircularProgress size={20} /> : 'Upload'}
                </Button>
              ),
            },
          }}
        />
      </Box>

      <Divider />

      {/* Background Video */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Background Video
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Autoplay, muted video URL. Example: https://example.com/bg.mp4
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="https://example.com/bg.mp4"
          value={bgVideoInput}
          onChange={(e) => setBgVideoInput(e.target.value)}
          disabled={uploading}
          slotProps={{
            input: {
              endAdornment: bgVideoInput && (
                <Button size="small" onClick={handleBgVideoUpload} disabled={uploading}>
                  {uploading ? <CircularProgress size={20} /> : 'Upload'}
                </Button>
              ),
            },
          }}
        />
      </Box>

      <Divider />

      {/* Custom CSS */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Custom CSS
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={8}
          placeholder="/* Your custom CSS here */"
          value={cssContent}
          onChange={(e) => setCssContent(e.target.value)}
          disabled={uploading}
          sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            onClick={handleCssSave}
            disabled={uploading}
          >
            Save CSS
          </Button>
          {customCss && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleCssDownload}
              disabled={uploading}
            >
              Download CSS
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
