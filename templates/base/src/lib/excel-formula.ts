/**
 * Excel formula support for the Sheet Viewer.
 *
 * The workbook stores formulas (e.g. "=SUM(E10:E11)", "=IF(D6=0,\"\",(F6-D6)/D6)",
 * "=PL!D7") with Excel's cached calculated values. This module:
 *  - evaluates a formula against the workbook (best-effort) so the DataGrid can
 *    show the calculated result immediately after the user amends the formula,
 *  - marks formulas we cannot evaluate (exotic functions, etc.) as
 *    unevaluable — the formula is still stored in the workbook and Excel
 *    recalculates it on open.
 *
 * Supported: arithmetic (+ - * / ^ %), parens, cell refs (A1, $A$1),
 * cross-sheet refs (Sheet!A1, 'Sheet Name'!A1), ranges (A1:B5) and the
 * functions SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, PRODUCT, ABS, INT, SQRT,
 * ROUND, ROUNDUP, ROUNDDOWN, MOD, POWER, IF, SUBTOTAL (code 9/109 only),
 * AND, OR, TRIM, PROPER, CHOOSE, DATE, WEEKDAY, COLUMN, SUMIF, VLOOKUP,
 * MATCH, INDEX, TEXT, IFERROR.
 */

import { utils } from 'xlsx';
import type { WorkBook, WorkSheet } from 'xlsx';

export interface FormulaEvalResult {
  /** Calculated value (number or string) when evaluable. */
  value?: unknown;
  /** True when the formula cannot be computed locally. */
  unevaluable: boolean;
}

const MAX_DEPTH = 12;
const MAX_RANGE_CELLS = 100_000;

interface Token {
  type: 'num' | 'str' | 'bool' | 'sheet' | 'ref' | 'ident' | 'op';
  value: string;
}

interface RangeValue {
  __range: true;
  values: unknown[];
  /** Number of columns in the rectangular range (row-major values layout). */
  width: number;
}

function isRange(v: unknown): v is RangeValue {
  return typeof v === 'object' && v !== null && '__range' in (v as RangeValue);
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let prevToken: Token | undefined;
  while (i < src.length) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t' || ch === '\n') { i++; continue; }
    if (/[\d.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[\d.]/.test(src[j])) j++;
      tokens.push({ type: 'num', value: src.slice(i, j) });
      i = j; prevToken = tokens[tokens.length - 1]; continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j++;
      tokens.push({ type: 'str', value: src.slice(i + 1, j) });
      i = j + 1; prevToken = tokens[tokens.length - 1]; continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== "'") j++;
      const sheetName = src.slice(i + 1, j);
      i = j + 1;
      if (src[i] === '!') { tokens.push({ type: 'sheet', value: sheetName }); i++; prevToken = tokens[tokens.length - 1]; continue; }
      throw new Error('bad quoted token');
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_$.]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (src[j] === '!') { tokens.push({ type: 'sheet', value: word }); i = j + 1; prevToken = tokens[tokens.length - 1]; continue; }
      if (/^\$?[A-Za-z]{1,3}\$?\d+$/.test(word)) tokens.push({ type: 'ref', value: word });
      else if (/^\$?[A-Za-z]{1,3}$/.test(word) && (src[j] === ':' || (prevToken?.type === 'op' && prevToken.value === ':'))) {
        // Whole-column ref (A:A, $C:$AG) — only meaningful inside a range
        tokens.push({ type: 'ref', value: word });
      }
      else if (word === 'TRUE') tokens.push({ type: 'bool', value: 'TRUE' });
      else if (word === 'FALSE') tokens.push({ type: 'bool', value: 'FALSE' });
      else tokens.push({ type: 'ident', value: word.toUpperCase() });
      i = j; prevToken = tokens[tokens.length - 1]; continue;
    }
    const two = src.slice(i, i + 2);
    if (two === '<=' || two === '>=' || two === '<>') { tokens.push({ type: 'op', value: two }); i += 2; prevToken = tokens[tokens.length - 1]; continue; }
    if ('+-*/^=<>(),%:'.includes(ch)) { tokens.push({ type: 'op', value: ch }); i++; prevToken = tokens[tokens.length - 1]; continue; }
    throw new Error('unexpected char: ' + ch);
  }
  return tokens;
}

function toNum(v: unknown): number {
  if (v === undefined || v === null) return 0; // Excel: empty cell in numeric context = 0
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const n = Number(v.trim());
    if (isFinite(n)) return n;
  }
  throw new Error('not numeric');
}

