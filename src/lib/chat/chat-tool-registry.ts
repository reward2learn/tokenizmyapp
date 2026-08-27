/**
 * Chat tool registry — which OpenAI function tools the model may see.
 *
 * The provider receives only tools the current viewer is allowed to use.
 * `tool_choice: 'auto'` then lets the model pick from that list based on the
 * prompt. Privileged tools are omitted entirely for unauthorized callers —
 * not merely refused at execute time.
 */
import {
  CHAT_SESSION_OPENAI_TOOLS,
  PURCHASE_CREDITS_OPENAI_TOOL,
} from '@/lib/chat/session-tools';
import { PLATFORM_OPENAI_TOOLS } from '@/lib/chat/platform-tools';

export type OpenAiFunctionTool = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

/**
 * Access gate for a registered tool.
 *
 * - `public` — any chat caller (including anonymous); UI session actions only.
 * - `authenticated` — signed-in session (pin or Google) required.
 * - `platformAdmin` — verified platform administrator.
 * - `billingPurchase` — org may buy credit packs (plan + self-serve / factory).
 */
export type ChatToolAccessRequirement =
  | 'public'
  | 'authenticated'
  | 'platformAdmin'
  | 'billingPurchase';

export type ChatToolCategory = 'session' | 'billing' | 'platform';

export interface ChatToolAccessContext {
  /** True when a verified session cookie/JWT is present. */
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  isPlatformApp: boolean;
  /** Org exists on the billing control plane. */
  hasBillingOrg: boolean;
  /** Plan + self-serve flags allow credit pack purchase. */
  canPurchaseCredits: boolean;
}

export interface RegisteredChatTool {
  name: string;
  category: ChatToolCategory;
  access: ChatToolAccessRequirement;
  /** Only registered on the tokenizmyapp control-plane app. */
  platformAppOnly?: boolean;
  openAiTool: OpenAiFunctionTool;
}

function toolByName(name: string): OpenAiFunctionTool {
  const fromSession = CHAT_SESSION_OPENAI_TOOLS.find((tool) => tool.function.name === name);
  if (fromSession) return fromSession as OpenAiFunctionTool;
  const fromPlatform = PLATFORM_OPENAI_TOOLS.find((tool) => tool.function.name === name);
  if (fromPlatform) return fromPlatform as OpenAiFunctionTool;
  throw new Error(`Unknown chat tool: ${name}`);
}

/**
 * Canonical registry. Order is stable for prompt caching / diffs.
 * Schemas live in session-tools / platform-tools; access lives here.
 */
export const CHAT_TOOL_REGISTRY: RegisteredChatTool[] = [
  {
    name: 'new_chat_session',
    category: 'session',
    access: 'authenticated',
    openAiTool: toolByName('new_chat_session'),
  },
  {
    name: 'clear_conversation',
    category: 'session',
    access: 'authenticated',
    openAiTool: toolByName('clear_conversation'),
  },
  {
    name: 'close_conversation',
    category: 'session',
    access: 'authenticated',
    openAiTool: toolByName('close_conversation'),
  },
  {
    name: 'save_conversation',
    category: 'session',
    access: 'authenticated',
    openAiTool: toolByName('save_conversation'),
  },
  {
    name: 'update_review_documents',
    category: 'session',
    access: 'authenticated',
    openAiTool: toolByName('update_review_documents'),
  },
  {
    name: 'build_custom_template',
    category: 'session',
    access: 'platformAdmin',
    openAiTool: toolByName('build_custom_template'),
  },
  {
    name: 'purchase_credits',
    category: 'billing',
    access: 'billingPurchase',
    openAiTool: PURCHASE_CREDITS_OPENAI_TOOL as OpenAiFunctionTool,
  },
  {
    name: 'query_platform_registry',
    category: 'platform',
    access: 'platformAdmin',
    platformAppOnly: true,
    openAiTool: toolByName('query_platform_registry'),
  },
  {
    name: 'query_organizations_billing',
    category: 'platform',
    access: 'platformAdmin',
    platformAppOnly: true,
    openAiTool: toolByName('query_organizations_billing'),
  },
  {
    name: 'query_vercel_inventory',
    category: 'platform',
    access: 'platformAdmin',
    platformAppOnly: true,
    openAiTool: toolByName('query_vercel_inventory'),
  },
];

/**
 * Whether the current viewer may see and invoke this tool.
 *
 * Extend this switch when adding capability-scoped tools (e.g. `financials:write`).
 * Session UI tools require a signed-in session (`authenticated`).
 */
export function canAccessChatTool(
  tool: RegisteredChatTool,
  ctx: ChatToolAccessContext,
): boolean {
  if (tool.platformAppOnly && !ctx.isPlatformApp) return false;

  switch (tool.access) {
    case 'public':
      return true;
    case 'authenticated':
      return ctx.isAuthenticated;
    case 'platformAdmin':
      return ctx.isPlatformAdmin;
    case 'billingPurchase':
      return ctx.hasBillingOrg && ctx.canPurchaseCredits;
    default: {
      const _exhaustive: never = tool.access;
      return _exhaustive;
    }
  }
}

/** OpenAI `tools` payload for the completions request — access-filtered. */
export function resolveAllowedChatTools(ctx: ChatToolAccessContext): OpenAiFunctionTool[] {
  return CHAT_TOOL_REGISTRY
    .filter((tool) => canAccessChatTool(tool, ctx))
    .map((tool) => tool.openAiTool);
}

export function resolveAllowedToolNames(ctx: ChatToolAccessContext): Set<string> {
  return new Set(resolveAllowedChatTools(ctx).map((tool) => tool.function.name));
}

export function toolCategoriesPresent(tools: OpenAiFunctionTool[]): {
  session: boolean;
  billing: boolean;
  platform: boolean;
} {
  const names = new Set(tools.map((tool) => tool.function.name));
  const categories = { session: false, billing: false, platform: false };
  for (const registered of CHAT_TOOL_REGISTRY) {
    if (!names.has(registered.name)) continue;
    categories[registered.category] = true;
  }
  return categories;
}
