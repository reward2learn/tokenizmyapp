#!/usr/bin/env bun
/**
 * Vercel Webhook Test Script
 * 
 * Simple, production-ready test script for /api/webhooks/vercel
 * Validates signature verification (HMAC-SHA256 with x-vercel-signature),
 * event routing, Inngest dispatching, tenant lookup, cleanup integration,
 * and audit logging.
 * 
 * Features:
 * - Multiple event types: deployment.succeeded, project.removed, deployment.error
 * - Accurate signature calculation matching vercel-webhook-service.ts
 * - Realistic sample payloads based on actual Vercel webhook shapes
 * - CLI interface with --event, --url, --secret flags
 * - Colored terminal output for quick debugging
 * - Dry-run mode to test signature without sending
 * - Env var support (VERCEL_WEBHOOK_URL, VERCEL_WEBHOOK_SECRET)
 * - Comprehensive error handling and TypeScript types
 * - Logs exact rawBody and computed signature for debugging mismatches
 * 
 * Usage:
 *   bun run scripts/test-webhook.ts --event=deployment.succeeded
 *   bun run scripts/test-webhook.ts --event=project.removed --secret=your-secret-here
 *   VERCEL_WEBHOOK_SECRET=dev-secret bun run scripts/test-webhook.ts --event=deployment.error
 * 
 * For local testing:
 * 1. Start dev server: cd tokenizmyapp && bun run dev
 * 2. Run this script (defaults to http://localhost:3000/api/webhooks/vercel)
 * 3. Check server console for [vercel-webhook] logs, Inngest events, cleanup traces
 * 4. Use --skip-sig for local dev if secret not set
 * 
 * This script helps debug:
 * - Signature verification failures (common rawBody vs JSON.stringify mismatch)
 * - Tenant lookup by project.id/name
 * - project.removed → cleanupTenant() flow
 * - deployment.* → status updates + Inngest handlers
 * - DB audit via webhook_events table
 */

import crypto from 'node:crypto';
import { parseArgs } from 'node:util';

type EventType = 'deployment.succeeded' | 'project.removed' | 'deployment.error' | 'tenant.template.amended' | 'reseller.onboarded' | 'test.webhook' | 'commission.paid';

interface VercelWebhookPayload {
  id: string;
  type: string;
  createdAt: number;
  payload: Record<string, any>;
}

interface TestConfig {
  eventType: EventType;
  url: string;
  secret: string | null;
  skipSignature: boolean;
  dryRun: boolean;
}

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const;

function log(color: keyof typeof COLORS, message: string, data?: any) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
  if (data) {
    if (typeof data === 'object') {
      console.dir(data, { depth: null, colors: true });
    } else {
      console.log(data);
    }
  }
}

function success(message: string, data?: any) {
  log('green', `✅ ${message}`, data);
}

function error(message: string, data?: any) {
  log('red', `❌ ${message}`, data);
}

function info(message: string, data?: any) {
  log('cyan', `ℹ️  ${message}`, data);
}

function warn(message: string, data?: any) {
  log('yellow', `⚠️  ${message}`, data);
}

/**
 * Realistic sample payloads matching the shapes expected by
 * vercel-webhook-service.ts (type at top-level, payload nested)
 */
