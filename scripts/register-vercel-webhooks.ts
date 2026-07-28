#!/usr/bin/env bun
/**
 * Vercel Webhook Registration Script for TokenizMyApp
 * 
 * Production-ready CLI script to register team-level Vercel webhooks via the official API.
 * Registers a single webhook subscription that listens to all critical deployment, project,
 * and domain events and routes them to https://tokenizmyapp.vercel.app/api/webhooks/vercel
 * (or custom URL).
 * 
 * This powers:
 * - Automatic tenant cleanup on project.removed
 * - Deployment status syncing (succeeded, error, canceled)
 * - Domain verification tracking
 * - Audit logging to webhook_events table
 * - Inngest workflow triggering for async processing
 * 
 * Matches exactly the events handled in vercel-webhook-service.ts and the webhook route.
 * 
 * API Used: POST /v1/webhooks (Vercel REST API v1)
 * - Payload: { url, events, projectIds? } — NO `secret` (Vercel generates it and returns in response)
 * - teamId passed as query param
 * - Response includes the `secret` to use as VERCEL_WEBHOOK_SECRET
 * 
 * Updated per requirements:
 * 1. Removed `secret` from request body (fixes "should NOT have additional property `secret`")
 * 2. Captures and displays the secret returned by Vercel
 * 3. Clear instructions for setting VERCEL_WEBHOOK_SECRET env var
 * 4. Enhanced error handling for 400 (validation), 409 (duplicates), 401/403 (auth errors)
 * 5. Robust payload structure matching Vercel OpenAPI spec
 * 
 * Usage:
 *   bun run register-webhooks --token=your-vercel-token
 *   bun run register-webhooks --token=xxx --url=https://yourdomain.com/api/webhooks/vercel --dry-run
 *   bun run register-webhooks --list --token=xxx
 * 
 * Recommended (with dry-run first):
 *   VERCEL_TOKEN=at_xxx bun run scripts/register-vercel-webhooks.ts --dry-run
 *   # Then run without --dry-run to register
 * 
 * After registration:
 * 1. Copy the SECRET returned in the success response
 * 2. Set it as VERCEL_WEBHOOK_SECRET=whsec_... in your tokenizmyapp Vercel project env vars
 *    (or .env.local for local dev)
 * 3. Redeploy the app
 * 4. Test with: bun run test-webhook --event=deployment.succeeded
 * 5. Verify in Vercel Dashboard > Settings > Webhooks
 * 
 * Team ID default: team_uKNaNEyjHVW7vooXeUfNJ3LW
 * Webhook URL default: https://tokenizmyapp.vercel.app/api/webhooks/vercel
 * 
 * The script is idempotent-friendly. Use --list to inspect existing webhooks.
 * Always test with --dry-run first to validate payload.
 */
import { parseArgs } from 'node:util';

type VercelEvent = 
  | 'project.removed'
  | 'deployment.succeeded'
  | 'deployment.error'
  | 'deployment.canceled'
  | 'project.domain.verified'
  | 'project.domain.unverified'
  | 'deployment.cleanup';

interface WebhookConfig {
  token: string;
  webhookUrl: string;
  secret: string;
  teamId: string;
  events: VercelEvent[];
  dryRun: boolean;
  listOnly: boolean;
  projectIds?: string[];
}

