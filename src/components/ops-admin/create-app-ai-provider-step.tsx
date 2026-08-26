'use client';

/**
 * Thin wrapper around TenantAiProvidersConfigStep for the Create App Wizard —
 * collects catalog + keys as local lifted state until the app DB exists.
 */
import {
  TenantAiProvidersConfigStep,
  type AiProviderWizardValue,
} from '@/components/ops-admin/tenant-ai-providers-config-step';

export type { AiProviderWizardValue };

export interface CreateAppAiProviderStepProps {
  value: AiProviderWizardValue;
  onChange: (next: AiProviderWizardValue) => void;
  tenantSlug?: string;
}

export function CreateAppAiProviderStep({ value, onChange, tenantSlug }: CreateAppAiProviderStepProps) {
  return <TenantAiProvidersConfigStep value={value} onChange={onChange} tenantSlug={tenantSlug} />;
}
