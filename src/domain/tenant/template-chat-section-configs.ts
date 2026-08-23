/**
 * Default `chat_panel` section configs for built-in templates.
 *
 * Section-level config wins over the deploy-time NEXT_PUBLIC_CHAT_STARTER_PROMPT
 * stamp — seeding these at provisioning gives each template a tailored empty
 * state even before the first redeploy.
 */
import {
  resolveChatStarterPrompt,
  TEMPLATE_ASSISTANT_PROFILES,
} from '@/domain/tenant/template-assistant-profiles';

/** Per-template chat_panel section config (emptyStatePrompt + optional quick prompts). */
export function chatPanelSectionConfig(templateId: string): Record<string, unknown> {
  const profile = TEMPLATE_ASSISTANT_PROFILES[templateId] ?? TEMPLATE_ASSISTANT_PROFILES.default;
  const config: Record<string, unknown> = {
    emptyStatePrompt: resolveChatStarterPrompt(profile),
  };
  if (profile.suggestedPrompts?.length) {
    config.suggestedPrompts = profile.suggestedPrompts;
  }
  return config;
}

/** Dashboard page with a template-tailored chat_panel as the last section. */
export function dashboardPageWithChat(
  templateId: string,
  leadingBlocks: readonly string[] = ['hero', 'kpi_cards', 'chart_financial'],
) {
  const blockTypes = [...leadingBlocks, 'chat_panel'];
  return {
    slug: 'dashboard',
    title: 'Dashboard',
    navLabel: 'Dashboard',
    authTier: 'public' as const,
    blockTypes,
    sectionConfigs: [
      ...leadingBlocks.map(() => ({})),
      chatPanelSectionConfig(templateId),
    ],
  };
}
