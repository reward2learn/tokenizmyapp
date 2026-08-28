import { describe, expect, it } from 'vitest';
import { filterChatToolsForProvider } from '@/lib/ai-providers-catalog';
import { resolveAllowedChatTools } from '@/lib/chat/chat-tool-registry';
import { executeSheetTool } from '@/lib/chat/sheet-tools';

describe('filterChatToolsForProvider', () => {
  const signedInTools = resolveAllowedChatTools({
    isAuthenticated: true,
    isPlatformAdmin: true,
    isPlatformApp: true,
    hasBillingOrg: true,
    canPurchaseCredits: true,
  });

  it('keeps all tools for cloud providers', () => {
    const filtered = filterChatToolsForProvider(signedInTools, 'openai');
    expect(filtered.map((t) => t.function.name)).toEqual(signedInTools.map((t) => t.function.name));
  });

  it('keeps only workbook tools for deepseek-studio', () => {
    const filtered = filterChatToolsForProvider(signedInTools, 'deepseek-studio');
    expect(filtered.map((t) => t.function.name)).toEqual([
      'list_workbook_sheets',
      'query_sheet_data',
    ]);
  });

  it('keeps only workbook tools for ollama-studio', () => {
    const filtered = filterChatToolsForProvider(signedInTools, 'ollama-studio');
    expect(filtered.map((t) => t.function.name)).toEqual([
      'list_workbook_sheets',
      'query_sheet_data',
    ]);
  });
});

describe('executeSheetTool', () => {
  it('requires authentication', async () => {
    const message = await executeSheetTool('list_workbook_sheets', '{}', {
      db: { knowledgeSnippet: { findUnique: async () => null } },
      isAuthenticated: false,
    });
    expect(message).toContain('signed-in');
  });

  it('rejects invalid JSON args', async () => {
    const message = await executeSheetTool('query_sheet_data', '{bad', {
      db: { knowledgeSnippet: { findUnique: async () => null } },
      isAuthenticated: true,
    });
    expect(message).toContain('invalid JSON');
  });

  it('requires sheet name for query_sheet_data', async () => {
    const message = await executeSheetTool('query_sheet_data', '{}', {
      db: { knowledgeSnippet: { findUnique: async () => null } },
      isAuthenticated: true,
    });
    expect(message).toContain('requires a "sheet"');
  });
});
