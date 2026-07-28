import { monthBounds, periodFromDate, toIsoDate, toPrismaDateTime, toPrismaTime, } from '@/domain/shared/date-utils';
import { camelToSnake, num, snakeToCamel } from '@/domain/shared/number-utils';
import { SyncMonthlyActuals } from '@/domain/actuals/sync-monthly-actuals';
import { getDepartment, requiredForDepartment, sectionsForDepartment, Z_REPORT_FIELD_KEYS, Z_REPORT_SECTIONS, } from '@/domain/z-report/z-report-schema';
import { mergeReceiptImages, sanitizeReceiptImages, stripReceiptImages, } from '@/domain/z-report/receipt-images';
const AMOUNT_KEYS = new Set(Z_REPORT_FIELD_KEYS.filter((k) => k.endsWith('_amount')
    || k === 'total_sales'
    || k === 'estimated_sales'
    || k === 'nett_sales'
    || k === 'avg_bills'
    || k === 'avg_covers'));
export const PRORATE_KEYS = Z_REPORT_FIELD_KEYS.filter((k) => k.endsWith('_qty')
    || k.endsWith('_amount')
    || k === 'total_sales'
    || k === 'estimated_sales'
    || k === 'nett_sales'
    || k === 'total_bills'
    || k === 'total_covers'
    || k === 'avg_bills'
    || k === 'avg_covers'
    || k === 'report_no');