function truthy(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.trim() !== '';
  if (isRange(v)) return v.values.some((x) => truthy(x));
  return false;
}

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(
    private wb: WorkBook,
    private ws: WorkSheet,
    src: string,
    private depth = 0,
    private currentCellAddr?: string,
  ) {
    this.tokens = tokenize(src);
  }

  parseExpr(): unknown { return this.parseComparison(); }

  /** True when the full token stream has been consumed. */
  finished(): boolean { return this.pos >= this.tokens.length; }

  private peek(): Token | undefined { return this.tokens[this.pos]; }

  private next(): Token | undefined { return this.tokens[this.pos++]; }

  private expectOp(op: string): void {
    const t = this.next();
    if (!t || t.type !== 'op' || t.value !== op) throw new Error('expected ' + op);
  }

  private parseComparison(): unknown {
    let left = this.parseAdditive();
    while (this.peek() && this.peek()!.type === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(this.peek()!.value)) {
      const op = this.next()!.value;
      const right = this.parseAdditive();
      left = compare(op, left, right);
    }
    return left;
  }

  private parseAdditive(): unknown {
    let left = this.parseMultiplicative();
    while (this.peek() && this.peek()!.type === 'op' && (this.peek()!.value === '+' || this.peek()!.value === '-')) {
      const op = this.next()!.value;
      const right = this.parseMultiplicative();
      left = arith(op, left, right);
    }
    return left;
  }

  private parseMultiplicative(): unknown {
    let left = this.parseUnary();
    while (this.peek() && this.peek()!.type === 'op' && (this.peek()!.value === '*' || this.peek()!.value === '/')) {
      const op = this.next()!.value;
      const right = this.parseUnary();
      left = arith(op, left, right);
    }
    return left;
  }

  private parseUnary(): unknown {
    const t = this.peek();
    if (t && t.type === 'op' && (t.value === '-' || t.value === '+')) {
      this.next();
      const v = this.parseUnary();
      return t.value === '-' ? -toNum(v) : toNum(v);
    }
    return this.parsePostfix();
  }

  private parsePostfix(): unknown {
    let v = this.parseAtom();
    while (this.peek() && this.peek()!.type === 'op' && this.peek()!.value === '%') {
      this.next();
      v = toNum(v) / 100;
    }
    return v;
  }

  private parseAtom(): unknown {
    const t = this.next();
    if (!t) throw new Error('unexpected end of formula');
    if (t.type === 'num') return Number(t.value);
    if (t.type === 'str') return t.value;
    if (t.type === 'bool') return t.value === 'TRUE';
    if (t.type === 'sheet') {
      const ref = this.next();
      if (!ref || ref.type !== 'ref') throw new Error('expected cell ref after sheet');
      const sheetWs = this.getSheet(t.value);
      return this.parseRangeOrValue(sheetWs, ref.value);
    }
    if (t.type === 'ref') return this.parseRangeOrValue(this.ws, t.value);
    if (t.type === 'ident') {
      if (this.peek() && this.peek()!.type === 'op' && this.peek()!.value === '(') {
        return this.callFunction(t.value);
      }
      throw new Error('unknown identifier: ' + t.value);
    }
    if (t.type === 'op' && t.value === '(') {
      const v = this.parseExpr();
      this.expectOp(')');
      return v;
    }
    throw new Error('unexpected token: ' + t.value);
  }

  private parseRangeOrValue(ws: WorkSheet, addr: string): unknown {
    const t = this.peek();
    if (t && t.type === 'op' && t.value === ':') {
      this.next();
      const end = this.next();
      if (!end || end.type !== 'ref') throw new Error('bad range end');
      const cells = this.rangeCells(ws, addr, end.value);
      const c1 = utils.decode_cell(addr.replace(/\$/g, ''));
      const c2 = utils.decode_cell(end.value.replace(/\$/g, ''));
      const width = Math.abs(c2.c - c1.c) + 1;
      return { __range: true, values: cells.map((c) => this.resolveCell(c.ws, c.addr, this.depth)), width } as RangeValue;
    }
    return this.resolveCell(ws, addr, this.depth);
  }

  private getSheet(name: string): WorkSheet {
    const sheet = this.wb.Sheets[name] ?? this.wb.Sheets[this.wb.SheetNames.find((n) => n.toLowerCase() === name.toLowerCase()) ?? ''];
    if (!sheet) throw new Error('sheet not found: ' + name);
    return sheet;
  }

  private rangeCells(ws: WorkSheet, a: string, b: string) {
    const cleanA = a.replace(/\$/g, '');
    const cleanB = b.replace(/\$/g, '');
    const colOnly = (s: string) => /^[A-Za-z]+$/.test(s);
    let r1: number, r2: number, cMin: number, cMax: number;
    if (colOnly(cleanA) || colOnly(cleanB)) {
      // Whole-column range (A:A, $C:$AG): bound rows by the sheet's used range
      const maxRow = ws['!ref'] ? utils.decode_range(ws['!ref']).e.r : 0;
      const colIndex = (s: string) => {
        let c = 0;
        for (const ch of s.toUpperCase()) c = c * 26 + (ch.charCodeAt(0) - 64);
        return c - 1; // 0-based
      };
      const cA = colOnly(cleanA) ? colIndex(cleanA) : utils.decode_cell(cleanA).c;
      const cB = colOnly(cleanB) ? colIndex(cleanB) : utils.decode_cell(cleanB).c;
      cMin = Math.min(cA, cB);
      cMax = Math.max(cA, cB);
      r1 = 0;
      r2 = maxRow;
    } else {
      const c1 = utils.decode_cell(cleanA);
      const c2 = utils.decode_cell(cleanB);
      r1 = Math.min(c1.r, c2.r); r2 = Math.max(c1.r, c2.r);
      cMin = Math.min(c1.c, c2.c); cMax = Math.max(c1.c, c2.c);
    }
    const count = (r2 - r1 + 1) * (cMax - cMin + 1);
    if (count > MAX_RANGE_CELLS) throw new Error('range too large');
    const out: { ws: WorkSheet; addr: string }[] = [];
    for (let r = r1; r <= r2; r++) {
      for (let c = cMin; c <= cMax; c++) {
        out.push({ ws, addr: utils.encode_cell({ r, c }) });
      }
    }
    return out;
  }

  private resolveCell(ws: WorkSheet, addr: string, depth: number): unknown {
    if (depth > MAX_DEPTH) return undefined;
    // Absolute refs ($A$7 / $A7) must be stripped before keying into the sheet
    const clean = addr.replace(/\$/g, '');
    const cell = ws[clean];
    // Excel coerces references to empty/missing cells to 0 in numeric contexts
    // (handled in toNum) and to "" in text contexts (handled in text helpers).
    if (!cell) return undefined;
    if (cell.v !== undefined && cell.v !== null) return cell.v;
    if (typeof cell.f === 'string' && cell.f.trim() !== '') {
      // OOXML stores formulas WITHOUT the leading '='; normalize before evaluating
      const f = cell.f.trim().startsWith('=') ? cell.f.trim() : '=' + cell.f.trim();
      const sub = evaluateFormula(this.wb, ws, f, depth + 1, clean);
      // A referenced cell whose formula fails is a real error in Excel too —
      // propagate it (so IFERROR can catch, and top-level stays unevaluable)
      // instead of silently treating it as an empty cell.
      if (sub.unevaluable) throw new Error('referenced cell formula unevaluable: ' + clean);
      return sub.value;
    }
    return undefined;
  }

  /**
   * Skip tokens of an expression without evaluating (used for lazy IF's
   * untaken branch). Stops before the next top-level ',' or ')'.
   */
  private skipExpr(): void {
    let depth = 0;
    while (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos];
      if (t.type === 'op') {
        if (t.value === '(') depth++;
        else if (t.value === ')') {
          if (depth === 0) return; // stopped before ')'
          depth--;
        } else if (t.value === ',' && depth === 0) return; // stopped before ','
      }
      this.pos++;
    }
  }

  private callFunction(name: string): unknown {
    // IF is lazy in Excel: only the taken branch is evaluated (avoids
    // divide-by-zero etc. on the untaken branch).
    if (name === 'IF') {
      this.expectOp('(');
      const cond = this.parseExpr();
      this.expectOp(',');
      if (truthy(cond)) {
        const v = this.parseExpr();
        // consume optional else branch without evaluating it
        if (this.peek() && this.peek()!.type === 'op' && this.peek()!.value === ',') {
          this.next();
          this.skipExpr();
        }
        this.expectOp(')');
        return v;
      }
      // cond falsy: skip the then-branch, evaluate the else branch
      this.skipExpr();
      if (this.peek() && this.peek()!.type === 'op' && this.peek()!.value === ',') {
        this.next();
        const v = this.parseExpr();
        this.expectOp(')');
        return v;
      }
      this.expectOp(')');
      return false;
    }
    // IFERROR evaluates its first argument in "soft" mode: any error/unevaluable
    // result falls back to the second argument instead of failing the formula.
    if (name === 'IFERROR') {
      this.expectOp('(');
      const startPos = this.pos;
      let first: unknown;
      try {
        first = this.parseExpr();
      } catch {
        first = undefined; // evaluation error -> use fallback
        // On a nested error the cursor is left mid-expression; seek forward
        // from the start of the value argument to its top-level ',' (the
        // fallback separator) or to the closing ')' if there is no fallback.
        let depth = 0;
        this.pos = startPos;
        while (this.pos < this.tokens.length) {
          const t = this.tokens[this.pos];
          if (t.type === 'op') {
            if (t.value === '(') depth++;
            else if (t.value === ')') {
              if (depth === 0) { this.pos++; break; } // no fallback: stop at IFERROR's ')'
              depth--;
            } else if (t.value === ',' && depth === 0) {
              this.pos++; // consume fallback separator
              break;
            }
          }
          this.pos++;
        }
      }
      // Comma-separated fallback argument
      if (this.peek() && this.peek()!.type === 'op' && this.peek()!.value === ',') this.next();
      const fallback = this.parseExpr();
      this.expectOp(')');
      return first === undefined ? fallback : first;
    }
    this.expectOp('(');
    const args: unknown[] = [];
    if (!(this.peek() && this.peek()!.type === 'op' && this.peek()!.value === ')')) {
      args.push(this.parseExpr());
      while (this.peek() && this.peek()!.type === 'op' && this.peek()!.value === ',') {
        this.next();
        args.push(this.parseExpr());
      }
    }
    this.expectOp(')');
    return applyFunction(name, args, this.currentCellAddr);
  }
}

