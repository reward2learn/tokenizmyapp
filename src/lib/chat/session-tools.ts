import type { DbClient } from '@/lib/db';
import { sanitizeConversationMessages, type ConversationMessageInput } from '@/lib/chat/conversation-messages';

export type ChatSessionAction =
  | 'new_chat_session'
  | 'clear_conversation'
  | 'close_conversation'
  | 'save_conversation'
  | 'update_review_documents'
  | 'build_custom_template';

export const CHAT_SESSION_ACTIONS: ChatSessionAction[] = [
  'new_chat_session',
  'clear_conversation',
  'close_conversation',
  'save_conversation',
  'update_review_documents',
  'build_custom_template',
];

/**
 * Tools an administrator can pick explicitly from the chat composer.
 *
 * Distinct from ChatSessionAction: those mirror UI buttons and are inferred
 * from the message text. A composer tool is chosen deliberately and is passed
 * to the chat route as `activeTool`, which attaches the tool regardless of how
 * the message happens to be phrased.
 */
export type ChatComposerTool = 'build_custom_template';

export interface ChatComposerToolDef {
  id: ChatComposerTool;
  label: string;
  /** Shown under the label in the picker — one line, concrete. */
  description: string;
  /** Placeholder swapped into the composer while the tool is active. */
  placeholder: string;
  /**
   * Restrict to the platform admin console.
   *
   * Two conditions, both required: the viewer is a platform admin, and they are
   * on an `/admin` route. The admin check is the security boundary — it is
   * enforced server-side in executeSessionTool and cannot be bypassed by a
   * crafted request. The route check is scope: this tool writes platform-level
   * configuration that has nothing to do with the tenant app a user is looking
   * at, so offering it from a tenant dashboard invites confusion about what is
   * being changed and for whom.
   */
  adminOnly?: boolean;
}

export const CHAT_COMPOSER_TOOLS: ChatComposerToolDef[] = [
  {
    id: 'build_custom_template',
    label: 'Custom Template Build',
    description: 'Generate a reusable app template from a website or written requirements.',
    placeholder: 'Describe the app template — paste a website URL or the requirements…',
    adminOnly: true,
  },
];

/** Composer tools offered on this surface. */
export function availableComposerTools(options: {
  isPlatformAdmin: boolean;
  isAdminRoute: boolean;
}): ChatComposerToolDef[] {
  return CHAT_COMPOSER_TOOLS.filter(
    (tool) => !tool.adminOnly || (options.isPlatformAdmin && options.isAdminRoute),
  );
}

export function isChatSessionAction(value: unknown): value is ChatSessionAction {
  return typeof value === 'string' && (CHAT_SESSION_ACTIONS as readonly string[]).includes(value);
}

export function isClientClearSessionAction(action: ChatSessionAction): boolean {
  return action === 'new_chat_session'
    || action === 'clear_conversation'
    || action === 'close_conversation';
}

const EXPLICIT_SESSION_REQUEST_PATTERN = /\b(new chat|fresh chat|start over|start fresh|clear(?: the)?(?: chat| conversation)|close(?: the)? conversation|save(?: this)?(?: chat| conversation)|save conversation|update(?: the)?(?: review|documents?|business review)|save to review|update review)\b/i;

/** Only attach session tools when the user is clearly asking to manage the chat UI. */
export function isExplicitSessionRequest(message: string): boolean {
  return EXPLICIT_SESSION_REQUEST_PATTERN.test(message.trim());
}

