/**
 * Template Catalog — defines available app templates with default configurations.
 *
 * 10 business sector templates derived from W3C XML Schema (XSD) standards
 * and schema.org types. Each template specifies default pages, navigation,
 * brand presets, W3C standard alignment, and schema.org structured data type.
 */

/** A single departmental app inside a suite template. */
export interface SuiteAppDefinition {
  id: string;
  name: string;
  department: string;
  summary: string;
  templateId: string;
  purpose?: string;
  kpis?: string[];
}

/**
 * Social login providers offered by the wallet.
 *
 * ⚠️ Bounded by the Reown project dashboard, not by what Reown supports.
 * AppKit renders a button for every social listed here, but the login only
 * completes for providers enabled under "Social & Email" on the Reown project.
 * Ours has Google and Apple enabled — listing X or Discord would render a
 * button that dead-ends. Widen this union only after enabling the provider in
 * the Reown dashboard.
 *
 * Email is NOT a social: Reown models it as a separate `features.email` flag,
 * so it lives on `emailLogin` below rather than in this list.
 */
export type WalletSocialProvider = 'google' | 'apple';

/**
 * Web3 wallet configuration for a template.
 *
 * "Social wallet" means the user signs in with a familiar identity (Google,
 * Apple, email) and a non-custodial wallet is derived for them — no seed
 * phrase, no extension. That is the only variant appropriate for the SMB
 * audience these templates target; `injected` is offered for tenants whose
 * users already hold wallets.
 *
 * Provider: Reown AppKit (reown.com). The shape below maps 1:1 onto
 * `createAppKit()` options so the runtime adapter is a straight translation
 * rather than an interpretation — see shared/src/lib/config/web3.ts.
 *
 * Deliberately declarative: this is stored configuration that a generated app
 * reads, not an SDK binding. Nothing here signs a transaction or holds a key,
 * and no key material is ever stored on a template. The Reown project id is
 * platform-level configuration (REOWN_PROJECT_ID), never a template field —
 * one Reown project fronts every tenant app.
 */
export interface Web3WalletConfig {
  enabled: boolean;
  /**
   * `social` — social/email login, wallet derived for the user.
   * `injected` — MetaMask and friends.
   * `both` — offer either.
   */
  connectMode: 'social' | 'injected' | 'both';
  /** Socials offered when connectMode includes `social`. Maps to AppKit `features.socials`. */
  socialProviders: WalletSocialProvider[];
  /** Offer email sign-in. Maps to AppKit `features.email`. */
  emailLogin: boolean;
  /** EVM chain ids the app targets. 1 = Ethereum, 137 = Polygon, 8453 = Base. */
  chains: number[];
  /** Show token balances in the app UI. */
  showBalances: boolean;
  /** Gate specific pages behind holding a token/NFT. */
  tokenGating: boolean;
}

/** Optional capabilities a template can switch on for apps built from it. */
export interface TemplateCapabilities {
  web3Wallet?: Web3WalletConfig;
}

/**
 * Who the AI assistant is, for apps built from this template.
 *
 * ## Why this exists
 *
 * The assistant's system prompt used to be assembled from a hardcoded corpus
 * describing one specific nightclub, plus two blocks appended unconditionally:
 * that tenant's monthly revenue targets, and answer rules instructing the model
 * to format in IDR and highlight break-even coverage. Every app built from
 * every template inherited all of it — a hotel in Europe was told to answer in
 * rupiah about a Bali venue's exit strategy.
 *
 * A template already decides an app's pages, navigation, data model and brand.
 * The assistant is part of the app, so it belongs here too: the same decision,
 * declared in the same place, rather than baked into a shared prompt file that
 * no tenant can override.
 *
 * ## Reaching the running app
 *
 * A provisioned app does not read this catalog — it runs from its own
 * deployment. The resolved profile is serialized into the `TEMPLATE_PROFILE`
 * environment variable at deploy time (see vercel-deploy-service.ts) and parsed
 * back by shared/src/lib/config/template-profile.ts. Everything here must
 * therefore be plain JSON-serializable data.
 */
