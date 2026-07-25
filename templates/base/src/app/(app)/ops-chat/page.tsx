'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { ChatPanel } from '@/components/chat/chat-panel';

export default function OpsChatPage() {
  return (
    <AuthGate requiredTier="pin" fallback={<SignInPanelGate requiredTier="pin" />}>
      <Container maxWidth="md" sx={{ py: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <ChatPanel />
        </Box>
      </Container>
    </AuthGate>
  );
}
