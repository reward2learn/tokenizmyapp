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
  /** Default theme: 'light' | 'dark' | 'system' (follows OS). */
  themeMode?: 'light' | 'dark' | 'system';
}

export const brandConfigApi = createApi({
  reducerPath: 'brandConfigApi',
  baseQuery,
  endpoints: (builder) => ({
    getBrandConfig: builder.query<ApiEnvelope<BrandConfig>, void>({
      query: () => 'brand-config',
    }),
  }),
});

export const {
  useGetBrandConfigQuery,
} = brandConfigApi;
