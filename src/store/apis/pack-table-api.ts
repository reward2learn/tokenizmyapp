import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';

// ── Types ────────────────────────────────────────────────────────────────

/** A single pack-table row: `id` plus one field value per column.
 *  Numeric values are already coerced to numbers, timestamps are ISO
 *  strings, and JSONB columns are parsed objects. */
export type PackTableRow = Record<string, unknown> & { id: string };

export interface PackTableColumnMeta {
  name: string;
  dataType: string;
  isPrimary: boolean;
  required: boolean;
  unique: boolean;
  isBase: boolean;
  editable: boolean;
}

export interface PackTableListResponse {
  table: string;
  rows: PackTableRow[];
  totalRows: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PackTableMetaResponse {
  table: string;
  columns: PackTableColumnMeta[];
  writableColumns: string[];
}

export interface PackTableListArgs {
  table: string;
  /** 1-based page. */
  page?: number;
  /** Page size (max 500). */
  perPage?: number;
  /** Server-side sort: JSON array string of [column, dir][] pairs, e.g. `[["guest","asc"]]`. */
  sortBy?: string;
  /** Free-text search across searchable columns. */
  q?: string;
}

export interface PackTableWriteArgs {
  table: string;
  data: Record<string, unknown>;
}

export interface PackTableRowArgs {
  table: string;
  id: string;
  data: Record<string, unknown>;
}

export interface PackTableDeleteArgs {
  table: string;
  id: string;
}

// ── API ──────────────────────────────────────────────────────────────────

export const packTableApi = createApi({
  reducerPath: 'packTableApi',
  baseQuery,
  tagTypes: ['PackTable'],
  endpoints: (builder) => ({
    /** GET /api/pack-tables/[table] — paginated row listing. */
    getPackTableRows: builder.query<ApiEnvelope<PackTableListResponse>, PackTableListArgs>({
      query: (params) => ({
        url: `pack-tables/${params.table}`,
        params: {
          page: params.page ?? 1,
          perPage: params.perPage ?? 200,
          ...(params.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params.q ? { q: params.q } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'PackTable' as const, id: arg.table }],
    }),
    /** GET /api/pack-tables/[table]/meta — column metadata + writable columns. */
    getPackTableMeta: builder.query<ApiEnvelope<PackTableMetaResponse>, { table: string }>({
      query: (params) => ({
        url: `pack-tables/${params.table}/meta`,
      }),
      providesTags: (result, error, arg) => [{ type: 'PackTable' as const, id: arg.table }],
    }),
    /** POST /api/pack-tables/[table] — create a row. */
    createPackTableRow: builder.mutation<ApiEnvelope<PackTableRow>, PackTableWriteArgs>({
      query: (params) => ({
        url: `pack-tables/${params.table}`,
        method: 'POST',
        body: { data: params.data },
      }),
      invalidatesTags: ['PackTable'],
    }),
    /** PATCH /api/pack-tables/[table]/[id] — update a row. */
    updatePackTableRow: builder.mutation<ApiEnvelope<PackTableRow>, PackTableRowArgs>({
      query: (params) => ({
        url: `pack-tables/${params.table}/${params.id}`,
        method: 'PATCH',
        body: { data: params.data },
      }),
      invalidatesTags: ['PackTable'],
    }),
    /** DELETE /api/pack-tables/[table]/[id] — delete a row. */
    deletePackTableRow: builder.mutation<ApiEnvelope<{ deleted: boolean }>, PackTableDeleteArgs>({
      query: (params) => ({
        url: `pack-tables/${params.table}/${params.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PackTable'],
    }),
  }),
});

export const {
  useGetPackTableRowsQuery,
  useGetPackTableMetaQuery,
  useCreatePackTableRowMutation,
  useUpdatePackTableRowMutation,
  useDeletePackTableRowMutation,
} = packTableApi;
