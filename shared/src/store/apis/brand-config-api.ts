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
