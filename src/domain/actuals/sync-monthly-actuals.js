import { monthBounds } from '@/domain/shared/date-utils';
import { num, toIdrInt } from '@/domain/shared/number-utils';
import { buildComputedPnl, buildPnlLinesFromValues, isExcelLedgerMonth, lineValueFromPnlLines, parsePnlLines, } from '@/domain/financial/pnl-calculator';
export class SyncMonthlyActuals {
    db;
    constructor(db) {
        this.db = db;
    }
    async aggregateZReportsForMonth(period) {
        const { start, end } = monthBounds(period);
        const rows = await this.db.$queryRaw `
      SELECT
        COUNT(DISTINCT report_date)::int AS days_count,
        COALESCE(SUM(nett_sales), 0) AS revenue,
        COALESCE(SUM(total_covers), 0)::int AS guests,
        COALESCE(SUM(gofood_amount), 0) AS gofood_revenue,
        COALESCE(SUM(dine_in_amount), 0) AS dine_in_amount,
        COALESCE(SUM(group_food_amount), 0) AS food_revenue,
        COALESCE(SUM(group_beverage_amount), 0) AS beverage_revenue,
        COALESCE(SUM(tax_10_amount), 0) AS tax_10,
        COALESCE(SUM(service_7_amount), 0) AS service_7,
        COALESCE(SUM(total_item_discount_amount), 0) AS discounts,
        COALESCE(SUM(pre_send_void_amount), 0) + COALESCE(SUM(post_send_void_amount), 0) AS voids,
        ROUND(AVG(avg_covers)) AS avg_spend
      FROM daily_z_reports d
      WHERE report_date >= ${start}::date AND report_date < ${end}::date
        AND (
          d.department != 'all_pos'
          OR NOT EXISTS (
            SELECT 1 FROM daily_z_reports d2
            WHERE d2.report_date = d.report_date
              AND d2.report_date >= ${start}::date AND d2.report_date < ${end}::date
              AND d2.department != 'all_pos'
          )
        )`;
        const row = rows[0];
        if (!row?.days_count)
            return null;
        return {
            period,
            days_count: row.days_count,
            revenue: toIdrInt(row.revenue),
            guests: num(row.guests) || 0,
            gofood_revenue: toIdrInt(row.gofood_revenue),
            dine_in_amount: toIdrInt(row.dine_in_amount),
            food_revenue: toIdrInt(row.food_revenue),
            beverage_revenue: toIdrInt(row.beverage_revenue),
            tax_10: toIdrInt(row.tax_10),
            service_7: toIdrInt(row.service_7),
            discounts: toIdrInt(row.discounts),
            voids: toIdrInt(row.voids),
            avg_spend: num(row.avg_spend),
        };
    }
    async aggregateZReportKpisByMonth() {
        const rows = await this.db.$queryRaw `
      SELECT
        TO_CHAR(DATE_TRUNC('month', report_date), 'YYYY-MM') AS period,
        COALESCE(SUM(nett_sales), 0) AS revenue,
        COALESCE(SUM(total_covers), 0)::int AS guests,
        COUNT(*)::int AS days_count
      FROM daily_z_reports
      GROUP BY 1
      ORDER BY 1`;
        const out = {};
        for (const row of rows) {
            out[row.period] = {
                revenue: num(row.revenue),
                guests: num(row.guests),
                days_count: row.days_count,
            };
        }
        return out;
    }
    async getManualInputs(period) {
        const row = await this.db.monthlyActualInput.findUnique({ where: { period } });
        if (!row?.inputs)
            return {};
        const raw = row.inputs;
        if (typeof raw === 'object' && !Array.isArray(raw)) {
            return raw;
        }
        return {};
    }
    async getYtdTotalsBefore(period) {
        const [year] = String(period).split('-');
        const rows = await this.db.financialProjection.findMany({
            where: {
                period: { startsWith: `${year}-`, lt: period },
                dataType: 'actual',
                scenario: 'actual',
            },
            orderBy: { period: 'asc' },
            select: { pnlLines: true },
        });
        let net = 0;
        let income = 0;
        for (const row of rows) {
            const lines = parsePnlLines(row.pnlLines);
            net += lineValueFromPnlLines(lines, 'net_income_pre_tax') || 0;
            income += lineValueFromPnlLines(lines, 'total_income_idr') || 0;
        }
        return { net_income_pre_tax: net, total_income_idr: income };
    }
    async syncMonthlyActuals(period) {
        if (isExcelLedgerMonth(period))
            return null;
        const agg = await this.aggregateZReportsForMonth(period);
        const manualInputs = await this.getManualInputs(period);
        const hasManual = Object.keys(manualInputs).length > 0;
        if (!agg && !hasManual)
            return null;
        const { year, month } = monthBounds(period);
        const ytdBefore = await this.getYtdTotalsBefore(period);
        const values = buildComputedPnl(period, agg, manualInputs, ytdBefore);
        const pnlLines = buildPnlLinesFromValues(values);
        const revenue = num(values.total_income_idr) ?? (agg ? agg.revenue : 0);
        const guests = num(values.total_guests_month) ?? (agg ? agg.guests : 0);
        const ebitda = num(values.ebitda);
        const netIncome = num(values.net_income_pre_tax);
        const staffCost = num(values.total_staff_cost) ?? 0;
        await this.db.financialProjection.upsert({
            where: {
                period_dataType_scenario: {
                    period,
                    dataType: 'actual',
                    scenario: 'actual',
                },
            },
            create: {
                period,
                year,
                month,
                dataType: 'actual',
                scenario: 'actual',
                revenue,
                ebitda: ebitda ?? 0,
                netIncome: netIncome ?? 0,
                guests: guests ?? 0,
                staffCost,
                pnlLines: pnlLines,
            },
            update: {
                revenue,
                guests: guests ?? 0,
                pnlLines: pnlLines,
                ebitda: ebitda ?? 0,
                netIncome: netIncome ?? 0,
                staffCost,
            },
        });
        return { period, ...(agg || {}), pnl_lines: pnlLines, values };
    }
    async resyncMonthlyActuals(period) {
        if (isExcelLedgerMonth(period))
            return null;
        const agg = await this.aggregateZReportsForMonth(period);
        const manualInputs = await this.getManualInputs(period);
        const hasManual = Object.keys(manualInputs).length > 0;
        if (agg || hasManual)
            return this.syncMonthlyActuals(period);
        await this.db.financialProjection.deleteMany({
            where: { period, dataType: 'actual', scenario: 'actual' },
        });
        return null;
    }
    async resyncActualsCascadeFrom(period) {
        if (isExcelLedgerMonth(period))
            return null;
        const primary = await this.resyncMonthlyActuals(period);
        const [year] = String(period).split('-');
        const laterRows = await this.db.$queryRaw `
      SELECT DISTINCT period FROM (
        SELECT period FROM monthly_actual_inputs WHERE period LIKE ${`${year}-%`} AND period > ${period}
        UNION
        SELECT period FROM financial_projections
          WHERE period LIKE ${`${year}-%`} AND period > ${period}
            AND data_type = 'actual' AND scenario = 'actual'
        UNION
        SELECT TO_CHAR(DATE_TRUNC('month', report_date), 'YYYY-MM') AS period
          FROM daily_z_reports
          WHERE TO_CHAR(DATE_TRUNC('month', report_date), 'YYYY') = ${year}
            AND TO_CHAR(DATE_TRUNC('month', report_date), 'YYYY-MM') > ${period}
      ) t
      ORDER BY period`;
        for (const row of laterRows) {
            if (row.period && row.period > period) {
                await this.resyncMonthlyActuals(row.period);
            }
        }
        return primary;
    }
    async buildActualScenarioPayload(period, existingScenario) {
        if (isExcelLedgerMonth(period)) {
            return existingScenario ?? { period, lines: [] };
        }
        const agg = await this.aggregateZReportsForMonth(period);
        const manualInputs = await this.getManualInputs(period);
        const ytdBefore = await this.getYtdTotalsBefore(period);
        const values = buildComputedPnl(period, agg, manualInputs, ytdBefore);
        const lines = buildPnlLinesFromValues(values);
        return {
            period,
            data_type: 'actual',
            scenario: 'actual',
            lines,
            revenue: num(values.total_income_idr) ?? agg?.revenue ?? null,
            guests: num(values.total_guests_month) ?? agg?.guests ?? null,
            ebitda: num(values.ebitda) ?? null,
            net_income: num(values.net_income_pre_tax) ?? null,
            staff_cost: num(values.total_staff_cost) ?? null,
            days_count: agg?.days_count ?? null,
            from_z_reports: !!agg,
        };
    }
}
