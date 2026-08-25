/**
 * Shared Zod schemas for AI provider catalog entries — used by admin/config
 * ai-provider routes and create-tenant seed payloads.
 */
import { z } from 'zod';

const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith('https://'), { message: 'URL must use https' });

const secretName = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[A-Z][A-Z0-9_]*$/, 'Must be an UPPER_SNAKE_CASE secret/env name');

const providerIdSlug = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'Provider id must be a lowercase slug');

export const aiProviderDefSchema = z.object({
  id: providerIdSlug,
  label: z.string().trim().min(1).max(100),
  keySecretName: secretName,
  keyEnvVar: secretName,
  keyPlaceholder: z.string().max(200),
  chatCompletionsUrl: httpsUrl,
  modelsUrl: httpsUrl,
  modelsRequireAuth: z.boolean(),
  docsUrl: httpsUrl,
  defaultModel: z.string().trim().min(1).max(200).optional(),
});

export const aiProvidersCatalogSchema = z
  .array(aiProviderDefSchema)
  .min(1)
  .superRefine((defs, ctx) => {
    const seen = new Set<string>();
    for (let i = 0; i < defs.length; i += 1) {
      const id = defs[i].id;
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate provider id "${id}"`,
          path: [i, 'id'],
        });
      }
      seen.add(id);
    }
  });

export type AiProviderDefInput = z.infer<typeof aiProviderDefSchema>;
