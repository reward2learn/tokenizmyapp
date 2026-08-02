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

// ── Custom columns (overlay — never written into the workbook buffer) ──
export interface CustomColumnMeta {
  id: string;
  sheet: string;
  name: string;
  position: number;
  virtualCol: number;
  cellCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomColumnCreateParams {
  sheet: string;
  name: string;
  /** Insertion index among the workbook's visible columns (0-based). */
  position?: number;
}

export interface CustomColumnUpdateParams {
  id: string;
  /** Sheet of the column (used for tag invalidation). */
  sheet: string;
  name?: string;
  position?: number;
  /** Bulk cell writes: 1-based Excel row -> value. '' clears the cell. */
  cells?: Record<string, unknown>;
  /** When true, "=..." string values are stored/evaluated as formulas. */
  formulaMode?: boolean;
}

export interface CustomColumnDeleteParams {
  id: string;
  sheet: string;
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
    getCustomColumns: builder.query<
      ApiEnvelope<{ columns: CustomColumnMeta[] }>,
      { sheet: string }
    >({
      query: (params) => ({
        url: 'sheet-data/custom-columns',
        params: { sheet: params.sheet },
      }),
      providesTags: (result, error, arg) => [{ type: 'SheetData' as const, id: arg.sheet }],
    }),
    createCustomColumn: builder.mutation<
      ApiEnvelope<{ column: CustomColumnMeta }>,
      CustomColumnCreateParams
    >({
      query: (params) => ({
        url: 'sheet-data/custom-columns',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'SheetData' as const, id: arg.sheet },
      ],
    }),
    updateCustomColumn: builder.mutation<
      ApiEnvelope<{ column: CustomColumnMeta }>,
      CustomColumnUpdateParams
    >({
      query: (params) => ({
        url: `sheet-data/custom-columns/${params.id}`,
        method: 'PATCH',
        body: params,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'SheetData' as const, id: arg.sheet },
      ],
    }),
    deleteCustomColumn: builder.mutation<
      ApiEnvelope<{ success: boolean }>,
      CustomColumnDeleteParams
    >({
      query: (params) => ({
        url: `sheet-data/custom-columns/${params.id}`,
        method: 'DELETE',
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
  useGetCustomColumnsQuery,
  useCreateCustomColumnMutation,
  useUpdateCustomColumnMutation,
  useDeleteCustomColumnMutation,
} = sheetDataApi;
