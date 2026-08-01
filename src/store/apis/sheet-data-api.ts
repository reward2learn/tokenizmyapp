import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';

export interface SheetDataParams {
  sheet: string;
  page?: number;
  perPage?: number;
  /** 1 = formula mode (GET parses & returns cell formulas). Default 0 (off). */
  formulas?: number;
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
  /** Original Excel cell reference (e.g. "D7") from initial load.
   *  When provided, the backend uses this directly instead of recalculating
   *  from rowIndex/column, ensuring correct cell is updated even after sorting/filtering. */
  _excelCell?: string;
  /** Actual Excel row number from initial load (1-based).
   *  Used as fallback when _excelCell is not provided. */
  _excelRow?: number;
  /** When true the backend stores/evaluates "=..." edits as Excel formulas. Default false (plain values). */
  formulaMode?: boolean;
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
          formulas: params.formulas ?? 0,
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'SheetData' as const, id: arg.sheet }],
    }),
    updateSheetCell: builder.mutation<
      ApiEnvelope<{
        success: boolean;
        cell?: string;
        /** Calculated result (when the edited value was an evaluable formula). */
        value?: unknown;
        /** Stored Excel formula (present when the edit started with "="). */
        formula?: string;
        /** True when the formula could not be evaluated locally (Excel recalcs on open). */
        unevaluable?: boolean;
      }>,
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