function compare(op: string, a: unknown, b: unknown): boolean {
  if (typeof a === 'string' && typeof b === 'string') {
    switch (op) {
      case '=': return a === b;
      case '<>': return a !== b;
      case '<': return a < b;
      case '>': return a > b;
      case '<=': return a <= b;
      case '>=': return a >= b;
    }
  }
  const x = toNum(a), y = toNum(b);
  switch (op) {
    case '=': return x === y;
    case '<>': return x !== y;
    case '<': return x < y;
    case '>': return x > y;
    case '<=': return x <= y;
    case '>=': return x >= y;
  }
  throw new Error('bad comparison');
}

function arith(op: string, a: unknown, b: unknown): number {
  const x = toNum(a), y = toNum(b);
  switch (op) {
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
    case '/': {
      if (y === 0) throw new Error('divide by zero');
      return x / y;
    }
    case '^': return Math.pow(x, y);
  }
  throw new Error('bad operator');
}

function flatten(args: unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const a of args) {
    if (isRange(a)) out.push(...a.values);
    else out.push(a);
  }
  return out;
}

function numbers(args: unknown[]): number[] {
  const out: number[] = [];
  for (const v of flatten(args)) {
    if (typeof v === 'number') out.push(v);
    else if (typeof v === 'boolean') out.push(v ? 1 : 0);
    else if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v.trim());
      if (isFinite(n)) out.push(n);
    }
  }
  return out;
}

