import { describe, expect, it } from 'vitest';
import {
  canAccessChatTool,
  CHAT_TOOL_REGISTRY,
  resolveAllowedChatTools,
  toolCategoriesPresent,
  type ChatToolAccessContext,
} from '@/lib/chat/chat-tool-registry';

function ctx(overrides: Partial<ChatToolAccessContext> = {}): ChatToolAccessContext {
  return {
    isAuthenticated: false,
    isPlatformAdmin: false,
    isPlatformApp: false,
    hasBillingOrg: false,
    canPurchaseCredits: false,
    ...overrides,
  };
}

function namesFor(access: ChatToolAccessContext): string[] {
  return resolveAllowedChatTools(access).map((tool) => tool.function.name);
}

describe('resolveAllowedChatTools', () => {
  it('gives anonymous callers no tools', () => {
    expect(namesFor(ctx())).toEqual([]);
  });

  it('gives signed-in users session and workbook tools including update_review_documents', () => {
    const names = namesFor(ctx({ isAuthenticated: true }));
    expect(names).toEqual([
      'new_chat_session',
      'clear_conversation',
      'close_conversation',
      'save_conversation',
      'update_review_documents',
      'list_workbook_sheets',
      'query_sheet_data',
    ]);
    expect(names).not.toContain('build_custom_template');
  });

  it('adds purchase_credits only when billing purchase is allowed', () => {
    expect(namesFor(ctx({ isAuthenticated: true, hasBillingOrg: true, canPurchaseCredits: false })))
      .not.toContain('purchase_credits');
    expect(namesFor(ctx({ isAuthenticated: true, hasBillingOrg: true, canPurchaseCredits: true })))
      .toContain('purchase_credits');
  });

  it('adds platform admin tools only on the factory app for platform admins', () => {
    const tenantAdmin = namesFor(ctx({
      isAuthenticated: true,
      isPlatformAdmin: true,
      isPlatformApp: false,
    }));
    expect(tenantAdmin).toContain('build_custom_template');
    expect(tenantAdmin).not.toContain('query_platform_registry');

    const factoryAdmin = namesFor(ctx({
      isAuthenticated: true,
      isPlatformAdmin: true,
      isPlatformApp: true,
    }));
    expect(factoryAdmin).toContain('build_custom_template');
    expect(factoryAdmin).toContain('query_platform_registry');
    expect(factoryAdmin).toContain('query_organizations_billing');
    expect(factoryAdmin).toContain('query_vercel_inventory');
  });

  it('never lists platform tools for a non-admin on the factory app', () => {
    const names = namesFor(ctx({
      isAuthenticated: true,
      isPlatformAdmin: false,
      isPlatformApp: true,
    }));
    expect(names).not.toContain('query_platform_registry');
    expect(names).not.toContain('build_custom_template');
  });
});

describe('canAccessChatTool', () => {
  it('respects platformAppOnly even for platform admins', () => {
    const platformTool = CHAT_TOOL_REGISTRY.find((tool) => tool.name === 'query_vercel_inventory')!;
    expect(canAccessChatTool(platformTool, ctx({ isPlatformAdmin: true, isPlatformApp: false })))
      .toBe(false);
    expect(canAccessChatTool(platformTool, ctx({ isPlatformAdmin: true, isPlatformApp: true })))
      .toBe(true);
  });
});

describe('toolCategoriesPresent', () => {
  it('flags categories from the allowed tool set', () => {
    const tools = resolveAllowedChatTools(ctx({
      isAuthenticated: true,
      isPlatformAdmin: true,
      isPlatformApp: true,
      hasBillingOrg: true,
      canPurchaseCredits: true,
    }));
    expect(toolCategoriesPresent(tools)).toEqual({
      session: true,
      billing: true,
      platform: true,
      workbook: true,
    });
  });

  it('flags workbook when only sheet tools are allowed', () => {
    const tools = resolveAllowedChatTools(ctx({ isAuthenticated: true }));
    const sheetOnly = tools.filter((t) =>
      t.function.name === 'list_workbook_sheets' || t.function.name === 'query_sheet_data',
    );
    expect(toolCategoriesPresent(sheetOnly)).toEqual({
      session: false,
      billing: false,
      platform: false,
      workbook: true,
    });
  });

  it('is empty when no tools are allowed', () => {
    // Force an empty list by filtering to a name that will not match — use [].
    expect(toolCategoriesPresent([])).toEqual({
      session: false,
      billing: false,
      platform: false,
      workbook: false,
    });
  });
});
