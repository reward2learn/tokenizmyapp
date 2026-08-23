'use client';

import Stack from '@mui/material/Stack';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { AiGenerateFieldButton } from '@/components/cms/ai-field-generate-button';
import type { CmsFieldValueType } from '@/lib/cms-block-field-catalog';

export interface CmsAiTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  fieldKey: string;
  fieldType?: CmsFieldValueType;
  fieldPath?: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

/** TextField with an adjacent AI generate button for CMS block settings. */
export function CmsAiTextField({
  fieldKey,
  fieldType = 'text',
  fieldPath,
  value,
  onChange,
  readOnly,
  ...textFieldProps
}: CmsAiTextFieldProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      <TextField
        {...textFieldProps}
        fullWidth
        value={value}
        disabled={readOnly || textFieldProps.disabled}
        onChange={(e) => onChange(e.target.value)}
        sx={{ flex: 1, ...textFieldProps.sx }}
      />
      {!readOnly ? (
        <AiGenerateFieldButton
          fieldKey={fieldKey}
          fieldType={fieldType}
          fieldPath={fieldPath}
          currentValue={value}
          onGenerated={(v) => {
            if (typeof v === 'string') onChange(v);
          }}
        />
      ) : null}
    </Stack>
  );
}
