import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ChatUiState {
  /** Measured height of the messages panel — drives credit-usage dialog sizing. */
  messagesPanelHeight: number | null;
  creditUsageOpen: boolean;
}

const initialState: ChatUiState = {
  messagesPanelHeight: null,
  creditUsageOpen: false,
};

export const chatUiSlice = createSlice({
  name: 'chatUi',
  initialState,
  reducers: {
    setMessagesPanelHeight(state, action: PayloadAction<number | null>) {
      state.messagesPanelHeight = action.payload;
    },
    setCreditUsageOpen(state, action: PayloadAction<boolean>) {
      state.creditUsageOpen = action.payload;
    },
  },
});

export const { setMessagesPanelHeight, setCreditUsageOpen } = chatUiSlice.actions;