const IMPORT_SOURCES = new Set(['xlsx_daily', 'xlsx_prorate']);
function isManualSource(source) {
    return !source || source === 'manual';
}
function coerceValue(key, val) {
    if (val === null || val === undefined || val === '')
        return null;
    if (key === 'report_date')
        return toIsoDate(val) || String(val).slice(0, 10);
    if (key === 'report_time') {
        // Prisma DateTime/@db.Time rejects bare "HH:mm:ss" — needs ISO DateTime
        return toPrismaTime(val);
    }
    if (key === 'period_start' || key === 'period_end') {
        return toPrismaDateTime(val);
    }
    if (key === 'operator' || key === 'pos_group' || key === 'begin_receipt_no' || key === 'end_receipt_no') {
        return String(val).trim();
    }
    if (AMOUNT_KEYS.has(key)) {
        const n = Number(String(val).replace(/,/g, ''));
        return Number.isFinite(n) ? n : null;
    }
    const n = parseInt(String(val).replace(/,/g, ''), 10);
    return Number.isFinite(n) ? n : null;
}
function rowToPrismaData(row, entrySource) {
    // Normalize camelCase keys to snake_case for field lookup
    for (const key of Object.keys(row)) {
        const snakeKey = camelToSnake(key);
        if (snakeKey !== key && row[snakeKey] === undefined) {
            row[snakeKey] = row[key];
        }
    }
    const built = {};
    for (const key of Z_REPORT_FIELD_KEYS) {
        if (row[key] !== undefined) {
            built[snakeToCamel(key)] = coerceValue(key, row[key]);
        }
    }
    if (row.raw_text)
        built.rawText = String(row.raw_text).trim();
    built.entrySource = entrySource;
    const reportDate = built.reportDate;
    if (!reportDate)
        throw new Error('report_date is required');
    if (!built.department)
        built.department = 'all_pos';
    const nettSales = num(built.nettSales);
    const totalSales = num(built.totalSales);
    if (!nettSales && !totalSales) {
        throw new Error(`Nett Sales required for ${reportDate}`);
    }
    if (!built.totalCovers) {
        throw new Error(`Total covers required for ${reportDate}`);
    }
    if (!nettSales && totalSales)
        built.nettSales = totalSales;
    if (!built.avgCovers && built.nettSales && built.totalCovers) {
        built.avgCovers = Math.round(Number(built.nettSales) / Number(built.totalCovers));
    }
    if (row.receipt_images !== undefined) {
        built.receiptImages = sanitizeReceiptImages(row.receipt_images);
    }
    return built;
}
function sumRowFields(rows, keys) {
    const totals = {};
    for (const key of keys)
        totals[key] = 0;
    for (const row of rows) {
        for (const key of keys) {
            totals[key] += num(row[key]) || 0;
        }
    }
    return totals;
}
function splitProrated(total, parts) {
    if (parts <= 0)
        return [];
    const base = Math.floor((total / parts) * 100) / 100;
    const amounts = Array(parts).fill(base);
    let remainder = Math.round((total - base * parts) * 100) / 100;
    let i = 0;
    while (remainder > 0.009 && i < parts) {
        const step = Math.min(0.01, remainder);
        amounts[i] += step;
        remainder = Math.round((remainder - step) * 100) / 100;
        i++;
    }
    return amounts;
}
function splitProratedInt(total, parts) {
    if (parts <= 0)
        return [];
    const base = Math.floor(total / parts);
    const amounts = Array(parts).fill(base);
    let remainder = total - base * parts;
    let i = 0;
    while (remainder > 0 && i < parts) {
        amounts[i]++;
        remainder--;
        i++;
    }
    return amounts;
}
function buildProratedDayRow(period, date, sliceIndex, sliceCount, remainder, entrySource) {
    const row = {
        report_date: date,
        raw_text: `[${entrySource}] Monthly fill for ${period} — day ${date} (${sliceIndex + 1}/${sliceCount})`,
    };
    for (const key of PRORATE_KEYS) {
        const total = remainder[key] || 0;
        if (key.endsWith('_qty') || key === 'report_no' || key === 'total_bills' || key === 'total_covers') {
            const parts = splitProratedInt(Math.round(total), sliceCount);
            row[key] = parts[sliceIndex] ?? 0;
        }
        else {
            const parts = splitProrated(total, sliceCount);
            row[key] = parts[sliceIndex] ?? 0;
        }
    }
    if (!row.nett_sales && row.total_sales)
        row.nett_sales = row.total_sales;
    if (!row.total_sales && row.nett_sales)
        row.total_sales = row.nett_sales;
    if (row.nett_sales && row.total_covers && !row.avg_covers) {
        row.avg_covers = Math.round(Number(row.nett_sales) / Number(row.total_covers));
    }
    if (row.total_bills && row.nett_sales && !row.avg_bills) {
        row.avg_bills = Math.round(Number(row.nett_sales) / Number(row.total_bills));
    }
    return row;
}
export class ZReportService {
    db;
    sync;
    constructor(db) {
        this.db = db;
        this.sync = new SyncMonthlyActuals(db);
    }
    getSchema(deptId) {
        const department = deptId ?? 'all_pos';
        return {
            sections: sectionsForDepartment(department),
            departments: [getDepartment(department)],
            required: requiredForDepartment(department),
        };
    }
    async getByDate(reportDate, department = 'all_pos') {
        const date = toIsoDate(reportDate) || reportDate.slice(0, 10);
        return this.db.dailyZReport.findUnique({
            where: {
                reportDate_department: {
                    reportDate: new Date(`${date}T00:00:00.000Z`),
                    department,
                },
            },
        });
    }
    async upsert(row, entrySource = 'manual') {
        const data = rowToPrismaData(row, entrySource);
        const reportDate = new Date(`${String(data.reportDate)}T00:00:00.000Z`);
        const department = String(data.department ?? 'all_pos');
        // Build correct reportTime from reportDate string + time string
        if (data.reportTime && typeof data.reportTime === 'string') {
            const dateStr = String(data.reportDate).slice(0, 10);
            // data.reportTime is in ISO format "YYYY-MM-DDTHH:mm:ss.000Z"
            // Extract time portion from positions 11-19 e.g. "22:02:00"
            const timeStr = String(data.reportTime).slice(11, 19);
            data.reportTime = new Date(`${dateStr}T${timeStr}`);
        }
        const existing = await this.getByDate(String(data.reportDate), department);
        if (existing?.receiptImages && row.receipt_images !== undefined) {
            data.receiptImages = mergeReceiptImages(existing.receiptImages, row.receipt_images);
        }
        const updateData = { ...data };
        delete updateData.reportDate;
        delete updateData.department;
        const saved = await this.db.dailyZReport.upsert({
            where: { reportDate_department: { reportDate, department } },
            create: { ...data, reportDate, department },
            update: updateData,
        });
        await this.sync.resyncMonthlyActuals(periodFromDate(String(data.reportDate)));
        return saved;
    }
    async getMonthCalendar(period) {
        const { daysInMonth } = monthBounds(period);
        const { start, end } = monthBounds(period);
        const rows = await this.db.dailyZReport.findMany({
            where: {
                reportDate: { gte: new Date(`${start}T00:00:00.000Z`), lt: new Date(`${end}T00:00:00.000Z`) },
            },
            orderBy: { reportDate: 'asc' },
        });
        const byDate = {};
        rows.forEach((r) => {
            const d = toIsoDate(r.reportDate) || String(r.reportDate).slice(0, 10);
            byDate[d] = r;
        });
        const filled = [];
        const missing = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const date = `${period}-${String(d).padStart(2, '0')}`;
            if (byDate[date]) {
                filled.push({ date, entry_source: byDate[date].entrySource || 'manual' });
            }
            else {
                missing.push(date);
            }
        }
        return {
            period,
            days_in_month: daysInMonth,
            filled,
            missing,
            manual_count: filled.filter((f) => isManualSource(f.entry_source)).length,
            imported_count: filled.filter((f) => IMPORT_SOURCES.has(f.entry_source)).length,
        };
    }
    async importDailyRows(rows, options = {}) {
        const { fillMissingOnly = true, overwriteImported = true, entrySource = 'xlsx_daily', } = options;
        const imported = [];
        const skipped = [];
        const errors = [];
        const periods = new Set();
        for (const raw of rows) {
            // Normalize camelCase keys to snake_case so the import accepts either convention
            for (const key of Object.keys(raw)) {
                const snakeKey = camelToSnake(key);
                if (snakeKey !== key && raw[snakeKey] === undefined) {
                    raw[snakeKey] = raw[key];
                }
            }
            const date = coerceValue('report_date', raw.report_date ?? raw.date);
            if (!date) {
                errors.push({ row: raw, error: 'Missing report_date' });
                continue;
            }
            try {
                const existing = await this.db.dailyZReport.findFirst({
                    where: { reportDate: new Date(`${date}T00:00:00.000Z`) },
                    select: { reportDate: true, entrySource: true },
                });
                if (existing) {
                    if (isManualSource(existing.entrySource) && fillMissingOnly) {
                        skipped.push({ date, reason: 'manual_entry_exists' });
                        continue;
                    }
                    if (IMPORT_SOURCES.has(existing.entrySource) && !overwriteImported) {
                        skipped.push({ date, reason: 'imported_entry_exists' });
                        continue;
                    }
                }
                const row = {
                    ...raw,
                    report_date: date,
                    raw_text: raw.raw_text
                        ?? `[${entrySource}] Imported from XLSX on ${new Date().toISOString().slice(0, 10)}`,
                };
                const saved = await this.upsert(row, entrySource);
                imported.push(saved);
                periods.add(periodFromDate(date));
            }
            catch (err) {
                errors.push({ date, error: err instanceof Error ? err.message : String(err) });
            }
        }
        for (const period of periods) {
            await this.sync.resyncMonthlyActuals(period);
        }
        return { imported: imported.length, skipped, errors, periods: [...periods] };
    }
    async importMonthlyProrate(period, monthlyTotals, options = {}) {
        const { fillMissingOnly = true, overwriteImported = true } = options;
        const { daysInMonth, start, end } = monthBounds(period);
        const existingRows = await this.db.dailyZReport.findMany({
            where: {
                reportDate: { gte: new Date(`${start}T00:00:00.000Z`), lt: new Date(`${end}T00:00:00.000Z`) },
            },
        });
        const manualRows = existingRows
            .filter((r) => isManualSource(r.entrySource))
            .map((r) => Object.fromEntries(Z_REPORT_FIELD_KEYS.map((k) => [k, r[snakeToCamel(k)]])));
        const manualSum = sumRowFields(manualRows, PRORATE_KEYS);
        const remainder = {};
        for (const key of PRORATE_KEYS) {
            remainder[key] = (num(monthlyTotals[key]) || 0) - (manualSum[key] || 0);
        }
        if (num(monthlyTotals.nett_sales) && remainder.nett_sales < 0) {
            throw new Error('Monthly nett sales is less than sum of existing manual entries');
        }
        const targetDates = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const date = `${period}-${String(d).padStart(2, '0')}`;
            const ex = existingRows.find((r) => (toIsoDate(r.reportDate) || String(r.reportDate).slice(0, 10)) === date);
            if (!ex) {
                targetDates.push(date);
            }
            else if (IMPORT_SOURCES.has(ex.entrySource) && overwriteImported) {
                targetDates.push(date);
            }
            else if (ex && isManualSource(ex.entrySource) && !fillMissingOnly) {
                targetDates.push(date);
            }
        }
        if (!targetDates.length) {
            return {
                imported: 0,
                skipped: [{ reason: 'no_target_days' }],
                errors: [],
                periods: [period],
            };
        }
        const imported = [];
        const errors = [];
        for (let i = 0; i < targetDates.length; i++) {
            const date = targetDates[i];
            try {
                const row = buildProratedDayRow(period, date, i, targetDates.length, remainder, 'xlsx_prorate');
                const saved = await this.upsert(row, 'xlsx_prorate');
                imported.push(saved);
            }
            catch (err) {
                errors.push({ date, error: err instanceof Error ? err.message : String(err) });
            }
        }
        await this.sync.resyncMonthlyActuals(period);
        return {
            imported: imported.length,
            skipped: [],
            errors,
            periods: [period],
            target_dates: targetDates,
        };
    }
    async deleteZReport(reportDate, options = {}) {
        const { importedOnly = false } = options;
        const date = toIsoDate(reportDate) || String(reportDate).slice(0, 10);
        const period = periodFromDate(date);
        const existing = await this.db.dailyZReport.findFirst({
            where: { reportDate: new Date(`${date}T00:00:00.000Z`) },
        });
        if (!existing) {
            return { deleted: false, reason: 'not_found', period };
        }
        if (importedOnly && isManualSource(existing.entrySource)) {
            return { deleted: false, reason: 'manual_entry_protected', period };
        }
        await this.db.dailyZReport.deleteMany({
            where: { reportDate: new Date(`${date}T00:00:00.000Z`) },
        });
        await this.sync.resyncMonthlyActuals(period);
        return { deleted: true, report_date: date, period, entry_source: existing.entrySource };
    }
    async deleteMonthImported(period) {
        const { start, end } = monthBounds(period);
        const deleted = await this.db.dailyZReport.deleteMany({
            where: {
                reportDate: { gte: new Date(`${start}T00:00:00.000Z`), lt: new Date(`${end}T00:00:00.000Z`) },
                entrySource: { in: ['xlsx_daily', 'xlsx_prorate'] },
            },
        });
        await this.sync.resyncMonthlyActuals(period);
        return { deleted: deleted.count, period };
    }
    stripReceiptImages(row) {
        return stripReceiptImages(row);
    }
}
export { Z_REPORT_SECTIONS };
