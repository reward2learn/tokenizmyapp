import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const navigationApi = createApi({
    reducerPath: 'navigationApi',
    baseQuery,
    endpoints: (builder) => ({
        getNavigation: builder.query({
            query: (params) => ({
                url: 'navigation',
                params: params ?? {},
            }),
        }),
    }),
});
export const { useGetNavigationQuery, } = navigationApi;
