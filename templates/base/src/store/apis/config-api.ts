import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';
import type { ReseedResponse } from '@/app/api/config/reseed/route';
import type { ReprocessResponse } from '@/app/api/config/reprocess/route';

export interface WorkflowAcceptedResponse {
  ok: boolean;
  runId: string;
  status: 'accepted';
  counts: Record<string, number>;
  filesUsed: Record<string, 'upload' | 'disk'>;
  uploaded: string[];
  warnings: string[];
}

export interface WorkflowStatusResponse {
  status: 'running' | 'completed' | 'failed' | 'not_found';
  runId: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface OpenAiKeyStatus {
  configured: boolean;
  source: 'db' | 'env' | null;
}

import type { AiProviderDef, AiProviderId } from '@/lib/ai-providers-catalog';

export type { AiProviderDef, AiProviderId };

export interface AiProviderInfo {
  id: string;
  label: string;
  configured: boolean;
  source: 'db' | 'env' | null;
  docsUrl: string;
  keyPlaceholder: string;
  defaultModel: string | null;
}

export interface AiProviderStatus {
  providers: AiProviderInfo[];
  catalog?: AiProviderDef[];
  activeProviderId: string;
  activeModel: string | null;
}

export interface AiModelOption {
  id: string;
  label: string;
  description?: string;
}

export interface VercelTokenStatus {
  status: 'configured' | 'expired' | 'not_configured';
  tokenInfo: string | null;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  oauthUrl: string | null;
}

export interface ChatSettings {
  webSearchEnabled: boolean;
  updatedAt: string;
}

export interface ReviewPartDetail {
  slug: string;
  title: string;
  partKey: string;
  markdownLength: number;
  markdownPreview: string;
}

export interface SeedDetailsResponse {
  appPages: unknown[];
  pageSections: unknown[];
  reviewPartDetails: ReviewPartDetail[];
  knowledgeSnippets: unknown[];
  tasks: unknown[];
  roles: unknown[];
  monthlyTargets: unknown[];
  levers: unknown[];
  actionItems: unknown[];
  dailyZReports: unknown[];
}

export const configApi = createApi({
  reducerPath: 'configApi',
  baseQuery,
  tagTypes: ['OpenAiKey', 'ChatSettings', 'SeedDetails', 'VercelToken', 'AiProvider', 'CachedWorkbook'],
  endpoints: (builder) => ({
    reseedFromSources: builder.mutation<ApiEnvelope<ReseedResponse | WorkflowAcceptedResponse>, FormData>({
      query: (body) => ({
        url: 'config/reseed',
        method: 'POST',
        body,
      }),
      // Sync seed finishes before 202; invalidate so Review Data / wizard see new counts.
      // Workflow completion also invalidates from the upload form.
      invalidatesTags: ['SeedDetails', 'CachedWorkbook'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { navigationApi } = await import('@/store/apis/navigation-api');
          dispatch(navigationApi.util.invalidateTags([{ type: 'Navigation' }] as any));
        } catch {
          // reseed failed
        }
      },
    }),
    reprocessFromCache: builder.mutation<ApiEnvelope<ReprocessResponse>, void>({
      query: () => ({
        url: 'config/reprocess',
        method: 'POST',
      }),
      invalidatesTags: ['SeedDetails', 'CachedWorkbook'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { navigationApi } = await import('@/store/apis/navigation-api');
          dispatch(navigationApi.util.invalidateTags([{ type: 'Navigation' }] as any));
        } catch {
          // reprocess failed
        }
      },
    }),
    /** GET /api/config/cached-workbook — last successful workbook cache metadata */
    getCachedWorkbook: builder.query<
      ApiEnvelope<
        | {
            cached: true;
            appId: string;
            sizeBytes: number;
            fileName: string;
            meta: { files: Array<{ fileName: string; sizeBytes: number }>; uploadedAt: string };
          }
        | { cached: false }
      >,
      void
    >({
      query: () => 'config/cached-workbook',
      providesTags: ['CachedWorkbook'],
    }),
    getOpenAiKeyStatus: builder.query<ApiEnvelope<OpenAiKeyStatus>, void>({
      query: () => 'config/openai-key',
      providesTags: ['OpenAiKey'],
    }),
    saveOpenAiKey: builder.mutation<ApiEnvelope<OpenAiKeyStatus>, { apiKey: string }>({
      query: (body) => ({
        url: 'config/openai-key',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OpenAiKey'],
    }),
    clearOpenAiKey: builder.mutation<ApiEnvelope<OpenAiKeyStatus>, void>({
      query: () => ({
        url: 'config/openai-key',
        method: 'DELETE',
      }),
      invalidatesTags: ['OpenAiKey'],
    }),
    getChatSettings: builder.query<ApiEnvelope<ChatSettings>, void>({
      query: () => 'config/settings',
      providesTags: ['ChatSettings'],
    }),
    updateChatSettings: builder.mutation<ApiEnvelope<ChatSettings>, { webSearchEnabled: boolean }>({
      query: (body) => ({
        url: 'config/settings',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ChatSettings'],
    }),
    /** GET /api/config/seed-details — returns full seed inventory */
    getSeedDetails: builder.query<ApiEnvelope<SeedDetailsResponse>, void>({
      query: () => 'config/seed-details',
      providesTags: ['SeedDetails'],
    }),
    /** POST /api/config/import-data — bulk JSON import into seed tables */
    importData: builder.mutation<ApiEnvelope<{ imported: number }>, { table: string; data: unknown[] }>({
      query: (body) => ({
        url: 'config/import-data',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SeedDetails'],
    }),
    /** GET /api/config/vercel-token — Vercel OAuth token configuration status */
    getVercelTokenStatus: builder.query<ApiEnvelope<VercelTokenStatus>, void>({
      query: () => 'config/vercel-token',
      providesTags: ['VercelToken'],
    }),
        /** GET /api/config/reseed/status?runId= — poll workflow completion */
    getReseedWorkflowStatus: builder.query<WorkflowStatusResponse, string>({
      query: (runId) => `config/reseed/status?runId=${runId}`,
      keepUnusedDataFor: 5,
    }),
    /** GET /api/config/ai-provider — status for every provider + active selection */
    getAiProviderStatus: builder.query<ApiEnvelope<AiProviderStatus>, void>({
      query: () => 'config/ai-provider',
      providesTags: ['AiProvider'],
    }),
    /** POST /api/config/ai-provider — save catalog / key and/or activate */
    saveAiProvider: builder.mutation<
      ApiEnvelope<AiProviderStatus>,
      {
        providerId?: string;
        apiKey?: string;
        model?: string;
        activate?: boolean;
        catalog?: AiProviderDef[];
        apiKeysBySecretName?: Record<string, string>;
      }
    >({
      query: (body) => ({
        url: 'config/ai-provider',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AiProvider'],
    }),
    /** DELETE /api/config/ai-provider — remove a provider's stored key */
    clearAiProviderKey: builder.mutation<ApiEnvelope<AiProviderStatus>, { providerId: string }>({
      query: (body) => ({
        url: 'config/ai-provider',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['AiProvider'],
    }),
    /** GET /api/config/ai-models?providerId= — live model list for a provider */
    getAiModels: builder.query<ApiEnvelope<{ providerId: string; models: AiModelOption[] }>, string>({
      query: (providerId) => `config/ai-models?providerId=${providerId}`,
    }),
  }),
});

export const {
  useReseedFromSourcesMutation,
  useReprocessFromCacheMutation,
  useGetCachedWorkbookQuery,
  useGetOpenAiKeyStatusQuery,
  useSaveOpenAiKeyMutation,
  useClearOpenAiKeyMutation,
  useGetChatSettingsQuery,
  useUpdateChatSettingsMutation,
  useGetSeedDetailsQuery,
  useImportDataMutation,
  useLazyGetReseedWorkflowStatusQuery,
  useGetVercelTokenStatusQuery,
  useGetAiProviderStatusQuery,
  useSaveAiProviderMutation,
  useClearAiProviderKeyMutation,
  useLazyGetAiModelsQuery,
} = configApi;