function toNumSafe(v: unknown): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') { const n = Number(v.trim()); return isFinite(n) ? n : undefined; }
  return undefined;
}

/** Collapse whitespace + trim (Excel TRIM). */
function excelTrim(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v ?? '').replace(/\s+/g, ' ').trim();
}

/** Excel PROPER: uppercase first letter of every word, lowercase the rest. */
function excelProper(v: unknown): string {
  if (v === undefined || v === null) return ""; // Excel: empty cell in text context
  return String(v ?? '').toLowerCase().replace(/(^|[^A-Za-z0-9])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase());
}

/** Excel serial date -> { y, m, d } in the 1900 date system (incl. fake 1900-02-29). */
function serialToDate(serial: number): { y: number; m: number; d: number } {
  // Serial 1 = 1900-01-01; serial 60 = fake 1900-02-29; serial >= 61 offset by one day.
  const days = Math.floor(serial) + (serial >= 60 ? -1 : 0);
  // Excel serial 1 = 1900-01-01 = base + 1 day; serial >= 61 loses the fake
  // 1900-02-29 (serial 60), so real elapsed days = serial - 1.
  const ms = days * 86400000;
  const date = new Date(Date.UTC(1899, 11, 31) + ms);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

/** Build an Excel serial date from y/m/d (1900 system, incl. fake 1900-02-29). */
function dateToSerial(y: number, m: number, d: number): number {
  const dt = new Date(Date.UTC(y, m - 1, d));
  const serial = Math.floor((dt.getTime() - Date.UTC(1899, 11, 31)) / 86400000);
  return serial >= 60 ? serial + 1 : serial; // offset for the fake 1900-02-29
}

/** Minimal Excel TEXT formats: numeric (0, 0.00, #,##0, #,##0.00, 0%, 0.0%) and date tokens (yyyy yy mmmm mmm mm m dddd ddd dd d hh h mm m ss s). Throws on unrecognized formats. */
function excelTextFormat(v: unknown, format: string): string {
  if (v === undefined || v === null) return "";
  const fmt = String(format);
  const num = typeof v === 'number' ? v : Number(String(v ?? '').trim());
  const isDateLike = /[yYdDhHmMsS]/.test(fmt.replace(/[^a-zA-Z]/g, '')) && /y|d|h|s/i.test(fmt);
  if (isDateLike && isFinite(num)) {
    const { y, m, d } = serialToDate(num);
    const hours = Math.floor((num % 1) * 24);
    const minutes = Math.floor((((num % 1) * 24) - hours) * 60);
    const seconds = Math.round(((((num % 1) * 24) - hours) * 60 - minutes) * 60);
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const rep: Record<string, string> = {
      'yyyy': String(y), 'yy': String(y).slice(-2),
      'mmmm': monthNames[m - 1], 'mmm': monthNames[m - 1].slice(0, 3), 'mon': String(m).padStart(2, '0'), 'mon1': String(m),
      'dddd': dayNames[wd], 'ddd': dayNames[wd].slice(0, 3), 'dd': String(d).padStart(2, '0'), 'd': String(d),
      'hh': String(hours).padStart(2, '0'), 'h': String(hours),
      'min': String(minutes).padStart(2, '0'), 'min1': String(minutes),
      'ss': String(seconds).padStart(2, '0'), 's': String(seconds),
    };
    // Token-based replace, longest matches first. Excel rule: 'mm'/'m' are
    // MINUTES when the format contains an hour token, otherwise MONTH.
    const hasHour = /h/i.test(fmt);
    return fmt.replace(/yyyy|yy|mmmm|mmm|dddd|ddd|hh|ss|dd|mm|d|m|h|s/gi, (tok) => {
      const key = tok.toLowerCase();
      if (key === 'mm') return hasHour ? rep['min'] : rep['mon'];
      if (key === 'm') return hasHour ? rep['min1'] : rep['mon1'];
      return rep[key] ?? tok;
    });
  }
  if (!isFinite(num)) return String(v ?? '');
  const pct = fmt.includes('%');
  const decimals = (fmt.match(/0+\.(0+)/) ?? [])[1]?.length ?? 0;
  const grouping = fmt.includes(',');
  const value = pct ? num * 100 : num;
  let out = value.toFixed(decimals);
  if (grouping) {
    const [int, dec] = out.split('.');
    out = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? '.' + dec : '');
  }
  return out + (pct ? '%' : '');
}

