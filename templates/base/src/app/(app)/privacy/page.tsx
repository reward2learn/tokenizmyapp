/**
 * Public Privacy Policy page.
 * Reads from ContentPage DB (slug: "privacy"); falls back to legal/privacy-policy.html.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { AuthGate } from '@/components/auth/auth-gate';
import { createClient } from '@/lib/db';
import { ContentPageService } from '@/domain/content/content-page-service';

export const dynamic = 'force-dynamic';

interface ResolvedContent {
  title: string;
  body: string;
}

function readLegalFallback(): ResolvedContent {
  try {
    const path = resolve(process.cwd(), 'legal', 'privacy-policy.html');
    if (!existsSync(path)) return { title: 'Privacy Policy', body: '<p>Content not available.</p>' };
    const html = readFileSync(path, 'utf8');
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'Privacy Policy';
    const body = articleMatch ? articleMatch[1].trim() : html;
    return { title, body };
  } catch {
    return { title: 'Privacy Policy', body: '<p>Content not available.</p>' };
  }
}

async function resolvePrivacyContent(): Promise<ResolvedContent> {
  try {
    const db = createClient();
    const service = new ContentPageService(db);
    const page = await service.getBySlug('privacy');
    if (page && page.isPublished) {
      return { title: page.title, body: page.body };
    }
  } catch {
    // DB unavailable — fall back to bundled HTML
  }
  return readLegalFallback();
}

export default async function PrivacyPage() {
  const { title, body } = await resolvePrivacyContent();

  return (
    <AuthGate requiredTier="public">
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px' }}>
        <article
          dangerouslySetInnerHTML={{ __html: body }}
          style={{ lineHeight: 1.7 }}
          data-page-title={title}
        />
      </main>
    </AuthGate>
  );
}
