import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';

export interface BrandConfig {
  tenantSlug: string;
  tenantDisplayName: string;
  tenantTemplate: string;
  brandLogoText: string;
  brandLogoUrl: string | null;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  /** Resolved loading graphic (app override, else tenant default). */
  loadingGraphicUrl?: string | null;
  /** App-level override; empty inherits tenant default. Admin API only. */
  brandLoadingGraphicUrl?: string;
  /** Tenant-level default. Admin API only. */
  tenantLoadingGraphicUrl?: string | null;
  themeMode?: string;
}

export const brandConfigApi = createApi({
  reducerPath: 'brandConfigApi',
  baseQuery,
  tagTypes: ['BrandConfig'],
  endpoints: (builder) => ({
    getBrandConfig: builder.query<ApiEnvelope<BrandConfig>, void>({
      query: () => 'brand-config',
      providesTags: ['BrandConfig'],
    }),
  }),
});

export const {
  useGetBrandConfigQuery,
} = brandConfigApi;
