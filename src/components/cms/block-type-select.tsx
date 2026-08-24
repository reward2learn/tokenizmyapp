'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import {
  CMS_SWITCHABLE_BLOCK_TYPES,
  isSwitchableBlockType,
} from '@/lib/cms-block-type-change';

export interface BlockTypeSelectProps {
  value: string;
  onChange: (blockType: string) => void;
  disabled?: boolean;
  /** When false, only switchable types appear; the current value is always listed. */
  includeCurrentWhenNonSwitchable?: boolean;
}

export function BlockTypeSelect({
  value,
  onChange,
  disabled,
  includeCurrentWhenNonSwitchable = true,
}: BlockTypeSelectProps) {
  const options: string[] = [...CMS_SWITCHABLE_BLOCK_TYPES];
  if (
    includeCurrentWhenNonSwitchable &&
    value &&
    !isSwitchableBlockType(value) &&
    !options.includes(value)
  ) {
    options.unshift(value);
  }

  return (
    <>
      <FormControl size="small" fullWidth disabled={disabled}>
        <InputLabel id="cms-block-type">Block type</InputLabel>
        <Select
          labelId="cms-block-type"
          label="Block type"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((bt) => (
            <MenuItem key={bt} value={bt}>
              {bt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary">
        Switch presentation (e.g. KPI cards → chat). Layout and access tier are kept; type-specific
        fields reset. Data-backed blocks seed chat prompts and store a data context reference.
      </Typography>
    </>
  );
}
