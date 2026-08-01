/**
 * Excel formula support for the Sheet Viewer.
 *
 * The workbook stores formulas (e.g. "=SUM(E10:E11)", "=IF(D6=0,\"\",(F6-D6)/D6)",
 * "=PL!D7") with Excel's cached calculated values. This module:
 *  - evaluates a formula against the workbook (best-effort) so the DataGrid can
 *    show the calculated result immediately after the user amends the formula,
 *  - marks formulas we cannot evaluate (VLOOKUP, CHOOSE, WEEKDAY, exotic
 *    functions, etc.) as unevaluable — the formula is still stored in the
 *    workbook and Excel recalculates it on open.
 *
 * Supported: arithmetic (+ - * / ^ %), parens, cell refs (A1, $A$1),
 * cross-sheet refs (Sheet!A1, 'Sheet Name'!A1), ranges (A1:B5) and the
 * functions SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, PRODUCT, ABS, INT, SQRT,
 * ROUND, ROUNDUP, ROUNDDOWN, MOD, POWER, IF, SUBTOTAL (code 9/109 only).
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
}

function isRange(v: unknown): v is RangeValue {
  return typeof v === 'object' && v !== null && '__range' in (v as RangeValue);
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t' || ch === '\n') { i++; continue; }
    if (/[\d.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[\d.]/.test(src[j])) j++;
      tokens.push({ type: 'num', value: src.slice(i, j) });
      i = j; continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j++;
      tokens.push({ type: 'str', value: src.slice(i + 1, j) });
      i = j + 1; continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== "'") j++;
      const sheetName = src.slice(i + 1, j);
      i = j + 1;
      if (src[i] === '!') { tokens.push({ type: 'sheet', value: sheetName }); i++; continue; }
      throw new Error('bad quoted token');
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_$.]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (src[j] === '!') { tokens.push({ type: 'sheet', value: word }); i = j + 1; continue; }
      if (/^\$?[A-Za-z]{1,3}\$?\d+$/.test(word)) tokens.push({ type: 'ref', value: word });
      else if (word === 'TRUE') tokens.push({ type: 'bool', value: 'TRUE' });
      else if (word === 'FALSE') tokens.push({ type: 'bool', value: 'FALSE' });
      else tokens.push({ type: 'ident', value: word.toUpperCase() });
      i = j; continue;
    }
    const two = src.slice(i, i + 2);
    if (two === '<=' || two === '>=' || two === '<>') { tokens.push({ type: 'op', value: two }); i += 2; continue; }
    if ('+-*/^=<>(),%:'.includes(ch)) { tokens.push({ type: 'op', value: ch }); i++; continue; }
    throw new Error('unexpected char: ' + ch);
  }
  return tokens;
}

function toNum(v: unknown): number {
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
      return { __range: true, values: cells.map((c) => this.resolveCell(c.ws, c.addr, this.depth)) } as RangeValue;
    }
    return this.resolveCell(ws, addr, this.depth);
  }

  private getSheet(name: string): WorkSheet {
    const sheet = this.wb.Sheets[name] ?? this.wb.Sheets[this.wb.SheetNames.find((n) => n.toLowerCase() === name.toLowerCase()) ?? ''];
    if (!sheet) throw new Error('sheet not found: ' + name);
    return sheet;
  }

  private rangeCells(ws: WorkSheet, a: string, b: string) {
    const c1 = utils.decode_cell(a.replace(/\$/g, ''));
    const c2 = utils.decode_cell(b.replace(/\$/g, ''));
    const r1 = Math.min(c1.r, c2.r), r2 = Math.max(c1.r, c2.r);
    const cMin = Math.min(c1.c, c2.c), cMax = Math.max(c1.c, c2.c);
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
    const cell = ws[addr];
    if (!cell) return undefined;
    if (cell.v !== undefined && cell.v !== null) return cell.v;
    if (typeof cell.f === 'string' && cell.f.startsWith('=')) {
      const sub = evaluateFormula(this.wb, ws, cell.f, depth + 1);
      return sub.unevaluable ? undefined : sub.value;
    }
    return undefined;
  }

  private callFunction(name: string): unknown {
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
    return applyFunction(name, args);
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

function applyFunction(name: string, args: unknown[]): unknown {
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
    default:
      throw new Error('unsupported function: ' + name);
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
): FormulaEvalResult {
  try {
    const src = formula.trim();
    if (!src.startsWith('=')) return { unevaluable: true };
    const parser = new Parser(wb, ws, src.slice(1), depth);
    const v = parser.parseExpr();
    if (!parser.finished()) return { unevaluable: true };
    if (v === undefined || v === null) return { unevaluable: true };
    if (typeof v === 'number' && !isFinite(v)) return { unevaluable: true };
    // Booleans -> 1/0 for numeric Excel cells
    if (typeof v === 'boolean') return { value: v ? 1 : 0, unevaluable: false };
    return { value: v, unevaluable: false };
  } catch {
    return { unevaluable: true };
  }
}
