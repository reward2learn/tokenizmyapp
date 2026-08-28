import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ChatCreditUsage } from '@/components/chat/chat-credit-usage';
import { chatStreamSlice, recordTurnUsage } from '@/store/chat-stream-slice';
import { chatUiSlice } from '@/store/chat-ui-slice';

function renderUsage(preloaded?: Parameters<typeof chatStreamSlice.reducer>[0]) {
  const store = configureStore({
    reducer: {
      chatStream: chatStreamSlice.reducer,
      chatUi: chatUiSlice.reducer,
    },
    preloadedState: preloaded ? { chatStream: preloaded } : undefined,
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <ChatCreditUsage />
      </Provider>,
    ),
  };
}

describe('ChatCreditUsage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders nothing when there is no usage yet', () => {
    const { container } = renderUsage();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows compact chip and opens usage modal with metrics', async () => {
    const state = chatStreamSlice.reducer(undefined, recordTurnUsage({
      promptTokens: 1000,
      completionTokens: 500,
      credits: 2,
      consumed: 2,
      charged: true,
      balance: 48,
      model: 'gpt-4o-mini',
    }));
    const { store } = renderUsage(state);
    expect(screen.getByLabelText('Chat credit usage')).toHaveTextContent('2 credits this chat');

    fireEvent.click(screen.getByLabelText('Chat credit usage'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/~2 credits used this conversation/)).toBeInTheDocument();
    expect(screen.getByText('Prompt tokens')).toBeInTheDocument();
    expect(screen.getByText('Remaining balance')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Second turn updates totals when we re-render via store
    store.dispatch(recordTurnUsage({
      promptTokens: 100,
      completionTokens: 50,
      credits: 1,
      consumed: 1,
      charged: true,
      balance: 47,
    }));
  });

  it('shows Metering incomplete when last turn had tokens but no balance', () => {
    const state = chatStreamSlice.reducer(undefined, recordTurnUsage({
      promptTokens: 9153,
      completionTokens: 523,
      credits: 5,
      consumed: 0,
      charged: false,
      balance: null,
      model: 'gpt-4.1',
    }));
    renderUsage(state);
    expect(screen.getByLabelText('Chat credit usage')).toHaveTextContent('Metering incomplete');
  });

  it('shows Not billed when last turn was uncharged (metering skipped)', () => {
    const state = chatStreamSlice.reducer(undefined, recordTurnUsage({
      promptTokens: 10,
      completionTokens: 5,
      credits: 1,
      consumed: 0,
      charged: false,
      balance: 100,
    }));
    renderUsage(state);
    expect(screen.getByLabelText('Chat credit usage')).toHaveTextContent('Not billed');
  });

  it('does not show rate-card credits as charged when turn was uncharged', () => {
    let state = chatStreamSlice.reducer(undefined, recordTurnUsage({
      promptTokens: 1000,
      completionTokens: 500,
      credits: 4,
      consumed: 0,
      charged: false,
      balance: 28741,
    }));
    state = chatStreamSlice.reducer(state, recordTurnUsage({
      promptTokens: 800,
      completionTokens: 400,
      credits: 3,
      consumed: 0,
      charged: false,
      balance: 28734,
    }));
    renderUsage(state);
    fireEvent.click(screen.getByLabelText('Chat credit usage'));
    expect(screen.getByText('Credits charged')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('Not billed');
    expect(screen.getByRole('dialog')).not.toHaveTextContent('Credits charged7');
    expect(screen.getByText('Turns')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('28734');
  });

  it('shows credits consumed even when byok flag is set', () => {
    const state = chatStreamSlice.reducer(undefined, recordTurnUsage({
      promptTokens: 100,
      completionTokens: 50,
      credits: 2,
      consumed: 2,
      charged: true,
      balance: 48,
      byok: true,
    }));
    renderUsage(state);
    expect(screen.getByLabelText('Chat credit usage')).toHaveTextContent('2 credits this chat');
  });

  it('scopes the dialog to the chat container at full width', () => {
    const state = chatStreamSlice.reducer(undefined, recordTurnUsage({
      promptTokens: 1000,
      completionTokens: 500,
      credits: 2,
      consumed: 2,
      charged: true,
      balance: 48,
    }));
    const chatRoot = document.createElement('div');
    chatRoot.style.position = 'relative';
    chatRoot.style.width = '640px';
    chatRoot.style.height = '480px';
    document.body.appendChild(chatRoot);

    const store = configureStore({
      reducer: {
        chatStream: chatStreamSlice.reducer,
        chatUi: chatUiSlice.reducer,
      },
      preloadedState: { chatStream: state },
    });
    render(
      <Provider store={store}>
        <ChatCreditUsage containerEl={chatRoot} />
      </Provider>,
    );

    fireEvent.click(screen.getByLabelText('Chat credit usage'));
    const dialog = screen.getByRole('dialog');
    expect(chatRoot.contains(dialog)).toBe(true);
    // Paper must resolve against a full-size absolute container, not content width.
    expect(dialog).toHaveStyle({ width: '100%', maxWidth: '100%' });

    cleanup();
    chatRoot.remove();
  });
});