export const CHAT_SESSION_TOOL_INSTRUCTIONS = `You can manage the active chat session with tools that mirror the chat UI buttons.
Only call a session tool when the user explicitly asks to start a new chat, clear the chat, close the conversation, or save the conversation.
Never call session tools for business questions, metrics, revenue, operations, or general knowledge requests.
When a session tool is appropriate, call the matching tool before confirming the action in your reply.

To build a reusable app template ("Custom Template Build"):
- Available only to platform administrators in the admin console. If it is not available, say so
  plainly rather than attempting the call.
- GATHER THE DETAILS FIRST. Generating costs credits and takes up to a minute, so do not call the
  tool on a one-line request. Before calling, you need all four of:
    1. What the business does — the industry and what it sells or provides.
    2. Who uses the app — staff only, customers only, or both. This decides which pages are
       public, which are staff-only (pin) and which are owner-only (google).
    3. The two or three things they most need to track or manage day to day.
    4. The source: a web address to model on, pasted requirements, or neither.
  Ask for whatever is missing in ONE short message — a numbered list, not an interrogation over
  several turns. If the administrator declines to answer, proceed with what you have.
- Then call "build_custom_template" with everything folded into "brief" — the brief is the entire
  design input, so write it as a paragraph covering all four points, not as an echo of their words.
- Set sourceKind "url" plus the url when they gave you a site, "knowledge" plus knowledgeContent
  when they pasted requirements, otherwise "prompt".
- Only set web3Wallet true when the business genuinely involves tokens, NFTs, crypto payments or
  on-chain memberships. Do not enable it speculatively. The wallet is Reown AppKit with Google,
  Apple and email sign-in — users never handle a seed phrase.
- The tool DESIGNS the template but does NOT save it. The administrator reviews the result and
  presses "Save & Create Template" to add it to the platform library. Never claim it has been
  created, added or saved — say it is ready for review and name the button.
- Once saved it becomes selectable in the "Create New App" wizard for any tenant.

To update the Business Review and Executive Summary with insights from your conversation:
- When the user says something like "update the review" or "save this to the review" or provides substantive new financial/operational information, call the "update_review_documents" tool.
- Include a brief summary of the key changes or new information to incorporate.`;

export const CHAT_SESSION_OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'new_chat_session',
      description: 'Start a fresh chat session and clear the current conversation from the UI.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'clear_conversation',
      description: 'Clear all messages in the current chat without saving.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'close_conversation',
      description: 'Close the current conversation session and clear the chat.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'save_conversation',
      description: 'Save the current conversation to saved conversations.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Optional short title for the saved conversation',
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_review_documents',
      description: 'Update the Business Review and Executive Summary documents with insights, corrections, or new information from the current conversation.',
      parameters: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: 'Brief summary of the key updates, new data, or corrections to incorporate into the Business Review and Executive Summary.',
          },
        },
        required: ['summary'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'build_custom_template',
      description:
        'Design a reusable custom app template from a web address or written requirements. Returns a draft for the administrator to review — it is NOT saved until they confirm.',
      parameters: {
        type: 'object',
        properties: {
          brief: {
            type: 'string',
            description:
              'The full design input, as a paragraph: what the business does, who uses the app '
              + '(staff, customers or both), and the two or three things they most need to track. '
              + 'This is the only description the designer sees — do not send a bare phrase.',
          },
          sourceKind: {
            type: 'string',
            enum: ['url', 'knowledge', 'prompt'],
            description: 'Where the source material comes from: a website, pasted knowledge content, or the brief alone.',
          },
          url: {
            type: 'string',
            description: 'Website to model the template on. Required when sourceKind is "url".',
          },
          knowledgeContent: {
            type: 'string',
            description: 'Written requirements or knowledge-base content. Required when sourceKind is "knowledge".',
          },
          web3Wallet: {
            type: 'boolean',
            description: 'Force the Reown social wallet (Google/Apple/email sign-in) on or off. Omit to let the design decide (defaults to off).',
          },
        },
        required: ['brief', 'sourceKind'],
        additionalProperties: false,
      },
    },
  },
];

export interface SessionToolContext {
  db: DbClient;
  userName: string;
  messages: ConversationMessageInput[];
  /**
   * Signed-in viewer's email. Session tools that spend the platform AI key
   * gate on credits, so they need the same identity the chat route used —
   * otherwise an exempt operator passes the route's gate and is stopped here.
   */
  viewerEmail?: string | null;
  /**
   * Whether the viewer is a platform administrator.
   *
   * The security boundary for `adminOnly` tools. Derived from the verified
   * session in the chat route, never from anything the client sends.
   */
  isPlatformAdmin?: boolean;
}

/**
 * A generated-but-unsaved template, handed to the client for confirmation.
 *
 * The tool used to generate AND store in one step, so a chat turn silently
 * added platform configuration that the administrator had not yet seen. Since
 * generation costs credits, re-running it to "preview then confirm" would
 * charge twice and could return a different template the second time — so the
 * draft itself travels to the client and comes back on save.
 *
 * Carries everything `saveCustomTemplate` needs, so the save endpoint stores
 * without touching an AI provider.
 */
