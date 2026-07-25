import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiEnvelope } from '@/store/api-types';

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  format: string;
  isPublished: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export interface ContentPageInput {
  slug: string;
  title: string;
  body: string;
  format?: 'html' | 'markdown';
  isPublished?: boolean;
}

export interface ContentPagePatch {
  title?: string;
  body?: string;
  format?: 'html' | 'markdown';
  isPublished?: boolean;
}

/**
 * RTK Query API for legal/content page CRUD.
 * Base URL points at the admin content-pages endpoint; mutations use the
 * [slug] sub-route for single-page update/delete.
 */
export const contentPageApi = createApi({
  reducerPath: 'contentPageApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/admin/content-pages' }),
  tagTypes: ['ContentPage'],
  endpoints: (builder) => ({
    listContentPages: builder.query<ApiEnvelope<{ pages: ContentPage[] }>, void>({
      query: () => '',
      providesTags: ['ContentPage'],
    }),
    createContentPage: builder.mutation<
      ApiEnvelope<{ page: ContentPage }>,
      ContentPageInput
    >({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ContentPage'],
    }),
    updateContentPage: builder.mutation<
      ApiEnvelope<{ page: ContentPage }>,
      { slug: string; data: ContentPagePatch }
    >({
      query: ({ slug, data }) => ({
        url: slug,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ContentPage'],
    }),
    deleteContentPage: builder.mutation<
      ApiEnvelope<{ deleted: boolean }>,
      string
    >({
      query: (slug) => ({
        url: slug,
        method: 'DELETE',
      }),
      invalidatesTags: ['ContentPage'],
    }),
  }),
});

export const {
  useListContentPagesQuery,
  useCreateContentPageMutation,
  useUpdateContentPageMutation,
  useDeleteContentPageMutation,
} = contentPageApi;
