/**
 * Default functional roles per built-in template.
 *
 * Roles are a display-name catalog (code + name) — not tied to a specific person.
 * Provisioning seeds these into each tenant's `roles` table so task assignment,
 * PIN auth, and admin UI reflect the app's industry rather than one nightclub's org chart.
 */
import type { TemplateDefinition, TemplateRole } from '@/domain/tenant/template-catalog';

/** Minimal roles when a template does not declare its own. */
export const GENERIC_DEFAULT_ROLES: TemplateRole[] = [
  { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
  { code: 'manager', name: 'Manager' },
  { code: 'finance', name: 'Finance' },
  { code: 'operations', name: 'Operations' },
];

export const TEMPLATE_DEFAULT_ROLES: Record<string, TemplateRole[]> = {
  'financial-analytics': [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'finance', name: 'Finance' },
    { code: 'ceo', name: 'CEO / Owner' },
    { code: 'operations', name: 'Operations' },
    { code: 'compliance', name: 'Compliance / Legal' },
  ],
  restaurant: [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'General Manager' },
    { code: 'finance', name: 'Finance' },
    { code: 'kitchen', name: 'Kitchen / Chef' },
    { code: 'front-of-house', name: 'Front of House' },
  ],
  hotel: [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'General Manager' },
    { code: 'finance', name: 'Finance' },
    { code: 'front-desk', name: 'Front Desk' },
    { code: 'housekeeping', name: 'Housekeeping' },
  ],
  'ecommerce-retail': [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'Store Manager' },
    { code: 'finance', name: 'Finance' },
    { code: 'inventory', name: 'Inventory' },
    { code: 'customer-service', name: 'Customer Service' },
  ],
  healthcare: [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'Practice Manager' },
    { code: 'finance', name: 'Finance / Billing' },
    { code: 'clinical', name: 'Clinical Staff' },
    { code: 'administration', name: 'Administration' },
  ],
  'supply-chain': [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'Operations Manager' },
    { code: 'finance', name: 'Finance' },
    { code: 'logistics', name: 'Logistics' },
    { code: 'warehouse', name: 'Warehouse' },
  ],
  'real-estate': [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'Portfolio Manager' },
    { code: 'finance', name: 'Finance' },
    { code: 'leasing', name: 'Leasing' },
    { code: 'maintenance', name: 'Maintenance' },
  ],
  education: [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'Program Director' },
    { code: 'finance', name: 'Finance' },
    { code: 'instructor', name: 'Instructor' },
    { code: 'administration', name: 'Administration' },
  ],
  'professional-services': [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'Practice Lead' },
    { code: 'finance', name: 'Finance' },
    { code: 'delivery', name: 'Project Delivery' },
    { code: 'sales', name: 'Sales / Client Relations' },
  ],
  manufacturing: [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'Plant Manager' },
    { code: 'finance', name: 'Finance' },
    { code: 'production', name: 'Production' },
    { code: 'quality', name: 'Quality' },
  ],
  'spas-and-wellness': [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'manager', name: 'Spa Manager' },
    { code: 'finance', name: 'Finance' },
    { code: 'therapist', name: 'Therapist' },
    { code: 'reception', name: 'Reception' },
  ],
  'platform-admin': [
    { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
    { code: 'operations', name: 'Platform Operations' },
    { code: 'support', name: 'Support' },
  ],
  default: GENERIC_DEFAULT_ROLES,
};

/** Roles to seed for a template — prefers explicit template.defaultRoles, then catalog map. */
export function resolveTemplateRoles(template: TemplateDefinition): TemplateRole[] {
  if (template.defaultRoles?.length) return template.defaultRoles;
  const authored = TEMPLATE_DEFAULT_ROLES[template.id];
  if (authored) return authored;
  return GENERIC_DEFAULT_ROLES;
}
