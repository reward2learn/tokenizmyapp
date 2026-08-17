import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/store/auth-slice';
import { uiSlice } from '@/store/ui-slice';
import { chatStreamSlice } from '@/store/chat-stream-slice';
import { walletSlice } from '@/store/wallet-slice';
import { sheetViewerSlice, sheetViewerListenerMiddleware } from '@/store/sheet-viewer-slice';
import { undoRedoSlice, undoRedoListenerMiddleware } from '@/store/undo-redo-slice';
import { authApi } from '@/store/apis/auth-api';
import { financialApi } from '@/store/apis/financial-api';
import { metricsApi } from '@/store/apis/metrics-api';
import { monthlyActualsApi } from '@/store/apis/monthly-actuals-api';
import { contentApi } from '@/store/apis/content-api';
import { chatApi } from '@/store/apis/chat-api';
import { pdfApi } from '@/store/apis/pdf-api';
import { posApi } from '@/store/apis/pos-api';
import { configApi } from '@/store/apis/config-api';
import { tasksApi } from '@/store/apis/tasks-api';
import { adminApi } from '@/store/apis/admin-api';
import { dashboardApi } from '@/store/apis/dashboard-api';
import { sheetDataApi } from '@/store/apis/sheet-data-api';
import { brandConfigApi } from '@shared/store/apis/brand-config-api';
import { navigationApi } from '@/store/apis/navigation-api';
import { tenantApi } from '@/store/apis/tenant-api';

const apiMiddleware = [
  authApi.middleware,
  financialApi.middleware,
  metricsApi.middleware,
  monthlyActualsApi.middleware,
  contentApi.middleware,
  chatApi.middleware,
  pdfApi.middleware,
  posApi.middleware,
  configApi.middleware,
  tasksApi.middleware,
  adminApi.middleware,
  dashboardApi.middleware,
  sheetDataApi.middleware,
  brandConfigApi.middleware,
  navigationApi.middleware,
  tenantApi.middleware,
  sheetViewerListenerMiddleware,
  undoRedoListenerMiddleware,
] as const;

export function makeStore() {
  const store = configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
      chatStream: chatStreamSlice.reducer,
      wallet: walletSlice.reducer,
      sheetViewer: sheetViewerSlice.reducer,
      undoRedo: undoRedoSlice.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [financialApi.reducerPath]: financialApi.reducer,
      [metricsApi.reducerPath]: metricsApi.reducer,
      [monthlyActualsApi.reducerPath]: monthlyActualsApi.reducer,
      [contentApi.reducerPath]: contentApi.reducer,
      [chatApi.reducerPath]: chatApi.reducer,
      [pdfApi.reducerPath]: pdfApi.reducer,
      [posApi.reducerPath]: posApi.reducer,
      [configApi.reducerPath]: configApi.reducer,
      [tasksApi.reducerPath]: tasksApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [dashboardApi.reducerPath]: dashboardApi.reducer,
      [sheetDataApi.reducerPath]: sheetDataApi.reducer,
      [brandConfigApi.reducerPath]: brandConfigApi.reducer,
      [navigationApi.reducerPath]: navigationApi.reducer,
      [tenantApi.reducerPath]: tenantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...apiMiddleware),
  });

  // Wallet state is pushed in from Reown AppKit rather than fetched, so the
  // subscription is set up with the store instead of inside a component. It
  // no-ops on the server and whenever the wallet capability is switched off.
  // Imported lazily so @reown/appkit stays out of the bundle for the majority
  // of apps that never enable a wallet.
  if (typeof window !== 'undefined') {
    void import('@/store/wallet-watcher').then(({ attachWalletWatcher }) =>
      attachWalletWatcher(store),
    );
  }

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
