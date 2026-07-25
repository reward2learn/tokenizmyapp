import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiEnvelope } from '@/store/api-types';
import type { MediaAssetDto } from '@/domain/media/media-service';

export type MediaAsset = MediaAssetDto;

export interface MediaListParams {
  /** Filter by media type: "image" or "video". */
  type?: 'image' | 'video';
  /** Filter by a single tag. */
  tag?: string;
}

export interface UploadMediaArgs {
  file: File;
  altText?: string;
  tags?: string[];
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * RTK Query API for media asset upload & management.
 * Base URL: /api/media — mutations hit the upload & [id] sub-routes.
 */
export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/media' }),
  tagTypes: ['MediaAsset'],
  endpoints: (builder) => ({
    listMedia: builder.query<ApiEnvelope<{ assets: MediaAsset[] }>, MediaListParams | void>({
      query: (params) => {
        if (!params) return '';
        const search = new URLSearchParams();
        if (params.type) search.set('type', params.type);
        if (params.tag) search.set('tag', params.tag);
        const qs = search.toString();
        return qs ? `?${qs}` : '';
      },
      providesTags: ['MediaAsset'],
    }),
    uploadMedia: builder.mutation<ApiEnvelope<{ asset: MediaAsset }>, UploadMediaArgs>({
      query: ({ file, altText, tags, width, height, duration }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (altText) formData.append('altText', altText);
        if (tags && tags.length > 0) formData.append('tags', tags.join(','));
        if (width !== undefined) formData.append('width', String(width));
        if (height !== undefined) formData.append('height', String(height));
        if (duration !== undefined) formData.append('duration', String(duration));
        return {
          url: 'upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MediaAsset'],
    }),
    deleteMedia: builder.mutation<ApiEnvelope<{ deleted: boolean }>, string>({
      query: (id) => ({
        url: id,
        method: 'DELETE',
      }),
      invalidatesTags: ['MediaAsset'],
    }),
  }),
});

export const { useListMediaQuery, useUploadMediaMutation, useDeleteMediaMutation } = mediaApi;
