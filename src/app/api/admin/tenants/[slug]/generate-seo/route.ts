/**
 * POST /api/admin/tenants/[slug]/generate-seo
 *
 * Uses OpenAI to generate SEO metadata + app summary fields
 * (useCase, goals, benefits, functionality) for a tenant.
 */
import { z } from 'zod';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  displayName: z.string().min(1).max(200),
  template: z.string().max(100).default('default'),
  description: z.string().max(1000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) {
    return jsonError('Platform admin only', 403);
  }

  await params; // validate slug param exists (unused for now)

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const { displayName, template, description } = parsed.data;

  const systemPrompt = `You are generating metadata for a business application.
Return ONLY valid JSON — no markdown fences, no explanation.`;

  const userPrompt = `App name: ${displayName}
Template: ${template}
Description: ${description || 'N/A'}

Generate the following in JSON format:
{
  "seo": {
    "title": "SEO page title (max 60 chars, includes app name)",
    "description": "Meta description for search engines (max 160 chars)"
  },
  "useCase": "1-2 sentence description of what this app is used for",
  "goals": ["goal1", "goal2", "goal3"],
  "benefits": ["benefit1", "benefit2", "benefit3"],
  "functionality": ["feature1", "feature2", "feature3"]
}

Return ONLY valid JSON, no markdown fences.`;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    // Strip markdown fences if the model wraps them anyway
    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();

    const generated = JSON.parse(cleaned) as {
      seo?: { title?: string; description?: string };
      useCase?: string;
      goals?: string[];
      benefits?: string[];
      functionality?: string[];
    };

    return jsonOk({
      seo: {
        title: generated.seo?.title?.slice(0, 60) || '',
        description: generated.seo?.description?.slice(0, 160) || '',
      },
      useCase: generated.useCase || '',
      goals: Array.isArray(generated.goals) ? generated.goals.slice(0, 5) : [],
      benefits: Array.isArray(generated.benefits) ? generated.benefits.slice(0, 5) : [],
      functionality: Array.isArray(generated.functionality) ? generated.functionality.slice(0, 5) : [],
    });
  } catch (err) {
    console.error('[generate-seo] POST error:', err);
    return jsonError(
      err instanceof Error ? err.message : 'Failed to generate SEO metadata',
      500,
    );
  }
}
