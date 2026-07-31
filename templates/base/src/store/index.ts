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
import { contentPageApi } from '@/store/apis/content-page-api';
import { mediaApi } from '@/store/apis/media-api';
import { notificationApi } from '@/store/apis/notification-api';
import { commerceApi } from '@/store/apis/commerce-api';
import { marketingApi } from '@/store/apis/marketing-api';
import { userApi } from '@/store/apis/user-api';
import { aiAgentApi } from '@/store/apis/ai-agent-api';
import { whatsappApi } from '@/store/apis/whatsapp-api';
import { integrationApi } from '@/store/apis/integration-api';
import { billingApi } from '@/store/apis/billing-api';

const apiMiddleware = [
  authApi.middleware,
  contentApi.middleware,
  chatApi.middleware,
  configApi.middleware,
  tasksApi.middleware,
  adminApi.middleware,
  brandConfigApi.middleware,
  sheetDataApi.middleware,
  navigationApi.middleware,
  tenantApi.middleware,
  contentPageApi.middleware,
  mediaApi.middleware,
  notificationApi.middleware,
  commerceApi.middleware,
  marketingApi.middleware,
  userApi.middleware,
  aiAgentApi.middleware,
  whatsappApi.middleware,
  integrationApi.middleware,
  billingApi.middleware,
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
      [sheetDataApi.reducerPath]: sheetDataApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [brandConfigApi.reducerPath]: brandConfigApi.reducer,
      [navigationApi.reducerPath]: navigationApi.reducer,
      [tenantApi.reducerPath]: tenantApi.reducer,
      [contentPageApi.reducerPath]: contentPageApi.reducer,
      [mediaApi.reducerPath]: mediaApi.reducer,
      [notificationApi.reducerPath]: notificationApi.reducer,
      [commerceApi.reducerPath]: commerceApi.reducer,
      [marketingApi.reducerPath]: marketingApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
      [aiAgentApi.reducerPath]: aiAgentApi.reducer,
      [whatsappApi.reducerPath]: whatsappApi.reducer,
      [integrationApi.reducerPath]: integrationApi.reducer,
      [billingApi.reducerPath]: billingApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...apiMiddleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
