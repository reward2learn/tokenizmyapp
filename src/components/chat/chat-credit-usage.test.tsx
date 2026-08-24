import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ChatCreditUsage } from '@/components/chat/chat-credit-usage';
import { chatStreamSlice, recordTurnUsage } from '@/store/chat-stream-slice';

function renderUsage(preloaded?: Parameters<typeof chatStreamSlice.reducer>[0]) {
  const store = configureStore({
    reducer: { chatStream: chatStreamSlice.reducer },
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

  it('shows compact chip and expands popover with metrics', () => {
    let state = chatStreamSlice.reducer(undefined, recordTurnUsage({
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
    expect(screen.getByText(/~2 credits used this conversation/)).toBeInTheDocument();
    expect(screen.getByText('Prompt tokens')).toBeInTheDocument();
    expect(screen.getByText('Remaining balance')).toBeInTheDocument();

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

  it('shows BYOK label when last turn was not charged', () => {
    const state = chatStreamSlice.reducer(undefined, recordTurnUsage({
      promptTokens: 10,
      completionTokens: 5,
      credits: 0,
      consumed: 0,
      charged: false,
      balance: null,
      byok: true,
    }));
    renderUsage(state);
    expect(screen.getByLabelText('Chat credit usage')).toHaveTextContent('Not billed (BYOK)');
  });
});
