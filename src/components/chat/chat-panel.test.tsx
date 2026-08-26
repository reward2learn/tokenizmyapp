import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ChatPanel } from '@/components/chat/chat-panel';
import { chatStreamSlice } from '@/store/chat-stream-slice';
import { chatListenerMiddleware } from '@/store/chat-listener-middleware';
import { chatApi } from '@/store/apis/chat-api';
import { sheetViewerSlice } from '@/store/sheet-viewer-slice';
import { authSlice } from '@/store/auth-slice';
import { uiSlice } from '@/store/ui-slice';
import { templateApi } from '@/store/apis/template-api';

const searchParamsRef: { current: URLSearchParams } = { current: new URLSearchParams('') };

vi.mock('next/navigation', () => ({
  usePathname: () => '/ops-chat',
  useSearchParams: () => searchParamsRef.current,
}));

vi.mock('@/components/ops-admin/stripe-topup-dialog', () => ({
  StripeTopUpDialog: () => null,
}));

vi.mock('@/components/billing/use-billing-org', () => ({
  useBillingOrgId: () => null,
  useSelfServeBillingEnabled: () => false,
}));

function renderPanel(search: string) {
  searchParamsRef.current = new URLSearchParams(search);
  const store = configureStore({
    reducer: {
      chatStream: chatStreamSlice.reducer,
      sheetViewer: sheetViewerSlice.reducer,
      // The composer reads auth.platformAdmin to decide which tools to offer,
      // and the template draft card issues a templateApi mutation.
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
      [chatApi.reducerPath]: chatApi.reducer,
      [templateApi.reducerPath]: templateApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(chatApi.middleware, templateApi.middleware, chatListenerMiddleware),
  });
  return render(
    <Provider store={store}>
      <ChatPanel />
    </Provider>,
  );
}

describe('ChatPanel Ask-AI prefill', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('UC-ASKAI-01: prefills the input from ?prompt=', async () => {
    renderPanel('prompt=' + encodeURIComponent('Explain the exit-viability task'));
    const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
    await waitFor(() => expect(input.value).toBe('Explain the exit-viability task'));
  });

  it('UC-ASKAI-01: leaves input empty when no prompt param', async () => {
    renderPanel('');
    const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
    await waitFor(() => expect(input.value).toBe(''));
  });
});
