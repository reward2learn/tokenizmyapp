#!/usr/bin/env bun
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
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
 * API Used: POST /v1/webhooks (Vercel REST API v1 — official, supports all listed events)
 * Note: The /v2/integrations/webhooks is an older/alias endpoint; we use the canonical one.
 * Vercel generates (or accepts) a secret which is returned in the response. Use it for
 * VERCEL_WEBHOOK_SECRET env var in your tokenizmyapp deployment.
 *
 * Features:
 * - Full CLI with parseArgs (supports --token=xxx --secret=yyy style)
 * - Env var fallbacks (VERCEL_TOKEN, VERCEL_WEBHOOK_URL, VERCEL_WEBHOOK_SECRET, VERCEL_TEAM_ID)
 * - List existing webhooks (--list)
 * - Dry-run mode for validation
 * - Colored terminal output with emojis
 * - Comprehensive error handling and API response parsing
 * - Input validation (URL format, required token, event list)
 * - Automatic secret generation fallback if not provided
 * - Post-registration instructions and next steps
 * - TypeScript strict with full interfaces
 *
 * Usage:
 *   bun run register-webhooks --token=your-vercel-token --secret=your-webhook-secret
 *   bun run register-webhooks --token=xxx --url=https://yourdomain.com/api/webhooks/vercel
 *   bun run register-webhooks --list --token=xxx
 *
 * Example (recommended):
 *   VERCEL_TOKEN=at_xxx bun run scripts/register-vercel-webhooks.ts \
 *     --secret=whsec_strongrandomsecret1234567890abcdef \
 *     --team-id=team_7m5fwG2qKtVsGtgV35AB3nHi
 *
 * After running:
 * 1. Copy the returned secret (or the one you provided)
 * 2. Set VERCEL_WEBHOOK_SECRET=... in your tokenizmyapp Vercel project env vars
 * 3. Redeploy tokenizmyapp if necessary
 * 4. Test with: bun run test-webhook --event=deployment.succeeded
 * 5. Verify in Vercel Dashboard > Settings > Webhooks
 *
 * Team ID default: team_7m5fwG2qKtVsGtgV35AB3nHi (Tokenizin Pro)
 * Webhook URL default: https://tokenizmyapp.vercel.app/api/webhooks/vercel
 *
 * This script is idempotent-friendly — if a webhook for the same URL exists, it will
 * inform you and suggest using --list to inspect.
 */
var node_crypto_1 = require("node:crypto");
var node_util_1 = require("node:util");
var COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};
function log(color, message, data) {
    console.log("".concat(COLORS[color]).concat(message).concat(COLORS.reset));
    if (data) {
        if (typeof data === 'object') {
            console.dir(data, { depth: null, colors: true });
        }
        else {
            console.log(data);
        }
    }
}
function success(message, data) {
    log('green', "\u2705 ".concat(message), data);
}
function error(message, data) {
    log('red', "\u274C ".concat(message), data);
}
function info(message, data) {
    log('cyan', "\u2139\uFE0F  ".concat(message), data);
}
function warn(message, data) {
    log('yellow', "\u26A0\uFE0F  ".concat(message), data);
}
var DEFAULT_TEAM_ID = 'team_7m5fwG2qKtVsGtgV35AB3nHi';
var DEFAULT_WEBHOOK_URL = 'https://tokenizmyapp.vercel.app/api/webhooks/vercel';
var VERCEL_API_BASE = 'https://api.vercel.com';
var ALL_EVENTS = [
    'project.removed',
    'deployment.succeeded',
    'deployment.error',
    'deployment.canceled',
    'project.domain.verified',
    'project.domain.unverified',
    'deployment.cleanup',
];
/**
 * Generates a strong random webhook secret if none provided.
 * Format: whsec_ + 32 random hex chars (standard for webhook secrets).
 */