const SAMPLE_PAYLOADS: Record<EventType, VercelWebhookPayload> = {
  'deployment.succeeded': {
    id: 'evt_1722470400000_abc123',
    type: 'deployment.succeeded',
    createdAt: Date.now(),
    payload: {
      deployment: {
        id: 'dpl_abc123def456',
        url: 'https://redrubybali-abc123.vercel.app',
        readyState: 'READY',
        name: 'redrubybali',
        inspectorUrl: 'https://vercel.com/inspect/abc123',
      },
      project: {
        id: 'prj_1234567890abcdef',
        name: 'redrubybali',
      },
      meta: {
        gitCommitRef: 'main',
        gitCommitSha: 'a1b2c3d4e5f67890',
      },
    },
  },
  'project.removed': {
    id: 'evt_1722470400001_xyz789',
    type: 'project.removed',
    createdAt: Date.now(),
    payload: {
      id: 'prj_1234567890abcdef',
      name: 'redrubybali',
      slug: 'redrubybali',
      deletedAt: Date.now(),
    },
  },
  'deployment.error': {
    id: 'evt_1722470400002_err456',
    type: 'deployment.error',
    createdAt: Date.now(),
    payload: {
      deployment: {
        id: 'dpl_error123',
        url: 'https://redrubybali-error123.vercel.app',
        readyState: 'ERROR',
        error: {
          code: 'BUILD_FAILED',
          message: 'Build failed due to missing dependency',
        },
      },
      project: {
        id: 'prj_1234567890abcdef',
        name: 'redrubybali',
      },
    },
  },
  // New comprehensive test cases for webhook-system.md and reseller-onboarding
  'tenant.template.amended': {
    id: 'evt_reseller_001',
    type: 'tenant.template.amended',
    createdAt: Date.now(),
    payload: {
      slug: 'prestix-partner-01',
      previousTemplate: 'restaurant',
      newTemplate: 'reseller-onboarding',
      delta: {
        addedPages: ['resellers', 'commissions', 'onboarding'],
        addedNav: ['Partners', 'Commissions'],
        colorChange: true,
        blockTypesAdded: ['partner_metrics', 'commission_split'],
        newSchemaOrg: ['Reseller', 'OfferCatalog'],
      },
      amendmentReason: 'partner-onboarding-upgrade',
      metadata: {
        ptixWallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        commissionRate: '0.15',
      },
    },
  },
  'reseller.onboarded': {
    id: 'evt_reseller_002',
    type: 'reseller.onboarded',
    createdAt: Date.now(),
    payload: {
      resellerSlug: 'bali-promoter-vip',
      partnerId: 'partner_789',
      businessName: 'Bali Beach Promotions',
      template: 'reseller-onboarding',
      schemaOrg: {
        '@type': 'Reseller',
        name: 'Bali Beach Promotions',
        url: 'https://bali-promoter-vip.vercel.app',
      },
      commissionConfig: {
        rate: 0.25,
        ptixAutoExchange: true,
        venueSplit: '60/40',
      },
      webhookTest: true,
    },
  },
  'test.webhook': {
    id: 'evt_test_003',
    type: 'test.webhook',
    createdAt: Date.now(),
    payload: {
      message: 'This is a test event from the updated test-webhook script',
      timestamp: Date.now(),
      templateSelectorTest: true,
      deltaExample: {
        addedPages: ['onboarding'],
        schemaOrgType: 'Organization',
      },
      note: 'Used by TemplateSelector component live preview and reseller flow testing',
    },
  },
  'commission.paid': {
    id: 'evt_commission_004',
    type: 'commission.paid',
    createdAt: Date.now(),
    payload: {
      resellerId: 'partner_789',
      amount: 24500000, // IDR in full integers per project standards
      currency: 'IDR',
      ptixConverted: 12450,
      status: 'success',
      transactionId: 'tx_0xabcdef123456',
      period: '2026-Q3',
    },
  },
};

/**
 * Computes x-vercel-signature exactly as in verifySignature()
 * Uses crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
 * Uses timingSafeEqual in service, but we just compute the hex here.
 */
function computeSignature(rawBody: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  return hmac.digest('hex');
}

/**
 * Sends the test webhook to the endpoint
 */
async function sendWebhook(config: TestConfig, payload: VercelWebhookPayload): Promise<void> {
  const rawBody = JSON.stringify(payload);
  let signature = '';

  info(`Preparing to send ${config.eventType} webhook`, {
    url: config.url,
    eventId: payload.id,
    rawBodyLength: rawBody.length,
    hasSecret: !!config.secret,
    skipSignature: config.skipSignature,
  });

  if (config.secret && !config.skipSignature) {
    signature = computeSignature(rawBody, config.secret);
    info(`Computed signature: ${signature.substring(0, 16)}...`);
  } else if (config.skipSignature) {
    warn('Skipping signature (for local dev without secret)');
  } else {
    warn('No secret provided — signature verification will be skipped by service in dev mode');
  }

  if (config.dryRun) {
    success('DRY RUN COMPLETE — signature computed successfully');
    console.log('\nRaw body that would be sent:');
    console.log(rawBody);
    console.log('\nHeaders that would be sent:');
    console.log({
      'content-type': 'application/json',
      'x-vercel-signature': signature || 'skipped',
      'x-vercel-event': config.eventType,
    });
    return;
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-vercel-event': config.eventType,
    };

    if (signature) {
      headers['x-vercel-signature'] = signature;
    }

    info('Sending POST request...');

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    const responseText = await response.text();
    const isSuccess = response.ok || response.status === 200; // endpoint always returns 200

    if (isSuccess) {
      success(`Webhook accepted by server (status: ${response.status})`, {
        response: responseText || '(empty body - expected for fast ACK)',
        eventType: config.eventType,
        note: 'Check server logs for [vercel-webhook], Inngest events, cleanupTenant(), tenant status updates, and webhook_events DB records',
      });
    } else {
      error(`Server returned non-2xx status: ${response.status}`, responseText);
    }

    // Additional advice
    console.log('\n' + '='.repeat(60));
    console.log('NEXT STEPS FOR DEBUGGING:');
    console.log('1. Check terminal running the dev server for detailed logs');
    console.log('2. Look for "Signature verified successfully" or verification errors');
    console.log('3. Verify tenant lookup for project name/id in DB');
    console.log('4. For project.removed: confirm cleanupTenant() was called');
    console.log('5. Check Inngest dashboard or console for dispatched events');
    console.log('6. Query DB: SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 5;');
    console.log('='.repeat(60));

  } catch (err) {
    error('Failed to send webhook request', {
      error: err instanceof Error ? err.message : String(err),
      suggestion: 'Is the dev server running on localhost:3000? Check network/firewall.',
    });
  }
}