/** Excel match for VLOOKUP/MATCH: exact (0) or approximate (1/-1). Returns 1-based index or -1. */
function findMatch(lookup: unknown, arr: unknown[], type: number): number {
  if (type === 0) {
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      if (typeof lookup === 'number' && typeof a === 'number' && lookup === a) return i + 1;
      if (typeof lookup === 'string' && typeof a === 'string' && excelTrim(lookup).toLowerCase() === excelTrim(a).toLowerCase()) return i + 1;
      if (String(lookup).toLowerCase() === String(a ?? '').toLowerCase()) return i + 1;
    }
    return -1;
  }
  // Approximate: assume ascending (type 1) -> largest <= lookup; descending (-1) -> smallest >= lookup
  let best = -1;
  if (type === 1) {
    for (let i = 0; i < arr.length; i++) {
      const a = toNumSafe(arr[i]);
      const l = toNumSafe(lookup);
      if (a !== undefined && l !== undefined && a <= l) best = i + 1;
    }
  } else if (type === -1) {
    for (let i = 0; i < arr.length; i++) {
      const a = toNumSafe(arr[i]);
      const l = toNumSafe(lookup);
      if (a !== undefined && l !== undefined && a >= l && (best === -1 || a <= toNumSafe(arr[best - 1])!)) best = i + 1;
    }
  }
  return best;
}