export interface TemplateAssistantProfile {
  /** What the assistant *is*, e.g. "restaurant operations analyst". */
  role: string;
  /** The business domain, e.g. "restaurant and food service operations". */
  domain: string;
  /**
   * ISO 4217 code used when the assistant quotes money.
   *
   * A template-level default only — a tenant's own currency, once known, should
   * win over it. Templates that are not money-centric (education, healthcare)
   * still need a value for the occasions money does come up.
   */
  currency: string;
  /** Domain metrics the assistant should reach for first. */
  keyMetrics: string[];
  /** What the assistant can help with — drives its opening offer. */
  capabilities: string[];
  /** Replaces the old hardcoded "How You Answer" block. */
  answerStyle: string[];
}

export interface TemplateDefinition {
  id: string;
  label: string;
  description: string;
  icon: string; // MUI icon name
  templateType: 'single' | 'suite';
  /**
   * Where this template came from. Built-ins live in TEMPLATE_CATALOG below;
   * `custom` templates are AI-generated and stored in the platform root DB
   * (see custom-template-service.ts).
   */
  source?: 'builtin' | 'custom';
  capabilities?: TemplateCapabilities;
  /**
   * Persona for this template's AI assistant. Optional so an older stored
   * custom template still loads; `resolveAssistantProfile()` derives a usable
   * one from `label`/`description`/`schemaOrgType` when it is absent.
   */
  assistant?: TemplateAssistantProfile;
  defaultColors: { primary: string; secondary: string };
  defaultPages: {
    slug: string;
    title: string;
    navLabel?: string;
    authTier: 'public' | 'pin' | 'google';
    blockTypes: string[];
    /**
     * Optional per-section config, same order as `blockTypes`.
     * AI-generated custom templates fill this with headlines, FAQ items, etc.
     * Built-ins omit it — seed then stores `{ minTier }` only.
     */
    sectionConfigs?: Record<string, unknown>[];
  }[];
  defaultNavItems: {
    title: string;
    path: string;
    icon: string;
    authTier: 'public' | 'pin' | 'google';
  }[];
  /** schema.org type for JSON-LD structured data */
  schemaOrgType: string | string[];
  /** W3C XSD standard alignment */
  xsdStandard: string;

  // Suite-specific fields (only present when templateType === 'suite')
  suiteApps?: SuiteAppDefinition[];
  baseTemplateId?: string;
}

// ── Shared page definitions ─────────────────────────────

const DASHBOARD_PAGE = (blockTypes: string[] = ['hero', 'kpi_cards', 'chart_financial']) => ({
  slug: 'dashboard', title: 'Dashboard', navLabel: 'Dashboard', authTier: 'public' as const, blockTypes,
});
const SUMMARY_PAGE = {
  slug: 'summary', title: 'Executive Summary', navLabel: 'Summary', authTier: 'google' as const,
  blockTypes: ['doc_markdown'],
};
const TASKS_PAGE = {
  slug: 'tasks', title: 'Tasks', navLabel: 'Tasks', authTier: 'pin' as const,
  blockTypes: ['action_checklist'],
};
const ADMIN_PAGE = {
  slug: 'admin', title: 'Admin', navLabel: 'Admin', authTier: 'pin' as const,
  blockTypes: ['ops_admin_tabs'],
};

/** Home landing page — standard layout with hero block as the default snippet. */
const HOME_PAGE = {
  slug: 'home', title: 'Home', navLabel: 'Home', authTier: 'public' as const,
  blockTypes: ['hero'],
};
/** Home nav item — serves the '/' route and is the default landing route on initial provisioning. */
const HOME_NAV = { title: 'Home', path: '/', icon: 'Home', authTier: 'public' as const };

