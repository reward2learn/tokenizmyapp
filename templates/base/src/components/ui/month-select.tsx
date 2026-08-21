'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { labelToPeriod } from '@/lib/chart-utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedMonth } from '@/store/ui-slice';

export interface MonthSelectProps {
  /** Month labels from chart overview (e.g. "Aug 2026"). */
  labels: string[];
  /** Optional size override for dense layouts. */
  size?: 'small' | 'medium';
  /** When true, also write `?month=` into the URL for shareable deep-links. */
  syncUrl?: boolean;
  disabled?: boolean;
}

/**
 * Shared month picker bound to Redux `selectedMonthLabel` / `selectedMonthPeriod`.
 * KPI cards, chart, and P&L all read that selection — changing here drives them.
 */
export function MonthSelect({
  labels,
  size = 'small',
  syncUrl = true,
  disabled = false,
}: MonthSelectProps) {
  const dispatch = useAppDispatch();
  const selectedMonthLabel = useAppSelector((s) => s.ui.selectedMonthLabel);

  const value =
    selectedMonthLabel && labels.includes(selectedMonthLabel)
      ? selectedMonthLabel
      : labels[0] ?? '';

  const handleChange = (event: SelectChangeEvent<string>) => {
    const label = event.target.value;
    if (!label) {
      dispatch(setSelectedMonth({ label: null, period: null }));
      if (syncUrl && typeof globalThis !== 'undefined') {
        const url = new URL(globalThis.location.href);
        url.searchParams.delete('month');
        globalThis.history.replaceState(null, '', url.toString());
      }
      return;
    }

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

  if (!labels.length) {
    return (
      <FormControl size={size} sx={{ minWidth: 140 }} disabled>
        <InputLabel id="month-select-label">Month</InputLabel>
        <Select labelId="month-select-label" label="Month" value="">
          <MenuItem value="">No months</MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <FormControl size={size} sx={{ minWidth: 160 }} disabled={disabled}>
      <InputLabel id="month-select-label">Month</InputLabel>
      <Select
        labelId="month-select-label"
        id="month-select"
        label="Month"
        value={value}
        onChange={handleChange}
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