/** Excel SUMIF criteria: number, plain text (wildcards * ? supported), or operator-prefixed ("<5", ">=100", "<>0"). */
function criteriaMatches(value: unknown, criteria: unknown): boolean {
  const v = value ?? '';
  if (typeof criteria === 'number') return typeof v === 'number' ? v === criteria : Number(String(v)) === criteria;
  const crit = excelTrim(criteria);
  if (crit === '') return v === '' || v === null || v === undefined;
  const m = crit.match(/^(<=|>=|<>|<|>|=)?(.*)$/s);
  const op = m?.[1] ?? '=';
  let target = m?.[2] ?? '';
  const numericTarget = toNumSafe(target);
  const numericVal = toNumSafe(v);
  if (op !== '=' && numericTarget !== undefined && numericVal !== undefined) {
    switch (op) {
      case '<': return numericVal < numericTarget;
      case '<=': return numericVal <= numericTarget;
      case '>': return numericVal > numericTarget;
      case '>=': return numericVal >= numericTarget;
      case '<>': return numericVal !== numericTarget;
    }
  }
  // Wildcard matching for equality (Excel * and ?)
  if (target.includes('*') || target.includes('?')) {
    const rx = '^' + target.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
    return new RegExp(rx, 'i').test(String(v ?? ''));
  }
  const s1 = String(v ?? '').trim().toLowerCase();
  const s2 = target.trim().toLowerCase();
  if (op === '<>') return s1 !== s2;
  return s1 === s2;
}

