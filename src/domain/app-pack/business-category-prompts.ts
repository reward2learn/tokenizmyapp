/**
 * Business category presets shared by both app-pack surfaces:
 *   - Unified App Bundle tab (app-pack-tab.tsx) — free-text/category prompt → AI
 *     decomposition into ONE tenant's own department-sectioned deployment.
 *   - Tenant wizard Suite Mode (tenant-wizard.tsx / edit-tenant-modal.tsx) —
 *     category prompt (real AI key) or `templateIds` (mock / deterministic
 *     fallback) → N separately-deployed SuiteAppInstance apps.
 *
 * `templateIds` are the best-fit template-catalog entries for the category —
 * used as the deterministic app seed whenever AI decomposition isn't running
 * (no OPENAI_API_KEY, or the caller explicitly wants one app per template).
 */

export interface BusinessCategoryPreset {
  category: string;
  prompt: string;
  templateIds: string[];
}

export const BUSINESS_CATEGORY_PROMPTS: BusinessCategoryPreset[] = [
  {
    category: 'Restaurant',
    prompt:
      'Build an app pack for restaurant operations: HR (employees, schedules, attendance), ' +
      'Menu & Inventory (recipes, stock levels, supplier orders), Sales Reporting (daily sales, ' +
      'hourly trends, payment methods), Finance (P&L, cash flow, costs tracking), plus a CEO ' +
      'Overview with cross-department KPIs and realtime actionable items.',
    templateIds: ['restaurant', 'financial-analytics'],
  },
  {
    category: 'Nightclub',
    prompt:
      'Build an app pack for nightclub operations: Guest List & Entry (guest lists, VIP tables, ' +
      'entry passes, cover charges), Events & DJ Booking (lineups, event schedules, DJ contracts), ' +
      'Sales & Bar Reporting (ticket sales, bar revenue, payment methods), Finance (cash flow, ' +
      'P&L, costs tracking), plus a CEO Overview with cross-department KPIs and realtime ' +
      'actionable items.',
    templateIds: ['restaurant', 'financial-analytics'],
  },
  {
    category: 'Flower Shop',
    prompt:
      'Build an app pack for flower shop operations: Orders & Deliveries (online orders, delivery ' +
      'scheduling, delivery routes), Inventory (flower stock, suppliers, spoilage tracking), ' +
      'Customers & Occasions (customer records, occasions, campaigns), Finance (sales, costs, ' +
      'cash flow), plus a CEO Overview with cross-department KPIs and realtime actionable items.',
    templateIds: ['ecommerce-retail', 'financial-analytics'],
  },
  {
    category: 'Massage Service',
    prompt:
      'Build an app pack for massage service operations: Appointments & Booking (sessions, ' +
      'therapists, rooms, availability), Client Records (health notes, preferences, visit history), ' +
      'Therapist Management (schedules, commissions, certifications), Finance (revenue, costs, ' +
      'cash flow), plus a CEO Overview with cross-department KPIs and realtime actionable items.',
    templateIds: ['spas-and-wellness', 'financial-analytics'],
  },
  {
    category: 'Hotel',
    prompt:
      'Build an app pack for hotel operations: Bookings & Rooms (reservations, availability, ' +
      'check-in/check-out), Housekeeping (room status, cleaning tasks, inspections), Guest Services ' +
      '(requests, feedback, loyalty), Finance (revenue, occupancy, P&L), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
    templateIds: ['hotel', 'restaurant', 'financial-analytics'],
  },
  {
    category: 'E-commerce / Retail',
    prompt:
      'Build an app pack for e-commerce and retail operations: Catalog & Inventory (products, ' +
      'SKUs, stock levels), Orders & Fulfillment (orders, shipments, returns), Customers & Loyalty ' +
      '(profiles, loyalty points, campaigns), Finance (sales, refunds, cash flow), plus a CEO ' +
      'Overview with cross-department KPIs and realtime actionable items.',
    templateIds: ['ecommerce-retail', 'supply-chain', 'financial-analytics'],
  },
  {
    category: 'Café / Coffee Shop',
    prompt:
      'Build an app pack for café operations: Sales & POS (daily sales, payment methods, hourly ' +
      'trends), Inventory (beans, milk, supplies, supplier orders), Staff & Shifts (schedules, ' +
      'attendance, tips), Finance (P&L, cash flow, costs tracking), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
    templateIds: ['restaurant', 'financial-analytics'],
  },
  {
    category: 'Spa & Wellness',
    prompt:
      'Build an app pack for spa and wellness operations: Appointments & Booking (treatments, ' +
      'therapists, rooms), Packages & Memberships (treatment packages, membership plans, upsells), ' +
      'Client Records (preferences, health notes, history), Finance (revenue, costs, cash flow), ' +
      'plus a CEO Overview with cross-department KPIs and realtime actionable items.',
    templateIds: ['spas-and-wellness', 'financial-analytics'],
  },
  {
    category: 'Fitness / Gym',
    prompt:
      'Build an app pack for fitness center operations: Memberships (plans, renewals, check-ins), ' +
      'Classes & Schedule (class schedule, capacity, bookings), Trainer Management (trainers, ' +
      'sessions, commissions), Finance (revenue, costs, cash flow), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
    templateIds: ['spas-and-wellness', 'financial-analytics'],
  },
  {
    category: 'Salon & Barber',
    prompt:
      'Build an app pack for salon and barber operations: Appointments (bookings, services, ' +
      'stylists), Services & Pricing (service catalog, pricing, upselling), Stylists (schedules, ' +
      'commissions, performance), Finance (revenue, product sales, costs), plus a CEO Overview ' +
      'with cross-department KPIs and realtime actionable items.',
    templateIds: ['spas-and-wellness', 'financial-analytics'],
  },
  {
    category: 'Coworking Space',
    prompt:
      'Build an app pack for coworking space operations: Memberships (plans, renewals, access), ' +
      'Desk & Room Bookings (desks, meeting rooms, availability), Billing & Invoices (invoicing, ' +
      'payments, overdue tracking), Finance (revenue, occupancy, costs), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
    templateIds: ['real-estate', 'financial-analytics'],
  },
  {
    category: 'Professional Services Firm',
    prompt:
      'Build an app pack for a professional services firm: Clients & Projects (client records, ' +
      'project tracking), Time & Billing (timesheets, billable hours, invoicing), HR (employees, ' +
      'schedules, attendance), Finance (P&L, cash flow, costs tracking), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
    templateIds: ['professional-services', 'financial-analytics'],
  },
  {
    category: 'Healthcare Clinic',
    prompt:
      'Build an app pack for healthcare clinic operations: Appointments & Patients (scheduling, ' +
      'patient records), Consultations & Treatments (visit records, treatment plans, follow-ups), ' +
      'Staff & Practitioners (doctors, nurses, schedules), Finance (billing, insurance, costs), ' +
      'plus a CEO Overview with cross-department KPIs and realtime actionable items.',
    templateIds: ['healthcare', 'financial-analytics'],
  },
  {
    category: 'Manufacturing',
    prompt:
      'Build an app pack for manufacturing operations: Production (work orders, batches, output), ' +
      'Inventory & Materials (raw materials, stock levels, suppliers), Quality (inspections, defects, ' +
      'non-conformances), Finance (costs, P&L, cash flow), plus a CEO Overview with cross-department ' +
      'KPIs and realtime actionable items.',
    templateIds: ['manufacturing', 'supply-chain', 'financial-analytics'],
  },
  {
    category: 'P2P Delivery Marketplace',
    prompt:
      'Build an app pack for a P2P delivery marketplace: Marketplace & Requests (buyer requests, item details, route matching, pricing), Traveler Operations (travel plans, luggage capacity, route optimization), Orders & Escrow (9-state order workflow, USDC escrow, dispute resolution), User Management (profiles, reputation scoring, KYC), Chat & Messaging (real-time buyer-traveler communication), Finance (revenue tracking, fee structure, escrow settlements), plus a CEO Overview with cross-department KPIs and realtime actionable items.',
    templateIds: ['delivery-marketplace', 'financial-analytics'],
  },
];

export function getBusinessCategory(category: string): BusinessCategoryPreset | undefined {
  return BUSINESS_CATEGORY_PROMPTS.find((c) => c.category === category);
}
