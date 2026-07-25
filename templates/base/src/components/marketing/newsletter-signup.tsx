'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

interface NewsletterSignupProps {
  onSubscribe?: (email: string) => Promise<void>;
}

export function NewsletterSignup({ onSubscribe }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await fetch('/api/marketing/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter' }),
      });
      setSubmitted(true);
      onSubscribe?.(email);
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    }
  };

  if (submitted) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="h6" color="success.main">Subscribed!</Typography>
        <Typography variant="body2">Thank you for subscribing to our newsletter.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Newsletter</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack direction="row" sx={{ gap: 2 }}>
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" variant="contained">Subscribe</Button>
        </Stack>
      </Box>
    </Box>
  );
}