function applyFunction(name: string, args: unknown[], thisCellAddr?: string): unknown {
  const nums = numbers(args);
  const sum = () => nums.reduce((s, v) => s + v, 0);
  switch (name) {
    case 'SUM': return sum();
    case 'AVERAGE': {
      if (!nums.length) throw new Error('AVERAGE of empty');
      return sum() / nums.length;
    }
    case 'MIN': {
      if (!nums.length) throw new Error('MIN of empty');
      return Math.min(...nums);
    }
    case 'MAX': {
      if (!nums.length) throw new Error('MAX of empty');
      return Math.max(...nums);
    }
    case 'COUNT': return nums.length;
    case 'COUNTA': return flatten(args).filter((v) => v !== '' && v !== undefined && v !== null).length;
    case 'PRODUCT': {
      if (!nums.length) throw new Error('PRODUCT of empty');
      return nums.reduce((p, v) => p * v, 1);
    }
    case 'ABS': return Math.abs(toNum(args[0]));
    case 'INT': return Math.trunc(toNum(args[0]));
    case 'SQRT': {
      const v = toNum(args[0]);
      if (v < 0) throw new Error('SQRT of negative');
      return Math.sqrt(v);
    }
    case 'ROUND': {
      const v = toNum(args[0]);
      const d = args.length > 1 ? toNum(args[1]) : 0;
      const f = Math.pow(10, d);
      return Math.round(v * f) / f;
    }
    case 'ROUNDUP': {
      const v = toNum(args[0]);
      const d = args.length > 1 ? toNum(args[1]) : 0;
      const f = Math.pow(10, d);
      return Math.sign(v) * Math.ceil(Math.abs(v) * f) / f;
    }
    case 'ROUNDDOWN': {
      const v = toNum(args[0]);
      const d = args.length > 1 ? toNum(args[1]) : 0;
      const f = Math.pow(10, d);
      return Math.sign(v) * Math.floor(Math.abs(v) * f) / f;
    }
    case 'MOD': {
      const a = toNum(args[0]), b = toNum(args[1]);
      if (b === 0) throw new Error('MOD by zero');
      return a - b * Math.floor(a / b);
    }
    case 'POWER': return Math.pow(toNum(args[0]), toNum(args[1]));
    case 'IF': return truthy(args[0]) ? args[1] : args[2];
    case 'SUBTOTAL': {
      // Code is arg 0 — must NOT be included in the sum (Excel SUBTOTAL(9,rng) == SUM(rng))
      const code = Math.abs(toNum(args[0]));
      if (code === 9 || code === 109) {
        const rangeNums = numbers(args.slice(1));
        return rangeNums.reduce((s, v) => s + v, 0);
      }
      throw new Error('SUBTOTAL code ' + code + ' not supported');
    }
    case 'AND': return flatten(args).every((a) => truthy(a));
    case 'OR': return flatten(args).some((a) => truthy(a));
    case 'TRIM': return excelTrim(args[0]);
    case 'PROPER': return excelProper(args[0]);
    case 'CHOOSE': {
      const idx = Math.floor(toNum(args[0]));
      const candidates = flatten(args.slice(1));
      if (idx < 1 || idx > candidates.length) throw new Error('CHOOSE index out of range');
      return candidates[idx - 1];
    }
    case 'DATE': return dateToSerial(
      Math.floor(toNum(args[0])),
      Math.floor(toNum(args[1])),
      Math.floor(toNum(args[2])),
    );
    case 'WEEKDAY': {
      const serial = toNum(args[0]);
      const type = args.length > 1 ? Math.floor(toNum(args[1])) : 1;
      const { y, m, d } = serialToDate(serial);
      const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sunday
      switch (type) {
        case 1: return jsDay + 1; // 1=Sunday .. 7=Saturday
        case 2: return jsDay === 0 ? 7 : jsDay; // 1=Monday .. 7=Sunday
        case 3: return jsDay; // 0=Monday .. 6=Sunday
        default: throw new Error('WEEKDAY return_type ' + type + ' not supported');
      }
    }
    case 'COLUMN': {
      const ref = args[0];
      if (ref === undefined) {
        if (!thisCellAddr) throw new Error('COLUMN without ref needs cell context');
        const decoded = utils.decode_cell(thisCellAddr);
        return decoded.c + 1; // 1-based
      }
      if (typeof ref === 'string') {
        const m = ref.match(/[A-Za-z]{1,3}/);
        if (!m) throw new Error('bad COLUMN ref');
        const colStr = m[0].toUpperCase();
        let col = 0;
        for (const ch of colStr) col = col * 26 + (ch.charCodeAt(0) - 64);
        return col;
      }
      throw new Error('COLUMN of range not supported');
    }
    case 'SUMIF': {
      const rangeArg = args[0];
      const criteria = args[1];
      const sumArg = args[2] ?? rangeArg;
      if (!isRange(rangeArg) || !isRange(sumArg)) throw new Error('SUMIF needs ranges');
      const values = rangeArg.values;
      const sums = sumArg.values;
      const out: number[] = [];
      for (let i = 0; i < values.length; i++) {
        if (criteriaMatches(values[i], criteria)) out.push(toNumSafe(sums[i] ?? 0) ?? 0);
      }
      return out.reduce((s, v) => s + v, 0);
    }
    case 'VLOOKUP': {
      const lookup = args[0];
      const table = args[1];
      const colIdx = Math.floor(toNum(args[2]));
      const approx = args.length > 3 ? truthy(args[3]) : true;
      if (!isRange(table) || colIdx < 1 || colIdx > table.width) throw new Error('VLOOKUP bad table/col');
      const firstCol: unknown[] = [];
      const rows: unknown[][] = [];
      for (let r = 0; r < Math.floor(table.values.length / table.width); r++) {
        const row = table.values.slice(r * table.width, (r + 1) * table.width);
        rows.push(row);
        firstCol.push(row[0]);
      }
      const hit = approx ? findMatch(lookup, firstCol, 1) : findMatch(lookup, firstCol, 0);
      if (hit === -1) throw new Error('VLOOKUP no match');
      const val = rows[hit - 1][colIdx - 1];
      return val === undefined ? '' : val;
    }
    case 'MATCH': {
      const lookup = args[0];
      const arr = args[1];
      const type = args.length > 2 ? Math.floor(toNum(args[2])) : 1;
      if (!isRange(arr)) throw new Error('MATCH needs a range');
      const hit = findMatch(lookup, arr.values, type);
      if (hit === -1) throw new Error('MATCH no match');
      return hit;
    }
    case 'INDEX': {
      const arr = args[0];
      const rowIdx = Math.floor(toNum(args[1]));
      if (!isRange(arr)) {
        return rowIdx === 1 ? arr : (() => { throw new Error('INDEX out of range'); })();
      }
      if (args.length > 2) {
        const colIdx = Math.floor(toNum(args[2]));
        const pos = (rowIdx - 1) * arr.width + (colIdx - 1);
        if (pos < 0 || pos >= arr.values.length) throw new Error('INDEX out of range');
        return arr.values[pos] ?? 0; // Excel coerces empty cells to 0
      }
      const pos = rowIdx - 1;
      if (pos < 0 || pos >= arr.values.length) throw new Error('INDEX out of range');
      return arr.values[pos] ?? 0; // Excel coerces empty cells to 0
    }
    case 'TEXT': {
      const fmt = String(args[1] ?? '');
      if (isRange(args[0])) {
        // Array context: apply TEXT element-wise (e.g. building a lookup array
        // for MATCH against a formatted header row).
        return {
          __range: true,
          values: args[0].values.map((v) => excelTextFormat(v, fmt)),
          width: args[0].width,
        } as RangeValue;
      }
      return excelTextFormat(args[0], fmt);
    }
    default:
      throw new Error('unsupported function: ' + name);
  }
}

/** A raw cell/range reference found inside a formula string. */
export interface FormulaRefToken {
  /** Target sheet (undefined = same sheet as the formula). */
  sheet?: string;
  /** Start cell address, "$" stripped (e.g. "V46"). */
  addr: string;
  /** Range end cell address when the reference is a range (e.g. "V54"). */
  end?: string;
}

