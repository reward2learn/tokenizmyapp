import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';
import type { TemplateDefinition } from '@/domain/tenant/template-catalog';
import type { CustomTemplateDraft } from '@/lib/chat/session-tools';

export interface CustomTemplateRecord {
  id: string;
  label: string;
  description: string;
  icon: string;
  templateType: 'single' | 'suite';
  definition: TemplateDefinition;
  capabilities: { web3Wallet?: TemplateDefinition['capabilities'] extends infer C
    ? C extends { web3Wallet?: infer W } ? W : never
    : never };
  sourceKind: 'url' | 'knowledge' | 'prompt';
  sourceRef: string | null;
  prompt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export const templateApi = createApi({
  reducerPath: 'templateApi',
  baseQuery,
  tagTypes: ['Template'],
  endpoints: (builder) => ({
    /**
     * Built-ins merged with stored custom templates.
     *
     * Template pickers must use this rather than importing `listTemplates()`
     * directly — that catalog is compiled-in and cannot see custom templates.
     */
    listAllTemplates: builder.query<
      ApiEnvelope<{ templates: TemplateDefinition[]; builtinCount: number; customCount: number }>,
      void
    >({
      query: () => ({ url: 'admin/templates' }),
      providesTags: ['Template'],
    }),

    listCustomTemplates: builder.query<
      ApiEnvelope<{ templates: CustomTemplateRecord[] }>,
      void
    >({
      query: () => ({ url: 'admin/custom-templates' }),
      providesTags: ['Template'],
    }),

    generateCustomTemplate: builder.mutation<
      ApiEnvelope<{
        stored: boolean;
        template: CustomTemplateRecord | TemplateDefinition;
        rationale: string | null;
        provider: { id: string; model: string };
      }>,
      {
        brief: string;
        sourceKind: 'url' | 'knowledge' | 'prompt';
        url?: string;
        knowledgeContent?: string;
        web3Wallet?: boolean;
        dryRun?: boolean;
      }
    >({
      query: (body) => ({ url: 'admin/custom-templates', method: 'POST', body }),
      invalidatesTags: ['Template'],
    }),

    /**
     * Persist a template the chat assistant designed.
     *
     * Separate from generateCustomTemplate because it must NOT regenerate: the
     * administrator approved a specific design, and generation is both costly
     * and non-deterministic. Invalidates 'Template' so every picker — including
     * the Create New App wizard — sees it immediately.
     */
    saveCustomTemplateDraft: builder.mutation<
      ApiEnvelope<{ stored: boolean; template: CustomTemplateRecord }>,
      { draft: CustomTemplateDraft }
    >({
      query: (body) => ({ url: 'admin/custom-templates', method: 'POST', body }),
      invalidatesTags: ['Template'],
    }),

    deleteCustomTemplate: builder.mutation<ApiEnvelope<{ templateId: string }>, string>({
      query: (templateId) => ({
        url: `admin/custom-templates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),
  }),
});

export const {
  useListAllTemplatesQuery,
  useListCustomTemplatesQuery,
  useGenerateCustomTemplateMutation,
  useSaveCustomTemplateDraftMutation,
  useDeleteCustomTemplateMutation,
} = templateApi;
