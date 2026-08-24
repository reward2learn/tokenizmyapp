import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
import type { ApiEnvelope } from '@/store/api-types';
import { brandConfigApi } from '@shared/store/apis/brand-config-api';
import { configApi } from '@/store/apis/config-api';
import { navigationApi } from '@/store/apis/navigation-api';
import { organizationApi } from '@/store/apis/organization-api';
import type { RoleConfigView } from '@/app/api/admin/roles/route';
import type { AdminConversationView } from '@/app/api/admin/conversations/route';
import type { AdminUserView } from '@/app/api/admin/users/route';
import type { BatchUserInput, BatchUserResult } from '@/app/api/admin/users/batch/route';
import type { AdminGroupView } from '@/app/api/admin/groups/route';
import { contentApi } from '@/store/apis/content-api';
import { publishPageSections } from '@/store/ui-slice';
import { cmsPageCacheKey, normalizeCmsScope } from '@shared/lib/cms-scope';
import { getTenantConfig } from '@shared/lib/config/tenant';
import type { AiUsageSummary } from '@/lib/billing/ai-usage-summary';

/** Cross-tenant browse scope — resolved server-side only for platform admins. */
export interface TenantAppScope {
  tenantSlug?: string;
  appId?: string;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['RoleConfig', 'AdminConversations', 'AdminUsers', 'AdminGroups', 'SeedData', 'AiContent', 'BrandConfig', 'Navigation', 'AppPack', 'PageSections'],
  endpoints: (builder) => ({
    listRoleConfigs: builder.query<ApiEnvelope<{ roles: RoleConfigView[] }>, TenantAppScope | void>({
      query: (scope) => ({ url: 'admin/roles', params: { tenantSlug: scope?.tenantSlug, appId: scope?.appId } }),
      providesTags: ['RoleConfig'],
    }),
    setRolePin: builder.mutation<ApiEnvelope<{ code: string; configured: boolean }>, { code: string; pin: string }>({
      query: (body) => ({
        url: 'admin/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RoleConfig'],
    }),

    createRole: builder.mutation<ApiEnvelope<RoleConfigView>, { code: string; name: string; isPlatformAdmin?: boolean } & TenantAppScope>({
      query: (body) => ({
        url: 'admin/roles',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['RoleConfig'],
    }),

    updateRole: builder.mutation<ApiEnvelope<RoleConfigView>, { code: string; name?: string; isPlatformAdmin?: boolean }>({
      query: (body) => ({
        url: 'admin/roles',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['RoleConfig'],
    }),

    deleteRole: builder.mutation<ApiEnvelope<{ deleted: boolean }>, string>({
      query: (code) => ({
        url: `admin/roles?code=${encodeURIComponent(code)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RoleConfig'],
    }),

    listAdminConversations: builder.query<
      ApiEnvelope<{ conversations: AdminConversationView[] }>,
      ({ archived?: boolean; owner?: string; limit?: number } & TenantAppScope) | void
    >({
      query: (params) => ({
        url: 'admin/conversations',
        params: {
          ...(params?.archived ? { archived: 'true' } : {}),
          ...(params?.owner ? { owner: params.owner } : {}),
          ...(params?.limit ? { limit: params.limit } : {}),
          ...(params?.tenantSlug ? { tenantSlug: params.tenantSlug } : {}),
          ...(params?.appId ? { appId: params.appId } : {}),
        },
      }),
      providesTags: ['AdminConversations'],
    }),
    archiveAdminConversation: builder.mutation<
      ApiEnvelope<{ id: number; archived: boolean }>,
      { id: number; archived: boolean } & TenantAppScope
    >({
      query: ({ id, archived, tenantSlug, appId }) => ({
        url: 'admin/conversations',
        method: 'PATCH',
        params: { id, archived, tenantSlug, appId },
      }),
      invalidatesTags: ['AdminConversations'],
    }),
    listAdminUsers: builder.query<ApiEnvelope<{ users: AdminUserView[] }>, TenantAppScope | void>({
      query: (scope) => ({ url: 'admin/users', params: { tenantSlug: scope?.tenantSlug, appId: scope?.appId } }),
      providesTags: ['AdminUsers'],
    }),
    updateAdminUser: builder.mutation<
      ApiEnvelope<{ id: string; updated: boolean }>,
      { id: string; email?: string; isActive?: boolean; roleCode?: string | null; groupCodes?: string[]; pin?: string } & TenantAppScope
    >({
      query: (body) => ({
        url: 'admin/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminUsers', 'RoleConfig'],
    }),
    deleteAdminUser: builder.mutation<
      ApiEnvelope<{ id: string; deleted: boolean }>,
      { id: string; sub: string } & TenantAppScope
    >({
      query: ({ id, tenantSlug, appId }) => ({
        url: 'admin/users',
        method: 'DELETE',
        params: { id, tenantSlug, appId },
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    /** POST /api/admin/users/batch — create/update users one-at-a-time or from a CSV upload */
    createAdminUsers: builder.mutation<
      ApiEnvelope<{ results: BatchUserResult[]; created: number; updated: number; skipped: number }>,
      { users: BatchUserInput[] } & TenantAppScope
    >({
      query: (body) => ({
        url: 'admin/users/batch',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminUsers', 'RoleConfig'],
    }),
    listAdminGroups: builder.query<ApiEnvelope<{ groups: AdminGroupView[]; defaults: string[] }>, TenantAppScope | void>({
      query: (scope) => ({ url: 'admin/groups', params: { tenantSlug: scope?.tenantSlug, appId: scope?.appId } }),
      providesTags: ['AdminGroups'],
    }),
    createAdminGroup: builder.mutation<
      ApiEnvelope<AdminGroupView>,
      { code: string; name: string; description?: string; permissions?: string[] } & TenantAppScope
    >({
      query: (body) => ({
        url: 'admin/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminGroups'],
    }),
    updateAdminGroup: builder.mutation<
      ApiEnvelope<{ code: string; updated: boolean }>,
      { code: string; name?: string; description?: string; permissions?: string[] } & TenantAppScope
    >({
      query: (body) => ({
        url: 'admin/groups',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminGroups'],
    }),
    /** POST /api/admin/clear-seed — clear all or selected seed tables.
     *  tenantSlug targets that tenant's own dedicated database; appId further
     *  scopes the clear to just that app's rows within the shared database. */
    clearSeed: builder.mutation<
      ApiEnvelope<{ deleted: Record<string, number>; message: string }>,
      ({ mode: 'all'; confirm: string } | { mode: 'selected'; tables: string[]; confirm: string }) & TenantAppScope
    >({
      query: (body) => ({
        url: 'admin/clear-seed',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SeedData'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(configApi.util.invalidateTags(['SeedDetails']));
        } catch {
          // clear failed — keep Review Data cache
        }
      },
    }),
    /** GET /api/admin/clear-seed — row-count overview of seed tables, optionally for a specific tenant/app's own database */
    getSeedOverview: builder.query<ApiEnvelope<{ counts: Record<string, number>; total: number; tenantSlug: string | null; appId: string | null }>, TenantAppScope | void>({
      query: (params) => ({ url: 'admin/clear-seed', params: { tenantSlug: params?.tenantSlug, appId: params?.appId } }),
      providesTags: ['SeedData'],
    }),
    /** GET /api/admin/ai-content — AI content generation status */
    getAiContent: builder.query<ApiEnvelope<unknown>, void>({
      query: () => 'admin/ai-content',
      providesTags: ['AiContent'],
    }),
    /** POST /api/admin/ai-content — trigger AI content generation */
    generateAiContent: builder.mutation<ApiEnvelope<unknown>, { filePath?: string; model?: string; additionalContext?: string; overridePrompt?: string }>({
      query: (body) => ({
        url: 'admin/ai-content',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AiContent'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // BR parts / snippets / tasks land in the same inventory Review Data reads.
          dispatch(configApi.util.invalidateTags(['SeedDetails']));
          dispatch(organizationApi.util.invalidateTags(['Credits']));
        } catch {
          // generate failed — keep cache
        }
      },
    }),
    /** GET /api/admin/brand-config — read brand config */
    getAdminBrandConfig: builder.query<ApiEnvelope<unknown>, TenantAppScope | void>({
      query: (scope) => ({ url: 'admin/brand-config', params: { tenantSlug: scope?.tenantSlug, appId: scope?.appId } }),
      providesTags: ['BrandConfig'],
    }),
    /** PUT /api/admin/brand-config — update brand config. tenantSlug/appId select
     * which row to write (query param); any tenantSlug field inside `data` is
     * itself a value being saved, not the row selector — see route.ts resolveScope. */
    updateAdminBrandConfig: builder.mutation<
      ApiEnvelope<unknown>,
      { data: FormData | Record<string, unknown> } & TenantAppScope
    >({
      query: ({ data, tenantSlug, appId }) => ({
        url: 'admin/brand-config',
        method: 'PUT',
        body: data,
        params: { tenantSlug, appId },
      }),
      invalidatesTags: ['BrandConfig'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(brandConfigApi.util.invalidateTags(['BrandConfig']));
        } catch {
          // save failed — keep the public header cache as-is
        }
      },
    }),
    /** GET /api/admin/navigation — list nav tree */
    getNavigation: builder.query<ApiEnvelope<unknown>, TenantAppScope | void>({
      query: (scope) => ({ url: 'admin/navigation', params: { tenantSlug: scope?.tenantSlug, appId: scope?.appId } }),
      providesTags: ['Navigation'],
    }),
    /** POST /api/admin/navigation — create nav item. tenantSlug/appId route the
     *  write to that tenant's own database when it has one — see admin/navigation/route.ts. */
    createNavigationItem: builder.mutation<ApiEnvelope<unknown>, Record<string, unknown> & TenantAppScope>({
      query: (body) => ({
        url: 'admin/navigation',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Navigation'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(navigationApi.util.invalidateTags(['Navigation']));
        } catch {
          /* keep drawer cache */
        }
      },
    }),
    /** PUT /api/admin/navigation — batch update nav items */
    updateNavigationItems: builder.mutation<ApiEnvelope<unknown>, { items: Record<string, unknown>[] } & TenantAppScope>({
      query: (body) => ({
        url: 'admin/navigation',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Navigation'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(navigationApi.util.invalidateTags(['Navigation']));
        } catch {
          /* keep drawer cache */
        }
      },
    }),
    /** DELETE /api/admin/navigation — delete by IDs */
    deleteNavigationItems: builder.mutation<ApiEnvelope<unknown>, { ids: string[] } & TenantAppScope>({
      query: ({ ids, tenantSlug, appId }) => {
        const params = new URLSearchParams({ ids: ids.map(encodeURIComponent).join(',') });
        if (tenantSlug) params.set('tenantSlug', tenantSlug);
        if (appId) params.set('appId', appId);
        return { url: `admin/navigation?${params.toString()}`, method: 'DELETE' };
      },
      invalidatesTags: ['Navigation'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(navigationApi.util.invalidateTags(['Navigation']));
        } catch {
          /* keep drawer cache */
        }
      },
    }),

    /** GET /api/admin/pages — list AppPage rows for CMS */
    listAdminPages: builder.query<
      ApiEnvelope<{
        pages: Array<{
          id: string;
          slug: string;
          title: string;
          authTier: string;
          navLabel: string | null;
          showInNav: boolean;
          contentLocked: boolean;
          sortOrder: number;
          sectionCount: number;
        }>;
      }>,
      TenantAppScope | void
    >({
      query: (scope) => ({
        url: 'admin/pages',
        params: { tenantSlug: scope?.tenantSlug, appId: scope?.appId },
      }),
      providesTags: ['PageSections'],
    }),

    /** PUT /api/admin/pages — set contentLocked (unlock for re-seed) */
    setPageContentLocked: builder.mutation<
      ApiEnvelope<{ slug: string; contentLocked: boolean }>,
      { slug: string; contentLocked: boolean } & TenantAppScope
    >({
      query: (body) => ({ url: 'admin/pages', method: 'PUT', body }),
      invalidatesTags: ['PageSections'],
    }),

    /** GET /api/admin/cms-sources — doc/snippet keys, workbook sheets, pack tables */
    getCmsSources: builder.query<
      ApiEnvelope<{ docSources: string[]; workbookSheets: string[]; packTables: string[] }>,
      TenantAppScope | void
    >({
      query: (scope) => ({
        url: 'admin/cms-sources',
        params: { tenantSlug: scope?.tenantSlug, appId: scope?.appId },
      }),
      providesTags: ['PageSections'],
    }),

    /** GET /api/admin/pages/[slug]/sections */
    getPageSections: builder.query<
      ApiEnvelope<{
        slug: string;
        title: string;
        contentLocked: boolean;
        sections: Array<{
          id: string;
          sortOrder: number;
          blockType: string;
          config: Record<string, unknown>;
        }>;
      }>,
      { slug: string } & TenantAppScope
    >({
      query: ({ slug, tenantSlug, appId }) => ({
        url: `admin/pages/${encodeURIComponent(slug)}/sections`,
        params: { tenantSlug, appId },
      }),
      providesTags: ['PageSections'],
    }),

    /** POST /api/admin/pages/[slug]/provision — create CMS row from catalog */
    provisionCatalogPage: builder.mutation<
      ApiEnvelope<{
        slug: string;
        provisioned: boolean;
        created: boolean;
        sectionCount: number;
        pageId: string;
      }>,
      { slug: string } & TenantAppScope
    >({
      query: ({ slug, tenantSlug, appId }) => ({
        url: `admin/pages/${encodeURIComponent(slug)}/provision`,
        method: 'POST',
        params: { tenantSlug, appId },
        body: { tenantSlug, appId },
      }),
      invalidatesTags: ['PageSections'],
    }),

    /** POST /api/admin/pages/[slug]/sections */
    createPageSection: builder.mutation<
      ApiEnvelope<{ created: boolean; id: string; sortOrder: number }>,
      { slug: string; blockType: string; config?: Record<string, unknown>; sortOrder?: number } & TenantAppScope
    >({
      query: ({ slug, ...body }) => ({
        url: `admin/pages/${encodeURIComponent(slug)}/sections`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PageSections'],
    }),

    /** PUT /api/admin/pages/[slug]/sections — batch update */
    updatePageSections: builder.mutation<
      ApiEnvelope<{ updated: number; contentLocked: boolean }>,
      {
        slug: string;
        sections: Array<{
          id: string;
          blockType?: string;
          config?: Record<string, unknown>;
          sortOrder?: number;
        }>;
      } & TenantAppScope
    >({
      query: ({ slug, ...body }) => ({
        url: `admin/pages/${encodeURIComponent(slug)}/sections`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['PageSections'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          for (const section of arg.sections) {
            const source = section.config?.source;
            if (typeof source === 'string' && source.length > 0) {
              dispatch(contentApi.util.invalidateTags([{ type: 'Document', id: source }]));
            }
          }
          dispatch(contentApi.util.invalidateTags(['Document']));
          dispatch(
            publishPageSections({
              slug: arg.slug,
              cacheKey: cmsPageCacheKey(
                normalizeCmsScope({ tenantSlug: arg.tenantSlug, appId: arg.appId }),
                arg.slug,
              ),
              sections: arg.sections.map((s, i) => ({
                id: s.id,
                sortOrder: s.sortOrder ?? i,
                blockType: s.blockType ?? 'doc_markdown',
                config: s.config ?? {},
              })),
            }),
          );
        } catch {
          // save failed — do not publish
        }
      },
    }),

    /** POST /api/admin/cms/ensure-hero-routes — provision pages + nav for hero CTA hrefs */
    ensureHeroNavRoutes: builder.mutation<
      ApiEnvelope<{
        paths: string[];
        pagesCreated: number;
        navCreated: number;
        skipped: string[];
      }>,
      {
        heroConfig?: Record<string, unknown>;
        navButtons?: Array<{ label: string; href: string }>;
      } & TenantAppScope
    >({
      query: (body) => ({
        url: 'admin/cms/ensure-hero-routes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Navigation', 'PageSections'],
    }),

    /** POST /api/admin/cms-generate-field — AI-generate a single CMS block config field */
    generateCmsField: builder.mutation<
      ApiEnvelope<{ value: unknown; usage?: AiUsageSummary | null }>,
      {
        pageSlug: string;
        pageTitle: string;
        blockType: string;
        fieldKey: string;
        fieldPath?: string;
        fieldType?: string;
        currentConfig?: Record<string, unknown>;
        currentValue?: unknown;
      } & TenantAppScope
    >({
      query: (body) => ({
        url: 'admin/cms-generate-field',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(organizationApi.util.invalidateTags(['Credits']));
        } catch {
          // leave cache; caller surfaces error
        }
      },
    }),

    /**
     * POST /api/admin/cms-generate-dashboard-slice —
     * Regenerate actionPhases / levers / targetRows in dashboard_data.
     */
    generateDashboardSlice: builder.mutation<
      ApiEnvelope<{ slice: string; value: unknown; usage?: AiUsageSummary | null }>,
      {
        pageSlug: string;
        pageTitle: string;
        blockType: string;
        slice?: 'actionPhases' | 'levers' | 'targetRows';
        currentValue?: unknown;
        additionalContext?: string;
      } & TenantAppScope
    >({
      query: (body) => ({
        url: 'admin/cms-generate-dashboard-slice',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { dashboardApi } = await import('@/store/apis/dashboard-api');
          dispatch(dashboardApi.util.invalidateTags(['DashboardData']));
          dispatch(organizationApi.util.invalidateTags(['Credits']));
        } catch {
          // leave cache; caller surfaces error
        }
      },
    }),

    /** DELETE /api/admin/pages/[slug]/sections */
    deletePageSections: builder.mutation<
      ApiEnvelope<{ deleted: number; contentLocked: boolean }>,
      { slug: string; ids: string[] } & TenantAppScope
    >({
      query: ({ slug, ids, tenantSlug, appId }) => {
        const params = new URLSearchParams({ ids: ids.join(',') });
        if (tenantSlug) params.set('tenantSlug', tenantSlug);
        if (appId) params.set('appId', appId);
        return {
          url: `admin/pages/${encodeURIComponent(slug)}/sections?${params.toString()}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['PageSections'],
    }),

    /** POST /api/admin/app-pack/generate — start app pack generation */
    generateAppPack: builder.mutation<ApiEnvelope<{ runId: string }>, { prompt: string; mock: boolean; tenantSlug: string }>({
      query: (body) => ({
        url: 'admin/app-pack/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppPack'],
    }),
    /** GET /api/admin/app-pack/generate/status — get generation status */
    getAppPackStatus: builder.query<ApiEnvelope<{
      status: string;
      runId: string;
      error?: string;
      result?: {
        packId: string;
        name: string;
        mock: boolean;
        ceoPurpose: string;
        ceoKpis: string[];
        apps: Array<{
          appId: string;
          appName: string;
          department: string;
          w3cStandard: string;
          models: number;
          useCases: number;
          pages: number;
          knowledgeSnippets: number;
          uxStages: number;
        }>;
        counts: { apps: number; pages: number; sections: number; nav: number; snippets: number; groups: number };
        schemaApplied: boolean;
        migrationMs: number;
        zmodel: string;
      };
    }>, string>({
      query: (runId) => `admin/app-pack/generate/status?runId=${encodeURIComponent(runId)}`,
      providesTags: ['AppPack'],
    }),
    /** POST /api/admin/navigation/reconcile — dedupe, seed defaults, apply hierarchy */
    reconcileNavigation: builder.mutation<
      ApiEnvelope<{
        deleted: number;
        seeded: number;
        sheetsSynced: number;
        hierarchyUpdated: number;
        excelFolderId: string | null;
      }>,
      TenantAppScope | void
    >({
      query: (scope) => ({
        url: 'admin/navigation/reconcile',
        method: 'POST',
        body: scope ?? {},
      }),
      invalidatesTags: ['Navigation'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(navigationApi.util.invalidateTags(['Navigation']));
        } catch {
          /* reconcile failed — keep drawer cache */
        }
      },
    }),
    /** POST /api/admin/populate-sheet-pages — sync sheet pages into navigation */
    populateSheetPages: builder.mutation<ApiEnvelope<{ created: number; parentId: string; totalSheets: number }>, { parentId?: string; parentTitle?: string }>({
      query: (body) => ({
        url: 'admin/populate-sheet-pages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Navigation'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(navigationApi.util.invalidateTags(['Navigation']));
        } catch {
          // populate failed — keep drawer cache
        }
      },
    }),
  }),
});

export const {
  useListRoleConfigsQuery,
  useSetRolePinMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useListAdminConversationsQuery,
  useArchiveAdminConversationMutation,
  useListAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useCreateAdminUsersMutation,
  useListAdminGroupsQuery,
  useCreateAdminGroupMutation,
  useUpdateAdminGroupMutation,
  useClearSeedMutation,
  useGetSeedOverviewQuery,
  useLazyGetSeedOverviewQuery,
  useGetAiContentQuery,
  useGenerateAiContentMutation,
  useGetAdminBrandConfigQuery,
  useUpdateAdminBrandConfigMutation,
  useGetNavigationQuery,
  useCreateNavigationItemMutation,
  useUpdateNavigationItemsMutation,
  useDeleteNavigationItemsMutation,
  useReconcileNavigationMutation,
  useListAdminPagesQuery,
  useSetPageContentLockedMutation,
  useGetCmsSourcesQuery,
  useGetPageSectionsQuery,
  useProvisionCatalogPageMutation,
  useCreatePageSectionMutation,
  useUpdatePageSectionsMutation,
  useEnsureHeroNavRoutesMutation,
  useDeletePageSectionsMutation,
  useGenerateCmsFieldMutation,
  useGenerateDashboardSliceMutation,
  usePopulateSheetPagesMutation,
  useGenerateAppPackMutation,
  useGetAppPackStatusQuery,
} = adminApi;
