/** Framework-free form schema model consumed by pro-form adapters. */

export type ProFieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'switch';

export interface SelectOption {
  label: string;
  value: string;
}

export interface ProFieldSchema {
  name: string;
  label: string;
  type: ProFieldType;
  placeholder?: string;
  description?: string;
  options?: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  /** Synchronous validators; return an error message or undefined when valid. */
  validators?: Array<(value: unknown) => string | undefined>;
}

export type ProFormLayout = 'stacked' | 'grid-2';

export interface ProFormGroup {
  title?: string;
  description?: string;
  layout?: ProFormLayout;
  fields: ProFieldSchema[];
}

export interface ProFormValues {
  [field: string]: unknown;
}

/** Runs every validator for one field; returns the first error message found. */
export function validateField(schema: ProFieldSchema, raw: unknown): string | undefined {
  if (schema.required && (raw === undefined || raw === null || raw === '')) {
    return `${schema.label} is required`;
  }
  for (const validate of schema.validators ?? []) {
    const error = validate(raw);
    if (error !== undefined) return error;
  }
  return undefined;
}
