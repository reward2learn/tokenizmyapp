'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export function AgentRunner() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  const handleRun = async () => {
    setRunning(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/ai-agent/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agentId: 'default', input }) });
      const data = await res.json();
      setOutput(data.output ?? 'No output');
      setDuration(Date.now() - start);
    } catch (err) {
      setOutput(`Error: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Run Agent</Typography>
      <TextField label="Input" fullWidth multiline rows={4} value={input} onChange={(e) => setInput(e.target.value)} sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleRun} disabled={running || !input}>{running ? 'Running...' : 'Execute'}</Button>
      {output && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Output:</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}><Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>{output}</Typography></Paper>
          {duration !== null && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Duration: {duration}ms</Typography>}
        </Box>
      )}
    </Paper>
  );
}
