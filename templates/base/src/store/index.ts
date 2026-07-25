import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/store/auth-slice';
import { uiSlice } from '@/store/ui-slice';
import { chatStreamSlice } from '@/store/chat-stream-slice';
import { authApi } from '@/store/apis/auth-api';
import { contentApi } from '@/store/apis/content-api';
import { chatApi } from '@/store/apis/chat-api';
import { configApi } from '@/store/apis/config-api';
import { tasksApi } from '@/store/apis/tasks-api';
import { adminApi } from '@/store/apis/admin-api';
import { brandConfigApi } from '@shared/store/apis/brand-config-api';
import { navigationApi } from '@/store/apis/navigation-api';
import { tenantApi } from '@/store/apis/tenant-api';

const apiMiddleware = [
  authApi.middleware,
  contentApi.middleware,
  chatApi.middleware,
  configApi.middleware,
  tasksApi.middleware,
  adminApi.middleware,
  brandConfigApi.middleware,
  navigationApi.middleware,
  tenantApi.middleware,
] as const;

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
      chatStream: chatStreamSlice.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [contentApi.reducerPath]: contentApi.reducer,
      [chatApi.reducerPath]: chatApi.reducer,
      [configApi.reducerPath]: configApi.reducer,
      [tasksApi.reducerPath]: tasksApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [brandConfigApi.reducerPath]: brandConfigApi.reducer,
      [navigationApi.reducerPath]: navigationApi.reducer,
      [tenantApi.reducerPath]: tenantApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...apiMiddleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