const BASIC_NAV = [
  { title: 'Home', path: '/', icon: 'Home', authTier: 'public' as const },
  { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' as const },
  { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' as const },
  { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' as const },
];

// ── Template Catalog (10 business sectors) ──────────────

export const TEMPLATE_CATALOG: Record<string, TemplateDefinition> = {
  // 1. Financial Analytics (reclassified from nightclub-bar)
  'financial-analytics': {
    id: 'financial-analytics',
    label: 'Financial Analytics',
    description: 'Financial performance tracking: revenue analysis, BEP modeling, P&L projections, KPI monitoring, executive reporting.',
    icon: 'Analytics',
    templateType: 'single',
    defaultColors: { primary: '#eb3d28', secondary: '#0af9fe' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      SUMMARY_PAGE,
      { slug: 'review', title: 'Business Review', navLabel: 'Review', authTier: 'google', blockTypes: ['review_blocks'] },
      TASKS_PAGE,
      { slug: 'ops-admin', title: 'Ops Admin', navLabel: 'Ops Admin', authTier: 'pin', blockTypes: ['ops_admin_tabs', 'z_report_form', 'costs_form'] },
      { slug: 'ops-tracking', title: 'Ops Tracking', navLabel: 'Ops Tracking', authTier: 'pin', blockTypes: ['kpi_cards', 'sheet_viewer'] },
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Business Review', path: '/review', icon: 'Description', authTier: 'google' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Ops Admin', path: '/ops-admin', icon: 'AdminPanelSettings', authTier: 'pin' },
      { title: 'Ops Tracking', path: '/ops-tracking', icon: 'TrackChanges', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: 'FinancialService',
    xsdStandard: 'FpML, FIXML',
  },

  // 2. Restaurant
  restaurant: {
    id: 'restaurant',
    label: 'Restaurant',
    description: 'Restaurant operations: menu management, table reservations, daily covers, food cost analysis, GoFood integration.',
    icon: 'Restaurant',
    templateType: 'single',
    defaultColors: { primary: '#2e7d32', secondary: '#ff8f00' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'menu', title: 'Menu', navLabel: 'Menu', authTier: 'public', blockTypes: ['dynamic_form'] },
      { slug: 'reservations', title: 'Reservations', navLabel: 'Reservations', authTier: 'public', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Menu', path: '/menu', icon: 'RestaurantMenu', authTier: 'public' },
      { title: 'Reservations', path: '/reservations', icon: 'EventSeat', authTier: 'public' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: 'Restaurant',
    xsdStandard: 'UBL, GS1',
  },

  // 3. Hotel & Hospitality
  hotel: {
    id: 'hotel',
    label: 'Hotel & Hospitality',
    description: 'Hotel operations: room occupancy, RevPAR, F&B outlets, event spaces, booking management.',
    icon: 'Hotel',
    templateType: 'single',
    defaultColors: { primary: '#1565c0', secondary: '#ff8f00' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'rooms', title: 'Rooms', navLabel: 'Rooms', authTier: 'public', blockTypes: ['dynamic_form'] },
      { slug: 'bookings', title: 'Bookings', navLabel: 'Bookings', authTier: 'public', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Rooms', path: '/rooms', icon: 'Hotel', authTier: 'public' },
      { title: 'Bookings', path: '/bookings', icon: 'BookOnline', authTier: 'public' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: ['Hotel', 'LodgingBusiness'],
    xsdStandard: 'OTA (OpenTravel Alliance)',
  },

  // 4. E-Commerce & Retail
  'ecommerce-retail': {
    id: 'ecommerce-retail',
    label: 'E-Commerce & Retail',
    description: 'Online store operations: product catalog, inventory management, sales orders, customer management.',
    icon: 'ShoppingCart',
    templateType: 'single',
    defaultColors: { primary: '#7b1fa2', secondary: '#00bcd4' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'products', title: 'Products', navLabel: 'Products', authTier: 'public', blockTypes: ['dynamic_form'] },
      { slug: 'orders', title: 'Orders', navLabel: 'Orders', authTier: 'pin', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Products', path: '/products', icon: 'Inventory', authTier: 'public' },
      { title: 'Orders', path: '/orders', icon: 'Receipt', authTier: 'pin' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: ['Store', 'Product'],
    xsdStandard: 'UBL (orders), Inventory Feeds',
  },

  // 5. Healthcare & Clinical
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare & Clinical',
    description: 'Healthcare operations: patient records, clinical documents, insurance claims, medical device telemetry.',
    icon: 'LocalHospital',
    templateType: 'single',
    defaultColors: { primary: '#0097a7', secondary: '#ff6f00' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'patients', title: 'Patients', navLabel: 'Patients', authTier: 'pin', blockTypes: ['dynamic_form'] },
      { slug: 'claims', title: 'Insurance Claims', navLabel: 'Claims', authTier: 'pin', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Patients', path: '/patients', icon: 'Person', authTier: 'pin' },
      { title: 'Claims', path: '/claims', icon: 'Assignment', authTier: 'pin' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: ['MedicalOrganization', 'Hospital'],
    xsdStandard: 'HL7/CDA, Claims Processing',
  },

  // 6. Supply Chain & Logistics
  'supply-chain': {
    id: 'supply-chain',
    label: 'Supply Chain & Logistics',
    description: 'Logistics operations: shipment tracking, warehouse management, carrier coordination, freight manifests.',
    icon: 'LocalShipping',
    templateType: 'single',
    defaultColors: { primary: '#37474f', secondary: '#ff9800' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'shipments', title: 'Shipments', navLabel: 'Shipments', authTier: 'pin', blockTypes: ['dynamic_form'] },
      { slug: 'warehouse', title: 'Warehouse', navLabel: 'Warehouse', authTier: 'pin', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Shipments', path: '/shipments', icon: 'LocalShipping', authTier: 'pin' },
      { title: 'Warehouse', path: '/warehouse', icon: 'Warehouse', authTier: 'pin' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: ['DeliveryEvent', 'ParcelDelivery'],
    xsdStandard: 'UBL (shipping), B2B Logistics',
  },

  // 7. Real Estate & Property
  'real-estate': {
    id: 'real-estate',
    label: 'Real Estate & Property',
    description: 'Property management: listings, tenant management, lease tracking, maintenance requests.',
    icon: 'Home',
    templateType: 'single',
    defaultColors: { primary: '#1b5e20', secondary: '#f57c00' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'properties', title: 'Properties', navLabel: 'Properties', authTier: 'public', blockTypes: ['dynamic_form'] },
      { slug: 'leases', title: 'Leases', navLabel: 'Leases', authTier: 'pin', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Properties', path: '/properties', icon: 'Home', authTier: 'public' },
      { title: 'Leases', path: '/leases', icon: 'Description', authTier: 'pin' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: 'RealEstateAgent',
    xsdStandard: 'RETS (Real Estate Transaction)',
  },

  // 8. Education & E-Learning
  education: {
    id: 'education',
    label: 'Education & E-Learning',
    description: 'Educational operations: course management, student enrollment, assignments, grading, progress tracking.',
    icon: 'School',
    templateType: 'single',
    defaultColors: { primary: '#0d47a1', secondary: '#ffc107' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'courses', title: 'Courses', navLabel: 'Courses', authTier: 'public', blockTypes: ['dynamic_form'] },
      { slug: 'enrollments', title: 'Enrollments', navLabel: 'Enrollments', authTier: 'pin', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Courses', path: '/courses', icon: 'School', authTier: 'public' },
      { title: 'Enrollments', path: '/enrollments', icon: 'AssignmentInd', authTier: 'pin' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: 'EducationalOrganization',
    xsdStandard: 'IMS Global (LTI, QTI)',
  },

  // 9. Professional Services
  'professional-services': {
    id: 'professional-services',
    label: 'Professional Services',
    description: 'Consultancy operations: project management, time tracking, invoicing, client deliverables.',
    icon: 'BusinessCenter',
    templateType: 'single',
    defaultColors: { primary: '#263238', secondary: '#00bcd4' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'projects', title: 'Projects', navLabel: 'Projects', authTier: 'pin', blockTypes: ['dynamic_form'] },
      { slug: 'invoices', title: 'Invoices', navLabel: 'Invoices', authTier: 'pin', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Projects', path: '/projects', icon: 'Folder', authTier: 'pin' },
      { title: 'Invoices', path: '/invoices', icon: 'Receipt', authTier: 'pin' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: 'ProfessionalService',
    xsdStandard: 'UBL (billing)',
  },

  // 10. Manufacturing & Industrial
  manufacturing: {
    id: 'manufacturing',
    label: 'Manufacturing & Industrial',
    description: 'Production operations: work orders, bill of materials, quality checks, inventory lots, production scheduling.',
    icon: 'PrecisionManufacturing',
    templateType: 'single',
    defaultColors: { primary: '#bf360c', secondary: '#ffab00' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'production', title: 'Production Orders', navLabel: 'Production', authTier: 'pin', blockTypes: ['dynamic_form'] },
      { slug: 'quality', title: 'Quality Control', navLabel: 'Quality', authTier: 'pin', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Production', path: '/production', icon: 'PrecisionManufacturing', authTier: 'pin' },
      { title: 'Quality', path: '/quality', icon: 'Verified', authTier: 'pin' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: 'Manufacturer',
    xsdStandard: 'B2MML (Business To Manufacturing)',
  },

  // 11. Spas & Wellness
  'spas-and-wellness': {
    id: 'spas-and-wellness',
    label: 'Spas & Wellness',
    description: 'Spa and wellness operations: appointment scheduling, client records, therapist management, service packages, treatment tracking.',
    icon: 'Spa',
    templateType: 'single',
    defaultColors: { primary: '#6a1b9a', secondary: '#e040fb' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial']),
      { slug: 'appointments', title: 'Appointments', navLabel: 'Appointments', authTier: 'public', blockTypes: ['dynamic_form'] },
      { slug: 'clients', title: 'Clients', navLabel: 'Clients', authTier: 'pin', blockTypes: ['dynamic_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'Appointments', path: '/appointments', icon: 'EventNote', authTier: 'public' },
      { title: 'Clients', path: '/clients', icon: 'PersonSearch', authTier: 'pin' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: 'HealthAndBeautyBusiness',
    xsdStandard: 'HL7 (appointments), ISO 19011 (quality)',
  },

  // 12. Platform Admin — designed for the root config / control-plane app (tokenizmyapp)
  'platform-admin': {
    id: 'platform-admin',
    label: 'Platform Admin',
    description: 'Central administration dashboard for managing tenant applications, platform configuration, system operations, and user management across all tenant instances.',
    icon: 'AdminPanelSettings',
    templateType: 'single',
    defaultColors: { primary: '#1a237e', secondary: '#00bcd4' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'metric_grid']),
      { slug: 'ops-admin', title: 'System Admin', navLabel: 'Ops Admin', authTier: 'pin', blockTypes: ['ops_admin_tabs', 'z_report_form', 'costs_form'] },
      SUMMARY_PAGE,
      TASKS_PAGE,
      ADMIN_PAGE,
    ],
    defaultNavItems: [
      HOME_NAV,
      { title: 'Dashboard', path: '/dashboard', icon: 'Dashboard', authTier: 'public' },
      { title: 'System Admin', path: '/ops-admin', icon: 'AdminPanelSettings', authTier: 'pin' },
      { title: 'Summary', path: '/summary', icon: 'Description', authTier: 'google' },
      { title: 'Tasks', path: '/tasks', icon: 'CheckCircle', authTier: 'pin' },
      { title: 'Admin', path: '/admin', icon: 'Settings', authTier: 'pin' },
    ],
    schemaOrgType: ['SoftwareApplication', 'WebApplication'],
    xsdStandard: 'schema.org',
  },

  // Default (minimal — kept for backward compatibility)
  default: {
    id: 'default',
    label: 'Generic Dashboard',
    description: 'A basic business operations dashboard with financial overview, tasks, and AI chat.',
    icon: 'Dashboard',
    templateType: 'single',
    defaultColors: { primary: '#eb3d28', secondary: '#0af9fe' },
    defaultPages: [
      HOME_PAGE,
      DASHBOARD_PAGE(['hero', 'kpi_cards', 'chart_financial', 'chat_panel']),
      SUMMARY_PAGE,
      TASKS_PAGE,
    ],
    defaultNavItems: BASIC_NAV,
    schemaOrgType: 'LocalBusiness',
    xsdStandard: 'schema.org',
  },
};

/** Get a template by ID, falling back to 'default'. */
export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATE_CATALOG[id] ?? TEMPLATE_CATALOG.default;
}

/** List all available templates. */
export function listTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATE_CATALOG);
}

/** Check if a given slug is reserved (cannot be used as a tenant slug). */
const RESERVED_SLUGS = new Set(['api', 'admin', 'dashboard', 'login', 'tokenizmyapp', 'www', 'app', 'config']);

export function isSlugAvailable(slug: string): boolean {
  if (RESERVED_SLUGS.has(slug.toLowerCase())) return false;
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/** Get suite departmental apps for a template, or null for single templates. */
export function getSuiteApps(templateId: string): SuiteAppDefinition[] | null {
  const tpl = TEMPLATE_CATALOG[templateId];
  if (tpl?.templateType === 'suite') return tpl.suiteApps ?? null;
  return null;
}

/** Return only suite templates from the catalog. */
export function listSuiteTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATE_CATALOG).filter((t) => t.templateType === 'suite');
}