/**
 * Parse command line arguments
 */
function parseCliArgs(): TestConfig {
  const args = parseArgs({
    options: {
      event: {
        type: 'string',
        short: 'e',
        default: 'deployment.succeeded' as EventType,
      },
      url: {
        type: 'string',
        short: 'u',
      },
      secret: {
        type: 'string',
        short: 's',
      },
      'skip-sig': {
        type: 'boolean',
        short: 'k',
        default: false,
      },
      'dry-run': {
        type: 'boolean',
        short: 'd',
        default: false,
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false,
      },
    },
    allowPositionals: true,
  });

  if (args.values.help) {
    console.log(`
Usage: bun run scripts/test-webhook.ts [options]

Options:
  -e, --event <type>     Event type. Now supports comprehensive webhook + reseller scenarios.
                         (deployment.succeeded, tenant.template.amended, reseller.onboarded,
                          test.webhook, commission.paid, etc). Default: deployment.succeeded
  -u, --url <url>        Webhook URL. Default: http://localhost:3000/api/admin/webhooks (for admin tests)
                         or http://localhost:3000/api/webhooks/vercel
  -s, --secret <secret>  Webhook secret. Default: env VERCEL_WEBHOOK_SECRET
  -k, --skip-sig         Skip signature calculation (useful in local dev)
  -d, --dry-run          Compute signature/payload but do not send request
  -h, --help             Show this help

Examples:
  bun run scripts/test-webhook.ts --event=test.webhook
  bun run scripts/test-webhook.ts --event=tenant.template.amended
  bun run scripts/test-webhook.ts --event=reseller.onboarded
  VERCEL_WEBHOOK_SECRET=dev-secret bun run scripts/test-webhook.ts --event=commission.paid
  # For admin webhook system testing (see docs/webhook-system.md)
    `);
    process.exit(0);
  }

  const eventType = (args.values.event as EventType) || 'deployment.succeeded';
  const supportedEvents = [
    'deployment.succeeded', 'project.removed', 'deployment.error',
    'tenant.template.amended', 'reseller.onboarded', 'test.webhook', 'commission.paid'
  ];
  if (!supportedEvents.includes(eventType)) {
    error(`Unsupported event type: ${eventType}. Supported: ${supportedEvents.join(', ')}`);
    process.exit(1);
  }

  const isAdminEvent = ['tenant.template.amended', 'reseller.onboarded', 'test.webhook', 'commission.paid'].includes(eventType);
  const defaultUrl = process.env.WEBHOOK_URL || 
    (isAdminEvent 
      ? 'http://localhost:3000/api/admin/webhooks' 
      : process.env.VERCEL_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/vercel');
  const url = (args.values.url as string) || defaultUrl;

  const secret = (args.values.secret as string) || process.env.VERCEL_WEBHOOK_SECRET || null;
  const skipSignature = args.values['skip-sig'] || false;
  const dryRun = args.values['dry-run'] || false;

  if (!secret && !skipSignature && !dryRun) {
    warn('No VERCEL_WEBHOOK_SECRET provided. The service will skip verification in development.');
  }

  return {
    eventType,
    url,
    secret,
    skipSignature,
    dryRun,
  };
}

/**
 * Main entry point
 */
async function main() {
  info('🚀 Comprehensive Webhook + Reseller Onboarding Test Script Starting');
  console.log(`${COLORS.bright}RedRuby-FPA / Prestix Webhook System Tester (with Reseller Onboarding Scenarios)${COLORS.reset}\n`);
  console.log('See docs/webhook-system.md and docs/reseller-onboarding-template.md for details.\n');

  const config = parseCliArgs();
  const payload = { ...SAMPLE_PAYLOADS[config.eventType] };

  // Update timestamp to be current
  payload.createdAt = Date.now();

  // Customize payload slightly based on event for better tenant matching
  if (config.eventType === 'project.removed' || config.eventType.includes('deployment')) {
    payload.payload.project = payload.payload.project || { id: 'prj_test123', name: 'test-tenant' };
    payload.payload.id = payload.payload.id || 'prj_test123';
  }

  success(`Testing event: ${config.eventType}`);
  await sendWebhook(config, payload);

  console.log(`\n${COLORS.magenta}Script completed. New test cases added for:
• tenant.template.amended (delta-driven template changes)
• reseller.onboarded (full reseller onboarding flow with PTIX/commission payload)
• test.webhook (used by TemplateSelector component)
• commission.paid (IDR integer compliance)
See docs/webhook-system.md for troubleshooting and comprehensive scenarios.${COLORS.reset}`);
}

main().catch((err) => {
  error('Unhandled error in test script', err);
  process.exit(1);
});