export interface CustomTemplateDraft {
  label: string;
  description: string;
  icon: string;
  templateType: 'single' | 'suite';
  /** Full TemplateDefinition — kept opaque here to avoid a domain import. */
  definition: Record<string, unknown>;
  capabilities: Record<string, unknown>;
  sourceKind: 'url' | 'knowledge' | 'prompt';
  sourceRef: string | null;
  prompt: string;
  /** Page titles, for the confirmation card. */
  pageTitles: string[];
  /** One line on why the design came out this way — shown for review. */
  rationale: string | null;
  walletSummary: string;
}

export interface SessionToolResult {
  toolMessage: string;
  clientAction?: ChatSessionAction;
  /** Set by build_custom_template — rendered as a confirmation card. */
  templateDraft?: CustomTemplateDraft;
}

export async function executeSessionTool(
  toolName: string,
  rawArgs: string,
  ctx: SessionToolContext,
): Promise<SessionToolResult> {
  let args: Record<string, unknown> = {};
  if (rawArgs.trim()) {
    try {
      args = JSON.parse(rawArgs) as Record<string, unknown>;
    } catch {
      return { toolMessage: 'Tool arguments were invalid JSON.' };
    }
  }

  switch (toolName) {
    case 'new_chat_session':
      return {
        toolMessage: 'Started a new chat session.',
        clientAction: 'new_chat_session',
      };
    case 'clear_conversation':
      return {
        toolMessage: 'Cleared the current conversation.',
        clientAction: 'clear_conversation',
      };
    case 'close_conversation':
      return {
        toolMessage: 'Closed the current conversation.',
        clientAction: 'close_conversation',
      };
    case 'save_conversation': {
      if (!ctx.messages.length) {
        return { toolMessage: 'There is nothing to save yet.' };
      }

      const messages = sanitizeConversationMessages(ctx.messages);
      const firstUser = messages.find((msg) => msg.role === 'user')?.content ?? 'Chat Conversation';
      const title = typeof args.title === 'string' && args.title.trim()
        ? args.title.trim().slice(0, 200)
        : firstUser.slice(0, 80);

      const saved = await ctx.db.conversation.create({
        data: {
          userName: ctx.userName,
          title,
          messages: messages as object[],
          messageCount: messages.length,
        },
      });

      return {
        toolMessage: `Conversation saved (id ${saved.id}).`,
        clientAction: 'save_conversation',
      };
    }
    case 'build_custom_template': {
      // Security boundary for the adminOnly tool. The composer already hides it
      // outside /admin, but that is presentation — a crafted request can set
      // activeTool freely, and this writes platform-level configuration and
      // spends the platform AI key.
      if (!ctx.isPlatformAdmin) {
        return {
          toolMessage:
            'Building app templates is restricted to platform administrators in the admin console. ' +
            'Tell the user this action is not available here.',
        };
      }

      const brief = typeof args.brief === 'string' ? args.brief.trim() : '';
      if (!brief) {
        return { toolMessage: 'A brief is required — describe the kind of app the template should build.' };
      }

      // The brief is the entire input to the design. A three-word brief produces
      // a template that could describe any business, so ask rather than generate
      // something the administrator will discard — generation costs credits and
      // takes a scrape plus a model round-trip.
      if (brief.length < 25) {
        return {
          toolMessage:
            'The brief is too thin to design from. Ask the administrator for: what the business does, ' +
            'who uses the app (staff, customers, or both), and the two or three things they most need ' +
            'to track. Then call this tool again.',
        };
      }

      const sourceKind = args.sourceKind === 'url' || args.sourceKind === 'knowledge'
        ? args.sourceKind
        : 'prompt';
      const url = typeof args.url === 'string' ? args.url.trim() : undefined;
      const knowledgeContent = typeof args.knowledgeContent === 'string' ? args.knowledgeContent : undefined;

      if (sourceKind === 'url' && !url) {
        return { toolMessage: 'Ask the administrator for the web address to model the template on.' };
      }
      if (sourceKind === 'knowledge' && !knowledgeContent?.trim()) {
        return { toolMessage: 'Ask the administrator to paste the requirements or knowledge content.' };
      }

      // Imported lazily: the generator reaches the AI provider and the platform
      // root DB, neither of which should load for an ordinary chat turn.
      const [{ generateCustomTemplate }, credits] = await Promise.all([
        import('@/domain/tenant/custom-template-generator'),
        import('@/domain/billing/credit-service'),
      ]);

      // Same pre-flight gate as POST /api/admin/custom-templates. The tool
      // calls the generator directly rather than going through the route, so
      // without this the chat path would be an unmetered way to spend the
      // platform key. Reported as a message, not a 402 — the caller is the
      // model, and it needs something to say to the administrator.
      const gate = await credits.requireCreditsForOrg(
        await credits.resolvePlatformOrgId(),
        undefined,
        credits.CREDIT_FLOORS.templateGeneration,
        ctx.viewerEmail,
      );
      if (!gate.ok) {
        return {
          toolMessage:
            'Cannot build a template: this organization has no AI credits remaining. ' +
            'Tell the administrator to upgrade the plan or add credits.',
        };
      }

      try {
        const generated = await generateCustomTemplate({
          brief,
          sourceKind,
          url,
          knowledgeContent,
          web3WalletOverride: typeof args.web3Wallet === 'boolean' ? { enabled: args.web3Wallet } : undefined,
          viewerEmail: ctx.viewerEmail,
        });

        const wallet = generated.capabilities.web3Wallet;
        const pageTitles = generated.definition.defaultPages.map((p) => p.title);
        const walletSummary = wallet?.enabled
          ? `Reown wallet enabled — ${wallet.connectMode} sign-in via ${[
              ...wallet.socialProviders,
              ...(wallet.emailLogin ? ['email'] : []),
            ].join('/') || 'wallet extension'}, chains ${wallet.chains.join(', ')}.`
          : 'Web3 wallet not enabled.';

        // Deliberately NOT stored here. Storing on generation meant a chat turn
        // silently added platform configuration the administrator had not seen,
        // and left no way to reject a bad design short of deleting it
        // afterwards. The draft goes to the client for review; "Save & Create
        // Template" persists it without regenerating (and without spending
        // credits a second time).
        return {
          toolMessage: [
            `Designed a template: "${generated.definition.label}".`,
            `${generated.definition.description}`,
            `Pages: ${pageTitles.join(', ')}.`,
            walletSummary,
            'It has NOT been saved yet — tell the administrator to review it and press',
            '"Save & Create Template" to add it to the platform template library.',
          ].join(' '),
          clientAction: 'build_custom_template',
          templateDraft: {
            label: generated.definition.label,
            description: generated.definition.description,
            icon: generated.definition.icon,
            templateType: generated.definition.templateType,
            definition: generated.definition as unknown as Record<string, unknown>,
            capabilities: generated.capabilities as unknown as Record<string, unknown>,
            sourceKind,
            sourceRef: generated.sourceRef,
            prompt: brief,
            pageTitles,
            rationale: generated.rationale,
            walletSummary,
          },
        };
      } catch (err) {
        return { toolMessage: `Could not build the template: ${(err as Error).message}` };
      }
    }
    case 'update_review_documents': {
      const summary = typeof args.summary === 'string' ? args.summary.trim() : '';
      if (!summary) {
        return { toolMessage: 'Please provide a summary of what to update in the review.' };
      }

      try {
        const res = await fetch('/api/chat/update-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: ctx.messages, summary }),
        });
        const payload = await res.json();
        if (payload.success) {
          return {
            toolMessage: `✅ Business Review and Executive Summary updated based on our conversation. ${payload.data.partsUpdated} review part(s) updated.`,
            clientAction: 'update_review_documents',
          };
        }
        return { toolMessage: `Failed to update: ${payload.error ?? 'Unknown error'}` };
      } catch (err) {
        return { toolMessage: `Error updating review: ${err instanceof Error ? err.message : String(err)}` };
      }
    }
    default:
      return { toolMessage: `Unknown session tool: ${toolName}` };
  }
}