interface VercelWebhookResponse {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  projectIds?: string[];
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

function log(color: keyof typeof COLORS, message: string, data?: any): void {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
  if (data) {
    if (typeof data === 'object') {
      console.dir(data, { depth: null, colors: true });
    } else {
      console.log(data);
    }
  }
}

function success(message: string, data?: any): void {
  log('green', `✅ ${message}`, data);
}

function error(message: string, data?: any): void {
  log('red', `❌ ${message}`, data);
}

function info(message: string, data?: any): void {
  log('cyan', `ℹ️  ${message}`, data);
}

function warn(message: string, data?: any): void {
  log('yellow', `⚠️  ${message}`, data);
}

const DEFAULT_TEAM_ID = 'team_uKNaNEyjHVW7vooXeUfNJ3LW';
const DEFAULT_WEBHOOK_URL = 'https://tokenizmyapp.vercel.app/api/webhooks/vercel';
const VERCEL_API_BASE = 'https://api.vercel.com';

const ALL_EVENTS: VercelEvent[] = [
  'project.removed',
  'deployment.succeeded',
  'deployment.error',
  'deployment.canceled',
  'project.domain.verified',
  'project.domain.unverified',
  'deployment.cleanup',
];

/**
 * Validates URL format.
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http');
  } catch {
    return false;
  }
}

/**
 * Makes authenticated request to Vercel API.
 */
async function vercelApi(
  path: string, 
  options: RequestInit = {}, 
  teamId?: string
): Promise<Response> {
  const url = new URL(`${VERCEL_API_BASE}${path}`);
  
  if (teamId) {
    url.searchParams.set('teamId', teamId);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  return response;
}

/**
 * Lists all registered webhooks for the team.
 */
async function listWebhooks(config: WebhookConfig): Promise<void> {
  info('Fetching existing Vercel webhooks...');

  try {
    const response = await vercelApi(
      '/v1/webhooks',
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${config.token}` },
      },
      config.teamId
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as { webhooks?: VercelWebhookResponse[] };
    const webhooks = data.webhooks || [];

    success(`Found ${webhooks.length} webhook(s) for team ${config.teamId}`);

    if (webhooks.length === 0) {
      info('No webhooks registered yet. Use this script without --list to create one.');
      return;
    }

    webhooks.forEach((hook, index) => {
      console.log(`\n${COLORS.bright}Webhook #${index + 1}${COLORS.reset}`);
      console.log(`  ID: ${hook.id}`);
      console.log(`  URL: ${hook.url}`);
      console.log(`  Events: ${hook.events.join(', ')}`);
      if (hook.secret) console.log(`  Secret: ${hook.secret.substring(0, 12)}...`);
      console.log(`  Created: ${new Date(hook.createdAt).toISOString()}`);
      if (hook.projectIds && hook.projectIds.length > 0) {
        console.log(`  Project IDs: ${hook.projectIds.join(', ')}`);
      }
      console.log(`  Owner: ${hook.ownerId}`);
    });

    // Check if our target webhook URL is already registered
    const existingForUrl = webhooks.find(h => h.url === config.webhookUrl);
    if (existingForUrl) {
      success('✅ Webhook for this URL already exists!', {
        id: existingForUrl.id,
        events: existingForUrl.events,
        note: 'You can update it via Vercel Dashboard or delete and re-register.',
      });
    }

  } catch (err) {
    error('Failed to list webhooks', {
      error: err instanceof Error ? err.message : String(err),
      suggestion: 'Check your token has correct scopes (webhooks:write, webhooks:read) and teamId.',
    });
    process.exit(1);
  }
}

/**
 * Registers a new webhook with the correct payload structure.
 * Does NOT include `secret` in request (Vercel generates and returns it).
 * Enhanced error handling for common Vercel responses.
 */
async function registerWebhook(config: WebhookConfig): Promise<void> {
  info(`Registering webhook for URL: ${config.webhookUrl}`);
  info(`Events (${config.events.length}): ${config.events.join(', ')}`);
  if (config.projectIds && config.projectIds.length > 0) {
    info(`Scoped to projects: ${config.projectIds.join(', ')}`);
  }

  // Correct API payload per Vercel docs: url, events, optional projectIds.
  // NO `secret` - Vercel will generate one and return it in the 200 response.
  const payload: any = {
    url: config.webhookUrl,
    events: config.events,
  };

  if (config.projectIds && config.projectIds.length > 0) {
    payload.projectIds = config.projectIds;
  }

  if (config.dryRun) {
    success('✅ DRY-RUN MODE: Payload (no secret included):', payload);
    console.log('\n' + '='.repeat(80));
    console.log('✅ DRY-RUN COMPLETE - Payload is valid for POST /v1/webhooks');
    console.log('\nWhat happens on real run:');
    console.log('• Vercel generates a secret (whsec_...) and returns it in response');
    console.log('• You MUST copy that secret and set VERCEL_WEBHOOK_SECRET env var');
    console.log('• The webhook will trigger your /api/webhooks/vercel endpoint');
    console.log('\nNext steps:');
    console.log('1. Run WITHOUT --dry-run to register: bun run register-webhooks --token=xxx');
    console.log('2. Copy the returned secret from success output');
    console.log('3. Add to Vercel dashboard: Project Settings > Environment Variables');
    console.log('   Key: VERCEL_WEBHOOK_SECRET   Value: whsec_xxxxxxxxxxxxxxxx');
    console.log('4. Redeploy your tokenizmyapp deployment');
    console.log('5. Test: bun run test-webhook --event=deployment.succeeded');
    console.log('6. Check Vercel Dashboard > Settings > Webhooks');
    console.log('='.repeat(80));
    return;
  }

  info('Sending registration request to Vercel API...');

  try {
    const response = await vercelApi(
      '/v1/webhooks',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      config.teamId
    );

    const responseText = await response.text();
    let responseData: any;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    // Enhanced error handling for common Vercel API responses
    if (!response.ok) {
      const status = response.status;
      
      if (status === 400) {
        error('❌ Vercel API Validation Error (400)', {
          details: responseData,
          commonCause: 'The payload contained invalid fields (e.g. extra "secret" property was the previous issue)',
          solution: 'Payload now strictly follows Vercel spec: only url, events, and optional projectIds.',
          suggestion: 'Check the events array matches supported values. Run with --dry-run to validate.',
        });
        process.exit(1);
      }
      
      if (status === 409 || (typeof responseData === 'object' && 
          (responseData.message?.includes('already') || responseData.error?.includes('duplicate')))) {
        warn('⚠️  Webhook already exists (409 Conflict)', responseData);
        info('A webhook for this URL/events may already be registered.');
        info('Run with --list to see existing webhooks, or manage via Vercel Dashboard.');
        info('You can delete the existing one in Vercel > Settings > Webhooks if needed.');
        process.exit(0);
      }
      
      if (status === 401 || status === 403) {
        error('❌ Authentication / Authorization Error', {
          status,
          details: responseData,
          cause: status === 401 ? 'Invalid or expired Vercel token' : 'Insufficient permissions (needs webhooks:write scope)',
          solution: 'Generate a new token at https://vercel.com/account/tokens with "All" or Webhooks scopes.',
          teamId: config.teamId,
        });
        process.exit(1);
      }
      
      if (status === 429) {
        error('❌ Rate Limited (429)', responseData);
        info('Vercel rate limits exceeded. Wait a moment and try again.');
        process.exit(1);
      }

      // General error
      throw new Error(`Vercel API Error ${status}: ${JSON.stringify(responseData, null, 2)}`);
    }

    const webhook = responseData as VercelWebhookResponse;
    
    if (!webhook.secret) {
      warn('⚠️  No secret returned by Vercel! Check response below.');
    }

    success('🎉 Webhook registered successfully!', {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      projectIds: webhook.projectIds,
      ownerId: webhook.ownerId,
      createdAt: new Date(webhook.createdAt).toISOString(),
      dashboardUrl: `https://vercel.com/dashboard/${config.teamId || 'your-team'}/settings/webhooks`,
    });

    // Prominently display the secret that Vercel returned
    if (webhook.secret) {
      console.log('\n' + '='.repeat(80));
      console.log(`${COLORS.bright}${COLORS.green}🔑 YOUR VERCEL WEBHOOK SECRET:${COLORS.reset}`);
      console.log(`${COLORS.bright}${webhook.secret}${COLORS.reset}`);
      console.log('=' .repeat(80));
      console.log('\n🚨 IMPORTANT: Copy the secret above immediately!');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🚀 NEXT STEPS:');
    console.log('1. Copy the SECRET shown above (starts with whsec_)');
    console.log('2. Set as environment variable:');
    console.log('   VERCEL_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   → Vercel Dashboard > Your Project > Settings > Environment Variables');
    console.log('   → Or add to .env.local for local development');
    console.log('3. Redeploy tokenizmyapp (vercel --prod or trigger deploy)');
    console.log('4. Verify in Vercel Dashboard > Settings > Webhooks (should show Active)');
    console.log('5. Test the webhook:');
    console.log('   bun run test-webhook --event=deployment.succeeded');
    console.log('   bun run test-webhook --event=project.removed');
    console.log('6. Check server logs for [vercel-webhook] and DB table webhook_events');
    console.log('\nWebhook ID: ' + webhook.id);
    console.log('='.repeat(80));

    success('✅ Secret captured from Vercel response. Use it for VERCEL_WEBHOOK_SECRET.');

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    error('Webhook registration failed', {
      error: errorMsg,
      tokenPrefix: config.token.substring(0, 6) + '...',
      teamId: config.teamId,
      url: config.webhookUrl,
      payloadSummary: 'url + events + (optional projectIds) - NO secret',
      troubleshooting: [
        'Run with --dry-run first to validate payload structure',
        'Ensure token has "Webhooks" write scope (regenerate at vercel.com/account/tokens)',
        'Verify teamId is correct (--team-id=team_...)',
        'URL must be public HTTPS (your deployed /api/webhooks/vercel)',
        'For duplicates (409): use --list or delete via Vercel Dashboard',
        'Check exact error JSON above for "additionalProperties" or schema violations',
        'Vercel API docs: https://vercel.com/docs/rest-api/endpoints/webhooks',
      ],
    });
    process.exit(1);
  }
}

/**
 * Parses and validates command line arguments.
 */
function parseCliArgs(): WebhookConfig {
  const args = parseArgs({
    options: {
      token: {
        type: 'string',
        short: 't',
      },
      url: {
        type: 'string',
        short: 'u',
      },
      secret: {
        type: 'string',
        short: 's',
      },
      'team-id': {
        type: 'string',
        short: 'i',
      },
      'project-ids': {
        type: 'string',
      },
      list: {
        type: 'boolean',
        short: 'l',
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
${COLORS.bright}Vercel Webhook Registration Tool for TokenizMyApp${COLORS.reset}

Usage: bun run register-webhooks [options]

Options:
  -t, --token <token>          Vercel access token (REQUIRED). Use VERCEL_TOKEN env var.
  -u, --url <url>              Webhook URL. Default: ${DEFAULT_WEBHOOK_URL}
  -i, --team-id <id>           Team ID. Default: ${DEFAULT_TEAM_ID}
      --project-ids <ids>      Comma-separated project IDs to scope webhook (optional)
  -l, --list                   List existing webhooks instead of registering
  -d, --dry-run                Validate payload WITHOUT calling API (RECOMMENDED FIRST)
  -h, --help                   Show this help

Note: --secret is NO LONGER USED in registration (Vercel generates the secret and returns it).
      The returned secret MUST be set as VERCEL_WEBHOOK_SECRET env var.

Environment Variables (take precedence):
  VERCEL_TOKEN, VERCEL_WEBHOOK_URL, VERCEL_TEAM_ID, VERCEL_WEBHOOK_SECRET (for testing)

Examples:
  # Test payload first (recommended)
  VERCEL_TOKEN=at_xxx bun run register-webhooks --dry-run

  # Register for real
  VERCEL_TOKEN=at_xxx bun run register-webhooks

  VERCEL_TOKEN=at_xxx bun run register-webhooks --list
  bun run register-webhooks --url=https://yourapp.vercel.app/api/webhooks/vercel --dry-run

After successful registration, copy the secret from output and set VERCEL_WEBHOOK_SECRET.
See full docs in script header.
    `);
    process.exit(0);
  }


  const token = (args.values.token as string) || process.env.VERCEL_TOKEN;
  if (!token) {
    error('Vercel access token is required. Provide via --token or VERCEL_TOKEN env var.');
    console.log('\nGet a token from: https://vercel.com/account/tokens');
    process.exit(1);
  }

  const webhookUrl = (args.values.url as string) || 
                     process.env.VERCEL_WEBHOOK_URL || 
                     DEFAULT_WEBHOOK_URL;

  if (!isValidUrl(webhookUrl)) {
    error('Invalid webhook URL. Must be a valid HTTPS URL.', { provided: webhookUrl });
    process.exit(1);
  }

  const secret = (args.values.secret as string) || process.env.VERCEL_WEBHOOK_SECRET || '';
  const teamId = (args.values['team-id'] as string) || 
                 process.env.VERCEL_TEAM_ID || 
                 DEFAULT_TEAM_ID;

  let projectIds: string[] = [];
  if (args.values['project-ids']) {
    projectIds = (args.values['project-ids'] as string)
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);
  }

  const listOnly = args.values.list || false;
  const dryRun = args.values['dry-run'] || false;

  if (secret && !listOnly && !dryRun) {
    warn('⚠️  --secret flag / VERCEL_WEBHOOK_SECRET ignored for registration.');
    info('Vercel generates the secret automatically and returns it. Use the returned value.');
  }

  if (!listOnly && !dryRun) {
    info(`Target webhook URL: ${webhookUrl}`);
    info(`Team ID: ${teamId}`);
  }

  return {
    token,
    webhookUrl,
    secret,  // kept for interface compatibility but NOT sent in payload
    teamId,
    events: ALL_EVENTS,
    dryRun,
    listOnly,
    projectIds: projectIds.length > 0 ? projectIds : undefined,
  };
}

/**
 * Main entry point
 */
async function main() {
  console.log(`${COLORS.bright}${COLORS.magenta}🚀 TokenizMyApp Vercel Webhook Registrar${COLORS.reset}`);
  console.log('Registers production webhooks for tenant lifecycle events\n');

  const config = parseCliArgs();

  if (config.listOnly) {
    await listWebhooks(config);
  } else {
    await registerWebhook(config);
  }

  console.log(`\n${COLORS.cyan}Script completed successfully. Your Vercel webhooks are now configured for seamless tenant management.${COLORS.reset}`);
  console.log(`${COLORS.blue}See vercel-webhook-service.ts for event handling details.${COLORS.reset}`);
}

main().catch((err) => {
  error('Unhandled error in registration script', err);
  process.exit(1);
});
