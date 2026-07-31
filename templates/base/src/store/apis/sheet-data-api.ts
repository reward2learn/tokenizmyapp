import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';

export interface SheetDataParams {
  sheet: string;
  page?: number;
  perPage?: number;
}

export interface SheetDataResponse {
  sheet: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface UpdateSheetCellParams {
  sheet: string;
  rowIndex: number;
  column: string;
  value: unknown;
}

export const sheetDataApi = createApi({
  reducerPath: 'sheetDataApi',
  baseQuery,
  tagTypes: ['SheetData'],
  endpoints: (builder) => ({
    getSheetData: builder.query<ApiEnvelope<SheetDataResponse>, SheetDataParams>({
      query: (params) => ({
        url: 'sheet-data',
        params: {
          sheet: params.sheet,
          page: params.page ?? 1,
          perPage: params.perPage ?? 200,
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'SheetData' as const, id: arg.sheet }],
    }),
    updateSheetCell: builder.mutation<
      ApiEnvelope<{ success: boolean }>,
      UpdateSheetCellParams
    >({
      query: (params) => ({
        url: 'sheet-data/update-cell',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'SheetData' as const, id: arg.sheet },
      ],
    }),
  }),
});

export const {
  useGetSheetDataQuery,
  useUpdateSheetCellMutation,
} = sheetDataApi;
