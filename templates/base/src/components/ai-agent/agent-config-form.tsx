'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface AgentConfigFormProps {
  config?: { model?: string; temperature?: number; maxTokens?: number; tools?: string[]; systemPrompt?: string };
  onSave?: (config: Record<string, unknown>) => void;
}

export function AgentConfigForm({ config, onSave }: AgentConfigFormProps) {
  const [form, setForm] = useState({
    model: config?.model ?? 'gpt-4',
    temperature: config?.temperature ?? 0.7,
    maxTokens: config?.maxTokens ?? 2000,
    systemPrompt: config?.systemPrompt ?? '',
    tools: { search: true, code: false, email: false } as Record<string, boolean>,
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Agent Configuration</Typography>
      <Box>
        <TextField select label="Model" fullWidth value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} sx={{ mb: 2 }}>
          <MenuItem value="gpt-4">GPT-4</MenuItem>
          <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
          <MenuItem value="claude-3">Claude 3</MenuItem>
        </TextField>
        <Typography gutterBottom>Temperature: {form.temperature}</Typography>
        <Slider value={form.temperature} onChange={(_, v) => setForm((p) => ({ ...p, temperature: v as number }))} min={0} max={2} step={0.1} sx={{ mb: 2 }} />
        <TextField label="Max Tokens" type="number" fullWidth value={form.maxTokens} onChange={(e) => setForm((p) => ({ ...p, maxTokens: parseInt(e.target.value) || 2000 }))} sx={{ mb: 2 }} />
        <Typography gutterBottom>Tool Access</Typography>
        <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
          <FormControlLabel control={<Checkbox checked={form.tools.search} onChange={(e) => setForm((p) => ({ ...p, tools: { ...p.tools, search: e.target.checked } }))} />} label="Search" />
          <FormControlLabel control={<Checkbox checked={form.tools.code} onChange={(e) => setForm((p) => ({ ...p, tools: { ...p.tools, code: e.target.checked } }))} />} label="Code" />
          <FormControlLabel control={<Checkbox checked={form.tools.email} onChange={(e) => setForm((p) => ({ ...p, tools: { ...p.tools, email: e.target.checked } }))} />} label="Email" />
        </Stack>
        <TextField label="System Prompt" fullWidth multiline rows={4} value={form.systemPrompt} onChange={(e) => setForm((p) => ({ ...p, systemPrompt: e.target.value }))} sx={{ mb: 2 }} />
        <Button variant="contained" onClick={() => onSave?.(form)}>Save Config</Button>
      </Box>
    </Paper>
  );
}
