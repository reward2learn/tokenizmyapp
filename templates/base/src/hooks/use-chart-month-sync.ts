'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ChartOverview } from '@/domain/financial/financial-projection-service';
import {
  labelToPeriod,
  parseMonthQueryParam,
  pickActualSeriesForDefault,
  resolveDefaultMonthIndex,
} from '@/lib/chart-utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedMonth } from '@/store/ui-slice';

/**
 * Sync selected chart month from URL ?month= and/or chart overview labels.
 * Seeds the latest month with actuals (else current / first) when none selected.
 */
export function useChartMonthSync(overview: ChartOverview | undefined, enabled = true): void {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const selectedMonthLabel = useAppSelector((s) => s.ui.selectedMonthLabel);

  useEffect(() => {
    const labels = overview?.labels;
    if (!enabled || !labels?.length) return;

    const monthParam = parseMonthQueryParam(searchParams.get('month'));
    if (monthParam) {
      const idx = labels.indexOf(monthParam);
      if (idx >= 0) {
        dispatch(
          setSelectedMonth({
            label: monthParam,
            period: labelToPeriod(monthParam),
          }),
        );
      }
      return;
    }

    if (selectedMonthLabel && labels.includes(selectedMonthLabel)) return;

    const actualSeries = pickActualSeriesForDefault(overview?.actual);
    const defaultIdx = resolveDefaultMonthIndex(labels, actualSeries);
    const label = labels[defaultIdx];
    if (label) {
      dispatch(
        setSelectedMonth({
          label,
          period: labelToPeriod(label),
        }),
      );
    }
  }, [enabled, overview, searchParams, selectedMonthLabel, dispatch]);
}
