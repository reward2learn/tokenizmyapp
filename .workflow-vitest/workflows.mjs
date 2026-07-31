// biome-ignore-all lint: generated file
/* eslint-disable */
import { workflowEntrypoint } from 'workflow/runtime';

const workflowCode = `globalThis.__private_workflows = new Map();
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\\d+)?\\.?\\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?\$/i.exec(str);
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    __name(parse, "parse");
    function fmtShort(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d) {
        return Math.round(ms2 / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms2 / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms2 / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms2 / s) + "s";
      }
      return ms2 + "ms";
    }
    __name(fmtShort, "fmtShort");
    function fmtLong(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d) {
        return plural(ms2, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms2, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms2, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms2, msAbs, s, "second");
      }
      return ms2 + " ms";
    }
    __name(fmtLong, "fmtLong");
    function plural(ms2, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
    }
    __name(plural, "plural");
  }
});

// node_modules/@workflow/utils/dist/time.js
var import_ms = __toESM(require_ms(), 1);
function parseDurationToDate(param) {
  if (typeof param === "string") {
    const durationMs = (0, import_ms.default)(param);
    if (typeof durationMs !== "number" || durationMs < 0) {
      throw new Error(\`Invalid duration: "\${param}". Expected a valid duration string like "1s", "1m", "1h", etc.\`);
    }
    return new Date(Date.now() + durationMs);
  } else if (typeof param === "number") {
    if (param < 0 || !Number.isFinite(param)) {
      throw new Error(\`Invalid duration: \${param}. Expected a non-negative finite number of milliseconds.\`);
    }
    return new Date(Date.now() + param);
  } else if (param instanceof Date || param && typeof param === "object" && typeof param.getTime === "function") {
    return param instanceof Date ? param : new Date(param.getTime());
  } else {
    throw new Error(\`Invalid duration parameter. Expected a duration string, number (milliseconds), or Date object.\`);
  }
}
__name(parseDurationToDate, "parseDurationToDate");

// node_modules/@workflow/errors/dist/index.js
var BASE_URL = "https://useworkflow.dev/err";
function isError(value) {
  return typeof value === "object" && value !== null && "name" in value && "message" in value;
}
__name(isError, "isError");
var ERROR_SLUGS = {
  NODE_JS_MODULE_IN_WORKFLOW: "node-js-module-in-workflow",
  START_INVALID_WORKFLOW_FUNCTION: "start-invalid-workflow-function",
  SERIALIZATION_FAILED: "serialization-failed",
  WEBHOOK_INVALID_RESPOND_WITH_VALUE: "webhook-invalid-respond-with-value",
  WEBHOOK_RESPONSE_NOT_SENT: "webhook-response-not-sent",
  FETCH_IN_WORKFLOW_FUNCTION: "fetch-in-workflow",
  TIMEOUT_FUNCTIONS_IN_WORKFLOW: "timeout-in-workflow",
  HOOK_CONFLICT: "hook-conflict",
  CORRUPTED_EVENT_LOG: "corrupted-event-log",
  REPLAY_DIVERGENCE: "replay-divergence",
  STEP_NOT_REGISTERED: "step-not-registered",
  WORKFLOW_NOT_REGISTERED: "workflow-not-registered",
  RUNTIME_DECRYPTION_FAILED: "runtime-decryption-failed"
};
var WorkflowError = class extends Error {
  static {
    __name(this, "WorkflowError");
  }
  cause;
  constructor(message, options) {
    const msgDocs = options?.slug ? \`\${message}

Learn more: \${BASE_URL}/\${options.slug}\` : message;
    super(msgDocs, {
      cause: options?.cause
    });
    this.cause = options?.cause;
    if (options?.cause instanceof Error) {
      this.stack = \`\${this.stack}
Caused by: \${options.cause.stack}\`;
    }
  }
  static is(value) {
    return isError(value) && value.name === "WorkflowError";
  }
};
var HookConflictError = class extends WorkflowError {
  static {
    __name(this, "HookConflictError");
  }
  token;
  // TODO: Make this required once all persisted hook_conflict events and World
  // implementations always include the active hook owner's run ID.
  conflictingRunId;
  constructor(token, conflictingRunId) {
    super(\`Hook token "\${token}" is already in use by another workflow\${conflictingRunId ? \` (run "\${conflictingRunId}")\` : ""}\`, {
      slug: ERROR_SLUGS.HOOK_CONFLICT
    });
    this.name = "HookConflictError";
    this.token = token;
    if (conflictingRunId !== void 0) {
      this.conflictingRunId = conflictingRunId;
    }
  }
  static is(value) {
    return isError(value) && value.name === "HookConflictError";
  }
};
var FatalError = class extends Error {
  static {
    __name(this, "FatalError");
  }
  fatal = true;
  constructor(message) {
    super(message);
    this.name = "FatalError";
  }
  static is(value) {
    return isError(value) && value.name === "FatalError";
  }
};
var RetryableError = class extends Error {
  static {
    __name(this, "RetryableError");
  }
  /**
   * The Date when the step should be retried.
   */
  retryAfter;
  constructor(message, options = {}) {
    super(message);
    this.name = "RetryableError";
    if (options.retryAfter !== void 0) {
      this.retryAfter = parseDurationToDate(options.retryAfter);
    } else {
      this.retryAfter = new Date(Date.now() + 1e3);
    }
  }
  static is(value) {
    return isError(value) && value.name === "RetryableError";
  }
};
var FATAL_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//FatalError");
var RETRYABLE_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//RetryableError");
var HOOK_CONFLICT_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//HookConflictError");
if (typeof globalThis !== "undefined") {
  if (!Object.hasOwn(globalThis, FATAL_ERROR_KEY)) {
    Object.defineProperty(globalThis, FATAL_ERROR_KEY, {
      value: FatalError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  if (!Object.hasOwn(globalThis, RETRYABLE_ERROR_KEY)) {
    Object.defineProperty(globalThis, RETRYABLE_ERROR_KEY, {
      value: RetryableError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  if (!Object.hasOwn(globalThis, HOOK_CONFLICT_ERROR_KEY)) {
    Object.defineProperty(globalThis, HOOK_CONFLICT_ERROR_KEY, {
      value: HookConflictError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
}

// node_modules/@workflow/core/dist/symbols.js
var WORKFLOW_SLEEP = /* @__PURE__ */ Symbol.for("WORKFLOW_SLEEP");
var WORKFLOW_GET_STREAM_ID = /* @__PURE__ */ Symbol.for("WORKFLOW_GET_STREAM_ID");
var STREAM_NAME_SYMBOL = /* @__PURE__ */ Symbol.for("WORKFLOW_STREAM_NAME");

// node_modules/@workflow/core/dist/sleep.js
async function sleep(param) {
  const sleepFn = globalThis[WORKFLOW_SLEEP];
  if (!sleepFn) {
    throw new Error("\`sleep()\` can only be called inside a workflow function");
  }
  return sleepFn(param);
}
__name(sleep, "sleep");

// node_modules/@workflow/core/dist/workflow/writable-stream.js
function getWritable(options = {}) {
  const { namespace } = options;
  const name = globalThis[WORKFLOW_GET_STREAM_ID](namespace);
  return Object.create(globalThis.WritableStream.prototype, {
    [STREAM_NAME_SYMBOL]: {
      value: name,
      writable: false
    }
  });
}
__name(getWritable, "getWritable");

// node_modules/workflow/dist/stdlib.js
var fetch = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//workflow@4.7.0//fetch");

// workflows/workbook-ingest/steps.ts
var loadWorkbookStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//loadWorkbookStep");
var extractSheetsStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//extractSheetsStep");
var analyzeSheetsStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//analyzeSheetsStep");
var comprehendWorkbookStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//comprehendWorkbookStep");
var emitProgressStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//emitProgressStep");
var closeProgressStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//closeProgressStep");
var populateProjectionsStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//populateProjectionsStep");
var upsertSheetPagesStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//upsertSheetPagesStep");
var saveSnippetsStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//saveSnippetsStep");
var selectTemplateStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//selectTemplateStep");
var registerDynamicPagesStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//registerDynamicPagesStep");
var generateBusinessReviewStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//generateBusinessReviewStep");
var generateExecutiveSummaryStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//generateExecutiveSummaryStep");
var generateDashboardStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/workbook-ingest/steps//generateDashboardStep");

// workflows/workbook-ingest/index.ts
async function handleWorkbookIngest(input) {
  const writable = getWritable();
  const model = input.model ?? "gpt-4o";
  const dbUrl = input.dbUrl;
  const started = {
    step: "started",
    message: \`Workbook ingest started \\u2014 \${input.files.length} file(s), model \${model}\`,
    pct: 0
  };
  await emitProgressStep(writable, started);
  const buffers = await loadWorkbookStep(input.files);
  await emitProgressStep(writable, {
    step: "loading",
    message: \`Loaded \${buffers.length} file(s) \\u2014 validating .xlsx contents\\u2026\`,
    pct: 15
  });
  const sheets = await extractSheetsStep(buffers);
  await emitProgressStep(writable, {
    step: "extracting",
    message: \`Extracted \${sheets.length} sheet(s) across \${buffers.length} file(s).\`,
    pct: 45,
    detail: {
      sheets: sheets.length,
      tabNames: sheets.map((s) => s.tabName)
    }
  });
  const hints = await analyzeSheetsStep(sheets);
  await emitProgressStep(writable, {
    step: "analyzing",
    message: \`Analyzed \${hints.sheets.length} sheet(s) \\u2014 \${hints.workbook.totalRows} rows, \${Math.round(hints.workbook.overallNumericRatio * 100)}% numeric, currency \${hints.workbook.currencyGuess ?? "unknown"}, period \${hints.workbook.periodGuess ?? "unknown"}.\`,
    pct: 70,
    detail: {
      totalRows: hints.workbook.totalRows,
      overallNumericRatio: hints.workbook.overallNumericRatio,
      currencyGuess: hints.workbook.currencyGuess,
      periodGuess: hints.workbook.periodGuess
    }
  });
  const comprehension = await comprehendWorkbookStep(sheets, hints, model, input.openaiApiKey);
  await emitProgressStep(writable, {
    step: "comprehending",
    message: \`Comprehended \${comprehension.comprehension.sheets.length} sheet(s) \\u2014 \${comprehension.comprehension.projections.length} projections, template "\${comprehension.comprehension.template?.id ?? "none"}" (\${model}).\`,
    pct: 90,
    detail: {
      sheets: comprehension.comprehension.sheets.length,
      projections: comprehension.comprehension.projections.length,
      template: comprehension.comprehension.template?.id ?? null
    }
  });
  const templateFit = await selectTemplateStep(comprehension.comprehension);
  await emitProgressStep(writable, {
    step: "populating",
    message: \`Populating \${comprehension.comprehension.projections.length} projections into DB\\u2026\`,
    pct: 92,
    detail: {
      projectionsCount: comprehension.comprehension.projections.length
    }
  });
  const projectionsCount = await populateProjectionsStep(comprehension.comprehension, dbUrl);
  const pagesCreated = await upsertSheetPagesStep(comprehension.comprehension, dbUrl, input.tenantSlug);
  const pagesRegistered = await registerDynamicPagesStep(comprehension.comprehension);
  const snippetsCount = await saveSnippetsStep(comprehension.comprehension, model, dbUrl);
  const apiKey = input.openaiApiKey || process.env.OPENAI_API_KEY;
  let brParts = 0;
  let esSaved = false;
  let dashboardSaved = false;
  if (apiKey && !input.skipContentGeneration) {
    await emitProgressStep(writable, {
      step: "generating",
      message: "Generating AI content (Business Review \\u2192 Executive Summary \\u2192 Dashboard Data)...",
      pct: 95
    });
    brParts = await generateBusinessReviewStep(comprehension.comprehension, apiKey, dbUrl, model);
    await sleep("1s");
    esSaved = await generateExecutiveSummaryStep(comprehension.comprehension, apiKey, dbUrl, model);
    await sleep("1s");
    dashboardSaved = await generateDashboardStep(comprehension.comprehension, apiKey, dbUrl, model);
  }
  const contentGenerated = brParts > 0 || esSaved || dashboardSaved;
  await emitProgressStep(writable, {
    step: "complete",
    message: \`Workbook ingest complete \\u2014 \${projectionsCount} projections, \${pagesCreated.length} sheet pages, \${snippetsCount} snippets, content generated: \${contentGenerated}. Template: \${templateFit.recommended} (score \${templateFit.score}).\`,
    pct: 100,
    detail: {
      projectionsCount,
      pagesCreated: pagesCreated.length,
      pagesRegistered,
      snippetsCount,
      contentGenerated,
      brParts,
      esSaved,
      dashboardSaved,
      template: templateFit.recommended,
      templateScore: templateFit.score
    }
  });
  await closeProgressStep(writable);
  return {
    stage: "complete",
    message: \`Extracted \${sheets.length} sheet(s) from \${buffers.length} file(s), comprehended with \${model}, populated \${projectionsCount} projections + \${pagesCreated.length} sheet pages, content generated: \${contentGenerated} (template \${templateFit.recommended}).\`,
    sheetCount: sheets.length,
    hints,
    sheets: sheets.map(({ tabName, text }) => ({
      tabName,
      text
    })),
    comprehension: comprehension.comprehension,
    model,
    projectionsCount,
    pagesCreated,
    templateFit,
    contentGenerated,
    brParts,
    esSaved,
    dashboardSaved
  };
}
__name(handleWorkbookIngest, "handleWorkbookIngest");
handleWorkbookIngest.workflowId = "workflow//./workflows/workbook-ingest/index//handleWorkbookIngest";
globalThis.__private_workflows.set("workflow//./workflows/workbook-ingest/index//handleWorkbookIngest", handleWorkbookIngest);

// node_modules/builtin-modules/builtin-modules.json
var builtin_modules_default = [
  "node:assert",
  "assert",
  "node:assert/strict",
  "assert/strict",
  "node:async_hooks",
  "async_hooks",
  "node:buffer",
  "buffer",
  "node:child_process",
  "child_process",
  "node:cluster",
  "cluster",
  "node:console",
  "console",
  "node:constants",
  "constants",
  "node:crypto",
  "crypto",
  "node:dgram",
  "dgram",
  "node:diagnostics_channel",
  "diagnostics_channel",
  "node:dns",
  "dns",
  "node:dns/promises",
  "dns/promises",
  "node:domain",
  "domain",
  "node:events",
  "events",
  "node:fs",
  "fs",
  "node:fs/promises",
  "fs/promises",
  "node:http",
  "http",
  "node:http2",
  "http2",
  "node:https",
  "https",
  "node:inspector",
  "inspector",
  "node:inspector/promises",
  "inspector/promises",
  "node:module",
  "module",
  "node:net",
  "net",
  "node:os",
  "os",
  "node:path",
  "path",
  "node:path/posix",
  "path/posix",
  "node:path/win32",
  "path/win32",
  "node:perf_hooks",
  "perf_hooks",
  "node:process",
  "process",
  "node:querystring",
  "querystring",
  "node:quic",
  "node:readline",
  "readline",
  "node:readline/promises",
  "readline/promises",
  "node:repl",
  "repl",
  "node:sea",
  "node:sqlite",
  "node:stream",
  "stream",
  "node:stream/consumers",
  "stream/consumers",
  "node:stream/promises",
  "stream/promises",
  "node:stream/web",
  "stream/web",
  "node:string_decoder",
  "string_decoder",
  "node:test",
  "node:test/reporters",
  "node:timers",
  "timers",
  "node:timers/promises",
  "timers/promises",
  "node:tls",
  "tls",
  "node:trace_events",
  "trace_events",
  "node:tty",
  "tty",
  "node:url",
  "url",
  "node:util",
  "util",
  "node:util/types",
  "util/types",
  "node:v8",
  "v8",
  "node:vm",
  "vm",
  "node:wasi",
  "wasi",
  "node:worker_threads",
  "worker_threads",
  "node:zlib",
  "zlib"
];

// node_modules/builtin-modules/index.js
var builtin_modules_default2 = builtin_modules_default;

// node_modules/@workflow/builders/dist/serde-checker.js
var nodeBuiltins = builtin_modules_default2.join("|");
var nodeImportExtractRegex = new RegExp(\`(?:from\\\\s+['"](?:node:)?((?:\${nodeBuiltins})(?:/[^'"]*)?)['"]|require\\\\s*\\\\(\\\\s*['"](?:node:)?((?:\${nodeBuiltins})(?:/[^'"]*)?)['"]\\\\s*\\\\))\`, "g");
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL21zL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvdXRpbHMvc3JjL3RpbWUudHMiLCAibm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9lcnJvcnMvc3JjL2luZGV4LnRzIiwgIm5vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvc3ltYm9scy50cyIsICJub2RlX21vZHVsZXMvQHdvcmtmbG93L2NvcmUvc3JjL3NsZWVwLnRzIiwgIm5vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cvd3JpdGFibGUtc3RyZWFtLnRzIiwgIm5vZGVfbW9kdWxlcy93b3JrZmxvdy9zcmMvc3RkbGliLnRzIiwgIndvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMudHMiLCAid29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9pbmRleC50cyIsICJub2RlX21vZHVsZXMvYnVpbHRpbi1tb2R1bGVzL2J1aWx0aW4tbW9kdWxlcy5qc29uIiwgIm5vZGVfbW9kdWxlcy9idWlsdGluLW1vZHVsZXMvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9idWlsZGVycy9zcmMvc2VyZGUtY2hlY2tlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBIZWxwZXJzLlxuICovIHZhciBzID0gMTAwMDtcbnZhciBtID0gcyAqIDYwO1xudmFyIGggPSBtICogNjA7XG52YXIgZCA9IGggKiAyNDtcbnZhciB3ID0gZCAqIDc7XG52YXIgeSA9IGQgKiAzNjUuMjU7XG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqLyBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlKHZhbCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh2YWwpKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgdmFsaWQgbnVtYmVyLiB2YWw9JyArIEpTT04uc3RyaW5naWZ5KHZhbCkpO1xufTtcbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovIGZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgIGlmIChzdHIubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG1hdGNoID0gL14oLT8oPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHdlZWtzP3x3fHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKHN0cik7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gICAgdmFyIHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgIGNhc2UgJ3lycyc6XG4gICAgICAgIGNhc2UgJ3lyJzpcbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHk7XG4gICAgICAgIGNhc2UgJ3dlZWtzJzpcbiAgICAgICAgY2FzZSAnd2Vlayc6XG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiB3O1xuICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIGQ7XG4gICAgICAgIGNhc2UgJ2hvdXJzJzpcbiAgICAgICAgY2FzZSAnaG91cic6XG4gICAgICAgIGNhc2UgJ2hycyc6XG4gICAgICAgIGNhc2UgJ2hyJzpcbiAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIGg7XG4gICAgICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICBjYXNlICdtaW5zJzpcbiAgICAgICAgY2FzZSAnbWluJzpcbiAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIG07XG4gICAgICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICBjYXNlICdzZWNzJzpcbiAgICAgICAgY2FzZSAnc2VjJzpcbiAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHM7XG4gICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICAgICAgY2FzZSAnbXNlY3MnOlxuICAgICAgICBjYXNlICdtc2VjJzpcbiAgICAgICAgY2FzZSAnbXMnOlxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbn1cbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi8gZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgICB2YXIgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBkKSArICdkJztcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IG0pIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IHMpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBzKSArICdzJztcbiAgICB9XG4gICAgcmV0dXJuIG1zICsgJ21zJztcbn1cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqLyBmdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gICAgdmFyIG1zQWJzID0gTWF0aC5hYnMobXMpO1xuICAgIGlmIChtc0FicyA+PSBkKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBkLCAnZGF5Jyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBoKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBoLCAnaG91cicpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgbSwgJ21pbnV0ZScpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgcywgJ3NlY29uZCcpO1xuICAgIH1cbiAgICByZXR1cm4gbXMgKyAnIG1zJztcbn1cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi8gZnVuY3Rpb24gcGx1cmFsKG1zLCBtc0FicywgbiwgbmFtZSkge1xuICAgIHZhciBpc1BsdXJhbCA9IG1zQWJzID49IG4gKiAxLjU7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBuKSArICcgJyArIG5hbWUgKyAoaXNQbHVyYWwgPyAncycgOiAnJyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcbmltcG9ydCBtcyBmcm9tICdtcyc7XG5cbi8qKlxuICogUGFyc2VzIGEgZHVyYXRpb24gcGFyYW1ldGVyIChzdHJpbmcsIG51bWJlciwgb3IgRGF0ZSkgYW5kIHJldHVybnMgYSBEYXRlIG9iamVjdFxuICogcmVwcmVzZW50aW5nIHdoZW4gdGhlIGR1cmF0aW9uIHNob3VsZCBlbGFwc2UuXG4gKlxuICogLSBGb3Igc3RyaW5nczogUGFyc2VzIGR1cmF0aW9uIHN0cmluZ3MgbGlrZSBcIjFzXCIsIFwiNW1cIiwgXCIxaFwiLCBldGMuIHVzaW5nIHRoZSBgbXNgIGxpYnJhcnlcbiAqIC0gRm9yIG51bWJlcnM6IFRyZWF0cyBhcyBtaWxsaXNlY29uZHMgZnJvbSBub3dcbiAqIC0gRm9yIERhdGUgb2JqZWN0czogUmV0dXJucyB0aGUgZGF0ZSBkaXJlY3RseSAoaGFuZGxlcyBib3RoIERhdGUgaW5zdGFuY2VzIGFuZCBkYXRlLWxpa2Ugb2JqZWN0cyBmcm9tIGRlc2VyaWFsaXphdGlvbilcbiAqXG4gKiBAcGFyYW0gcGFyYW0gLSBUaGUgZHVyYXRpb24gcGFyYW1ldGVyIChTdHJpbmdWYWx1ZSwgRGF0ZSwgb3IgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcylcbiAqIEByZXR1cm5zIEEgRGF0ZSBvYmplY3QgcmVwcmVzZW50aW5nIHdoZW4gdGhlIGR1cmF0aW9uIHNob3VsZCBlbGFwc2VcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcGFyYW1ldGVyIGlzIGludmFsaWQgb3IgY2Fubm90IGJlIHBhcnNlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEdXJhdGlvblRvRGF0ZShwYXJhbTogU3RyaW5nVmFsdWUgfCBEYXRlIHwgbnVtYmVyKTogRGF0ZSB7XG4gIGlmICh0eXBlb2YgcGFyYW0gPT09ICdzdHJpbmcnKSB7XG4gICAgY29uc3QgZHVyYXRpb25NcyA9IG1zKHBhcmFtKTtcbiAgICBpZiAodHlwZW9mIGR1cmF0aW9uTXMgIT09ICdudW1iZXInIHx8IGR1cmF0aW9uTXMgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGR1cmF0aW9uOiBcIiR7cGFyYW19XCIuIEV4cGVjdGVkIGEgdmFsaWQgZHVyYXRpb24gc3RyaW5nIGxpa2UgXCIxc1wiLCBcIjFtXCIsIFwiMWhcIiwgZXRjLmBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLm5vdygpICsgZHVyYXRpb25Ncyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtID09PSAnbnVtYmVyJykge1xuICAgIGlmIChwYXJhbSA8IDAgfHwgIU51bWJlci5pc0Zpbml0ZShwYXJhbSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgZHVyYXRpb246ICR7cGFyYW19LiBFeHBlY3RlZCBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5gXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5ub3coKSArIHBhcmFtKTtcbiAgfSBlbHNlIGlmIChcbiAgICBwYXJhbSBpbnN0YW5jZW9mIERhdGUgfHxcbiAgICAocGFyYW0gJiZcbiAgICAgIHR5cGVvZiBwYXJhbSA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiAocGFyYW0gYXMgYW55KS5nZXRUaW1lID09PSAnZnVuY3Rpb24nKVxuICApIHtcbiAgICAvLyBIYW5kbGUgYm90aCBEYXRlIGluc3RhbmNlcyBhbmQgZGF0ZS1saWtlIG9iamVjdHMgKGZyb20gZGVzZXJpYWxpemF0aW9uKVxuICAgIHJldHVybiBwYXJhbSBpbnN0YW5jZW9mIERhdGUgPyBwYXJhbSA6IG5ldyBEYXRlKChwYXJhbSBhcyBhbnkpLmdldFRpbWUoKSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEludmFsaWQgZHVyYXRpb24gcGFyYW1ldGVyLiBFeHBlY3RlZCBhIGR1cmF0aW9uIHN0cmluZywgbnVtYmVyIChtaWxsaXNlY29uZHMpLCBvciBEYXRlIG9iamVjdC5gXG4gICAgKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IHBhcnNlRHVyYXRpb25Ub0RhdGUgfSBmcm9tICdAd29ya2Zsb3cvdXRpbHMnO1xuaW1wb3J0IHR5cGUgeyBTdHJ1Y3R1cmVkRXJyb3IgfSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0IHR5cGUgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcblxuY29uc3QgQkFTRV9VUkwgPSAnaHR0cHM6Ly91c2V3b3JrZmxvdy5kZXYvZXJyJztcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqIENoZWNrIGlmIGEgdmFsdWUgaXMgYW4gRXJyb3Igd2l0aG91dCByZWx5aW5nIG9uIE5vZGUuanMgdXRpbGl0aWVzLlxuICogVGhpcyBpcyBuZWVkZWQgZm9yIGVycm9yIGNsYXNzZXMgdGhhdCBjYW4gYmUgdXNlZCBpbiBWTSBjb250ZXh0cyB3aGVyZVxuICogTm9kZS5qcyBpbXBvcnRzIGFyZSBub3QgYXZhaWxhYmxlLlxuICovXG5mdW5jdGlvbiBpc0Vycm9yKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgeyBuYW1lOiBzdHJpbmc7IG1lc3NhZ2U6IHN0cmluZyB9IHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgdmFsdWUgIT09IG51bGwgJiZcbiAgICAnbmFtZScgaW4gdmFsdWUgJiZcbiAgICAnbWVzc2FnZScgaW4gdmFsdWVcbiAgKTtcbn1cblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqIEFsbCB0aGUgc2x1Z3Mgb2YgdGhlIGVycm9ycyB1c2VkIGZvciBkb2N1bWVudGF0aW9uIGxpbmtzLlxuICovXG5leHBvcnQgY29uc3QgRVJST1JfU0xVR1MgPSB7XG4gIE5PREVfSlNfTU9EVUxFX0lOX1dPUktGTE9XOiAnbm9kZS1qcy1tb2R1bGUtaW4td29ya2Zsb3cnLFxuICBTVEFSVF9JTlZBTElEX1dPUktGTE9XX0ZVTkNUSU9OOiAnc3RhcnQtaW52YWxpZC13b3JrZmxvdy1mdW5jdGlvbicsXG4gIFNFUklBTElaQVRJT05fRkFJTEVEOiAnc2VyaWFsaXphdGlvbi1mYWlsZWQnLFxuICBXRUJIT09LX0lOVkFMSURfUkVTUE9ORF9XSVRIX1ZBTFVFOiAnd2ViaG9vay1pbnZhbGlkLXJlc3BvbmQtd2l0aC12YWx1ZScsXG4gIFdFQkhPT0tfUkVTUE9OU0VfTk9UX1NFTlQ6ICd3ZWJob29rLXJlc3BvbnNlLW5vdC1zZW50JyxcbiAgRkVUQ0hfSU5fV09SS0ZMT1dfRlVOQ1RJT046ICdmZXRjaC1pbi13b3JrZmxvdycsXG4gIFRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XOiAndGltZW91dC1pbi13b3JrZmxvdycsXG4gIEhPT0tfQ09ORkxJQ1Q6ICdob29rLWNvbmZsaWN0JyxcbiAgQ09SUlVQVEVEX0VWRU5UX0xPRzogJ2NvcnJ1cHRlZC1ldmVudC1sb2cnLFxuICBSRVBMQVlfRElWRVJHRU5DRTogJ3JlcGxheS1kaXZlcmdlbmNlJyxcbiAgU1RFUF9OT1RfUkVHSVNURVJFRDogJ3N0ZXAtbm90LXJlZ2lzdGVyZWQnLFxuICBXT1JLRkxPV19OT1RfUkVHSVNURVJFRDogJ3dvcmtmbG93LW5vdC1yZWdpc3RlcmVkJyxcbiAgUlVOVElNRV9ERUNSWVBUSU9OX0ZBSUxFRDogJ3J1bnRpbWUtZGVjcnlwdGlvbi1mYWlsZWQnLFxufSBhcyBjb25zdDtcblxudHlwZSBFcnJvclNsdWcgPSAodHlwZW9mIEVSUk9SX1NMVUdTKVtrZXlvZiB0eXBlb2YgRVJST1JfU0xVR1NdO1xuXG5pbnRlcmZhY2UgV29ya2Zsb3dFcnJvck9wdGlvbnMgZXh0ZW5kcyBFcnJvck9wdGlvbnMge1xuICAvKipcbiAgICogVGhlIHNsdWcgb2YgdGhlIGVycm9yLiBUaGlzIHdpbGwgYmUgdXNlZCB0byBnZW5lcmF0ZSBhIGxpbmsgdG8gdGhlIGVycm9yIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBzbHVnPzogRXJyb3JTbHVnO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGNsYXNzIGZvciBhbGwgV29ya2Zsb3ctcmVsYXRlZCBlcnJvcnMuXG4gKlxuICogVGhpcyBlcnJvciBpcyB0aHJvd24gYnkgdGhlIFdvcmtmbG93IFNESyB3aGVuIGludGVybmFsIG9wZXJhdGlvbnMgZmFpbC5cbiAqIFlvdSBjYW4gdXNlIHRoaXMgY2xhc3Mgd2l0aCBgaW5zdGFuY2VvZmAgdG8gY2F0Y2ggYW55IFdvcmtmbG93IFNESyBlcnJvci5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIHRyeSB7XG4gKiAgIGF3YWl0IGdldFJ1bihydW5JZCk7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBXb3JrZmxvd0Vycm9yKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcignV29ya2Zsb3cgU0RLIGVycm9yOicsIGVycm9yLm1lc3NhZ2UpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHJlYWRvbmx5IGNhdXNlPzogdW5rbm93bjtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM/OiBXb3JrZmxvd0Vycm9yT3B0aW9ucykge1xuICAgIGNvbnN0IG1zZ0RvY3MgPSBvcHRpb25zPy5zbHVnXG4gICAgICA/IGAke21lc3NhZ2V9XFxuXFxuTGVhcm4gbW9yZTogJHtCQVNFX1VSTH0vJHtvcHRpb25zLnNsdWd9YFxuICAgICAgOiBtZXNzYWdlO1xuICAgIHN1cGVyKG1zZ0RvY3MsIHsgY2F1c2U6IG9wdGlvbnM/LmNhdXNlIH0pO1xuICAgIHRoaXMuY2F1c2UgPSBvcHRpb25zPy5jYXVzZTtcblxuICAgIGlmIChvcHRpb25zPy5jYXVzZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aGlzLnN0YWNrID0gYCR7dGhpcy5zdGFja31cXG5DYXVzZWQgYnk6ICR7b3B0aW9ucy5jYXVzZS5zdGFja31gO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93RXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIHdvcmxkIChzdG9yYWdlIGJhY2tlbmQpIG9wZXJhdGlvbiBmYWlscyB1bmV4cGVjdGVkbHkuXG4gKlxuICogVGhpcyBpcyB0aGUgY2F0Y2gtYWxsIGVycm9yIGZvciB3b3JsZCBpbXBsZW1lbnRhdGlvbnMuIFNwZWNpZmljLFxuICogd2VsbC1rbm93biBmYWlsdXJlIG1vZGVzIGhhdmUgZGVkaWNhdGVkIGVycm9yIHR5cGVzIChlLmcuXG4gKiBFbnRpdHlDb25mbGljdEVycm9yLCBSdW5FeHBpcmVkRXJyb3IsIFRocm90dGxlRXJyb3IpLiBUaGlzIGVycm9yXG4gKiBjb3ZlcnMgZXZlcnl0aGluZyBlbHNlIOKAlCB2YWxpZGF0aW9uIGZhaWx1cmVzLCBtaXNzaW5nIGVudGl0aWVzXG4gKiB3aXRob3V0IGEgZGVkaWNhdGVkIHR5cGUsIG9yIHVuZXhwZWN0ZWQgSFRUUCBlcnJvcnMgZnJvbSB3b3JsZC12ZXJjZWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZmxvd1dvcmxkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgc3RhdHVzPzogbnVtYmVyO1xuICBjb2RlPzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG4gIC8qKiBSZXRyeS1BZnRlciB2YWx1ZSBpbiBzZWNvbmRzLCBwcmVzZW50IG9uIDQyOSBhbmQgNDI1IHJlc3BvbnNlcyAqL1xuICByZXRyeUFmdGVyPzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBvcHRpb25zPzoge1xuICAgICAgc3RhdHVzPzogbnVtYmVyO1xuICAgICAgdXJsPzogc3RyaW5nO1xuICAgICAgY29kZT86IHN0cmluZztcbiAgICAgIHJldHJ5QWZ0ZXI/OiBudW1iZXI7XG4gICAgICBjYXVzZT86IHVua25vd247XG4gICAgfVxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7XG4gICAgICBjYXVzZTogb3B0aW9ucz8uY2F1c2UsXG4gICAgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93V29ybGRFcnJvcic7XG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zPy5zdGF0dXM7XG4gICAgdGhpcy5jb2RlID0gb3B0aW9ucz8uY29kZTtcbiAgICB0aGlzLnVybCA9IG9wdGlvbnM/LnVybDtcbiAgICB0aGlzLnJldHJ5QWZ0ZXIgPSBvcHRpb25zPy5yZXRyeUFmdGVyO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93V29ybGRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIHdvcmtmbG93IHJ1biBmYWlscyBkdXJpbmcgZXhlY3V0aW9uLlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIHRoYXQgdGhlIHdvcmtmbG93IGVuY291bnRlcmVkIGEgZmF0YWwgZXJyb3IgYW5kIGNhbm5vdFxuICogY29udGludWUuIEl0IGlzIHRocm93biB3aGVuIGF3YWl0aW5nIGBydW4ucmV0dXJuVmFsdWVgIG9uIGEgcnVuIHdob3NlIHN0YXR1c1xuICogaXMgYCdmYWlsZWQnYC4gVGhlIGBjYXVzZWAgcHJvcGVydHkgY29udGFpbnMgdGhlIHVuZGVybHlpbmcgZXJyb3Igd2l0aCBpdHNcbiAqIG1lc3NhZ2UsIHN0YWNrIHRyYWNlLCBhbmQgb3B0aW9uYWwgZXJyb3IgY29kZS5cbiAqXG4gKiBVc2UgdGhlIHN0YXRpYyBgV29ya2Zsb3dSdW5GYWlsZWRFcnJvci5pcygpYCBtZXRob2QgZm9yIHR5cGUtc2FmZSBjaGVja2luZ1xuICogaW4gY2F0Y2ggYmxvY2tzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgV29ya2Zsb3dSdW5GYWlsZWRFcnJvciB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9lcnJvcnNcIjtcbiAqXG4gKiB0cnkge1xuICogICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW4ucmV0dXJuVmFsdWU7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoV29ya2Zsb3dSdW5GYWlsZWRFcnJvci5pcyhlcnJvcikpIHtcbiAqICAgICBjb25zb2xlLmVycm9yKGBSdW4gJHtlcnJvci5ydW5JZH0gZmFpbGVkOmAsIGVycm9yLmNhdXNlLm1lc3NhZ2UpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuRmFpbGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcnVuSWQ6IHN0cmluZztcbiAgZGVjbGFyZSBjYXVzZTogRXJyb3IgJiB7IGNvZGU/OiBzdHJpbmcgfTtcblxuICBjb25zdHJ1Y3RvcihydW5JZDogc3RyaW5nLCBlcnJvcjogU3RydWN0dXJlZEVycm9yKSB7XG4gICAgLy8gQ3JlYXRlIGEgcHJvcGVyIEVycm9yIGluc3RhbmNlIGZyb20gdGhlIFN0cnVjdHVyZWRFcnJvciB0byBzZXQgYXMgY2F1c2VcbiAgICAvLyBOT1RFOiBjdXN0b20gZXJyb3IgdHlwZXMgZG8gbm90IGdldCBzZXJpYWxpemVkL2Rlc2VyaWFsaXplZC4gRXZlcnl0aGluZyBpcyBhbiBFcnJvclxuICAgIGNvbnN0IGNhdXNlRXJyb3IgPSBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgaWYgKGVycm9yLnN0YWNrKSB7XG4gICAgICBjYXVzZUVycm9yLnN0YWNrID0gZXJyb3Iuc3RhY2s7XG4gICAgfVxuICAgIGlmIChlcnJvci5jb2RlKSB7XG4gICAgICAoY2F1c2VFcnJvciBhcyBhbnkpLmNvZGUgPSBlcnJvci5jb2RlO1xuICAgIH1cblxuICAgIHN1cGVyKGBXb3JrZmxvdyBydW4gXCIke3J1bklkfVwiIGZhaWxlZDogJHtlcnJvci5tZXNzYWdlfWAsIHtcbiAgICAgIGNhdXNlOiBjYXVzZUVycm9yLFxuICAgIH0pO1xuICAgIHRoaXMubmFtZSA9ICdXb3JrZmxvd1J1bkZhaWxlZEVycm9yJztcbiAgICB0aGlzLnJ1bklkID0gcnVuSWQ7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBXb3JrZmxvd1J1bkZhaWxlZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93UnVuRmFpbGVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYXR0ZW1wdGluZyB0byBnZXQgcmVzdWx0cyBmcm9tIGFuIGluY29tcGxldGUgd29ya2Zsb3cgcnVuLlxuICpcbiAqIFRoaXMgZXJyb3Igb2NjdXJzIHdoZW4geW91IHRyeSB0byBhY2Nlc3MgdGhlIHJlc3VsdCBvZiBhIHdvcmtmbG93XG4gKiB0aGF0IGlzIHN0aWxsIHJ1bm5pbmcgb3IgaGFzbid0IGNvbXBsZXRlZCB5ZXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZmxvd1J1bk5vdENvbXBsZXRlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIHJ1bklkOiBzdHJpbmc7XG4gIHN0YXR1czogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcsIHN0YXR1czogc3RyaW5nKSB7XG4gICAgc3VwZXIoYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgaGFzIG5vdCBjb21wbGV0ZWRgLCB7fSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuTm90Q29tcGxldGVkRXJyb3InO1xuICAgIHRoaXMucnVuSWQgPSBydW5JZDtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93UnVuTm90Q29tcGxldGVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dSdW5Ob3RDb21wbGV0ZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgV29ya2Zsb3cgcnVudGltZSBlbmNvdW50ZXJzIGFuIGludGVybmFsIGVycm9yLlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIGFuIGlzc3VlIHdpdGggd29ya2Zsb3cgZXhlY3V0aW9uLCBzdWNoIGFzXG4gKiBzZXJpYWxpemF0aW9uIGZhaWx1cmVzLCBzdGFydGluZyBhbiBpbnZhbGlkIHdvcmtmbG93IGZ1bmN0aW9uLCBvclxuICogb3RoZXIgcnVudGltZSBwcm9ibGVtcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVudGltZUVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IFdvcmtmbG93RXJyb3JPcHRpb25zKSB7XG4gICAgc3VwZXIobWVzc2FnZSwge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dSdW50aW1lRXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dSdW50aW1lRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dSdW50aW1lRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIHBlcnNpc3RlZCB3b3JrZmxvdyBldmVudCBsb2cgY2Fubm90IGJlIHJlcGxheWVkIGJlY2F1c2UgaXRcbiAqIGNvbnRhaW5zIG9ycGhhbmVkLCBkdXBsaWNhdGUsIG9yIG1pc21hdGNoZWQgZXZlbnRzLlxuICpcbiAqIFRoaXMgaXMgYSBydW50aW1lL2luZnJhc3RydWN0dXJlIGZhaWx1cmUgcmF0aGVyIHRoYW4gdXNlciBjb2RlIHRocm93aW5nLlxuICogV2hlbiB0aGlzIHJlYWNoZXMgcnVuIGZhaWx1cmUgaGFuZGxpbmcsIGl0IGlzIHJlY29yZGVkIHdpdGggdGhlIGRpc3RpbmN0XG4gKiBgQ09SUlVQVEVEX0VWRU5UX0xPR2AgY29kZSBzbyB3b3JsZHMgYW5kIGJhY2tlbmRzIGNhbiB0cmFjayBpdCBzZXBhcmF0ZWx5XG4gKiBmcm9tIGdlbmVyaWMgcnVudGltZSBmYWlsdXJlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvcnJ1cHRlZEV2ZW50TG9nRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1J1bnRpbWVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IEVycm9yT3B0aW9ucykge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBzbHVnOiBFUlJPUl9TTFVHUy5DT1JSVVBURURfRVZFTlRfTE9HLFxuICAgIH0pO1xuICAgIHRoaXMubmFtZSA9ICdDb3JydXB0ZWRFdmVudExvZ0Vycm9yJztcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIENvcnJ1cHRlZEV2ZW50TG9nRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnQ29ycnVwdGVkRXZlbnRMb2dFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25hbCBzdHJ1Y3R1cmVkIGNvbnRleHQgYXR0YWNoZWQgdG8gYSB7QGxpbmsgUnVudGltZURlY3J5cHRpb25FcnJvcn0sXG4gKiBjYXJyaWVkIG92ZXIgZnJvbSB0aGUgdW5kZXJseWluZyBkZWNyeXB0IGNhbGwgc2l0ZSB0byBoZWxwIGRpYWdub3NlIHRoZVxuICogZmFpbHVyZSB3aXRob3V0IHBva2luZyB0aHJvdWdoIHN0YWNrcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSdW50aW1lRGVjcnlwdGlvbkVycm9yQ29udGV4dCB7XG4gIC8qKiBUaGUgb3BlcmF0aW9uIHRoYXQgZmFpbGVkIOKAlCB1c2VmdWwgdG8gdGVsbCBlbmNyeXB0IHZzIGRlY3J5cHQgYXBhcnQuICovXG4gIG9wZXJhdGlvbj86ICdlbmNyeXB0JyB8ICdkZWNyeXB0JztcbiAgLyoqIEJ5dGUgbGVuZ3RoIG9mIHRoZSBpbnB1dCBwYXlsb2FkIGF0IHRoZSB0aW1lIG9mIHRoZSBmYWlsdXJlLiAqL1xuICBieXRlTGVuZ3RoPzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIGZpcnN0IDQgYnl0ZXMgb2YgdGhlIGlucHV0IHBheWxvYWQsIGRlY29kZWQgYXMgVVRGLTggaWYgcHJpbnRhYmxlLlxuICAgKiBVc2VmdWwgZm9yIHRlbGxpbmcgYXBhcnQgdHJ1bmNhdGVkLWJ1dC12YWxpZC1sb29raW5nIGVuY3J5cHRlZCBwYXlsb2Fkc1xuICAgKiBmcm9tIGNvbXBsZXRlbHkgdW5yZWxhdGVkIGNvcnJ1cHRpb24gKGUuZy4gYW4gSFRNTCBlcnJvciBwYWdlIHN1cmZhY2VkXG4gICAqIGFzIGEgMjAwIE9LKS5cbiAgICovXG4gIGZvcm1hdFByZWZpeD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgU0RLJ3MgYnVpbHQtaW4gQUVTLUdDTSBlbmNyeXB0aW9uIGxheWVyIGZhaWxzIHRvIGVuY3J5cHRcbiAqIG9yIGRlY3J5cHQgYSB3b3JrZmxvdyBwYXlsb2FkLlxuICpcbiAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgU0RLIGZhaWx1cmUg4oCUIHVzZXIgY29kZSBuZXZlciBpbnZva2VzIHRoZSBTREsnc1xuICogZW5jcnlwdGlvbiBwcmltaXRpdmVzIGRpcmVjdGx5LiBDb21tb24gY2F1c2VzOlxuICpcbiAqIC0gQSBjaXBoZXJ0ZXh0IC8gYXV0aCB0YWcgbWlzbWF0Y2gsIHR5cGljYWxseSBzdXJmYWNlZCBhcyB0aGUgbmF0aXZlIFdlYlxuICogICBDcnlwdG8gYE9wZXJhdGlvbkVycm9yOiBUaGUgb3BlcmF0aW9uIGZhaWxlZCBmb3IgYW4gb3BlcmF0aW9uLXNwZWNpZmljXG4gKiAgIHJlYXNvbmAuIFVzdWFsbHkgY2F1c2VkIGJ5IGNpcGhlcnRleHQgbXV0YXRpb24gb3IgdHJ1bmNhdGlvbiBpbiB0cmFuc2l0XG4gKiAgIGJldHdlZW4gc3RvcmFnZSBhbmQgcmVhZCAodHJ1bmNhdGVkIEhUVFAgcmVzcG9uc2UsIGVkZ2UtY2FjaGUgbWlzc1xuICogICByZXR1cm5pbmcgYSBwYXJ0aWFsIDIwMCwgcHJveHkgZHJvcCBkdXJpbmcgc3RyZWFtaW5nLCBldGMuKS5cbiAqIC0gQSBrZXkgcmVzb2x1dGlvbiBtaXNtYXRjaCAod3JvbmcgZGVwbG95bWVudCwgbWlzc2luZyBrZXkgbWF0ZXJpYWwpLlxuICogLSBBIG1hbGZvcm1lZCBlbmNyeXB0ZWQgZW52ZWxvcGUgKHRvbyBzaG9ydCB0byBjb250YWluIHRoZSBHQ00gbm9uY2VcbiAqICAgYW5kIHRhZykuXG4gKlxuICogRXh0ZW5kcyB7QGxpbmsgV29ya2Zsb3dSdW50aW1lRXJyb3J9IHNvIHRoZSBydW4tZmFpbHVyZSBjbGFzc2lmaWVyXG4gKiByb3V0ZXMgaXQgdG8gYFJVTlRJTUVfRVJST1JgLlxuICovXG5leHBvcnQgY2xhc3MgUnVudGltZURlY3J5cHRpb25FcnJvciBleHRlbmRzIFdvcmtmbG93UnVudGltZUVycm9yIHtcbiAgLyoqIE9wdGlvbmFsIHN0cnVjdHVyZWQgY29udGV4dCBhYm91dCB0aGUgZmFpbGVkIGVuY3J5cHQvZGVjcnlwdCBjYWxsLiAqL1xuICBkZWNsYXJlIHJlYWRvbmx5IGNvbnRleHQ/OiBSdW50aW1lRGVjcnlwdGlvbkVycm9yQ29udGV4dDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEVycm9yT3B0aW9ucyAmIHsgY29udGV4dD86IFJ1bnRpbWVEZWNyeXB0aW9uRXJyb3JDb250ZXh0IH1cbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwge1xuICAgICAgY2F1c2U6IG9wdGlvbnM/LmNhdXNlLFxuICAgICAgc2x1ZzogRVJST1JfU0xVR1MuUlVOVElNRV9ERUNSWVBUSU9OX0ZBSUxFRCxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnUnVudGltZURlY3J5cHRpb25FcnJvcic7XG4gICAgaWYgKG9wdGlvbnM/LmNvbnRleHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0O1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJ1bnRpbWVEZWNyeXB0aW9uRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUnVudGltZURlY3J5cHRpb25FcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgY3VycmVudCB3b3JrZmxvdyByZXBsYXkgY2Fubm90IGZvbGxvdyB0aGUgcGF0aCBkZXNjcmliZWQgYnlcbiAqIHRoZSByZWNvcmRlZCBldmVudCBsb2cuIEEgc2luZ2xlIGRpdmVyZ2VuY2UgZG9lcyBub3QgcHJvdmUgdGhhdCB0aGVcbiAqIHBlcnNpc3RlZCBoaXN0b3J5IGlzIGludmFsaWQ6IGEgc3Vic2VxdWVudCByZXBsYXkgbWF5IG9ic2VydmUgb3Igc2NoZWR1bGVcbiAqIHdvcmsgY29ycmVjdGx5LCBzbyB0aGUgcnVudGltZSBtYXkgcmVkZWxpdmVyIGJlZm9yZSBkZWNsYXJpbmcgY29ycnVwdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlcGxheURpdmVyZ2VuY2VFcnJvciBleHRlbmRzIFdvcmtmbG93UnVudGltZUVycm9yIHtcbiAgcmVhZG9ubHkgZXZlbnRJZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9uczogRXJyb3JPcHRpb25zICYgeyBldmVudElkOiBzdHJpbmcgfSkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBzbHVnOiBFUlJPUl9TTFVHUy5SRVBMQVlfRElWRVJHRU5DRSxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnUmVwbGF5RGl2ZXJnZW5jZUVycm9yJztcbiAgICB0aGlzLmV2ZW50SWQgPSBvcHRpb25zLmV2ZW50SWQ7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSZXBsYXlEaXZlcmdlbmNlRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUmVwbGF5RGl2ZXJnZW5jZUVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgc3RlcCBmdW5jdGlvbiBpcyBub3QgcmVnaXN0ZXJlZCBpbiB0aGUgY3VycmVudCBkZXBsb3ltZW50LlxuICpcbiAqIFRoaXMgaXMgYW4gaW5mcmFzdHJ1Y3R1cmUgZXJyb3Ig4oCUIG5vdCBhIHVzZXIgY29kZSBlcnJvci4gSXQgdHlwaWNhbGx5IG1lYW5zXG4gKiBzb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSBidW5kbGluZy9idWlsZCB0b29saW5nIHRoYXQgY2F1c2VkIHRoZSBzdGVwXG4gKiB0byBub3QgZ2V0IGJ1aWx0IGNvcnJlY3RseS5cbiAqXG4gKiBXaGVuIHRoaXMgaGFwcGVucywgdGhlIHN0ZXAgZmFpbHMgKGxpa2UgYSBGYXRhbEVycm9yKSBhbmQgY29udHJvbCBpcyBwYXNzZWQgYmFja1xuICogdG8gdGhlIHdvcmtmbG93IGZ1bmN0aW9uLCB3aGljaCBjYW4gb3B0aW9uYWxseSBoYW5kbGUgdGhlIGZhaWx1cmUgZ3JhY2VmdWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0ZXBOb3RSZWdpc3RlcmVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1J1bnRpbWVFcnJvciB7XG4gIHN0ZXBOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioc3RlcE5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKFxuICAgICAgYFN0ZXAgXCIke3N0ZXBOYW1lfVwiIGlzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBjdXJyZW50IGRlcGxveW1lbnQuIFRoaXMgdXN1YWxseSBpbmRpY2F0ZXMgYSBidWlsZCBvciBidW5kbGluZyBpc3N1ZSB0aGF0IGNhdXNlZCB0aGUgc3RlcCB0byBub3QgYmUgaW5jbHVkZWQgaW4gdGhlIGRlcGxveW1lbnQuYCxcbiAgICAgIHsgc2x1ZzogRVJST1JfU0xVR1MuU1RFUF9OT1RfUkVHSVNURVJFRCB9XG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnU3RlcE5vdFJlZ2lzdGVyZWRFcnJvcic7XG4gICAgdGhpcy5zdGVwTmFtZSA9IHN0ZXBOYW1lO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgU3RlcE5vdFJlZ2lzdGVyZWRFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdTdGVwTm90UmVnaXN0ZXJlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgd29ya2Zsb3cgZnVuY3Rpb24gaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIGN1cnJlbnQgZGVwbG95bWVudC5cbiAqXG4gKiBUaGlzIGlzIGFuIGluZnJhc3RydWN0dXJlIGVycm9yIOKAlCBub3QgYSB1c2VyIGNvZGUgZXJyb3IuIEl0IHR5cGljYWxseSBtZWFuczpcbiAqIC0gQSBydW4gd2FzIHN0YXJ0ZWQgYWdhaW5zdCBhIGRlcGxveW1lbnQgdGhhdCBkb2VzIG5vdCBoYXZlIHRoZSB3b3JrZmxvd1xuICogICAoZS5nLiwgdGhlIHdvcmtmbG93IHdhcyByZW5hbWVkIG9yIG1vdmVkIGFuZCBhIG5ldyBydW4gdGFyZ2V0ZWQgdGhlIGxhdGVzdCBkZXBsb3ltZW50KVxuICogLSBTb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSBidW5kbGluZy9idWlsZCB0b29saW5nIHRoYXQgY2F1c2VkIHRoZSB3b3JrZmxvd1xuICogICB0byBub3QgZ2V0IGJ1aWx0IGNvcnJlY3RseVxuICpcbiAqIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgcnVuIGZhaWxzIHdpdGggYSBgUlVOVElNRV9FUlJPUmAgZXJyb3IgY29kZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dSdW50aW1lRXJyb3Ige1xuICB3b3JrZmxvd05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih3b3JrZmxvd05hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKFxuICAgICAgYFdvcmtmbG93IFwiJHt3b3JrZmxvd05hbWV9XCIgaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIGN1cnJlbnQgZGVwbG95bWVudC4gVGhpcyB1c3VhbGx5IG1lYW5zIGEgcnVuIHdhcyBzdGFydGVkIGFnYWluc3QgYSBkZXBsb3ltZW50IHRoYXQgZG9lcyBub3QgaGF2ZSB0aGlzIHdvcmtmbG93LCBvciB0aGVyZSB3YXMgYSBidWlsZC9idW5kbGluZyBpc3N1ZS5gLFxuICAgICAgeyBzbHVnOiBFUlJPUl9TTFVHUy5XT1JLRkxPV19OT1RfUkVHSVNURVJFRCB9XG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3InO1xuICAgIHRoaXMud29ya2Zsb3dOYW1lID0gd29ya2Zsb3dOYW1lO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gcGVyZm9ybWluZyBvcGVyYXRpb25zIG9uIGEgd29ya2Zsb3cgcnVuIHRoYXQgZG9lcyBub3QgZXhpc3QuXG4gKlxuICogVGhpcyBlcnJvciBvY2N1cnMgd2hlbiB5b3UgY2FsbCBtZXRob2RzIG9uIGEgcnVuIG9iamVjdCAoZS5nLiBgcnVuLnN0YXR1c2AsXG4gKiBgcnVuLmNhbmNlbCgpYCwgYHJ1bi5yZXR1cm5WYWx1ZWApIGJ1dCB0aGUgdW5kZXJseWluZyBydW4gSUQgZG9lcyBub3QgbWF0Y2hcbiAqIGFueSBrbm93biB3b3JrZmxvdyBydW4uIE5vdGUgdGhhdCBgZ2V0UnVuKGlkKWAgaXRzZWxmIGlzIHN5bmNocm9ub3VzIGFuZCB3aWxsXG4gKiBub3QgdGhyb3cg4oCUIHRoaXMgZXJyb3IgaXMgcmFpc2VkIHdoZW4gc3Vic2VxdWVudCBvcGVyYXRpb25zIGRpc2NvdmVyIHRoZSBydW5cbiAqIGlzIG1pc3NpbmcuXG4gKlxuICogVXNlIHRoZSBzdGF0aWMgYFdvcmtmbG93UnVuTm90Rm91bmRFcnJvci5pcygpYCBtZXRob2QgZm9yIHR5cGUtc2FmZSBjaGVja2luZ1xuICogaW4gY2F0Y2ggYmxvY2tzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHJ1bi5zdGF0dXM7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yLmlzKGVycm9yKSkge1xuICogICAgIGNvbnNvbGUuZXJyb3IoYFJ1biAke2Vycm9yLnJ1bklkfSBkb2VzIG5vdCBleGlzdGApO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuTm90Rm91bmRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBydW5JZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgV29ya2Zsb3cgcnVuIFwiJHtydW5JZH1cIiBub3QgZm91bmRgLCB7fSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuTm90Rm91bmRFcnJvcic7XG4gICAgdGhpcy5ydW5JZCA9IHJ1bklkO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93UnVuTm90Rm91bmRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIGhvb2sgdG9rZW4gaXMgYWxyZWFkeSBpbiB1c2UgYnkgYW5vdGhlciBhY3RpdmUgd29ya2Zsb3cgcnVuLlxuICpcbiAqIFRoaXMgaXMgYSB1c2VyIGVycm9yIOKAlCBpdCBtZWFucyB0aGUgc2FtZSBjdXN0b20gdG9rZW4gd2FzIHBhc3NlZCB0b1xuICogYGNyZWF0ZUhvb2tgIGluIHR3byBvciBtb3JlIGNvbmN1cnJlbnQgcnVucy4gVXNlIGEgdW5pcXVlIHRva2VuIHBlciBydW5cbiAqIChvciBvbWl0IHRoZSB0b2tlbiB0byBsZXQgdGhlIHJ1bnRpbWUgZ2VuZXJhdGUgb25lIGF1dG9tYXRpY2FsbHkpLlxuICovXG5leHBvcnQgY2xhc3MgSG9va0NvbmZsaWN0RXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgdG9rZW46IHN0cmluZztcbiAgLy8gVE9ETzogTWFrZSB0aGlzIHJlcXVpcmVkIG9uY2UgYWxsIHBlcnNpc3RlZCBob29rX2NvbmZsaWN0IGV2ZW50cyBhbmQgV29ybGRcbiAgLy8gaW1wbGVtZW50YXRpb25zIGFsd2F5cyBpbmNsdWRlIHRoZSBhY3RpdmUgaG9vayBvd25lcidzIHJ1biBJRC5cbiAgY29uZmxpY3RpbmdSdW5JZD86IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nLCBjb25mbGljdGluZ1J1bklkPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoXG4gICAgICBgSG9vayB0b2tlbiBcIiR7dG9rZW59XCIgaXMgYWxyZWFkeSBpbiB1c2UgYnkgYW5vdGhlciB3b3JrZmxvdyR7Y29uZmxpY3RpbmdSdW5JZCA/IGAgKHJ1biBcIiR7Y29uZmxpY3RpbmdSdW5JZH1cIilgIDogJyd9YCxcbiAgICAgIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuSE9PS19DT05GTElDVCxcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMubmFtZSA9ICdIb29rQ29uZmxpY3RFcnJvcic7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIGlmIChjb25mbGljdGluZ1J1bklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29uZmxpY3RpbmdSdW5JZCA9IGNvbmZsaWN0aW5nUnVuSWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgSG9va0NvbmZsaWN0RXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnSG9va0NvbmZsaWN0RXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gY2FsbGluZyBgcmVzdW1lSG9vaygpYCBvciBgcmVzdW1lV2ViaG9vaygpYCB3aXRoIGEgdG9rZW4gdGhhdFxuICogZG9lcyBub3QgbWF0Y2ggYW55IGFjdGl2ZSBob29rLlxuICpcbiAqIENvbW1vbiBjYXVzZXM6XG4gKiAtIFRoZSBob29rIGhhcyBleHBpcmVkIChwYXN0IGl0cyBUVEwpXG4gKiAtIFRoZSBob29rIHdhcyBhbHJlYWR5IGRpc3Bvc2VkIGFmdGVyIGJlaW5nIGNvbnN1bWVkXG4gKiAtIFRoZSB3b3JrZmxvdyBoYXMgbm90IHN0YXJ0ZWQgeWV0LCBzbyB0aGUgaG9vayBkb2VzIG5vdCBleGlzdFxuICpcbiAqIEEgY29tbW9uIHBhdHRlcm4gaXMgdG8gY2F0Y2ggdGhpcyBlcnJvciBhbmQgc3RhcnQgYSBuZXcgd29ya2Zsb3cgcnVuIHdoZW5cbiAqIHRoZSBob29rIGRvZXMgbm90IGV4aXN0IHlldCAodGhlIFwicmVzdW1lIG9yIHN0YXJ0XCIgcGF0dGVybikuXG4gKlxuICogVXNlIHRoZSBzdGF0aWMgYEhvb2tOb3RGb3VuZEVycm9yLmlzKClgIG1ldGhvZCBmb3IgdHlwZS1zYWZlIGNoZWNraW5nIGluXG4gKiBjYXRjaCBibG9ja3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBIb29rTm90Rm91bmRFcnJvciB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9lcnJvcnNcIjtcbiAqXG4gKiB0cnkge1xuICogICBhd2FpdCByZXN1bWVIb29rKHRva2VuLCBwYXlsb2FkKTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChIb29rTm90Rm91bmRFcnJvci5pcyhlcnJvcikpIHtcbiAqICAgICAvLyBIb29rIGRvZXNuJ3QgZXhpc3Qg4oCUIHN0YXJ0IGEgbmV3IHdvcmtmbG93IHJ1biBpbnN0ZWFkXG4gKiAgICAgYXdhaXQgc3RhcnRXb3JrZmxvdyhcIm15V29ya2Zsb3dcIiwgcGF5bG9hZCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSG9va05vdEZvdW5kRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgdG9rZW46IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoJ0hvb2sgbm90IGZvdW5kJywge30pO1xuICAgIHRoaXMubmFtZSA9ICdIb29rTm90Rm91bmRFcnJvcic7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgSG9va05vdEZvdW5kRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnSG9va05vdEZvdW5kRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGNvbmZsaWN0cyB3aXRoIHRoZSBjdXJyZW50IHN0YXRlIG9mIGFuIGVudGl0eS5cbiAqIFRoaXMgaW5jbHVkZXMgYXR0ZW1wdHMgdG8gbW9kaWZ5IGFuIGVudGl0eSBhbHJlYWR5IGluIGEgdGVybWluYWwgc3RhdGUsXG4gKiBjcmVhdGUgYW4gZW50aXR5IHRoYXQgYWxyZWFkeSBleGlzdHMsIG9yIGFueSBvdGhlciA0MDktc3R5bGUgY29uZmxpY3QuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkuIFVzZXJzIGludGVyYWN0aW5nXG4gKiB3aXRoIHdvcmxkIHN0b3JhZ2UgYmFja2VuZHMgZGlyZWN0bHkgbWF5IGVuY291bnRlciBpdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEVudGl0eUNvbmZsaWN0RXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnRW50aXR5Q29uZmxpY3RFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBFbnRpdHlDb25mbGljdEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ0VudGl0eUNvbmZsaWN0RXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBydW4gaXMgbm8gbG9uZ2VyIGF2YWlsYWJsZSDigJQgZWl0aGVyIGJlY2F1c2UgaXQgaGFzIGJlZW5cbiAqIGNsZWFuZWQgdXAsIGV4cGlyZWQsIG9yIGFscmVhZHkgcmVhY2hlZCBhIHRlcm1pbmFsIHN0YXRlIChjb21wbGV0ZWQvZmFpbGVkKS5cbiAqXG4gKiBUaGUgd29ya2Zsb3cgcnVudGltZSBoYW5kbGVzIHRoaXMgZXJyb3IgYXV0b21hdGljYWxseS4gVXNlcnMgaW50ZXJhY3RpbmdcbiAqIHdpdGggd29ybGQgc3RvcmFnZSBiYWNrZW5kcyBkaXJlY3RseSBtYXkgZW5jb3VudGVyIGl0LlxuICovXG5leHBvcnQgY2xhc3MgUnVuRXhwaXJlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1J1bkV4cGlyZWRFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSdW5FeHBpcmVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUnVuRXhwaXJlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBjYW5ub3QgcHJvY2VlZCBiZWNhdXNlIGEgcmVxdWlyZWQgdGltZXN0YW1wXG4gKiAoZS5nLiByZXRyeUFmdGVyKSBoYXMgbm90IGJlZW4gcmVhY2hlZCB5ZXQuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkuIFVzZXJzIGludGVyYWN0aW5nXG4gKiB3aXRoIHdvcmxkIHN0b3JhZ2UgYmFja2VuZHMgZGlyZWN0bHkgbWF5IGVuY291bnRlciBpdC5cbiAqXG4gKiBAcHJvcGVydHkgcmV0cnlBZnRlciAtIERlbGF5IGluIHNlY29uZHMgYmVmb3JlIHRoZSBvcGVyYXRpb24gY2FuIGJlIHJldHJpZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb29FYXJseUVycm9yIGV4dGVuZHMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogeyByZXRyeUFmdGVyPzogbnVtYmVyIH0pIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7IHJldHJ5QWZ0ZXI6IG9wdGlvbnM/LnJldHJ5QWZ0ZXIgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1Rvb0Vhcmx5RXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgVG9vRWFybHlFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdUb29FYXJseUVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgcmVxdWVzdCBpcyByYXRlIGxpbWl0ZWQgYnkgdGhlIHdvcmtmbG93IGJhY2tlbmQuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkgd2l0aCByZXRyeSBsb2dpYy5cbiAqIFVzZXJzIGludGVyYWN0aW5nIHdpdGggd29ybGQgc3RvcmFnZSBiYWNrZW5kcyBkaXJlY3RseSBtYXkgZW5jb3VudGVyIGl0XG4gKiBpZiByZXRyaWVzIGFyZSBleGhhdXN0ZWQuXG4gKlxuICogQHByb3BlcnR5IHJldHJ5QWZ0ZXIgLSBEZWxheSBpbiBzZWNvbmRzIGJlZm9yZSB0aGUgcmVxdWVzdCBjYW4gYmUgcmV0cmllZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFRocm90dGxlRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICByZXRyeUFmdGVyPzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IHsgcmV0cnlBZnRlcj86IG51bWJlciB9KSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1Rocm90dGxlRXJyb3InO1xuICAgIHRoaXMucmV0cnlBZnRlciA9IG9wdGlvbnM/LnJldHJ5QWZ0ZXI7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBUaHJvdHRsZUVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1Rocm90dGxlRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIGJhY2tlbmQgcmVqZWN0cyBhbiBldmVudCBjcmVhdGlvbiBiZWNhdXNlIHRoZSBjbGllbnQnc1xuICogZXZlbnQtbG9nIHNuYXBzaG90IGlzIHN0YWxlIOKAlCBhIG5ld2VyIG91dC1vZi1iYW5kIGV2ZW50IChlLmcuIGEgcmVjZWl2ZWRcbiAqIGhvb2sgb3IgYSBjb21wbGV0ZWQgc3RlcCkgd2FzIHJlY29yZGVkIGFmdGVyIHRoZSBzbmFwc2hvdCB0aGUgY2xpZW50XG4gKiByZXBsYXllZCBmcm9tIChIVFRQIDQxMikuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGF1dG9tYXRpY2FsbHk6IGl0IHJlbG9hZHMgdGhlIGV2ZW50IGxvZ1xuICogYW5kIHJldHJpZXMsIHVsdGltYXRlbHkgcmUtZW5xdWV1ZWluZyB0aGUgcnVuIGlmIGl0IGNhbm5vdCBjYXRjaCB1cC4gVXNlcnNcbiAqIGludGVyYWN0aW5nIHdpdGggd29ybGQgc3RvcmFnZSBiYWNrZW5kcyBkaXJlY3RseSBtYXkgZW5jb3VudGVyIGl0LlxuICovXG5leHBvcnQgY2xhc3MgUHJlY29uZGl0aW9uRmFpbGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM/OiB7IHJldHJ5QWZ0ZXI/OiBudW1iZXIgfSkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHsgc3RhdHVzOiA0MTIsIHJldHJ5QWZ0ZXI6IG9wdGlvbnM/LnJldHJ5QWZ0ZXIgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1ByZWNvbmRpdGlvbkZhaWxlZEVycm9yJztcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFByZWNvbmRpdGlvbkZhaWxlZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1ByZWNvbmRpdGlvbkZhaWxlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGF3YWl0aW5nIGBydW4ucmV0dXJuVmFsdWVgIG9uIGEgd29ya2Zsb3cgcnVuIHRoYXQgd2FzIGNhbmNlbGxlZC5cbiAqXG4gKiBUaGlzIGVycm9yIGluZGljYXRlcyB0aGF0IHRoZSB3b3JrZmxvdyB3YXMgZXhwbGljaXRseSBjYW5jZWxsZWQgKHZpYVxuICogYHJ1bi5jYW5jZWwoKWApIGFuZCB3aWxsIG5vdCBwcm9kdWNlIGEgcmV0dXJuIHZhbHVlLiBZb3UgY2FuIGNoZWNrIGZvclxuICogY2FuY2VsbGF0aW9uIGJlZm9yZSBhd2FpdGluZyB0aGUgcmV0dXJuIHZhbHVlIGJ5IGluc3BlY3RpbmcgYHJ1bi5zdGF0dXNgLlxuICpcbiAqIFVzZSB0aGUgc3RhdGljIGBXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yLmlzKClgIG1ldGhvZCBmb3IgdHlwZS1zYWZlXG4gKiBjaGVja2luZyBpbiBjYXRjaCBibG9ja3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bi5yZXR1cm5WYWx1ZTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yLmlzKGVycm9yKSkge1xuICogICAgIGNvbnNvbGUubG9nKGBSdW4gJHtlcnJvci5ydW5JZH0gd2FzIGNhbmNlbGxlZGApO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcnVuSWQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihydW5JZDogc3RyaW5nKSB7XG4gICAgc3VwZXIoYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgY2FuY2VsbGVkYCwge30pO1xuICAgIHRoaXMubmFtZSA9ICdXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yJztcbiAgICB0aGlzLnJ1bklkID0gcnVuSWQ7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYXR0ZW1wdGluZyB0byBvcGVyYXRlIG9uIGEgd29ya2Zsb3cgcnVuIHRoYXQgcmVxdWlyZXMgYSBuZXdlciBXb3JsZCB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgZXJyb3Igb2NjdXJzIHdoZW4gYSBydW4gd2FzIGNyZWF0ZWQgd2l0aCBhIG5ld2VyIHNwZWMgdmVyc2lvbiB0aGFuIHRoZVxuICogY3VycmVudCBXb3JsZCBpbXBsZW1lbnRhdGlvbiBzdXBwb3J0cy4gVG8gcmVzb2x2ZSB0aGlzLCB1cGdyYWRlIHlvdXJcbiAqIGB3b3JrZmxvd2AgcGFja2FnZXMgdG8gYSB2ZXJzaW9uIHRoYXQgc3VwcG9ydHMgdGhlIHJlcXVpcmVkIHNwZWMgdmVyc2lvbi5cbiAqXG4gKiBVc2UgdGhlIHN0YXRpYyBgUnVuTm90U3VwcG9ydGVkRXJyb3IuaXMoKWAgbWV0aG9kIGZvciB0eXBlLXNhZmUgY2hlY2tpbmcgaW5cbiAqIGNhdGNoIGJsb2Nrcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IFJ1bk5vdFN1cHBvcnRlZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHJ1bi5zdGF0dXM7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoUnVuTm90U3VwcG9ydGVkRXJyb3IuaXMoZXJyb3IpKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcihcbiAqICAgICAgIGBSdW4gcmVxdWlyZXMgc3BlYyB2JHtlcnJvci5ydW5TcGVjVmVyc2lvbn0sIGAgK1xuICogICAgICAgYGJ1dCB3b3JsZCBzdXBwb3J0cyB2JHtlcnJvci53b3JsZFNwZWNWZXJzaW9ufWBcbiAqICAgICApO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJ1bk5vdFN1cHBvcnRlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIHJlYWRvbmx5IHJ1blNwZWNWZXJzaW9uOiBudW1iZXI7XG4gIHJlYWRvbmx5IHdvcmxkU3BlY1ZlcnNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihydW5TcGVjVmVyc2lvbjogbnVtYmVyLCB3b3JsZFNwZWNWZXJzaW9uOiBudW1iZXIpIHtcbiAgICBzdXBlcihcbiAgICAgIGBSdW4gcmVxdWlyZXMgc3BlYyB2ZXJzaW9uICR7cnVuU3BlY1ZlcnNpb259LCBidXQgd29ybGQgc3VwcG9ydHMgdmVyc2lvbiAke3dvcmxkU3BlY1ZlcnNpb259LiBgICtcbiAgICAgICAgYFBsZWFzZSB1cGdyYWRlICd3b3JrZmxvdycgcGFja2FnZS5gXG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnUnVuTm90U3VwcG9ydGVkRXJyb3InO1xuICAgIHRoaXMucnVuU3BlY1ZlcnNpb24gPSBydW5TcGVjVmVyc2lvbjtcbiAgICB0aGlzLndvcmxkU3BlY1ZlcnNpb24gPSB3b3JsZFNwZWNWZXJzaW9uO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUnVuTm90U3VwcG9ydGVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUnVuTm90U3VwcG9ydGVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogQSBmYXRhbCBlcnJvciBpcyBhbiBlcnJvciB0aGF0IGNhbm5vdCBiZSByZXRyaWVkLlxuICogSXQgd2lsbCBjYXVzZSB0aGUgc3RlcCB0byBmYWlsIGFuZCB0aGUgZXJyb3Igd2lsbFxuICogYmUgYnViYmxlZCB1cCB0byB0aGUgd29ya2Zsb3cgbG9naWMuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYXRhbEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBmYXRhbCA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ0ZhdGFsRXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgRmF0YWxFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdGYXRhbEVycm9yJztcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJldHJ5YWJsZUVycm9yT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSByZXRyeWluZyB0aGUgc3RlcC5cbiAgICogQ2FuIGFsc28gYmUgYSBkdXJhdGlvbiBzdHJpbmcgKGUuZy4sIFwiNXNcIiwgXCIybVwiKSBvciBhIERhdGUgb2JqZWN0LlxuICAgKiBJZiBub3QgcHJvdmlkZWQsIHRoZSBzdGVwIHdpbGwgYmUgcmV0cmllZCBhZnRlciAxIHNlY29uZCAoMTAwMCBtaWxsaXNlY29uZHMpLlxuICAgKi9cbiAgcmV0cnlBZnRlcj86IG51bWJlciB8IFN0cmluZ1ZhbHVlIHwgRGF0ZTtcbn1cblxuLyoqXG4gKiBBbiBlcnJvciB0aGF0IGNhbiBoYXBwZW4gZHVyaW5nIGEgc3RlcCBleGVjdXRpb24sIGFsbG93aW5nXG4gKiBmb3IgY29uZmlndXJhdGlvbiBvZiB0aGUgcmV0cnkgYmVoYXZpb3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXRyeWFibGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIFRoZSBEYXRlIHdoZW4gdGhlIHN0ZXAgc2hvdWxkIGJlIHJldHJpZWQuXG4gICAqL1xuICByZXRyeUFmdGVyOiBEYXRlO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9uczogUmV0cnlhYmxlRXJyb3JPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnUmV0cnlhYmxlRXJyb3InO1xuXG4gICAgaWYgKG9wdGlvbnMucmV0cnlBZnRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnJldHJ5QWZ0ZXIgPSBwYXJzZUR1cmF0aW9uVG9EYXRlKG9wdGlvbnMucmV0cnlBZnRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZmF1bHQgdG8gMSBzZWNvbmQgKDEwMDAgbWlsbGlzZWNvbmRzKVxuICAgICAgdGhpcy5yZXRyeUFmdGVyID0gbmV3IERhdGUoRGF0ZS5ub3coKSArIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJldHJ5YWJsZUVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1JldHJ5YWJsZUVycm9yJztcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVkVSQ0VMXzQwM19FUlJPUl9NRVNTQUdFID1cbiAgJ1lvdXIgY3VycmVudCB2ZXJjZWwgYWNjb3VudCBkb2VzIG5vdCBoYXZlIGFjY2VzcyB0byB0aGlzIHJlc291cmNlLiBVc2UgYHZlcmNlbCBsb2dpbmAgb3IgYHZlcmNlbCBzd2l0Y2hgIHRvIGVuc3VyZSB5b3UgYXJlIGxpbmtlZCB0byB0aGUgcmlnaHQgYWNjb3VudC4nO1xuXG5leHBvcnQgeyBSVU5fRVJST1JfQ09ERVMsIHR5cGUgUnVuRXJyb3JDb2RlIH0gZnJvbSAnLi9lcnJvci1jb2Rlcy5qcyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ3Jvc3MtcmVhbG0gY2xhc3MgcmVnaXN0cmF0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyBgRmF0YWxFcnJvcmAsIGBSZXRyeWFibGVFcnJvcmAsIGFuZCBgSG9va0NvbmZsaWN0RXJyb3JgIGFyZSBub3QgYnVpbHQtaW5zLCBzbyBkaWZmZXJlbnQgcmVhbG1zXG4vLyAoZS5nLiB0aGUgd29ya2Zsb3cgVk0gY29udGV4dCB2cy4gdGhlIGhvc3QgY29udGV4dCB0aGF0IHJ1bnMgdGhlIHF1ZXVlXG4vLyBoYW5kbGVyKSBidW5kbGUgYW5kIGxvYWQgdGhlaXIgb3duIGNvcGllcyBvZiB0aGlzIG1vZHVsZSDigJQgbWVhbmluZyBlYWNoXG4vLyByZWFsbSBoYXMgaXRzIG93biBkaXN0aW5jdCBjbGFzcyBpZGVudGl0eS4gQ3Jvc3MtcmVhbG0gYGluc3RhbmNlb2ZgIGZhaWxzXG4vLyBiZWNhdXNlIHRoZSBwcm90b3R5cGUgY2hhaW5zIG5ldmVyIG1lZXQuXG4vL1xuLy8gVG8gbGV0IHNlcmlhbGl6YXRpb24gcmV2aXZlcnMgcmVjb25zdHJ1Y3QgYSB2YWx1ZSBhcyB0aGUgKmNvbnN1bWVyJ3MqXG4vLyBGYXRhbEVycm9yIChzbyB1c2VyLWNvZGUgYGVyciBpbnN0YW5jZW9mIEZhdGFsRXJyb3JgIHBhc3NlcyksIGVhY2ggYnVuZGxlZFxuLy8gY29weSBvZiB0aGlzIG1vZHVsZSBzZWxmLXJlZ2lzdGVycyBpdHMgY2xhc3Mgb24gYGdsb2JhbFRoaXNgIHZpYSBhIGtub3duXG4vLyBTeW1ib2wuZm9yIGtleS4gUmV2aXZlcnMgaW4gYEB3b3JrZmxvdy9jb3JlYCBsb29rIHVwIHRoZSBjbGFzcyB2aWEgdGhlXG4vLyBjb25zdW1lcidzIGdsb2JhbFRoaXMgYXQgaHlkcmF0aW9uIHRpbWUuXG4vL1xuLy8gRmlyc3QgcmVnaXN0cmF0aW9uIGluIGEgZ2l2ZW4gcmVhbG0gd2lucy4gVGhlIGRlc2NyaXB0b3IgaXMgbm9uLXdyaXRhYmxlXG4vLyBhbmQgbm9uLWNvbmZpZ3VyYWJsZSB0byBtYWtlIGFjY2lkZW50YWwgY2xvYmJlcmluZyBsb3VkLlxuY29uc3QgRkFUQUxfRVJST1JfS0VZID0gU3ltYm9sLmZvcignQHdvcmtmbG93L2Vycm9ycy8vRmF0YWxFcnJvcicpO1xuY29uc3QgUkVUUllBQkxFX0VSUk9SX0tFWSA9IFN5bWJvbC5mb3IoJ0B3b3JrZmxvdy9lcnJvcnMvL1JldHJ5YWJsZUVycm9yJyk7XG5jb25zdCBIT09LX0NPTkZMSUNUX0VSUk9SX0tFWSA9IFN5bWJvbC5mb3IoXG4gICdAd29ya2Zsb3cvZXJyb3JzLy9Ib29rQ29uZmxpY3RFcnJvcidcbik7XG5cbmlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgaWYgKCFPYmplY3QuaGFzT3duKGdsb2JhbFRoaXMsIEZBVEFMX0VSUk9SX0tFWSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsVGhpcywgRkFUQUxfRVJST1JfS0VZLCB7XG4gICAgICB2YWx1ZTogRmF0YWxFcnJvcixcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuICBpZiAoIU9iamVjdC5oYXNPd24oZ2xvYmFsVGhpcywgUkVUUllBQkxFX0VSUk9SX0tFWSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsVGhpcywgUkVUUllBQkxFX0VSUk9SX0tFWSwge1xuICAgICAgdmFsdWU6IFJldHJ5YWJsZUVycm9yLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG4gIGlmICghT2JqZWN0Lmhhc093bihnbG9iYWxUaGlzLCBIT09LX0NPTkZMSUNUX0VSUk9SX0tFWSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsVGhpcywgSE9PS19DT05GTElDVF9FUlJPUl9LRVksIHtcbiAgICAgIHZhbHVlOiBIb29rQ29uZmxpY3RFcnJvcixcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxufVxuIiwgImV4cG9ydCBjb25zdCBXT1JLRkxPV19VU0VfU1RFUCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX1VTRV9TVEVQJyk7XG5leHBvcnQgY29uc3QgV09SS0ZMT1dfQ1JFQVRFX0hPT0sgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19DUkVBVEVfSE9PSycpO1xuZXhwb3J0IGNvbnN0IFdPUktGTE9XX1NMRUVQID0gU3ltYm9sLmZvcignV09SS0ZMT1dfU0xFRVAnKTtcbmV4cG9ydCBjb25zdCBXT1JLRkxPV19DT05URVhUID0gU3ltYm9sLmZvcignV09SS0ZMT1dfQ09OVEVYVCcpO1xuZXhwb3J0IGNvbnN0IFdPUktGTE9XX0dFVF9TVFJFQU1fSUQgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19HRVRfU1RSRUFNX0lEJyk7XG5leHBvcnQgY29uc3QgU1RBQkxFX1VMSUQgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19TVEFCTEVfVUxJRCcpO1xuZXhwb3J0IGNvbnN0IFNUUkVBTV9OQU1FX1NZTUJPTCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX1NUUkVBTV9OQU1FJyk7XG5leHBvcnQgY29uc3QgU1RSRUFNX1RZUEVfU1lNQk9MID0gU3ltYm9sLmZvcignV09SS0ZMT1dfU1RSRUFNX1RZUEUnKTtcbmV4cG9ydCBjb25zdCBTVFJFQU1fRlJBTUlOR19TWU1CT0wgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19TVFJFQU1fRlJBTUlORycpO1xuLyoqXG4gKiBTdGFtcGVkIG9uIGEgcmVhbCBgV3JpdGFibGVTdHJlYW1gICh0aGUgdXNlci12aXNpYmxlIGBzZXJpYWxpemUud3JpdGFibGVgXG4gKiByZXR1cm5lZCBmcm9tIGEgc3RlcC1zaWRlIHJldml2ZXIgb3Igc3RlcC1jb250ZXh0IGBnZXRXcml0YWJsZSgpYCkgdG9cbiAqIHJlY29yZCB0aGUgYHJ1bklkYCBvZiB0aGUgd29ya2Zsb3cgcnVuIHRoYXQgb3ducyB0aGUgdW5kZXJseWluZyBzZXJ2ZXJcbiAqIHN0cmVhbS4gVXNlZCB0b2dldGhlciB3aXRoIGBTVFJFQU1fTkFNRV9TWU1CT0xgLlxuICpcbiAqIFdoZW4gYGdldEV4dGVybmFsUmVkdWNlcnMuV3JpdGFibGVTdHJlYW1gICh0aGUgZGVoeWRyYXRpb24gcGF0aCB1c2VkIGJ5XG4gKiBgc3RhcnQoKWApIHNlZXMgYm90aCBzeW1ib2xzIG9uIGEgd3JpdGFibGUsIGl0IGluY2x1ZGVzIHRoZSBgcnVuSWRgIGluXG4gKiB0aGUgZGVzY3JpcHRvciBpdCBlbWl0cy4gVGhlIGNoaWxkIHJ1bidzIHN0ZXAtc2lkZSByZXZpdmVyIHRoZW4gb3BlbnNcbiAqIGEgc2VydmVyIHdyaXRhYmxlIGFnYWluc3QgdGhlIG9yaWdpbmFsIGAocnVuSWQsIG5hbWUpYCBhbmQgcmVzb2x2ZXNcbiAqIHRoYXQgcnVuJ3MgZW5jcnlwdGlvbiBrZXkgZGlyZWN0bHkg4oCUIHNvIHRoZSBjaGlsZCdzIHdyaXRlcyBsYW5kIG9uXG4gKiB0aGUgcGFyZW50J3Mgc3RyZWFtIGFzLWlzLCB3aXRoIG5vIGNsaWVudCBwcm9jZXNzIGluIHRoZSBsb29wLiBUaGF0XG4gKiBrZWVwcyB0aGUgZm9yd2FyZGluZyBhbGl2ZSBmb3IgdGhlIGZ1bGwgbGlmZXRpbWUgb2YgdGhlIGNoaWxkIHJ1bixcbiAqIG5vdCBqdXN0IGZvciB0aGUgcGFyZW50IHN0ZXAgdGhhdCBpbml0aWF0ZWQgYHN0YXJ0KClgLlxuICovXG5leHBvcnQgY29uc3QgU1RSRUFNX1NFUlZFUl9SVU5fSURfU1lNQk9MID0gU3ltYm9sLmZvcihcbiAgJ1dPUktGTE9XX1NUUkVBTV9TRVJWRVJfUlVOX0lEJ1xuKTtcbi8qKlxuICogU3RhbXBlZCBhbG9uZ3NpZGUgYFNUUkVBTV9TRVJWRVJfUlVOX0lEX1NZTUJPTGAgd2hlbiB0aGUgZGVwbG95bWVudCB0aGF0XG4gKiBvd25zIGEgZm9yd2FyZGVkIHdyaXRhYmxlIHN0cmVhbSBpcyBrbm93bi4gQ3Jvc3MtZGVwbG95bWVudCBjb25zdW1lcnMgdXNlXG4gKiBpdCB0byByZXNvbHZlIHRoZSBvd25pbmcgcnVuJ3MgZW5jcnlwdGlvbiBrZXkgd2l0aG91dCBsb2FkaW5nIHRoZSBydW4gZmlyc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBTVFJFQU1fU0VSVkVSX0RFUExPWU1FTlRfSURfU1lNQk9MID0gU3ltYm9sLmZvcihcbiAgJ1dPUktGTE9XX1NUUkVBTV9TRVJWRVJfREVQTE9ZTUVOVF9JRCdcbik7XG5leHBvcnQgY29uc3QgQk9EWV9JTklUX1NZTUJPTCA9IFN5bWJvbC5mb3IoJ0JPRFlfSU5JVCcpO1xuZXhwb3J0IGNvbnN0IFdFQkhPT0tfUkVTUE9OU0VfV1JJVEFCTEUgPSBTeW1ib2wuZm9yKFxuICAnV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRSdcbik7XG5cbi8qKlxuICogU3ltYm9sIHVzZWQgdG8gc3RvcmUgdGhlIGNsYXNzIHJlZ2lzdHJ5IG9uIGdsb2JhbFRoaXMgaW4gd29ya2Zsb3cgbW9kZS5cbiAqIFRoaXMgYWxsb3dzIHRoZSBkZXNlcmlhbGl6ZXIgdG8gZmluZCBjbGFzc2VzIGJ5IGNsYXNzSWQgaW4gdGhlIFZNIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBjb25zdCBXT1JLRkxPV19DTEFTU19SRUdJU1RSWSA9IFN5bWJvbC5mb3IoJ3dvcmtmbG93LWNsYXNzLXJlZ2lzdHJ5Jyk7XG4iLCAiaW1wb3J0IHR5cGUgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcbmltcG9ydCB7IFdPUktGTE9XX1NMRUVQIH0gZnJvbSAnLi9zeW1ib2xzLmpzJztcblxuLyoqXG4gKiBTbGVlcCB3aXRoaW4gYSB3b3JrZmxvdyBmb3IgYSBnaXZlbiBkdXJhdGlvbi5cbiAqXG4gKiBUaGlzIGlzIGEgYnVpbHQtaW4gcnVudGltZSBmdW5jdGlvbiB0aGF0IHVzZXMgdGltZXIgZXZlbnRzIGluIHRoZSBldmVudCBsb2cuXG4gKlxuICogQHBhcmFtIGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIHRvIHNsZWVwIGZvciwgdGhpcyBpcyBhIHN0cmluZyBpbiB0aGUgZm9ybWF0XG4gKiBvZiBgXCIxMDAwbXNcImAsIGBcIjFzXCJgLCBgXCIxbVwiYCwgYFwiMWhcImAsIG9yIGBcIjFkXCJgLlxuICogQG92ZXJsb2FkXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBzbGVlcCBpcyBjb21wbGV0ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNsZWVwKGR1cmF0aW9uOiBTdHJpbmdWYWx1ZSk6IFByb21pc2U8dm9pZD47XG5cbi8qKlxuICogU2xlZXAgd2l0aGluIGEgd29ya2Zsb3cgdW50aWwgYSBzcGVjaWZpYyBkYXRlLlxuICpcbiAqIFRoaXMgaXMgYSBidWlsdC1pbiBydW50aW1lIGZ1bmN0aW9uIHRoYXQgdXNlcyB0aW1lciBldmVudHMgaW4gdGhlIGV2ZW50IGxvZy5cbiAqXG4gKiBAcGFyYW0gZGF0ZSAtIFRoZSBkYXRlIHRvIHNsZWVwIHVudGlsLCB0aGlzIG11c3QgYmUgYSBmdXR1cmUgZGF0ZS5cbiAqIEBvdmVybG9hZFxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc2xlZXAgaXMgY29tcGxldGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzbGVlcChkYXRlOiBEYXRlKTogUHJvbWlzZTx2b2lkPjtcblxuLyoqXG4gKiBTbGVlcCB3aXRoaW4gYSB3b3JrZmxvdyBmb3IgYSBnaXZlbiBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMuXG4gKlxuICogVGhpcyBpcyBhIGJ1aWx0LWluIHJ1bnRpbWUgZnVuY3Rpb24gdGhhdCB1c2VzIHRpbWVyIGV2ZW50cyBpbiB0aGUgZXZlbnQgbG9nLlxuICpcbiAqIEBwYXJhbSBkdXJhdGlvbk1zIC0gVGhlIGR1cmF0aW9uIHRvIHNsZWVwIGZvciBpbiBtaWxsaXNlY29uZHMuXG4gKiBAb3ZlcmxvYWRcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNsZWVwIGlzIGNvbXBsZXRlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2xlZXAoZHVyYXRpb25NczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNsZWVwKHBhcmFtOiBTdHJpbmdWYWx1ZSB8IERhdGUgfCBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gSW5zaWRlIHRoZSB3b3JrZmxvdyBWTSwgdGhlIHNsZWVwIGZ1bmN0aW9uIGlzIHN0b3JlZCBpbiB0aGUgZ2xvYmFsVGhpcyBvYmplY3QgYmVoaW5kIGEgc3ltYm9sXG4gIGNvbnN0IHNsZWVwRm4gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpW1dPUktGTE9XX1NMRUVQXTtcbiAgaWYgKCFzbGVlcEZuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgc2xlZXAoKWAgY2FuIG9ubHkgYmUgY2FsbGVkIGluc2lkZSBhIHdvcmtmbG93IGZ1bmN0aW9uJyk7XG4gIH1cbiAgcmV0dXJuIHNsZWVwRm4ocGFyYW0pO1xufVxuIiwgImltcG9ydCB0eXBlIHsgV29ya2Zsb3dXcml0YWJsZVN0cmVhbU9wdGlvbnMgfSBmcm9tICcuLi9zdGVwL3dyaXRhYmxlLXN0cmVhbS5qcyc7XG5pbXBvcnQgeyBTVFJFQU1fTkFNRV9TWU1CT0wsIFdPUktGTE9XX0dFVF9TVFJFQU1fSUQgfSBmcm9tICcuLi9zeW1ib2xzLmpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFdyaXRhYmxlPFcgPSBhbnk+KFxuICBvcHRpb25zOiBXb3JrZmxvd1dyaXRhYmxlU3RyZWFtT3B0aW9ucyA9IHt9XG4pOiBXcml0YWJsZVN0cmVhbTxXPiB7XG4gIGNvbnN0IHsgbmFtZXNwYWNlIH0gPSBvcHRpb25zO1xuICBjb25zdCBuYW1lID0gKGdsb2JhbFRoaXMgYXMgYW55KVtXT1JLRkxPV19HRVRfU1RSRUFNX0lEXShuYW1lc3BhY2UpO1xuICByZXR1cm4gT2JqZWN0LmNyZWF0ZShnbG9iYWxUaGlzLldyaXRhYmxlU3RyZWFtLnByb3RvdHlwZSwge1xuICAgIFtTVFJFQU1fTkFNRV9TWU1CT0xdOiB7XG4gICAgICB2YWx1ZTogbmFtZSxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICB9LFxuICB9KTtcbn1cbiIsICIvKipcbiAqIFRoaXMgaXMgdGhlIFwic3RhbmRhcmQgbGlicmFyeVwiIG9mIHN0ZXBzIHRoYXQgd2UgbWFrZSBhdmFpbGFibGUgdG8gYWxsIHdvcmtmbG93IHVzZXJzLlxuICogVGhlIGNhbiBiZSBpbXBvcnRlZCBsaWtlIHNvOiBgaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICd3b3JrZmxvdydgLiBhbmQgdXNlZCBpbiB3b3JrZmxvdy5cbiAqIFRoZSBuZWVkIHRvIGJlIGV4cG9ydGVkIGRpcmVjdGx5IGluIHRoaXMgcGFja2FnZSBhbmQgY2Fubm90IGxpdmUgaW4gYGNvcmVgIHRvIHByZXZlbnRcbiAqIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBwb3N0LWNvbXBpbGF0aW9uLlxuICovXG5cbi8qKlxuICogQSBob2lzdGVkIGBmZXRjaCgpYCBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIGFzIGEgXCJzdGVwXCIgZnVuY3Rpb24sXG4gKiBmb3IgdXNlIHdpdGhpbiB3b3JrZmxvdyBmdW5jdGlvbnMuXG4gKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBnbG9iYWxUaGlzLmZldGNoPikge1xuICAndXNlIHN0ZXAnO1xuICByZXR1cm4gZ2xvYmFsVGhpcy5mZXRjaCguLi5hcmdzKTtcbn1cbiIsICIvKipcbiAqIFN0ZXAgZnVuY3Rpb25zIGZvciB0aGUgd29ya2Jvb2staW5nZXN0IHdvcmtmbG93LlxuICpcbiAqIEVhY2ggZXhwb3J0ZWQgYXN5bmMgZnVuY3Rpb24gd2l0aCB0aGUgYCd1c2Ugc3RlcCdgIGRpcmVjdGl2ZSBpcyBhIGR1cmFibGVcbiAqIHN0ZXA6IGl0cyBhcmdzIGFuZCByZXN1bHQgYXJlIHNlcmlhbGl6ZWQgdG8gdGhlIGV2ZW50IGxvZywgYW5kIGl0IHJldHJpZXNcbiAqIChtYXggMywgb3IgcGVyIFJldHJ5YWJsZUVycm9yKSBiZWZvcmUgdGhlIGVycm9yIGJ1YmJsZXMgdG8gdGhlIHdvcmtmbG93LlxuICovIC8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wic3RlcHNcIjp7XCJ3b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLnRzXCI6e1wiYW5hbHl6ZVNoZWV0c1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vYW5hbHl6ZVNoZWV0c1N0ZXBcIn0sXCJjbG9zZVByb2dyZXNzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jbG9zZVByb2dyZXNzU3RlcFwifSxcImNvbXByZWhlbmRXb3JrYm9va1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vY29tcHJlaGVuZFdvcmtib29rU3RlcFwifSxcImVtaXRQcm9ncmVzc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZW1pdFByb2dyZXNzU3RlcFwifSxcImV4dHJhY3RTaGVldHNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2V4dHJhY3RTaGVldHNTdGVwXCJ9LFwiZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIn0sXCJnZW5lcmF0ZURhc2hib2FyZFN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVEYXNoYm9hcmRTdGVwXCJ9LFwiZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCJ9LFwibG9hZFdvcmtib29rU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9sb2FkV29ya2Jvb2tTdGVwXCJ9LFwicG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXBcIn0sXCJyZWdpc3RlckR5bmFtaWNQYWdlc1N0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCJ9LFwic2F2ZVNuaXBwZXRzU3RlcFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlU25pcHBldHNTdGVwXCJ9LFwic2VsZWN0VGVtcGxhdGVTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3NlbGVjdFRlbXBsYXRlU3RlcFwifSxcInVwc2VydFNoZWV0UGFnZXNTdGVwXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3Vwc2VydFNoZWV0UGFnZXNTdGVwXCJ9fX19Ki87XG4vKipcbiAqIENvbnZlcnQgcmF3IHVwbG9hZCBieXRlcyBpbnRvIHhsc3ggYnVmZmVycy5cbiAqXG4gKiBVaW50OEFycmF5IGlzIHNlcmlhbGl6YWJsZSBhY3Jvc3MgdGhlIHdvcmtmbG93IGJvdW5kYXJ5OyBCdWZmZXIgaXMgbm90XG4gKiBndWFyYW50ZWVkIGluIHdvcmtmbG93IHN0ZXAgc2FuZGJveGVzLCBzbyB3ZSBrZWVwIFVpbnQ4QXJyYXkgZXZlcnl3aGVyZVxuICogYW5kIGhhbmQgaXQgZGlyZWN0bHkgdG8gYHhsc3gucmVhZCh7IHR5cGU6ICdidWZmZXInIH0pYC5cbiAqXG4gKiBTaGVldEpTIGlzIGxlbmllbnQgd2l0aCBhcmJpdHJhcnkgdGV4dCAoaXQgcGFyc2VzIHBsYWluIHRleHQgYXMgYSAxLWNvbHVtblxuICogc2hlZXQpLCBzbyB3ZSB2YWxpZGF0ZSB0aGUgbWFnaWMgYnl0ZXMgQkVGT1JFIHBhcnNpbmcgdG8gY2F0Y2ggdXBsb2FkcyBvZlxuICogdGhlIHdyb25nIGZpbGUgdHlwZSB3aXRoIGEgY2xlYW4gRmF0YWxFcnJvci5cbiAqLyBleHBvcnQgdmFyIGxvYWRXb3JrYm9va1N0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2xvYWRXb3JrYm9va1N0ZXBcIik7XG4vKiogRVhUUkFDVDogc2VyaWFsaXplIGV2ZXJ5IHNoZWV0IHRvIHRleHQgKyBzdHJ1Y3R1cmFsIHN0YXRzLiAqLyBleHBvcnQgdmFyIGV4dHJhY3RTaGVldHNTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9leHRyYWN0U2hlZXRzU3RlcFwiKTtcbi8qKiBBTkFMWVpFOiBkZXRlcm1pbmlzdGljIHByZS1wYXNzIHByb2R1Y2luZyBzdHJ1Y3R1cmVkIGhpbnRzLiAqLyBleHBvcnQgdmFyIGFuYWx5emVTaGVldHNTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9hbmFseXplU2hlZXRzU3RlcFwiKTtcbi8qKlxuICogQ09NUFJFSEVORDogb25lIE9wZW5BSSBjYWxsIChncHQtNG8sIGpzb25fb2JqZWN0LCBab2QtdmFsaWRhdGVkKSB3aXRoIHRoZVxuICogZGV0ZXJtaW5pc3RpYyBBTkFMWVNJUyBoaW50cyBpbmplY3RlZCBpbnRvIHRoZSBwcm9tcHQuXG4gKlxuICogUmV0cnkgcG9saWN5IChcdTAwQTc0LjIgb2YgdGhlIHJvYWRtYXApOlxuICogICAtIDQyOSAgICAgICAgICAgIFx1MjE5MiBSZXRyeWFibGVFcnJvcih7IHJldHJ5QWZ0ZXIgfSkgdXNpbmcgUmV0cnktQWZ0ZXIgaGVhZGVyIChmYWxsYmFjayAxcylcbiAqICAgLSA1eHggLyBuZXR3b3JrICBcdTIxOTIgcGxhaW4gRXJyb3IgXHUyMTkyIFNESyBhdXRvLXJldHJ5IChtYXggMylcbiAqICAgLSBtaXNzaW5nIGtleSAgICBcdTIxOTIgRmF0YWxFcnJvciAocGVybWFuZW50LCBubyByZXRyeSBzdG9ybSlcbiAqICAgLSBzY2hlbWEgcmVqZWN0ZWQgXHUyMTkyIHBsYWluIEVycm9yIFx1MjE5MiBTREsgYXV0by1yZXRyaWVzIChtb2RlbCBvdXRwdXQgaXMgc3RvY2hhc3RpY1xuICogICAgICAgICAgICAgICAgICAgICAgYXQgdGVtcGVyYXR1cmUgMC4yKTsgcnVuIGZhaWxzIHdpdGggYSBjbGVhciBtZXNzYWdlIGFmdGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgU0RLJ3MgcmV0cnkgYnVkZ2V0IGlzIGV4aGF1c3RlZC5cbiAqLyBleHBvcnQgdmFyIGNvbXByZWhlbmRXb3JrYm9va1N0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL2NvbXByZWhlbmRXb3JrYm9va1N0ZXBcIik7XG4vKipcbiAqIEVtaXQgYSBwcm9ncmVzcyBjaHVuayB0byB0aGUgcnVuJ3Mgd3JpdGFibGUgc3RyZWFtIChTU0UgcGF5bG9hZCkuXG4gKiBNdXN0IGJlIGEgc3RlcDogd29ya2Zsb3cgZnVuY3Rpb25zIGNhbm5vdCBpbnRlcmFjdCB3aXRoIHRoZSBzdHJlYW0gZGlyZWN0bHkuXG4gKi8gZXhwb3J0IHZhciBlbWl0UHJvZ3Jlc3NTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9lbWl0UHJvZ3Jlc3NTdGVwXCIpO1xuLyoqXG4gKiBDbG9zZSB0aGUgcnVuJ3Mgd3JpdGFibGUgc3RyZWFtLCBzaWduYWxpbmcgY29tcGxldGlvbiB0byBzdHJlYW0gcmVhZGVycy5cbiAqIE11c3QgYmUgYSBzdGVwOiB3b3JrZmxvdyBmdW5jdGlvbnMgY2Fubm90IGludGVyYWN0IHdpdGggdGhlIHN0cmVhbSBkaXJlY3RseS5cbiAqLyBleHBvcnQgdmFyIGNsb3NlUHJvZ3Jlc3NTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9jbG9zZVByb2dyZXNzU3RlcFwiKTtcbi8vIFx1MjUwMFx1MjUwMCBQaGFzZSAzOiBQT1BVTEFURSBzdGVwcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8qKlxuICogVXBzZXJ0IGZpbmFuY2lhbCBwcm9qZWN0aW9ucyBmcm9tIHRoZSBBSSBjb21wcmVoZW5zaW9uLlxuICogSWRlbXBvdGVudDogT04gQ09ORkxJQ1QgKHBlcmlvZCwgZGF0YV90eXBlLCBzY2VuYXJpbykgRE8gVVBEQVRFLlxuICovIGV4cG9ydCB2YXIgcG9wdWxhdGVQcm9qZWN0aW9uc1N0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3Qvc3RlcHMvL3BvcHVsYXRlUHJvamVjdGlvbnNTdGVwXCIpO1xuLyoqXG4gKiBDcmVhdGUvdXBkYXRlIGR5bmFtaWMgYXBwIHBhZ2VzICsgcGFnZSBzZWN0aW9ucyBmb3IgZWFjaCBjb21wcmVoZW5kZWQgc2hlZXQuXG4gKlxuICogXHUwMEE3Ny4xIEZJWDogT04gQ09ORkxJQ1QgKHNsdWcpIERPIFVQREFURSAuLi4gUkVUVVJOSU5HIGlkIGVuc3VyZXMgd2UgYWx3YXlzXG4gKiBoYXZlIHRoZSBjb3JyZWN0IHBhZ2UgSUQgKG5ldyBvciBleGlzdGluZykuIFBhZ2Ugc2VjdGlvbnMgYXJlIGRlbGV0ZWQgYW5kXG4gKiByZS1pbnNlcnRlZCBzY29wZWQgdG8gdGhhdCBpZCBcdTIwMTQgbm8gb3JwaGFuIEZLIHJlZmVyZW5jZXMuXG4gKi8gZXhwb3J0IHZhciB1cHNlcnRTaGVldFBhZ2VzU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vdXBzZXJ0U2hlZXRQYWdlc1N0ZXBcIik7XG4vKiogVXBzZXJ0IGtub3dsZWRnZSBzbmlwcGV0cyAoZnVsbCBjb21wcmVoZW5zaW9uICsgcGVyLXNoZWV0IG1hcmtkb3duKS4gKi8gZXhwb3J0IHZhciBzYXZlU25pcHBldHNTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zYXZlU25pcHBldHNTdGVwXCIpO1xuLyoqXG4gKiBEZXRlcm1pbmlzdGljIHRlbXBsYXRlLWZpdCBzY29yaW5nIChcdTAwQTc1LjUpLlxuICpcbiAqIFNjb3JlcyB0aGUgQUktc3VnZ2VzdGVkIHRlbXBsYXRlIGFnYWluc3QgdGhlIGNvbXByZWhlbmRlZCBzaGVldCBjYXRlZ29yaWVzLlxuICogTm8gZXh0ZXJuYWwgaW1wb3J0cyBcdTIwMTQgYWxsIHRlbXBsYXRlIGRhdGEgaXMgaGFyZGNvZGVkIHRvIGtlZXAgdGhlIGJ1bmRsZSBsZWFuLlxuICovIGV4cG9ydCB2YXIgc2VsZWN0VGVtcGxhdGVTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9zZWxlY3RUZW1wbGF0ZVN0ZXBcIik7XG4vKiogQmVzdC1lZmZvcnQgcmVnaXN0ZXIgZHluYW1pYyBwYWdlcyBpbiB0aGUgcnVudGltZSBjYXRhbG9nLiAqLyBleHBvcnQgdmFyIHJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vcmVnaXN0ZXJEeW5hbWljUGFnZXNTdGVwXCIpO1xuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgQnVzaW5lc3MgUmV2aWV3IGZyb20gY29tcHJlaGVuc2lvbiBkYXRhLlxuICogU2F2ZXMgcGFyc2VkIHBhcnRzIHRvIGJ1c2luZXNzX3Jldmlld19wYXJ0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IHZhciBnZW5lcmF0ZUJ1c2luZXNzUmV2aWV3U3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9zdGVwcy8vZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXBcIik7XG4vKipcbiAqIEdlbmVyYXRlIHRoZSBFeGVjdXRpdmUgU3VtbWFyeSBmcm9tIGNvbXByZWhlbnNpb24gZGF0YS5cbiAqIFNhdmVzIHRvIGtub3dsZWRnZV9zbmlwcGV0cyB2aWEgcGcuXG4gKi8gZXhwb3J0IHZhciBnZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZUV4ZWN1dGl2ZVN1bW1hcnlTdGVwXCIpO1xuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgRGFzaGJvYXJkIERhdGEgZnJvbSBjb21wcmVoZW5zaW9uIGRhdGEuXG4gKiBTYXZlcyB0byBrbm93bGVkZ2Vfc25pcHBldHMgdmlhIHBnLlxuICovIGV4cG9ydCB2YXIgZ2VuZXJhdGVEYXNoYm9hcmRTdGVwID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi93b3JrZmxvd3Mvd29ya2Jvb2staW5nZXN0L3N0ZXBzLy9nZW5lcmF0ZURhc2hib2FyZFN0ZXBcIik7XG4iLCAiLyoqXG4gKiBXb3JrYm9vayBJbmdlc3QgV29ya2Zsb3cgXHUyMDE0IFZlcmNlbCBXb3JrZmxvdyBTREsgb3JjaGVzdHJhdG9yLlxuICpcbiAqIER1cmFibGUgcmVwbGFjZW1lbnQgZm9yIHRoZSBzeW5jaHJvbm91cyBBSSB3b3JrYm9vayBwaXBlbGluZVxuICogKHNyYy9kb21haW4vYWktd29ya2Jvb2svcGlwZWxpbmUudHMpLiBQaGFzZXM6XG4gKlxuICogICBQaGFzZSAxICh0aGlzIGZpbGUpICBcdTIwMTQgTE9BRCBcdTIxOTIgRVhUUkFDVCBcdTIxOTIgQU5BTFlaRVxuICogICBQaGFzZSAyICAgICAgICAgICAgICBcdTIwMTQgQ09NUFJFSEVORCAoT3BlbkFJIHN0ZXApICAgICAgICAgIFtyb2FkbWFwIFAyXVxuICogICBQaGFzZSAzICAgICAgICAgICAgICBcdTIwMTQgUE9QVUxBVEUgKHByb2plY3Rpb25zL3BhZ2VzKSAgICAgIFtyb2FkbWFwIFAzXVxuICogICBQaGFzZSA0ICAgICAgICAgICAgICBcdTIwMTQgR0VORVJBVEUgKEJSL0VTL0Rhc2hib2FyZCkgICAgICAgIFtyb2FkbWFwIFA1XVxuICpcbiAqIFByb2dyZXNzIGlzIHN0cmVhbWVkIHZpYSBnZXRXcml0YWJsZSgpIFx1MjE5MiBTU0Ugcm91dGUgKFBoYXNlIDQpLlxuICovIGltcG9ydCB7IHNsZWVwLCBnZXRXcml0YWJsZSB9IGZyb20gJ3dvcmtmbG93JztcbmltcG9ydCB7IGxvYWRXb3JrYm9va1N0ZXAsIGV4dHJhY3RTaGVldHNTdGVwLCBhbmFseXplU2hlZXRzU3RlcCwgY29tcHJlaGVuZFdvcmtib29rU3RlcCwgc2VsZWN0VGVtcGxhdGVTdGVwLCBwb3B1bGF0ZVByb2plY3Rpb25zU3RlcCwgdXBzZXJ0U2hlZXRQYWdlc1N0ZXAsIHJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcCwgc2F2ZVNuaXBwZXRzU3RlcCwgZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXAsIGdlbmVyYXRlRXhlY3V0aXZlU3VtbWFyeVN0ZXAsIGdlbmVyYXRlRGFzaGJvYXJkU3RlcCwgZW1pdFByb2dyZXNzU3RlcCwgY2xvc2VQcm9ncmVzc1N0ZXAgfSBmcm9tICcuL3N0ZXBzJztcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wid29ya2Zsb3dzXCI6e1wid29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9pbmRleC50c1wiOntcImhhbmRsZVdvcmtib29rSW5nZXN0XCI6e1wid29ya2Zsb3dJZFwiOlwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9pbmRleC8vaGFuZGxlV29ya2Jvb2tJbmdlc3RcIn19fX0qLztcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVXb3JrYm9va0luZ2VzdChpbnB1dCkge1xuICAgIGNvbnN0IHdyaXRhYmxlID0gZ2V0V3JpdGFibGUoKTtcbiAgICBjb25zdCBtb2RlbCA9IGlucHV0Lm1vZGVsID8/ICdncHQtNG8nO1xuICAgIGNvbnN0IGRiVXJsID0gaW5wdXQuZGJVcmw7XG4gICAgY29uc3Qgc3RhcnRlZCA9IHtcbiAgICAgICAgc3RlcDogJ3N0YXJ0ZWQnLFxuICAgICAgICBtZXNzYWdlOiBgV29ya2Jvb2sgaW5nZXN0IHN0YXJ0ZWQgXHUyMDE0ICR7aW5wdXQuZmlsZXMubGVuZ3RofSBmaWxlKHMpLCBtb2RlbCAke21vZGVsfWAsXG4gICAgICAgIHBjdDogMFxuICAgIH07XG4gICAgYXdhaXQgZW1pdFByb2dyZXNzU3RlcCh3cml0YWJsZSwgc3RhcnRlZCk7XG4gICAgLy8gXHUyNTAwXHUyNTAwIDEuIExPQUQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYnVmZmVycyA9IGF3YWl0IGxvYWRXb3JrYm9va1N0ZXAoaW5wdXQuZmlsZXMpO1xuICAgIGF3YWl0IGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGUsIHtcbiAgICAgICAgc3RlcDogJ2xvYWRpbmcnLFxuICAgICAgICBtZXNzYWdlOiBgTG9hZGVkICR7YnVmZmVycy5sZW5ndGh9IGZpbGUocykgXHUyMDE0IHZhbGlkYXRpbmcgLnhsc3ggY29udGVudHNcdTIwMjZgLFxuICAgICAgICBwY3Q6IDE1XG4gICAgfSk7XG4gICAgLy8gXHUyNTAwXHUyNTAwIDIuIEVYVFJBQ1QgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3Qgc2hlZXRzID0gYXdhaXQgZXh0cmFjdFNoZWV0c1N0ZXAoYnVmZmVycyk7XG4gICAgYXdhaXQgZW1pdFByb2dyZXNzU3RlcCh3cml0YWJsZSwge1xuICAgICAgICBzdGVwOiAnZXh0cmFjdGluZycsXG4gICAgICAgIG1lc3NhZ2U6IGBFeHRyYWN0ZWQgJHtzaGVldHMubGVuZ3RofSBzaGVldChzKSBhY3Jvc3MgJHtidWZmZXJzLmxlbmd0aH0gZmlsZShzKS5gLFxuICAgICAgICBwY3Q6IDQ1LFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIHNoZWV0czogc2hlZXRzLmxlbmd0aCxcbiAgICAgICAgICAgIHRhYk5hbWVzOiBzaGVldHMubWFwKChzKT0+cy50YWJOYW1lKVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8gXHUyNTAwXHUyNTAwIDMuIEFOQUxZWkUgKGRldGVybWluaXN0aWMgcHJlLXBhc3MpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IGhpbnRzID0gYXdhaXQgYW5hbHl6ZVNoZWV0c1N0ZXAoc2hlZXRzKTtcbiAgICBhd2FpdCBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlLCB7XG4gICAgICAgIHN0ZXA6ICdhbmFseXppbmcnLFxuICAgICAgICBtZXNzYWdlOiBgQW5hbHl6ZWQgJHtoaW50cy5zaGVldHMubGVuZ3RofSBzaGVldChzKSBcdTIwMTQgJHtoaW50cy53b3JrYm9vay50b3RhbFJvd3N9IHJvd3MsIGAgKyBgJHtNYXRoLnJvdW5kKGhpbnRzLndvcmtib29rLm92ZXJhbGxOdW1lcmljUmF0aW8gKiAxMDApfSUgbnVtZXJpYywgYCArIGBjdXJyZW5jeSAke2hpbnRzLndvcmtib29rLmN1cnJlbmN5R3Vlc3MgPz8gJ3Vua25vd24nfSwgYCArIGBwZXJpb2QgJHtoaW50cy53b3JrYm9vay5wZXJpb2RHdWVzcyA/PyAndW5rbm93bid9LmAsXG4gICAgICAgIHBjdDogNzAsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgdG90YWxSb3dzOiBoaW50cy53b3JrYm9vay50b3RhbFJvd3MsXG4gICAgICAgICAgICBvdmVyYWxsTnVtZXJpY1JhdGlvOiBoaW50cy53b3JrYm9vay5vdmVyYWxsTnVtZXJpY1JhdGlvLFxuICAgICAgICAgICAgY3VycmVuY3lHdWVzczogaGludHMud29ya2Jvb2suY3VycmVuY3lHdWVzcyxcbiAgICAgICAgICAgIHBlcmlvZEd1ZXNzOiBoaW50cy53b3JrYm9vay5wZXJpb2RHdWVzc1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8gXHUyNTAwXHUyNTAwIDQuIENPTVBSRUhFTkQgKE9wZW5BSSwgaGludHMtaW5qZWN0ZWQgcHJvbXB0KSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBjb21wcmVoZW5zaW9uID0gYXdhaXQgY29tcHJlaGVuZFdvcmtib29rU3RlcChzaGVldHMsIGhpbnRzLCBtb2RlbCwgaW5wdXQub3BlbmFpQXBpS2V5KTtcbiAgICBhd2FpdCBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlLCB7XG4gICAgICAgIHN0ZXA6ICdjb21wcmVoZW5kaW5nJyxcbiAgICAgICAgbWVzc2FnZTogYENvbXByZWhlbmRlZCAke2NvbXByZWhlbnNpb24uY29tcHJlaGVuc2lvbi5zaGVldHMubGVuZ3RofSBzaGVldChzKSBcdTIwMTQgYCArIGAke2NvbXByZWhlbnNpb24uY29tcHJlaGVuc2lvbi5wcm9qZWN0aW9ucy5sZW5ndGh9IHByb2plY3Rpb25zLCBgICsgYHRlbXBsYXRlIFwiJHtjb21wcmVoZW5zaW9uLmNvbXByZWhlbnNpb24udGVtcGxhdGU/LmlkID8/ICdub25lJ31cIiAoJHttb2RlbH0pLmAsXG4gICAgICAgIHBjdDogOTAsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgc2hlZXRzOiBjb21wcmVoZW5zaW9uLmNvbXByZWhlbnNpb24uc2hlZXRzLmxlbmd0aCxcbiAgICAgICAgICAgIHByb2plY3Rpb25zOiBjb21wcmVoZW5zaW9uLmNvbXByZWhlbnNpb24ucHJvamVjdGlvbnMubGVuZ3RoLFxuICAgICAgICAgICAgdGVtcGxhdGU6IGNvbXByZWhlbnNpb24uY29tcHJlaGVuc2lvbi50ZW1wbGF0ZT8uaWQgPz8gbnVsbFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8gXHUyNTAwXHUyNTAwIDRiLiBTRUxFQ1QgVEVNUExBVEUgKGRldGVybWluaXN0aWMgZml0IHNjb3JpbmcsIFx1MDBBNzUuNSkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgdGVtcGxhdGVGaXQgPSBhd2FpdCBzZWxlY3RUZW1wbGF0ZVN0ZXAoY29tcHJlaGVuc2lvbi5jb21wcmVoZW5zaW9uKTtcbiAgICBhd2FpdCBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlLCB7XG4gICAgICAgIHN0ZXA6ICdwb3B1bGF0aW5nJyxcbiAgICAgICAgbWVzc2FnZTogYFBvcHVsYXRpbmcgJHtjb21wcmVoZW5zaW9uLmNvbXByZWhlbnNpb24ucHJvamVjdGlvbnMubGVuZ3RofSBwcm9qZWN0aW9ucyBpbnRvIERCXHUyMDI2YCxcbiAgICAgICAgcGN0OiA5MixcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBwcm9qZWN0aW9uc0NvdW50OiBjb21wcmVoZW5zaW9uLmNvbXByZWhlbnNpb24ucHJvamVjdGlvbnMubGVuZ3RoXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBcdTI1MDBcdTI1MDAgNS4gUE9QVUxBVEUgUFJPSkVDVElPTlMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgcHJvamVjdGlvbnNDb3VudCA9IGF3YWl0IHBvcHVsYXRlUHJvamVjdGlvbnNTdGVwKGNvbXByZWhlbnNpb24uY29tcHJlaGVuc2lvbiwgZGJVcmwpO1xuICAgIC8vIFx1MjUwMFx1MjUwMCA2LiBVUFNFUlQgU0hFRVQgUEFHRVMgKHdpdGggXHUwMEE3Ny4xIG9ycGhhbiBmaXgpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBhZ2VzQ3JlYXRlZCA9IGF3YWl0IHVwc2VydFNoZWV0UGFnZXNTdGVwKGNvbXByZWhlbnNpb24uY29tcHJlaGVuc2lvbiwgZGJVcmwsIGlucHV0LnRlbmFudFNsdWcpO1xuICAgIC8vIFx1MjUwMFx1MjUwMCA3LiBSRUdJU1RFUiBEWU5BTUlDIFBBR0VTIChiZXN0LWVmZm9ydCBydW50aW1lIGNhdGFsb2cpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBhZ2VzUmVnaXN0ZXJlZCA9IGF3YWl0IHJlZ2lzdGVyRHluYW1pY1BhZ2VzU3RlcChjb21wcmVoZW5zaW9uLmNvbXByZWhlbnNpb24pO1xuICAgIC8vIFx1MjUwMFx1MjUwMCA4LiBTQVZFIEtOT1dMRURHRSBTTklQUEVUUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBzbmlwcGV0c0NvdW50ID0gYXdhaXQgc2F2ZVNuaXBwZXRzU3RlcChjb21wcmVoZW5zaW9uLmNvbXByZWhlbnNpb24sIG1vZGVsLCBkYlVybCk7XG4gICAgLy8gXHUyNTAwXHUyNTAwIDkuIEdFTkVSQVRFIGNvbnRlbnQgKEFJIFx1MjE5MiBCUiAvIEVTIC8gRGFzaGJvYXJkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBhcGlLZXkgPSBpbnB1dC5vcGVuYWlBcGlLZXkgfHwgcHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVk7XG4gICAgbGV0IGJyUGFydHMgPSAwO1xuICAgIGxldCBlc1NhdmVkID0gZmFsc2U7XG4gICAgbGV0IGRhc2hib2FyZFNhdmVkID0gZmFsc2U7XG4gICAgaWYgKGFwaUtleSAmJiAhaW5wdXQuc2tpcENvbnRlbnRHZW5lcmF0aW9uKSB7XG4gICAgICAgIGF3YWl0IGVtaXRQcm9ncmVzc1N0ZXAod3JpdGFibGUsIHtcbiAgICAgICAgICAgIHN0ZXA6ICdnZW5lcmF0aW5nJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdHZW5lcmF0aW5nIEFJIGNvbnRlbnQgKEJ1c2luZXNzIFJldmlldyBcdTIxOTIgRXhlY3V0aXZlIFN1bW1hcnkgXHUyMTkyIERhc2hib2FyZCBEYXRhKS4uLicsXG4gICAgICAgICAgICBwY3Q6IDk1XG4gICAgICAgIH0pO1xuICAgICAgICBiclBhcnRzID0gYXdhaXQgZ2VuZXJhdGVCdXNpbmVzc1Jldmlld1N0ZXAoY29tcHJlaGVuc2lvbi5jb21wcmVoZW5zaW9uLCBhcGlLZXksIGRiVXJsLCBtb2RlbCk7XG4gICAgICAgIGF3YWl0IHNsZWVwKCcxcycpO1xuICAgICAgICBlc1NhdmVkID0gYXdhaXQgZ2VuZXJhdGVFeGVjdXRpdmVTdW1tYXJ5U3RlcChjb21wcmVoZW5zaW9uLmNvbXByZWhlbnNpb24sIGFwaUtleSwgZGJVcmwsIG1vZGVsKTtcbiAgICAgICAgYXdhaXQgc2xlZXAoJzFzJyk7XG4gICAgICAgIGRhc2hib2FyZFNhdmVkID0gYXdhaXQgZ2VuZXJhdGVEYXNoYm9hcmRTdGVwKGNvbXByZWhlbnNpb24uY29tcHJlaGVuc2lvbiwgYXBpS2V5LCBkYlVybCwgbW9kZWwpO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50R2VuZXJhdGVkID0gYnJQYXJ0cyA+IDAgfHwgZXNTYXZlZCB8fCBkYXNoYm9hcmRTYXZlZDtcbiAgICBhd2FpdCBlbWl0UHJvZ3Jlc3NTdGVwKHdyaXRhYmxlLCB7XG4gICAgICAgIHN0ZXA6ICdjb21wbGV0ZScsXG4gICAgICAgIG1lc3NhZ2U6IGBXb3JrYm9vayBpbmdlc3QgY29tcGxldGUgXHUyMDE0ICR7cHJvamVjdGlvbnNDb3VudH0gcHJvamVjdGlvbnMsICR7cGFnZXNDcmVhdGVkLmxlbmd0aH0gc2hlZXQgcGFnZXMsIGAgKyBgJHtzbmlwcGV0c0NvdW50fSBzbmlwcGV0cywgY29udGVudCBnZW5lcmF0ZWQ6ICR7Y29udGVudEdlbmVyYXRlZH0uIGAgKyBgVGVtcGxhdGU6ICR7dGVtcGxhdGVGaXQucmVjb21tZW5kZWR9IChzY29yZSAke3RlbXBsYXRlRml0LnNjb3JlfSkuYCxcbiAgICAgICAgcGN0OiAxMDAsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgcHJvamVjdGlvbnNDb3VudCxcbiAgICAgICAgICAgIHBhZ2VzQ3JlYXRlZDogcGFnZXNDcmVhdGVkLmxlbmd0aCxcbiAgICAgICAgICAgIHBhZ2VzUmVnaXN0ZXJlZCxcbiAgICAgICAgICAgIHNuaXBwZXRzQ291bnQsXG4gICAgICAgICAgICBjb250ZW50R2VuZXJhdGVkLFxuICAgICAgICAgICAgYnJQYXJ0cyxcbiAgICAgICAgICAgIGVzU2F2ZWQsXG4gICAgICAgICAgICBkYXNoYm9hcmRTYXZlZCxcbiAgICAgICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZUZpdC5yZWNvbW1lbmRlZCxcbiAgICAgICAgICAgIHRlbXBsYXRlU2NvcmU6IHRlbXBsYXRlRml0LnNjb3JlXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBhd2FpdCBjbG9zZVByb2dyZXNzU3RlcCh3cml0YWJsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhZ2U6ICdjb21wbGV0ZScsXG4gICAgICAgIG1lc3NhZ2U6IGBFeHRyYWN0ZWQgJHtzaGVldHMubGVuZ3RofSBzaGVldChzKSBmcm9tICR7YnVmZmVycy5sZW5ndGh9IGZpbGUocyksIGAgKyBgY29tcHJlaGVuZGVkIHdpdGggJHttb2RlbH0sIGAgKyBgcG9wdWxhdGVkICR7cHJvamVjdGlvbnNDb3VudH0gcHJvamVjdGlvbnMgKyAke3BhZ2VzQ3JlYXRlZC5sZW5ndGh9IHNoZWV0IHBhZ2VzLCBgICsgYGNvbnRlbnQgZ2VuZXJhdGVkOiAke2NvbnRlbnRHZW5lcmF0ZWR9IGAgKyBgKHRlbXBsYXRlICR7dGVtcGxhdGVGaXQucmVjb21tZW5kZWR9KS5gLFxuICAgICAgICBzaGVldENvdW50OiBzaGVldHMubGVuZ3RoLFxuICAgICAgICBoaW50cyxcbiAgICAgICAgc2hlZXRzOiBzaGVldHMubWFwKCh7IHRhYk5hbWUsIHRleHQgfSk9Pih7XG4gICAgICAgICAgICAgICAgdGFiTmFtZSxcbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICB9KSksXG4gICAgICAgIGNvbXByZWhlbnNpb246IGNvbXByZWhlbnNpb24uY29tcHJlaGVuc2lvbixcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIHByb2plY3Rpb25zQ291bnQsXG4gICAgICAgIHBhZ2VzQ3JlYXRlZCxcbiAgICAgICAgdGVtcGxhdGVGaXQsXG4gICAgICAgIGNvbnRlbnRHZW5lcmF0ZWQsXG4gICAgICAgIGJyUGFydHMsXG4gICAgICAgIGVzU2F2ZWQsXG4gICAgICAgIGRhc2hib2FyZFNhdmVkXG4gICAgfTtcbn1cbmhhbmRsZVdvcmtib29rSW5nZXN0LndvcmtmbG93SWQgPSBcIndvcmtmbG93Ly8uL3dvcmtmbG93cy93b3JrYm9vay1pbmdlc3QvaW5kZXgvL2hhbmRsZVdvcmtib29rSW5nZXN0XCI7XG5nbG9iYWxUaGlzLl9fcHJpdmF0ZV93b3JrZmxvd3Muc2V0KFwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3dvcmtib29rLWluZ2VzdC9pbmRleC8vaGFuZGxlV29ya2Jvb2tJbmdlc3RcIiwgaGFuZGxlV29ya2Jvb2tJbmdlc3QpO1xuIiwgIltcblx0XCJub2RlOmFzc2VydFwiLFxuXHRcImFzc2VydFwiLFxuXHRcIm5vZGU6YXNzZXJ0L3N0cmljdFwiLFxuXHRcImFzc2VydC9zdHJpY3RcIixcblx0XCJub2RlOmFzeW5jX2hvb2tzXCIsXG5cdFwiYXN5bmNfaG9va3NcIixcblx0XCJub2RlOmJ1ZmZlclwiLFxuXHRcImJ1ZmZlclwiLFxuXHRcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiLFxuXHRcImNoaWxkX3Byb2Nlc3NcIixcblx0XCJub2RlOmNsdXN0ZXJcIixcblx0XCJjbHVzdGVyXCIsXG5cdFwibm9kZTpjb25zb2xlXCIsXG5cdFwiY29uc29sZVwiLFxuXHRcIm5vZGU6Y29uc3RhbnRzXCIsXG5cdFwiY29uc3RhbnRzXCIsXG5cdFwibm9kZTpjcnlwdG9cIixcblx0XCJjcnlwdG9cIixcblx0XCJub2RlOmRncmFtXCIsXG5cdFwiZGdyYW1cIixcblx0XCJub2RlOmRpYWdub3N0aWNzX2NoYW5uZWxcIixcblx0XCJkaWFnbm9zdGljc19jaGFubmVsXCIsXG5cdFwibm9kZTpkbnNcIixcblx0XCJkbnNcIixcblx0XCJub2RlOmRucy9wcm9taXNlc1wiLFxuXHRcImRucy9wcm9taXNlc1wiLFxuXHRcIm5vZGU6ZG9tYWluXCIsXG5cdFwiZG9tYWluXCIsXG5cdFwibm9kZTpldmVudHNcIixcblx0XCJldmVudHNcIixcblx0XCJub2RlOmZzXCIsXG5cdFwiZnNcIixcblx0XCJub2RlOmZzL3Byb21pc2VzXCIsXG5cdFwiZnMvcHJvbWlzZXNcIixcblx0XCJub2RlOmh0dHBcIixcblx0XCJodHRwXCIsXG5cdFwibm9kZTpodHRwMlwiLFxuXHRcImh0dHAyXCIsXG5cdFwibm9kZTpodHRwc1wiLFxuXHRcImh0dHBzXCIsXG5cdFwibm9kZTppbnNwZWN0b3JcIixcblx0XCJpbnNwZWN0b3JcIixcblx0XCJub2RlOmluc3BlY3Rvci9wcm9taXNlc1wiLFxuXHRcImluc3BlY3Rvci9wcm9taXNlc1wiLFxuXHRcIm5vZGU6bW9kdWxlXCIsXG5cdFwibW9kdWxlXCIsXG5cdFwibm9kZTpuZXRcIixcblx0XCJuZXRcIixcblx0XCJub2RlOm9zXCIsXG5cdFwib3NcIixcblx0XCJub2RlOnBhdGhcIixcblx0XCJwYXRoXCIsXG5cdFwibm9kZTpwYXRoL3Bvc2l4XCIsXG5cdFwicGF0aC9wb3NpeFwiLFxuXHRcIm5vZGU6cGF0aC93aW4zMlwiLFxuXHRcInBhdGgvd2luMzJcIixcblx0XCJub2RlOnBlcmZfaG9va3NcIixcblx0XCJwZXJmX2hvb2tzXCIsXG5cdFwibm9kZTpwcm9jZXNzXCIsXG5cdFwicHJvY2Vzc1wiLFxuXHRcIm5vZGU6cXVlcnlzdHJpbmdcIixcblx0XCJxdWVyeXN0cmluZ1wiLFxuXHRcIm5vZGU6cXVpY1wiLFxuXHRcIm5vZGU6cmVhZGxpbmVcIixcblx0XCJyZWFkbGluZVwiLFxuXHRcIm5vZGU6cmVhZGxpbmUvcHJvbWlzZXNcIixcblx0XCJyZWFkbGluZS9wcm9taXNlc1wiLFxuXHRcIm5vZGU6cmVwbFwiLFxuXHRcInJlcGxcIixcblx0XCJub2RlOnNlYVwiLFxuXHRcIm5vZGU6c3FsaXRlXCIsXG5cdFwibm9kZTpzdHJlYW1cIixcblx0XCJzdHJlYW1cIixcblx0XCJub2RlOnN0cmVhbS9jb25zdW1lcnNcIixcblx0XCJzdHJlYW0vY29uc3VtZXJzXCIsXG5cdFwibm9kZTpzdHJlYW0vcHJvbWlzZXNcIixcblx0XCJzdHJlYW0vcHJvbWlzZXNcIixcblx0XCJub2RlOnN0cmVhbS93ZWJcIixcblx0XCJzdHJlYW0vd2ViXCIsXG5cdFwibm9kZTpzdHJpbmdfZGVjb2RlclwiLFxuXHRcInN0cmluZ19kZWNvZGVyXCIsXG5cdFwibm9kZTp0ZXN0XCIsXG5cdFwibm9kZTp0ZXN0L3JlcG9ydGVyc1wiLFxuXHRcIm5vZGU6dGltZXJzXCIsXG5cdFwidGltZXJzXCIsXG5cdFwibm9kZTp0aW1lcnMvcHJvbWlzZXNcIixcblx0XCJ0aW1lcnMvcHJvbWlzZXNcIixcblx0XCJub2RlOnRsc1wiLFxuXHRcInRsc1wiLFxuXHRcIm5vZGU6dHJhY2VfZXZlbnRzXCIsXG5cdFwidHJhY2VfZXZlbnRzXCIsXG5cdFwibm9kZTp0dHlcIixcblx0XCJ0dHlcIixcblx0XCJub2RlOnVybFwiLFxuXHRcInVybFwiLFxuXHRcIm5vZGU6dXRpbFwiLFxuXHRcInV0aWxcIixcblx0XCJub2RlOnV0aWwvdHlwZXNcIixcblx0XCJ1dGlsL3R5cGVzXCIsXG5cdFwibm9kZTp2OFwiLFxuXHRcInY4XCIsXG5cdFwibm9kZTp2bVwiLFxuXHRcInZtXCIsXG5cdFwibm9kZTp3YXNpXCIsXG5cdFwid2FzaVwiLFxuXHRcIm5vZGU6d29ya2VyX3RocmVhZHNcIixcblx0XCJ3b3JrZXJfdGhyZWFkc1wiLFxuXHRcIm5vZGU6emxpYlwiLFxuXHRcInpsaWJcIlxuXVxuIiwgImltcG9ydCBidWlsdGluTW9kdWxlcyBmcm9tICcuL2J1aWx0aW4tbW9kdWxlcy5qc29uJztcbmV4cG9ydCBkZWZhdWx0IGJ1aWx0aW5Nb2R1bGVzO1xuIiwgIi8qKlxuICogU2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIGZvciB3b3JrZmxvdyBjdXN0b20gY2xhc3Mgc2VyaWFsaXphdGlvbi5cbiAqXG4gKiBBbmFseXplcyBzb3VyY2UgY29kZSB0byBkZXRlcm1pbmUgaWYgY2xhc3NlcyB3aXRoIFdPUktGTE9XX1NFUklBTElaRSAvXG4gKiBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgY29ycmVjdGx5IHNldCB1cCBmb3IgdGhlIHdvcmtmbG93IHNhbmRib3guXG4gKlxuICogVXNlZCBieTpcbiAqIC0gQ0xJIGB2YWxpZGF0ZWAgY29tbWFuZFxuICogLSBDTEkgYHRyYW5zZm9ybWAgY29tbWFuZCAoLS1jaGVjay1zZXJkZSlcbiAqIC0gU1dDIHBsYXlncm91bmQgc2VyZGUgYW5hbHlzaXMgcGFuZWxcbiAqIC0gQnVpbGQtdGltZSB3YXJuaW5ncyBpbiBCYXNlQnVpbGRlclxuICovXG5cbmltcG9ydCBidWlsdGluTW9kdWxlcyBmcm9tICdidWlsdGluLW1vZHVsZXMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd01hbmlmZXN0IH0gZnJvbSAnLi9hcHBseS1zd2MtdHJhbnNmb3JtLmpzJztcblxuLy8gQnVpbGQgYSByZWdleCB0aGF0IG1hdGNoZXMgTm9kZS5qcyBidWlsdC1pbiBtb2R1bGUgaW1wb3J0cyBpbiB0cmFuc2Zvcm1lZCBjb2RlLlxuLy8gSGFuZGxlcyBib3RoIEVTTSAoYGZyb20gJ2ZzJ2AsIGBmcm9tICdub2RlOmZzJ2ApIGFuZCBDSlMgKGByZXF1aXJlKCdmcycpYClcbmNvbnN0IG5vZGVCdWlsdGlucyA9IGJ1aWx0aW5Nb2R1bGVzLmpvaW4oJ3wnKTtcblxuLy8gUmVnZXggdG8gZXh0cmFjdCBzcGVjaWZpYyBtb2R1bGUgbmFtZXMgZnJvbSBpbXBvcnQvcmVxdWlyZSBzdGF0ZW1lbnRzXG5jb25zdCBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgYCg/OmZyb21cXFxccytbJ1wiXSg/Om5vZGU6KT8oKD86JHtub2RlQnVpbHRpbnN9KSg/Oi9bXidcIl0qKT8pWydcIl1gICtcbiAgICBgfHJlcXVpcmVcXFxccypcXFxcKFxcXFxzKlsnXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXVxcXFxzKlxcXFwpKWAsXG4gICdnJ1xuKTtcblxuLy8gUmVnZXggdG8gZGV0ZWN0IGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFcyBnZW5lcmF0ZWQgYnkgdGhlIFNXQyBwbHVnaW5cbmNvbnN0IHJlZ2lzdHJhdGlvbklpZmVSZWdleCA9XG4gIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKltcIiddd29ya2Zsb3ctY2xhc3MtcmVnaXN0cnlbXCInXVxccypcXCkvO1xuXG4vKipcbiAqIFJlc3VsdCBvZiBjaGVja2luZyBhIHNpbmdsZSBjbGFzcyBmb3Igc2VyZGUgY29tcGxpYW5jZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJkZUNsYXNzQ2hlY2tSZXN1bHQge1xuICAvKiogVGhlIGNsYXNzIG5hbWUgYXMgZGV0ZWN0ZWQgaW4gdGhlIHNvdXJjZSAqL1xuICBjbGFzc05hbWU6IHN0cmluZztcbiAgLyoqIFRoZSBjbGFzc0lkIGFzc2lnbmVkIGJ5IHRoZSBTV0MgcGx1Z2luIChmcm9tIHRoZSBtYW5pZmVzdCkgKi9cbiAgY2xhc3NJZDogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgU1dDIHBsdWdpbiBkZXRlY3RlZCBzZXJkZSBzeW1ib2xzIG9uIHRoaXMgY2xhc3MgKi9cbiAgZGV0ZWN0ZWQ6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIGEgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZCBpbiB0aGUgb3V0cHV0ICovXG4gIHJlZ2lzdGVyZWQ6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIHJlbWFpbmluZyBpbiB0aGUgd29ya2Zsb3ctbW9kZSBvdXRwdXQuXG4gICAqIElmIG5vbi1lbXB0eSwgdGhlIGNsYXNzIGlzIE5PVCB3b3JrZmxvdy1zYW5kYm94IGNvbXBsaWFudC5cbiAgICovXG4gIG5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIGNsYXNzIHBhc3NlcyBhbGwgY29tcGxpYW5jZSBjaGVja3MgKi9cbiAgY29tcGxpYW50OiBib29sZWFuO1xuICAvKiogSHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb25zIG9mIGFueSBpc3N1ZXMgZm91bmQgKi9cbiAgaXNzdWVzOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBGdWxsIHJlc3VsdCBvZiBzZXJkZSBjb21wbGlhbmNlIGFuYWx5c2lzIGZvciBhIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2hlY2tSZXN1bHQge1xuICAvKiogUGVyLWNsYXNzIGFuYWx5c2lzIHJlc3VsdHMgKi9cbiAgY2xhc3NlczogU2VyZGVDbGFzc0NoZWNrUmVzdWx0W107XG4gIC8qKiBBbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZvdW5kIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCAqL1xuICBnbG9iYWxOb2RlSW1wb3J0czogc3RyaW5nW107XG4gIC8qKiBXaGV0aGVyIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCBjb250YWlucyBhbnkgc2VyZGUtcmVsYXRlZCBjbGFzc2VzICovXG4gIGhhc1NlcmRlQ2xhc3NlczogYm9vbGVhbjtcbiAgLyoqIFRoZSByYXcgd29ya2Zsb3cgbWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59XG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgc2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIHRoYXQgd29ya3Mgd2l0aCBwcmUtY29tcHV0ZWRcbiAqIFNXQyB0cmFuc2Zvcm0gcmVzdWx0cy4gVGhpcyBhdm9pZHMgcmUtcnVubmluZyB0aGUgU1dDIHRyYW5zZm9ybVxuICogd2hlbiB0aGUgY2FsbGVyIGFscmVhZHkgaGFzIHRoZSBvdXRwdXRzIChlLmcuLCB0aGUgcGxheWdyb3VuZCBvciBidWlsZGVyKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVTZXJkZUNvbXBsaWFuY2Uob3B0aW9uczoge1xuICAvKiogU291cmNlIGNvZGUgKHVzZWQgZm9yIHBhdHRlcm4gZGV0ZWN0aW9uKSAqL1xuICBzb3VyY2VDb2RlOiBzdHJpbmc7XG4gIC8qKiBXb3JrZmxvdy1tb2RlIHRyYW5zZm9ybWVkIG91dHB1dCAqL1xuICB3b3JrZmxvd0NvZGU6IHN0cmluZztcbiAgLyoqIE1hbmlmZXN0IGV4dHJhY3RlZCBmcm9tIHRoZSBTV0MgdHJhbnNmb3JtICovXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0O1xufSk6IFNlcmRlQ2hlY2tSZXN1bHQge1xuICBjb25zdCB7IHNvdXJjZUNvZGUsIHdvcmtmbG93Q29kZSwgbWFuaWZlc3QgfSA9IG9wdGlvbnM7XG5cbiAgLy8gMS4gRXh0cmFjdCBhbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZyb20gdGhlIHdvcmtmbG93IG91dHB1dFxuICBjb25zdCBnbG9iYWxOb2RlSW1wb3J0cyA9IGV4dHJhY3ROb2RlSW1wb3J0cyh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDIuIENoZWNrIGlmIHRoZSBtYW5pZmVzdCBjb250YWlucyBhbnkgc2VyZGUtcmVnaXN0ZXJlZCBjbGFzc2VzXG4gIGNvbnN0IGNsYXNzRW50cmllcyA9IGV4dHJhY3RDbGFzc0VudHJpZXMobWFuaWZlc3QpO1xuICBjb25zdCBoYXNTZXJkZUNsYXNzZXMgPSBjbGFzc0VudHJpZXMubGVuZ3RoID4gMDtcblxuICAvLyAzLiBDaGVjayBpZiB0aGUgd29ya2Zsb3cgb3V0cHV0IGNvbnRhaW5zIHJlZ2lzdHJhdGlvbiBJSUZFc1xuICBjb25zdCBoYXNSZWdpc3RyYXRpb24gPSByZWdpc3RyYXRpb25JaWZlUmVnZXgudGVzdCh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDQuIEFuYWx5emUgZWFjaCBjbGFzc1xuICBjb25zdCBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXSA9IGNsYXNzRW50cmllcy5tYXAoKGVudHJ5KSA9PiB7XG4gICAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gQ2hlY2sgZm9yIE5vZGUuanMgaW1wb3J0cyAodGhlc2Ugd2lsbCBmYWlsIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94KVxuICAgIGlmIChnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYFdvcmtmbG93IGJ1bmRsZSBjb250YWlucyBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHM6ICR7Z2xvYmFsTm9kZUltcG9ydHMuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgIGBUaGVzZSB3aWxsIGZhaWwgYXQgcnVudGltZSBpbiB0aGUgd29ya2Zsb3cgc2FuZGJveC4gYCArXG4gICAgICAgICAgYEFkZCBcInVzZSBzdGVwXCIgdG8gbWV0aG9kcyB0aGF0IGRlcGVuZCBvbiBOb2RlLmpzIEFQSXMgc28gdGhleSBhcmUgc3RyaXBwZWQgZnJvbSB0aGUgd29ya2Zsb3cgYnVuZGxlLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHJlZ2lzdHJhdGlvblxuICAgIGlmICghaGFzUmVnaXN0cmF0aW9uKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYE5vIGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFIHdhcyBnZW5lcmF0ZWQuIGAgK1xuICAgICAgICAgIGBFbnN1cmUgV09SS0ZMT1dfU0VSSUFMSVpFIGFuZCBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBgICtcbiAgICAgICAgICBgaW5zaWRlIHRoZSBjbGFzcyBib2R5IHVzaW5nIGNvbXB1dGVkIHByb3BlcnR5IHN5bnRheDogc3RhdGljIFtXT1JLRkxPV19TRVJJQUxJWkVdKC4uLikgeyAuLi4gfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogZW50cnkuY2xhc3NOYW1lLFxuICAgICAgY2xhc3NJZDogZW50cnkuY2xhc3NJZCxcbiAgICAgIGRldGVjdGVkOiB0cnVlLFxuICAgICAgcmVnaXN0ZXJlZDogaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPT09IDAgJiYgaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgaXNzdWVzLFxuICAgIH07XG4gIH0pO1xuXG4gIC8vIDUuIENoZWNrIGZvciBjbGFzc2VzIHRoYXQgaGF2ZSBzZXJkZSBwYXR0ZXJucyBpbiBzb3VyY2UgYnV0IHdlcmVuJ3QgZGV0ZWN0ZWQgYnkgU1dDXG4gIGNvbnN0IHNvdXJjZUhhc1NlcmRlUGF0dGVybnMgPVxuICAgIC9cXFtcXHMqV09SS0ZMT1dfKD86U0VSSUFMSVpFfERFU0VSSUFMSVpFKVxccypcXF0vLnRlc3Qoc291cmNlQ29kZSkgfHxcbiAgICAvU3ltYm9sXFwuZm9yXFxzKlxcKFxccypbJ1wiXXdvcmtmbG93LSg/OnNlcmlhbGl6ZXxkZXNlcmlhbGl6ZSlbJ1wiXVxccypcXCkvLnRlc3QoXG4gICAgICBzb3VyY2VDb2RlXG4gICAgKTtcblxuICBpZiAoc291cmNlSGFzU2VyZGVQYXR0ZXJucyAmJiBjbGFzc0VudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgY2xhc3Nlcy5wdXNoKHtcbiAgICAgIGNsYXNzTmFtZTogJzx1bmtub3duPicsXG4gICAgICBjbGFzc0lkOiAnJyxcbiAgICAgIGRldGVjdGVkOiBmYWxzZSxcbiAgICAgIHJlZ2lzdGVyZWQ6IGZhbHNlLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBmYWxzZSxcbiAgICAgIGlzc3VlczogW1xuICAgICAgICBgU291cmNlIGNvZGUgY29udGFpbnMgV09SS0ZMT1dfU0VSSUFMSVpFL1dPUktGTE9XX0RFU0VSSUFMSVpFIHBhdHRlcm5zIGJ1dCBgICtcbiAgICAgICAgICBgdGhlIFNXQyBwbHVnaW4gZGlkIG5vdCBkZXRlY3QgYW55IHNlcmRlLWVuYWJsZWQgY2xhc3Nlcy4gYCArXG4gICAgICAgICAgYEVuc3VyZSB0aGUgc3ltYm9scyBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBJTlNJREUgdGhlIGNsYXNzIGJvZHksIGAgK1xuICAgICAgICAgIGBub3QgYXNzaWduZWQgZXh0ZXJuYWxseSAoZS5nLiwgKE15Q2xhc3MgYXMgYW55KVtXT1JLRkxPV19TRVJJQUxJWkVdID0gLi4uKS5gLFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xhc3NlcyxcbiAgICBnbG9iYWxOb2RlSW1wb3J0cyxcbiAgICBoYXNTZXJkZUNsYXNzZXMsXG4gICAgbWFuaWZlc3QsXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdCBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBuYW1lcyBmcm9tIHRyYW5zZm9ybWVkIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3ROb2RlSW1wb3J0cyhjb2RlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgLy8gUmVzZXQgcmVnZXggc3RhdGVcbiAgbm9kZUltcG9ydEV4dHJhY3RSZWdleC5sYXN0SW5kZXggPSAwO1xuICBmb3IgKFxuICAgIGxldCBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKTtcbiAgICBtYXRjaCAhPT0gbnVsbDtcbiAgICBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKVxuICApIHtcbiAgICAvLyBtYXRjaFsxXSBpcyBmcm9tIHRoZSBFU00gcGF0dGVybiwgbWF0Y2hbMl0gaXMgZnJvbSB0aGUgQ0pTIHBhdHRlcm5cbiAgICBjb25zdCBtb2R1bGVOYW1lID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl07XG4gICAgaWYgKG1vZHVsZU5hbWUpIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBiYXNlIG1vZHVsZSBuYW1lIChlLmcuLCAnZnMvcHJvbWlzZXMnIC0+ICdmcycpXG4gICAgICBpbXBvcnRzLmFkZChtb2R1bGVOYW1lLnNwbGl0KCcvJylbMF0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLmltcG9ydHNdLnNvcnQoKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IGNsYXNzIGVudHJpZXMgZnJvbSBhIFdvcmtmbG93TWFuaWZlc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2xhc3NFbnRyaWVzKFxuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdFxuKTogQXJyYXk8eyBjbGFzc05hbWU6IHN0cmluZzsgY2xhc3NJZDogc3RyaW5nOyBmaWxlTmFtZTogc3RyaW5nIH0+IHtcbiAgY29uc3QgZW50cmllczogQXJyYXk8e1xuICAgIGNsYXNzTmFtZTogc3RyaW5nO1xuICAgIGNsYXNzSWQ6IHN0cmluZztcbiAgICBmaWxlTmFtZTogc3RyaW5nO1xuICB9PiA9IFtdO1xuICBpZiAoIW1hbmlmZXN0LmNsYXNzZXMpIHJldHVybiBlbnRyaWVzO1xuXG4gIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjbGFzc2VzXSBvZiBPYmplY3QuZW50cmllcyhtYW5pZmVzdC5jbGFzc2VzKSkge1xuICAgIGZvciAoY29uc3QgW2NsYXNzTmFtZSwgeyBjbGFzc0lkIH1dIG9mIE9iamVjdC5lbnRyaWVzKGNsYXNzZXMpKSB7XG4gICAgICBlbnRyaWVzLnB1c2goeyBjbGFzc05hbWUsIGNsYXNzSWQsIGZpbGVOYW1lIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZW50cmllcztcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUEsc0NBQUFBLFNBQUE7QUFFSSxRQUFJLElBQUk7QUFDWixRQUFJLElBQUksSUFBSTtBQUNaLFFBQUksSUFBSSxJQUFJO0FBQ1osUUFBSSxJQUFJLElBQUk7QUFDWixRQUFJLElBQUksSUFBSTtBQUNaLFFBQUksSUFBSSxJQUFJO0FBYVIsSUFBQUEsUUFBTyxVQUFVLFNBQVMsS0FBSyxTQUFTO0FBQ3hDLGdCQUFVLFdBQVcsQ0FBQztBQUN0QixVQUFJLE9BQU8sT0FBTztBQUNsQixVQUFJLFNBQVMsWUFBWSxJQUFJLFNBQVMsR0FBRztBQUNyQyxlQUFPLE1BQU0sR0FBRztBQUFBLE1BQ3BCLFdBQVcsU0FBUyxZQUFZLFNBQVMsR0FBRyxHQUFHO0FBQzNDLGVBQU8sUUFBUSxPQUFPLFFBQVEsR0FBRyxJQUFJLFNBQVMsR0FBRztBQUFBLE1BQ3JEO0FBQ0EsWUFBTSxJQUFJLE1BQU0sMERBQTBELEtBQUssVUFBVSxHQUFHLENBQUM7QUFBQSxJQUNqRztBQU9JLGFBQVMsTUFBTSxLQUFLO0FBQ3BCLFlBQU0sT0FBTyxHQUFHO0FBQ2hCLFVBQUksSUFBSSxTQUFTLEtBQUs7QUFDbEI7QUFBQSxNQUNKO0FBQ0EsVUFBSSxRQUFRLG1JQUFtSSxLQUFLLEdBQUc7QUFDdkosVUFBSSxDQUFDLE9BQU87QUFDUjtBQUFBLE1BQ0o7QUFDQSxVQUFJLElBQUksV0FBVyxNQUFNLENBQUMsQ0FBQztBQUMzQixVQUFJLFFBQVEsTUFBTSxDQUFDLEtBQUssTUFBTSxZQUFZO0FBQzFDLGNBQU8sTUFBSztBQUFBLFFBQ1IsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLElBQUk7QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTyxJQUFJO0FBQUEsUUFDZixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU8sSUFBSTtBQUFBLFFBQ2YsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLElBQUk7QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTyxJQUFJO0FBQUEsUUFDZixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU8sSUFBSTtBQUFBLFFBQ2YsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPO0FBQUEsUUFDWDtBQUNJLGlCQUFPO0FBQUEsTUFDZjtBQUFBLElBQ0o7QUFyRGE7QUE0RFQsYUFBUyxTQUFTQyxLQUFJO0FBQ3RCLFVBQUksUUFBUSxLQUFLLElBQUlBLEdBQUU7QUFDdkIsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPLEtBQUssTUFBTUEsTUFBSyxDQUFDLElBQUk7QUFBQSxNQUNoQztBQUNBLFVBQUksU0FBUyxHQUFHO0FBQ1osZUFBTyxLQUFLLE1BQU1BLE1BQUssQ0FBQyxJQUFJO0FBQUEsTUFDaEM7QUFDQSxVQUFJLFNBQVMsR0FBRztBQUNaLGVBQU8sS0FBSyxNQUFNQSxNQUFLLENBQUMsSUFBSTtBQUFBLE1BQ2hDO0FBQ0EsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPLEtBQUssTUFBTUEsTUFBSyxDQUFDLElBQUk7QUFBQSxNQUNoQztBQUNBLGFBQU9BLE1BQUs7QUFBQSxJQUNoQjtBQWZhO0FBc0JULGFBQVMsUUFBUUEsS0FBSTtBQUNyQixVQUFJLFFBQVEsS0FBSyxJQUFJQSxHQUFFO0FBQ3ZCLFVBQUksU0FBUyxHQUFHO0FBQ1osZUFBTyxPQUFPQSxLQUFJLE9BQU8sR0FBRyxLQUFLO0FBQUEsTUFDckM7QUFDQSxVQUFJLFNBQVMsR0FBRztBQUNaLGVBQU8sT0FBT0EsS0FBSSxPQUFPLEdBQUcsTUFBTTtBQUFBLE1BQ3RDO0FBQ0EsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPLE9BQU9BLEtBQUksT0FBTyxHQUFHLFFBQVE7QUFBQSxNQUN4QztBQUNBLFVBQUksU0FBUyxHQUFHO0FBQ1osZUFBTyxPQUFPQSxLQUFJLE9BQU8sR0FBRyxRQUFRO0FBQUEsTUFDeEM7QUFDQSxhQUFPQSxNQUFLO0FBQUEsSUFDaEI7QUFmYTtBQWtCVCxhQUFTLE9BQU9BLEtBQUksT0FBTyxHQUFHLE1BQU07QUFDcEMsVUFBSSxXQUFXLFNBQVMsSUFBSTtBQUM1QixhQUFPLEtBQUssTUFBTUEsTUFBSyxDQUFDLElBQUksTUFBTSxRQUFRLFdBQVcsTUFBTTtBQUFBLElBQy9EO0FBSGE7QUFBQTtBQUFBOzs7QUN2SWIsZ0JBQWU7QUFhWixTQUFBLG9CQUFBLE9BQUE7QUFDSCxNQUFNLE9BQUEsVUFBVSxVQUFtQjtBQUM3QixVQUFBLGlCQUFpQixVQUFBQyxTQUFBLEtBQVU7QUFDN0IsUUFBQSxPQUFNLGVBQWdCLFlBQU8sYUFBQSxHQUFBO0FBQ3pCLFlBQUEsSUFBTyxNQUFBLHNCQUEyQixLQUFBLGlFQUFpQjs7QUFJdkQsV0FBQyxJQUFBLEtBQUEsS0FBQSxJQUFBLElBQUEsVUFBQTthQUNNLE9BQUksVUFBYSxVQUFLO0FBQzlCLFFBQUEsUUFBQSxLQUFBLENBQUEsT0FBQSxTQUFBLEtBQUEsR0FBQTtBQUFNLFlBQUksSUFBTyxNQUFLLHFCQUFnQixLQUFBLDBEQUFBO0lBQ3JDO1dBQ0UsSUFBTSxLQUFJLEtBQ1IsSUFBQSxJQUFBLEtBQUE7YUFFSCxpQkFBQSxRQUFBLFNBQUEsT0FBQSxVQUFBLFlBQUEsT0FBQSxNQUFBLFlBQUEsWUFBQTtBQUVGLFdBQUEsaUJBQUEsT0FBQSxRQUFBLElBQUEsS0FBQSxNQUFBLFFBQUEsQ0FBQTtTQUFNO0FBRUwsVUFBTSxJQUFBLE1BQUEsZ0dBQUE7OztBQW5CUDs7O0FDVkgsSUFBTSxXQUFXO0FBT2QsU0FBQSxRQUFBLE9BQUE7QUFDSCxTQUFTLE9BQVEsVUFBYyxZQUFBLFVBQUEsUUFBQSxVQUFBLFNBQUEsYUFBQTs7QUFENUI7QUFRRixJQUFBLGNBQUE7RUFFRCw0QkFBQTs7O0VBR0csb0NBQUE7RUFDSCwyQkFBMkI7RUFDekIsNEJBQTRCO0VBQzVCLCtCQUErQjtFQUMvQixlQUFBO0VBQ0EscUJBQUE7RUFDQSxtQkFBQTtFQUNBLHFCQUFBO0VBQ0EseUJBQUE7RUFDQSwyQkFBZTs7O0VBakNqQjs7Ozs7Ozs7O01Ba0VHLE9BQUEsU0FBQTtJQUNHLENBQUE7QUFDSyxTQUFnQixRQUFBLFNBQUE7QUFFekIsUUFBQSxTQUFZLGlCQUErQyxPQUFBO0FBQ3pELFdBQU0sUUFBVSxHQUFBLEtBQVMsS0FBSTthQUFBLFFBQUEsTUFBQSxLQUFBOzs7U0FHN0IsR0FBTSxPQUFPO0FBQ2IsV0FBSyxRQUFRLEtBQU8sS0FBRSxNQUFNLFNBQUE7OztBQWtWNUIsSUFBUyxvQkFBVCxjQUFZLGNBQTJCO0VBN1ozQyxPQTZaMkM7Ozs7Ozs7RUFNekMsWUFBQyxPQUFBLGtCQUFBO0FBQ0YsVUFBQSxlQUFBLEtBQUEsMENBQUEsbUJBQUEsVUFBQSxnQkFBQSxPQUFBLEVBQUEsSUFBQTtNQUVELE1BQUEsWUFBQTs7Ozs7O0lBTUc7RUFDSDtFQUNFLE9BQWMsR0FBQSxPQUFBO0FBQ2QsV0FBQSxRQUFBLEtBQUEsS0FBQSxNQUFBLFNBQUE7RUFDQTs7QUFxT0ksSUFBTyxhQUFQLGNBQTRCLE1BQVE7RUFycEIxQyxPQXFwQjBDOzs7RUFDL0IsUUFBQTtFQUNBLFlBQUEsU0FBeUI7QUFFbEMsVUFBQSxPQUFZO0FBQ1YsU0FBSyxPQUNIOztTQUdGLEdBQUssT0FBTztBQUNaLFdBQUssUUFBQSxLQUFjLEtBQUcsTUFBQSxTQUFlOzs7QUFPeEMsSUFBQSxpQkFBQSxjQUFBLE1BQUE7RUF0cUJELE9Bc3FCQzs7Ozs7Ozs7QUFNRSxVQUFBLE9BQUE7QUFDRyxTQUFPLE9BQUE7QUFDWCxRQUFRLFFBQUssZUFBQSxRQUFBO0FBRWIsV0FBWSxhQUFlLG9CQUFBLFFBQUEsVUFBQTtJQUN6QixPQUFNO0FBRVAsV0FBQSxhQUFBLElBQUEsS0FBQSxLQUFBLElBQUEsSUFBQSxHQUFBO0lBRUQ7O0VBRUEsT0FBQyxHQUFBLE9BQUE7QUFDRixXQUFBLFFBQUEsS0FBQSxLQUFBLE1BQUEsU0FBQTtFQVdEOztJQXdCRyxrQkFBQSx1QkFBQSxJQUFBLDhCQUFBO0lBQ0Ysc0JBQUEsdUJBQUEsSUFBQSxrQ0FBQTtBQUVELElBQU0sMEJBQU8sdUJBQXdCLElBQ25DLHFDQUFBO0FBRUYsSUFBQSxPQUFTLGVBQW9DLGFBQU07QUFFbkQsTUFBQSxDQUFBLE9BQUEsT0FBQSxZQUFBLGVBQUEsR0FBQTtBQUNBLFdBQUEsZUFBQSxZQUFpQyxpQkFBQTtNQUNqQyxPQUFBO01BQ0UsVUFBQTtNQUNGLFlBQUE7TUFDQSxjQUFBO0lBQ0EsQ0FBQTtFQUNBO0FBQ0EsTUFBQSxDQUFBLE9BQUEsT0FBQSxZQUFBLG1CQUEyQyxHQUFBO0FBQ3pDLFdBQUEsZUFBQSxZQUFBLHFCQUFBO01BQ0YsT0FBQTtNQUNBLFVBQUE7TUFDQSxZQUFBO01BQ0EsY0FBQTtJQUNBLENBQUE7RUFDRTtBQUNGLE1BQUEsQ0FBQSxPQUFBLE9BQUEsWUFBQSx1QkFBQSxHQUFBO0FBQ0EsV0FBQSxlQUFBLFlBQUEseUJBQTJEO01BQ3JELE9BQUE7TUFDQSxVQUFBO01BQ0EsWUFBQTtNQUlLLGNBQWU7SUFDcEIsQ0FBQzs7Ozs7QUMxdkJBLElBQU0saUJBQWlCLHVCQUFPLElBQUksZ0JBQWdCO0FBRWxELElBQU0seUJBQXlCLHVCQUFPLElBQUksd0JBQXdCO0FBRWxFLElBQU0scUJBQXFCLHVCQUFPLElBQUksc0JBQXNCOzs7QUMrQm5FLGVBQXNCLE1BQU0sT0FBa0M7QUFFNUQsUUFBTSxVQUFXLFdBQW1CLGNBQWM7QUFDbEQsTUFBSSxDQUFDLFNBQVM7QUFDWixVQUFNLElBQUksTUFBTSx5REFBeUQ7RUFDM0U7QUFDQSxTQUFPLFFBQVEsS0FBSztBQUN0QjtBQVBzQjs7O0FDbENoQixTQUFVLFlBQ2QsVUFBeUMsQ0FBQSxHQUFFO0FBRTNDLFFBQU0sRUFBRSxVQUFTLElBQUs7QUFDdEIsUUFBTSxPQUFRLFdBQW1CLHNCQUFzQixFQUFFLFNBQVM7QUFDbEUsU0FBTyxPQUFPLE9BQU8sV0FBVyxlQUFlLFdBQVc7SUFDeEQsQ0FBQyxrQkFBa0IsR0FBRztNQUNwQixPQUFPO01BQ1AsVUFBVTs7R0FFYjtBQUNIO0FBWGdCOzs7QUNTYixJQUFBLFFBQUEsV0FBQSx1QkFBQSxJQUFBLG1CQUFBLENBQUEsRUFBQSw2QkFBQTs7O0FDS1EsSUFBSSxtQkFBbUIsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsMkRBQTJEO0FBQ2hFLElBQUksb0JBQW9CLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLDREQUE0RDtBQUMvSCxJQUFJLG9CQUFvQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSw0REFBNEQ7QUFZL0wsSUFBSSx5QkFBeUIsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsaUVBQWlFO0FBSTFJLElBQUksbUJBQW1CLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLDJEQUEyRDtBQUk5SCxJQUFJLG9CQUFvQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSw0REFBNEQ7QUFLaEksSUFBSSwwQkFBMEIsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsa0VBQWtFO0FBTzVJLElBQUksdUJBQXVCLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLCtEQUErRDtBQUM5RCxJQUFJLG1CQUFtQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSwyREFBMkQ7QUFNdE0sSUFBSSxxQkFBcUIsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsNkRBQTZEO0FBQ3BFLElBQUksMkJBQTJCLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLG1FQUFtRTtBQUk1TSxJQUFJLDZCQUE2QixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSxxRUFBcUU7QUFJbEosSUFBSSwrQkFBK0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsdUVBQXVFO0FBSXRKLElBQUksd0JBQXdCLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLGdFQUFnRTs7O0FDeERuSixlQUFzQixxQkFBcUIsT0FBTztBQUM5QyxRQUFNLFdBQVcsWUFBWTtBQUM3QixRQUFNLFFBQVEsTUFBTSxTQUFTO0FBQzdCLFFBQU0sUUFBUSxNQUFNO0FBQ3BCLFFBQU0sVUFBVTtBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sU0FBUyxrQ0FBNkIsTUFBTSxNQUFNLE1BQU0sbUJBQW1CLEtBQUs7QUFBQSxJQUNoRixLQUFLO0FBQUEsRUFDVDtBQUNBLFFBQU0saUJBQWlCLFVBQVUsT0FBTztBQUV4QyxRQUFNLFVBQVUsTUFBTSxpQkFBaUIsTUFBTSxLQUFLO0FBQ2xELFFBQU0saUJBQWlCLFVBQVU7QUFBQSxJQUM3QixNQUFNO0FBQUEsSUFDTixTQUFTLFVBQVUsUUFBUSxNQUFNO0FBQUEsSUFDakMsS0FBSztBQUFBLEVBQ1QsQ0FBQztBQUVELFFBQU0sU0FBUyxNQUFNLGtCQUFrQixPQUFPO0FBQzlDLFFBQU0saUJBQWlCLFVBQVU7QUFBQSxJQUM3QixNQUFNO0FBQUEsSUFDTixTQUFTLGFBQWEsT0FBTyxNQUFNLG9CQUFvQixRQUFRLE1BQU07QUFBQSxJQUNyRSxLQUFLO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDSixRQUFRLE9BQU87QUFBQSxNQUNmLFVBQVUsT0FBTyxJQUFJLENBQUMsTUFBSSxFQUFFLE9BQU87QUFBQSxJQUN2QztBQUFBLEVBQ0osQ0FBQztBQUVELFFBQU0sUUFBUSxNQUFNLGtCQUFrQixNQUFNO0FBQzVDLFFBQU0saUJBQWlCLFVBQVU7QUFBQSxJQUM3QixNQUFNO0FBQUEsSUFDTixTQUFTLFlBQVksTUFBTSxPQUFPLE1BQU0sb0JBQWUsTUFBTSxTQUFTLFNBQVMsVUFBZSxLQUFLLE1BQU0sTUFBTSxTQUFTLHNCQUFzQixHQUFHLENBQUMsdUJBQTRCLE1BQU0sU0FBUyxpQkFBaUIsU0FBUyxZQUFpQixNQUFNLFNBQVMsZUFBZSxTQUFTO0FBQUEsSUFDL1EsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ0osV0FBVyxNQUFNLFNBQVM7QUFBQSxNQUMxQixxQkFBcUIsTUFBTSxTQUFTO0FBQUEsTUFDcEMsZUFBZSxNQUFNLFNBQVM7QUFBQSxNQUM5QixhQUFhLE1BQU0sU0FBUztBQUFBLElBQ2hDO0FBQUEsRUFDSixDQUFDO0FBRUQsUUFBTSxnQkFBZ0IsTUFBTSx1QkFBdUIsUUFBUSxPQUFPLE9BQU8sTUFBTSxZQUFZO0FBQzNGLFFBQU0saUJBQWlCLFVBQVU7QUFBQSxJQUM3QixNQUFNO0FBQUEsSUFDTixTQUFTLGdCQUFnQixjQUFjLGNBQWMsT0FBTyxNQUFNLG9CQUFvQixjQUFjLGNBQWMsWUFBWSxNQUFNLDJCQUFnQyxjQUFjLGNBQWMsVUFBVSxNQUFNLE1BQU0sTUFBTSxLQUFLO0FBQUEsSUFDak8sS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ0osUUFBUSxjQUFjLGNBQWMsT0FBTztBQUFBLE1BQzNDLGFBQWEsY0FBYyxjQUFjLFlBQVk7QUFBQSxNQUNyRCxVQUFVLGNBQWMsY0FBYyxVQUFVLE1BQU07QUFBQSxJQUMxRDtBQUFBLEVBQ0osQ0FBQztBQUVELFFBQU0sY0FBYyxNQUFNLG1CQUFtQixjQUFjLGFBQWE7QUFDeEUsUUFBTSxpQkFBaUIsVUFBVTtBQUFBLElBQzdCLE1BQU07QUFBQSxJQUNOLFNBQVMsY0FBYyxjQUFjLGNBQWMsWUFBWSxNQUFNO0FBQUEsSUFDckUsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ0osa0JBQWtCLGNBQWMsY0FBYyxZQUFZO0FBQUEsSUFDOUQ7QUFBQSxFQUNKLENBQUM7QUFFRCxRQUFNLG1CQUFtQixNQUFNLHdCQUF3QixjQUFjLGVBQWUsS0FBSztBQUV6RixRQUFNLGVBQWUsTUFBTSxxQkFBcUIsY0FBYyxlQUFlLE9BQU8sTUFBTSxVQUFVO0FBRXBHLFFBQU0sa0JBQWtCLE1BQU0seUJBQXlCLGNBQWMsYUFBYTtBQUVsRixRQUFNLGdCQUFnQixNQUFNLGlCQUFpQixjQUFjLGVBQWUsT0FBTyxLQUFLO0FBRXRGLFFBQU0sU0FBUyxNQUFNLGdCQUFnQixRQUFRLElBQUk7QUFDakQsTUFBSSxVQUFVO0FBQ2QsTUFBSSxVQUFVO0FBQ2QsTUFBSSxpQkFBaUI7QUFDckIsTUFBSSxVQUFVLENBQUMsTUFBTSx1QkFBdUI7QUFDeEMsVUFBTSxpQkFBaUIsVUFBVTtBQUFBLE1BQzdCLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULEtBQUs7QUFBQSxJQUNULENBQUM7QUFDRCxjQUFVLE1BQU0sMkJBQTJCLGNBQWMsZUFBZSxRQUFRLE9BQU8sS0FBSztBQUM1RixVQUFNLE1BQU0sSUFBSTtBQUNoQixjQUFVLE1BQU0sNkJBQTZCLGNBQWMsZUFBZSxRQUFRLE9BQU8sS0FBSztBQUM5RixVQUFNLE1BQU0sSUFBSTtBQUNoQixxQkFBaUIsTUFBTSxzQkFBc0IsY0FBYyxlQUFlLFFBQVEsT0FBTyxLQUFLO0FBQUEsRUFDbEc7QUFDQSxRQUFNLG1CQUFtQixVQUFVLEtBQUssV0FBVztBQUNuRCxRQUFNLGlCQUFpQixVQUFVO0FBQUEsSUFDN0IsTUFBTTtBQUFBLElBQ04sU0FBUyxtQ0FBOEIsZ0JBQWdCLGlCQUFpQixhQUFhLE1BQU0saUJBQXNCLGFBQWEsaUNBQWlDLGdCQUFnQixlQUFvQixZQUFZLFdBQVcsV0FBVyxZQUFZLEtBQUs7QUFBQSxJQUN0UCxLQUFLO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDSjtBQUFBLE1BQ0EsY0FBYyxhQUFhO0FBQUEsTUFDM0I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0EsVUFBVSxZQUFZO0FBQUEsTUFDdEIsZUFBZSxZQUFZO0FBQUEsSUFDL0I7QUFBQSxFQUNKLENBQUM7QUFDRCxRQUFNLGtCQUFrQixRQUFRO0FBQ2hDLFNBQU87QUFBQSxJQUNILE9BQU87QUFBQSxJQUNQLFNBQVMsYUFBYSxPQUFPLE1BQU0sa0JBQWtCLFFBQVEsTUFBTSwrQkFBb0MsS0FBSyxlQUFvQixnQkFBZ0Isa0JBQWtCLGFBQWEsTUFBTSxvQ0FBeUMsZ0JBQWdCLGNBQW1CLFlBQVksV0FBVztBQUFBLElBQ3hSLFlBQVksT0FBTztBQUFBLElBQ25CO0FBQUEsSUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDLEVBQUUsU0FBUyxLQUFLLE9BQUs7QUFBQSxNQUNqQztBQUFBLE1BQ0E7QUFBQSxJQUNKLEVBQUU7QUFBQSxJQUNOLGVBQWUsY0FBYztBQUFBLElBQzdCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFDSjtBQTlIc0I7QUErSHRCLHFCQUFxQixhQUFhO0FBQ2xDLFdBQVcsb0JBQW9CLElBQUkscUVBQXFFLG9CQUFvQjs7O0FDL0k1SDtBQUFBLEVBQ0M7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRDs7O0FDN0dBLElBQU9DLDJCQUFROzs7QUNnQmYsSUFBQSxlQUFBQyx5QkFBQSxLQUFBLEdBQUE7QUFHQSxJQUFBLHlCQUFBLElBQUEsT0FBQSxnQ0FBd0UsWUFBQSwwREFBQSxZQUFBLDhCQUFBLEdBQUE7IiwKICAibmFtZXMiOiBbIm1vZHVsZSIsICJtcyIsICJtcyIsICJidWlsdGluX21vZHVsZXNfZGVmYXVsdCIsICJidWlsdGluX21vZHVsZXNfZGVmYXVsdCJdCn0K
`;

export const POST = workflowEntrypoint(workflowCode);
export const GET = POST;
export const HEAD = POST;
export const OPTIONS = POST;