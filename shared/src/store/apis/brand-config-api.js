import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const brandConfigApi = createApi({
    reducerPath: 'brandConfigApi',
    baseQuery,
    endpoints: (builder) => ({
        getBrandConfig: builder.query({
            query: () => 'brand-config',
        }),
    }),
});
export const { useGetBrandConfigQuery, } = brandConfigApi;
