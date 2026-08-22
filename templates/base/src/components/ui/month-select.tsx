'use client';

import { Suspense, useEffect, useMemo } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import {
  defaultChartMonthLabels,
  labelToPeriod,
  pickActualSeriesForDefault,
  resolveDefaultMonthIndex,
} from '@/lib/chart-utils';
import { useChartMonthSync } from '@/hooks/use-chart-month-sync';
import { useGetChartOverviewQuery } from '@/store/apis/financial-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedMonth } from '@/store/ui-slice';

export interface MonthSelectProps {
  /**
   * Optional month labels from a parent that already loaded chart overview.
   * When omitted / empty, the select loads overview itself and falls back to a
   * generated year–month range so the dropdown is never stuck disabled.
   */
  labels?: string[];
  /** Optional actual series so the display default matches last-actuals seeding. */
  actualSeries?: (number | null)[] | null;
  size?: 'small' | 'medium';
  syncUrl?: boolean;
  disabled?: boolean;
}

function MonthSelectInner({
  labels: labelsProp,
  actualSeries: actualSeriesProp,
  size = 'small',
  syncUrl = true,
  disabled = false,
}: MonthSelectProps) {
  const dispatch = useAppDispatch();
  const selectedMonthLabel = useAppSelector((s) => s.ui.selectedMonthLabel);

  // Self-fetch when parent has not supplied labels yet (or API returned []).
  const needsOwnData = !labelsProp?.length;
  const { data, isLoading, isFetching } = useGetChartOverviewQuery('conservative', {
    skip: !needsOwnData,
  });
  const overview = data?.data;

  useChartMonthSync(needsOwnData ? overview : undefined, needsOwnData);

  const labels = useMemo(() => {
    if (labelsProp?.length) return labelsProp;
    if (overview?.labels?.length) return overview.labels;
    // Always keep a usable year–month list (prev / current / next year).
    return defaultChartMonthLabels();
  }, [labelsProp, overview?.labels]);

  const actualSeries = useMemo(() => {
    if (actualSeriesProp) return actualSeriesProp;
    return pickActualSeriesForDefault(overview?.actual);
  }, [actualSeriesProp, overview?.actual]);

  // Seed Redux when parent supplied labels but sync hook is not running here.
  useEffect(() => {
    if (needsOwnData) return;
    if (!labels.length) return;
    if (selectedMonthLabel && labels.includes(selectedMonthLabel)) return;

    const idx = resolveDefaultMonthIndex(labels, actualSeries);
    const label = labels[idx];
    if (!label) return;
    dispatch(
      setSelectedMonth({
        label,
        period: labelToPeriod(label),
      }),
    );
  }, [needsOwnData, labels, actualSeries, selectedMonthLabel, dispatch]);

  const defaultLabel = labels[resolveDefaultMonthIndex(labels, actualSeries)] ?? '';
  const value =
    selectedMonthLabel && labels.includes(selectedMonthLabel)
      ? selectedMonthLabel
      : defaultLabel;

  const handleChange = (event: SelectChangeEvent<string>) => {
    const label = event.target.value;
    if (!label) return;

    dispatch(
      setSelectedMonth({
        label,
        period: labelToPeriod(label),
      }),
    );

    if (syncUrl && typeof globalThis !== 'undefined') {
      const url = new URL(globalThis.location.href);
      url.searchParams.set('month', label.replace(' ', '+'));
      globalThis.history.replaceState(null, '', url.toString());
    }
  };

  const busy = needsOwnData && (isLoading || isFetching) && !overview?.labels?.length;

  return (
    <FormControl size={size} sx={{ minWidth: 160 }} disabled={disabled || busy}>
      <InputLabel id="month-select-label">Month</InputLabel>
      <Select
        labelId="month-select-label"
        id="month-select"
        label="Month"
        value={value || ''}
        onChange={handleChange}
        renderValue={(selected) => selected || 'Select month'}
      >
        {labels.map((label) => (
          <MenuItem key={label} value={label}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/**
 * Shared month picker bound to Redux `selectedMonthLabel` / `selectedMonthPeriod`.
 * Always offers a year–month dropdown; never permanently disabled for empty data.
 */
export function MonthSelect(props: MonthSelectProps) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'inline-flex', alignItems: 'center', minWidth: 160, height: 40 }}>
          <CircularProgress size={18} />
        </Box>
      }
    >
      <MonthSelectInner {...props} />
    </Suspense>
  );
}
