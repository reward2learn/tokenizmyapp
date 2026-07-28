import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const sheetDataApi = createApi({
    reducerPath: 'sheetDataApi',
    baseQuery,
    endpoints: (builder) => ({
        getSheetData: builder.query({
            query: (params) => ({
                url: 'sheet-data',
                params: {
                    sheet: params.sheet,
                    page: params.page ?? 1,
                    perPage: params.perPage ?? 200,
                },
            }),
        }),
    }),
});
export const { useGetSheetDataQuery, } = sheetDataApi;