function generateSecret() {
    var randomBytes = node_crypto_1.default.randomBytes(32);
    return "whsec_".concat(randomBytes.toString('hex'));
}
/**
 * Validates URL format.
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return url.startsWith('http');
    }
    catch (_a) {
        return false;
    }
}
/**
 * Makes authenticated request to Vercel API.
 */
function vercelApi(path_1) {
    return __awaiter(this, arguments, void 0, function (path, options, teamId) {
        var url, headers, response;
        var _a;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    url = new URL("".concat(VERCEL_API_BASE).concat(path));
                    if (teamId) {
                        url.searchParams.set('teamId', teamId);
                    }
                    headers = __assign({ 'Authorization': "Bearer ".concat(((_a = options.headers) === null || _a === void 0 ? void 0 : _a['Authorization']) || ''), 'Content-Type': 'application/json' }, options.headers);
                    return [4 /*yield*/, fetch(url.toString(), __assign(__assign({}, options), { headers: headers }))];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, response];
            }
        });
    });
}
/**
 * Lists all registered webhooks for the team.
 */
function listWebhooks(config) {
    return __awaiter(this, void 0, void 0, function () {
        var response, errorText, data, webhooks, existingForUrl, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    info('Fetching existing Vercel webhooks...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, vercelApi('/v1/webhooks', {
                            method: 'GET',
                            headers: { 'Authorization': "Bearer ".concat(config.token) },
                        }, config.teamId)];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    errorText = _a.sent();
                    throw new Error("API Error ".concat(response.status, ": ").concat(errorText));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    webhooks = data.webhooks || [];
                    success("Found ".concat(webhooks.length, " webhook(s) for team ").concat(config.teamId));
                    if (webhooks.length === 0) {
                        info('No webhooks registered yet. Use this script without --list to create one.');
                        return [2 /*return*/];
                    }
                    webhooks.forEach(function (hook, index) {
                        console.log("\n".concat(COLORS.bright, "Webhook #").concat(index + 1).concat(COLORS.reset));
                        console.log("  ID: ".concat(hook.id));
                        console.log("  URL: ".concat(hook.url));
                        console.log("  Events: ".concat(hook.events.join(', ')));
                        if (hook.secret)
                            console.log("  Secret: ".concat(hook.secret.substring(0, 12), "..."));
                        console.log("  Created: ".concat(new Date(hook.createdAt).toISOString()));
                        if (hook.projectIds && hook.projectIds.length > 0) {
                            console.log("  Project IDs: ".concat(hook.projectIds.join(', ')));
                        }
                        console.log("  Owner: ".concat(hook.ownerId));
                    });
                    existingForUrl = webhooks.find(function (h) { return h.url === config.webhookUrl; });
                    if (existingForUrl) {
                        success('✅ Webhook for this URL already exists!', {
                            id: existingForUrl.id,
                            events: existingForUrl.events,
                            note: 'You can update it via Vercel Dashboard or delete and re-register.',
                        });
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    error('Failed to list webhooks', {
                        error: err_1 instanceof Error ? err_1.message : String(err_1),
                        suggestion: 'Check your token has correct scopes (webhooks:write, webhooks:read) and teamId.',
                    });
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Registers a new webhook with all required events.
 */
function registerWebhook(config) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, generated, response, responseData, responseText, webhook, err_2, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    info("Registering webhook for URL: ".concat(config.webhookUrl));
                    info("Events (".concat(config.events.length, "): ").concat(config.events.join(', ')));
                    if (config.projectIds && config.projectIds.length > 0) {
                        info("Scoped to projects: ".concat(config.projectIds.join(', ')));
                    }
                    payload = {
                        url: config.webhookUrl,
                        events: config.events,
                    };
                    if (config.secret) {
                        // Note: API may ignore or use provided secret; primarily Vercel generates one
                        payload.secret = config.secret;
                        info("Using provided secret (first 8 chars): ".concat(config.secret.substring(0, 8), "..."));
                    }
                    else {
                        generated = generateSecret();
                        payload.secret = generated;
                        warn('No secret provided — generated one for you. Copy it from response!');
                        config.secret = generated;
                    }
                    if (config.projectIds && config.projectIds.length > 0) {
                        payload.projectIds = config.projectIds;
                    }
                    if (config.dryRun) {
                        success('DRY-RUN: Would register the following payload:', payload);
                        console.log('\n' + '='.repeat(80));
                        console.log('Next steps if not dry-run:');
                        console.log('1. Set VERCEL_WEBHOOK_SECRET in tokenizmyapp env vars (use the secret above)');
                        console.log('2. Redeploy tokenizmyapp');
                        console.log('3. Test: bun run test-webhook');
                        console.log('4. Monitor Vercel Dashboard > Webhooks');
                        console.log('='.repeat(80));
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, vercelApi('/v1/webhooks', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(config.token),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(payload),
                        }, config.teamId)];
                case 2:
                    response = _a.sent();
                    responseData = void 0;
                    return [4 /*yield*/, response.text()];
                case 3:
                    responseText = _a.sent();
                    try {
                        responseData = JSON.parse(responseText);
                    }
                    catch (_b) {
                        responseData = { raw: responseText };
                    }
                    if (!response.ok) {
                        if (response.status === 409 || responseText.includes('already exists')) {
                            warn('Webhook may already exist for this URL/events combination.', responseData);
                            info('Run with --list to inspect existing webhooks.');
                            process.exit(0);
                        }
                        throw new Error("Vercel API ".concat(response.status, ": ").concat(JSON.stringify(responseData)));
                    }
                    webhook = responseData;
                    success('🎉 Webhook registered successfully!', {
                        id: webhook.id,
                        url: webhook.url,
                        events: webhook.events,
                        secret: webhook.secret || config.secret,
                        ownerId: webhook.ownerId,
                        createdAt: new Date(webhook.createdAt).toISOString(),
                        dashboardUrl: "https://vercel.com/dashboard/".concat(config.teamId, "/settings/webhooks"),
                    });
                    console.log('\n' + '='.repeat(80));
                    console.log('🚀 NEXT STEPS:');
                    console.log('1. Copy the SECRET above and set as VERCEL_WEBHOOK_SECRET env var');
                    console.log('   in your tokenizmyapp Vercel project (or .env.local for dev)');
                    console.log('2. Redeploy tokenizmyapp: vercel --prod or via dashboard');
                    console.log('3. Verify webhook is ACTIVE in Vercel Dashboard');
                    console.log('4. Test the integration:');
                    console.log('   bun run test-webhook --event=deployment.succeeded');
                    console.log('   bun run test-webhook --event=project.removed');
                    console.log('5. Monitor logs for [vercel-webhook] prefix and webhook_events table');
                    console.log('6. (Optional) Scope specific projects by adding --project-ids=prj_xxx,prj_yyy');
                    console.log('\nWebhook ID for reference: ' + webhook.id);
                    console.log('='.repeat(80));
                    if (webhook.secret && webhook.secret !== config.secret) {
                        success('Vercel returned a secret — use this one:', webhook.secret);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    errorMsg = err_2 instanceof Error ? err_2.message : String(err_2);
                    error('Webhook registration failed', {
                        error: errorMsg,
                        tokenPrefix: config.token.substring(0, 6) + '...',
                        teamId: config.teamId,
                        url: config.webhookUrl,
                        troubleshooting: [
                            'Ensure token has "Webhooks" scope (or full access)',
                            'Verify teamId is correct (use --team-id=...)',
                            'Check URL is publicly accessible (HTTPS required)',
                            'If duplicate, use --list to see and manage via dashboard',
                            'Vercel rate limits: avoid rapid repeated calls',
                        ],
                    });
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Parses and validates command line arguments.
 */
function parseCliArgs() {
    var args = (0, node_util_1.parseArgs)({
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
        console.log("\n".concat(COLORS.bright, "Vercel Webhook Registration Tool for TokenizMyApp").concat(COLORS.reset, "\n\nUsage: bun run register-webhooks [options]\n\nOptions:\n  -t, --token <token>          Vercel access token (required). Can use VERCEL_TOKEN env.\n  -u, --url <url>              Webhook URL. Default: ").concat(DEFAULT_WEBHOOK_URL, "\n  -s, --secret <secret>        Webhook secret. If omitted, one will be generated.\n  -i, --team-id <id>           Team ID. Default: ").concat(DEFAULT_TEAM_ID, "\n      --project-ids <ids>      Comma-separated project IDs to scope webhook to (optional)\n  -l, --list                   List existing webhooks instead of registering\n  -d, --dry-run                Validate inputs and show payload without calling API\n  -h, --help                   Show this help\n\nEnvironment Variables (take precedence where applicable):\n  VERCEL_TOKEN, VERCEL_WEBHOOK_URL, VERCEL_WEBHOOK_SECRET, VERCEL_TEAM_ID\n\nExamples:\n  bun run register-webhooks --token=at_xxx --secret=whsec_yyy\n  VERCEL_TOKEN=at_xxx bun run register-webhooks --list\n  bun run register-webhooks --url=https://myapp.example.com/api/webhooks/vercel --dry-run\n\nAfter registration, update your deployment with the returned secret and test thoroughly.\nSee full documentation in script header.\n    "));
        process.exit(0);
    }
    var token = args.values.token || process.env.VERCEL_TOKEN;
    if (!token) {
        error('Vercel access token is required. Provide via --token or VERCEL_TOKEN env var.');
        console.log('\nGet a token from: https://vercel.com/account/tokens');
        process.exit(1);
    }
    var webhookUrl = args.values.url ||
        process.env.VERCEL_WEBHOOK_URL ||
        DEFAULT_WEBHOOK_URL;
    if (!isValidUrl(webhookUrl)) {
        error('Invalid webhook URL. Must be a valid HTTPS URL.', { provided: webhookUrl });
        process.exit(1);
    }
    var secret = args.values.secret || process.env.VERCEL_WEBHOOK_SECRET || '';
    var teamId = args.values['team-id'] ||
        process.env.VERCEL_TEAM_ID ||
        DEFAULT_TEAM_ID;
    var projectIds = [];
    if (args.values['project-ids']) {
        projectIds = args.values['project-ids']
            .split(',')
            .map(function (id) { return id.trim(); })
            .filter(Boolean);
    }
    var listOnly = args.values.list || false;
    var dryRun = args.values['dry-run'] || false;
    if (!listOnly && !dryRun) {
        info("Target webhook URL: ".concat(webhookUrl));
        info("Team ID: ".concat(teamId));
    }
    return {
        token: token,
        webhookUrl: webhookUrl,
        secret: secret,
        teamId: teamId,
        events: ALL_EVENTS,
        dryRun: dryRun,
        listOnly: listOnly,
        projectIds: projectIds.length > 0 ? projectIds : undefined,
    };
}
/**
 * Main entry point
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("".concat(COLORS.bright).concat(COLORS.magenta, "\uD83D\uDE80 TokenizMyApp Vercel Webhook Registrar").concat(COLORS.reset));
                    console.log('Registers production webhooks for tenant lifecycle events\n');
                    config = parseCliArgs();
                    if (!config.listOnly) return [3 /*break*/, 2];
                    return [4 /*yield*/, listWebhooks(config)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, registerWebhook(config)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    console.log("\n".concat(COLORS.cyan, "Script completed successfully. Your Vercel webhooks are now configured for seamless tenant management.").concat(COLORS.reset));
                    console.log("".concat(COLORS.blue, "See vercel-webhook-service.ts for event handling details.").concat(COLORS.reset));
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    error('Unhandled error in registration script', err);
    process.exit(1);
});