/**
 * Regex fallback for formulas the tokenizer cannot parse (exotic chars).
 * Handles: A1, $A$1, A1:B5, A:A, Sheet!D7, 'Sheet 1'!D7.
 */
function regexRefs(src: string): FormulaRefToken[] {
  const out: FormulaRefToken[] = [];
  const re = /(?:(?:'([^']+)'|([A-Za-z_][A-Za-z0-9_.]*))!?)?\$?([A-Za-z]{1,3})(\$?)(\d*)(?::\$?([A-Za-z]{1,3})(\$?)(\d*))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const [, sheet, sheet2, col, , digits, endCol, , endDigits] = m;
    const nextCh = src[m.index + m[0].length];
    // Column-only token (no digits): only meaningful as a range part (A:A).
    // Also skips identifiers like "SUMIFS(" (matched as "SUM" + "IFS(").
    if (digits === '') {
      if (nextCh !== ':') continue;
    } else if (nextCh === '(') {
      continue; // function name ending in digits (LOG10(, LOG2(, ...)
    }
    const addr = `${col}${digits}`;
    if (endCol && endDigits !== '') out.push({ sheet: sheet ?? sheet2, addr, end: `${endCol}${endDigits}` });
    else if (endCol) out.push({ sheet: sheet ?? sheet2, addr, end: `${endCol}` });
    else out.push({ sheet: sheet ?? sheet2, addr });
  }
  return out;
}

/**
 * Collect every cell/range reference from a formula string.
 *
 * "=SUM(V46:V54)"     -> [{ addr: "V46", end: "V54" }]
 * "=PL!D7 + PL!D8"    -> [{ sheet: "PL", addr: "D7" }, { sheet: "PL", addr: "D8" }]
 * "=V46*2"            -> [{ addr: "V46" }]
 *
 * Uses the same tokenizer as evaluateFormula so reference detection stays
 * consistent with evaluation; falls back to a regex pass when the tokenizer
 * rejects the string (unevaluable formulas still get their refs mapped).
 */
export function collectReferences(src: string): FormulaRefToken[] {
  const text = src.replace(/^=/, '').trim();
  if (!text) return [];
  try {
    const tokens = tokenize(text);
    const refs: FormulaRefToken[] = [];
    let pendingSheet: string | undefined;
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i]!;
      if (t.type === 'sheet') {
        pendingSheet = t.value;
        i++;
        continue;
      }
      if (t.type === 'ref') {
        const addr = t.value.replace(/\$/g, '');
        const nxt = tokens[i + 1];
        // Function-name false positives (LOG10(, LOG2() are tokenized as refs)
        if (nxt && nxt.type === 'op' && nxt.value === '(') {
          i += 2;
          pendingSheet = undefined;
          continue;
        }
        if (nxt && nxt.type === 'op' && nxt.value === ':') {
          const endTok = tokens[i + 2];
          if (endTok && endTok.type === 'ref') {
            refs.push({ sheet: pendingSheet, addr, end: endTok.value.replace(/\$/g, '') });
            i += 3;
            pendingSheet = undefined;
            continue;
          }
        }
        refs.push({ sheet: pendingSheet, addr });
        i++;
        pendingSheet = undefined;
        continue;
      }
      i++;
    }
    return refs;
  } catch {
    return regexRefs(text);
  }
}

/**
 * Evaluate an Excel formula string against the workbook.
 * Returns { value } for formulas we can compute, { unevaluable: true } otherwise.
 */
export function evaluateFormula(
  wb: WorkBook,
  ws: WorkSheet,
  formula: string,
  depth = 0,
  currentCellAddr?: string,
): FormulaEvalResult {
  try {
    const src = formula.trim();
    if (!src.startsWith('=')) return { unevaluable: true };
    const parser = new Parser(wb, ws, src.slice(1), depth, currentCellAddr);
    const v = parser.parseExpr();
    if (!parser.finished()) return { unevaluable: true };
    // Excel: a top-level reference to an empty/missing cell evaluates to 0.
    // (Real failures — unsupported/erroring referenced formulas — throw in
    // resolveCell and are caught above, so they still return unevaluable.)
    if (v === undefined || v === null) return { value: 0, unevaluable: false };
    if (typeof v === 'number' && !isFinite(v)) return { unevaluable: true };
    // Booleans -> 1/0 for numeric Excel cells
    if (typeof v === 'boolean') return { value: v ? 1 : 0, unevaluable: false };
    return { value: v, unevaluable: false };
  } catch {
    return { unevaluable: true };
  }
}
