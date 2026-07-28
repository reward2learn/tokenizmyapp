import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const monthlyActualsApi = createApi({
    reducerPath: 'monthlyActualsApi',
    baseQuery,
    tagTypes: ['MonthlyActuals'],
    endpoints: (builder) => ({
        getMonthlyActuals: builder.query({
            query: (params) => ({
                url: 'financial-overview',
                params: {
                    resource: 'monthly-actuals',
                    ...params,
                    ...(params.prefill ? { prefill: '1' } : {}),
                    ...(params.recent ? { recent: '1' } : {}),
                },
            }),
            providesTags: (_result, _error, { period }) => [{ type: 'MonthlyActuals', id: period }],
        }),
        saveMonthlyActuals: builder.mutation({
            query: (body) => ({
                url: 'financial-overview?resource=monthly-actuals',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['MonthlyActuals'],
        }),
    }),
});
export const { useGetMonthlyActualsQuery, useLazyGetMonthlyActualsQuery, useSaveMonthlyActualsMutation, } = monthlyActualsApi;
