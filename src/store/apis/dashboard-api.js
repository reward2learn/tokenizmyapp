import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const dashboardApi = createApi({
    reducerPath: 'dashboardApi',
    baseQuery,
    endpoints: (builder) => ({
        getDashboardData: builder.query({
            query: () => 'dashboard-data',
        }),
        saveDashboardData: builder.mutation({
            query: (body) => ({
                url: 'dashboard-data',
                method: 'POST',
                body,
            }),
        }),
    }),
});
export const { useGetDashboardDataQuery, useSaveDashboardDataMutation, } = dashboardApi;
