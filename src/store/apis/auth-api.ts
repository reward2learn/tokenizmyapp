import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope, SessionPayload } from '@/store/api-types';

export interface UserProfile {
  avatarUrl: string | null;
}

export interface OrganizationBranding {
  logoUrl?: string | null;
  backgroundImageUrl?: string | null;
  backgroundVideoUrl?: string | null;
  customCss?: string | null;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Session', 'UserProfile', 'OrganizationBranding'],
  endpoints: (builder) => ({
    getSession: builder.query<ApiEnvelope<SessionPayload>, void>({
      query: () => 'auth?action=me',
      providesTags: ['Session'],
    }),
    verifyPin: builder.mutation<{ ok: boolean; success?: boolean }, { name?: string; role?: string; pin: string }>({
      query: (body) => ({
        url: 'auth?action=verify-pin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth?action=logout',
        method: 'GET',
        responseHandler: 'text',
      }),
      invalidatesTags: ['Session'],
    }),
    listPinUsers: builder.query<ApiEnvelope<{
      users: Array<{ sub: string; name: string; role: string; pinConfigured: boolean; lastSeenAt?: string | null }>;
      lastUsedSub?: string | null;
      lastUsedName?: string | null;
    }>, void>({
      query: () => 'auth?action=list-pin-users',
    }),
    getUserProfile: builder.query<ApiEnvelope<UserProfile>, void>({
      query: () => 'user/profile',
      providesTags: ['UserProfile'],
    }),
    updateUserProfile: builder.mutation<ApiEnvelope<{ message: string }>, { avatarUrl: string }>({
      query: (body) => ({
        url: 'user/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    getOrganizationBranding: builder.query<ApiEnvelope<OrganizationBranding>, string>({
      query: (orgId) => `admin/organizations/${orgId}/branding`,
      providesTags: ['OrganizationBranding'],
    }),
    updateOrganizationBranding: builder.mutation<ApiEnvelope<{ message: string }>, { orgId: string; branding: Partial<OrganizationBranding> }>({
      query: ({ orgId, branding }) => ({
        url: `admin/organizations/${orgId}/branding`,
        method: 'PATCH',
        body: branding,
      }),
      invalidatesTags: ['OrganizationBranding'],
    }),
  }),
});

export const {
  useGetSessionQuery,
  useVerifyPinMutation,
  useLogoutMutation,
  useListPinUsersQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetOrganizationBrandingQuery,
  useUpdateOrganizationBrandingMutation,
} = authApi;
