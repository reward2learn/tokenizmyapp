import { NextResponse } from 'next/server';
import { createClient, createClientForUrl } from '@/lib/db';
import { requireWriteAuth, requireRead, requireWrite } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureConversationsColumns } from '@/lib/db-migrate';
import { resolveDedicatedTenantDbUrl } from '@/domain/tenant/tenant-db-resolver';

export const maxDuration = 30;

let conversationsEnsured: Promise<boolean> | null = null;
function ensureConversationsOnce(): Promise<boolean> {
  if (!conversationsEnsured) {
    conversationsEnsured = ensureConversationsColumns(createClient()).catch((err) => {
      conversationsEnsured = null;
      throw err;
    });
  }
  return conversationsEnsured;
}

export interface AdminConversationView {
  id: number;
  user_name: string;
  owner_sub: string | null;
  title: string;
  message_count: number;
  archived: boolean;
  created_at: string;
  tenant_slug: string | null;
  app_id: string | null;
}

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireRead('conversations', request);
  if (!groupGuard.ok) return jsonError('Requires conversations:read', 403);

  const url = new URL(request.url);
  const includeArchived = url.searchParams.get('archived') === 'true';
  const owner = url.searchParams.get('owner');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100', 10), 200);
  // Cross-tenant browsing is a platform-admin-only capability; ignored for
  // any other caller with plain conversations:read.
  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);
  const tenantSlug = isPlatformAdmin ? url.searchParams.get('tenantSlug') : null;
  const appId = isPlatformAdmin ? url.searchParams.get('appId') : null;

  // Conversations are written by the live tenant app itself (see
  // /api/chat/route.ts) using its own POSTGRES_URL — a tenant with a
  // dedicated database must be read there, not the platform root DB.
  const dbUrl = await resolveDedicatedTenantDbUrl(tenantSlug, appId);

  let db;
  try {
    db = dbUrl
      ? createClientForUrl(dbUrl, { tier: guard.session.tier, sub: guard.session.sub })
      : createClient({ tier: guard.session.tier, sub: guard.session.sub });
  } catch {
    return jsonError('Database unavailable', 503);
  }

  try {
    // Self-healing — a tenant's dedicated DB may predate the tenant_slug/
    // app_id columns (only added by a Seed/Sync action, or here). The root
    // DB's ensure is cached process-wide since every request shares it; a
    // dedicated client is fresh per-request, so it's cheap to just run it.
    if (dbUrl) {
      await ensureConversationsColumns(db);
    } else {
      await ensureConversationsOnce();
    }
  } catch {
    // Best-effort column ensure.
  }

  try {
    const rows = await db.conversation.findMany({
      where: {
        ...(includeArchived ? {} : { archived: false }),
        ...(owner ? { ownerSub: owner } : {}),
        ...(tenantSlug ? { tenantSlug } : {}),
        ...(appId ? { appId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userName: true,
        ownerSub: true,
        title: true,
        messageCount: true,
        archived: true,
        createdAt: true,
        tenantSlug: true,
        appId: true,
      },
    });

    const conversations: AdminConversationView[] = rows.map((r) => ({
      id: r.id,
      user_name: r.userName,
      owner_sub: r.ownerSub,
      title: r.title,
      message_count: r.messageCount,
      archived: r.archived,
      created_at: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      tenant_slug: r.tenantSlug,
      app_id: r.appId,
    }));

    return jsonOk({ conversations });
  } catch (err) {
    console.error('[admin/conversations] GET error:', err);
    return jsonError('Failed to load conversations', 500);
  } finally {
    if (dbUrl) await db.$disconnect();
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireWrite('conversations', request);
  if (!groupGuard.ok) return jsonError('Requires conversations:write', 403);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const numId = id ? parseInt(id, 10) : NaN;
  if (!id || Number.isNaN(numId)) return jsonError('Invalid id', 400);

  const archiveParam = url.searchParams.get('archived');
  if (archiveParam !== 'true' && archiveParam !== 'false') {
    return jsonError('archived=true|false is required', 400);
  }
  const archived = archiveParam === 'true';

  // Cross-tenant browsing is a platform-admin-only capability; ignored for
  // any other caller with plain conversations:write.
  const isPlatformAdmin = sessionIsPlatformAdmin(guard.session);
  const tenantSlug = isPlatformAdmin ? url.searchParams.get('tenantSlug') : null;
  const appId = isPlatformAdmin ? url.searchParams.get('appId') : null;
  // ids are per-database SERIAL sequences, so the right database must be
  // targeted explicitly — see GET above.
  const dbUrl = await resolveDedicatedTenantDbUrl(tenantSlug, appId);

  let db;
  try {
    db = dbUrl
      ? createClientForUrl(dbUrl, { tier: guard.session.tier, sub: guard.session.sub })
      : createClient({ tier: guard.session.tier, sub: guard.session.sub });
  } catch {
    return jsonError('Database unavailable', 503);
  }

  try {
    if (dbUrl) {
      await ensureConversationsColumns(db);
    } else {
      await ensureConversationsOnce();
    }
  } catch {
    // Best-effort column ensure.
  }

  try {
    const existing = await db.conversation.findUnique({ where: { id: numId } });
    if (!existing) return jsonError('Conversation not found', 404);

    const updated = await db.conversation.update({
      where: { id: numId },
      data: { archived },
    });

    return jsonOk({ id: updated.id, archived: updated.archived });
  } finally {
    if (dbUrl) await db.$disconnect();
  }
}
