import { useForm } from '@tanstack/react-form';

import { Button } from '@package/ui/button';
import { Checkbox } from '@package/ui/checkbox';
import { Input } from '@package/ui/input';
import { Label } from '@package/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui/select';
import { Switch } from '@package/ui/switch';
import { Textarea } from '@package/ui/textarea';
import { cn } from '@package/ui/cn';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type {
  ProFieldSchema,
  ProFormGroup,
  ProFormValues,
} from '@package/pro-core/form';

export interface ProFormProps {
  schema: Array<ProFormGroup>;
  defaultValues: ProFormValues;
  submitLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  submitError?: unknown;
  onSubmit: (values: ProFormValues) => Promise<boolean | void> | boolean | void;
  onCancel?: () => void;
  className?: string;
}

function FieldControl({
  schema,
  value,
  error,
  disabled,
  onChange,
}: {
  schema: ProFieldSchema;
  value: unknown;
  error?: string;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}) {
  switch (schema.type) {
    case 'textarea':
      return (
        <Textarea
          id={`pro-field-${schema.name}`}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={schema.placeholder}
          disabled={disabled}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? `pro-field-${schema.name}-error` : undefined}
        />
      );
    case 'number':
      return (
        <Input
          id={`pro-field-${schema.name}`}
          type='number'
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(event) =>
            onChange(event.target.value === '' ? undefined : Number(event.target.value))
          }
          placeholder={schema.placeholder}
          disabled={disabled}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? `pro-field-${schema.name}-error` : undefined}
        />
      );
    case 'select':
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={(next) => onChange(next)}
          disabled={disabled}
        >
          <SelectTrigger
            id={`pro-field-${schema.name}`}
            className='w-full'
            aria-invalid={error !== undefined}
            aria-describedby={error !== undefined ? `pro-field-${schema.name}-error` : undefined}
          >
            <SelectValue placeholder={schema.placeholder ?? 'Select…'} />
          </SelectTrigger>
          <SelectContent>
            {(schema.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'checkbox':
      return (
        <div className='flex items-center gap-2'>
          <Checkbox
            id={`pro-field-${schema.name}`}
            checked={!!value}
            onCheckedChange={(checked) => onChange(!!checked)}
            aria-invalid={error !== undefined}
            aria-describedby={error !== undefined ? `pro-field-${schema.name}-error` : undefined}
          />
          <span className='text-sm'>{schema.placeholder ?? schema.label}</span>
        </div>
      );
    case 'switch':
      return (
        <Switch
          id={`pro-field-${schema.name}`}
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked)}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? `pro-field-${schema.name}-error` : undefined}
        />
      );
    default:
      return (
        <Input
          id={`pro-field-${schema.name}`}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={schema.placeholder}
          disabled={disabled}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? `pro-field-${schema.name}-error` : undefined}
        />
      );
  }
}

function FieldRow({
  schema,
  children,
}: {
  schema: ProFieldSchema;
  children: ReactNode;
}) {
  const isCheckLike = schema.type === 'checkbox' || schema.type === 'switch';
  return (
    <div className='flex flex-col gap-2'>
      {!isCheckLike && <Label htmlFor={`pro-field-${schema.name}`}>{schema.label}</Label>}
      {children}
      {schema.description !== undefined && !isCheckLike && (
        <p className='text-xs text-muted-foreground'>{schema.description}</p>
      )}
    </div>
  );
}

/** Schema-driven form on TanStack Form; renders every group and field type. */
export function ProForm({
  schema,
  defaultValues,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  pending = false,
  submitError,
  onSubmit,
  onCancel,
  className,
}: ProFormProps) {
  const [submitFailure, setSubmitFailure] = useState<unknown>(null);

  const form = useForm({
    defaultValues: defaultValues as ProFormValues,
    onSubmit: async ({ value }) => {
      // A rejected onSubmit must become visible form state. Letting it escape the `void
      // form.handleSubmit()` call site below turns every failure into an unhandled rejection with no
      // feedback, and callers such as ProStepForm rely on this boundary to report a step failure.
      setSubmitFailure(null);
      try {
        await onSubmit(value);
      } catch (error) {
        setSubmitFailure(error);
      }
    },
  });

  const resolvedSubmitError = submitError ?? submitFailure;

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {schema.map((group, groupIndex) => (
        <section key={groupIndex} className='flex flex-col gap-4'>
          {(group.title !== undefined || group.description !== undefined) && (
            <div className='flex flex-col gap-0.5 pb-1'>
              {group.title !== undefined && (
                <h3 className='text-sm font-semibold'>{group.title}</h3>
              )}
              {group.description !== undefined && (
                <p className='text-xs text-muted-foreground'>{group.description}</p>
              )}
            </div>
          )}
          <div
            className={
              group.layout === 'grid-2' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'flex flex-col gap-4'
            }
          >
            {group.fields.map((field) => (
              <form.Field
                key={field.name}
                name={field.name as never}
                validators={{
                  onChange: ({ value }) => {
                    for (const validate of field.validators ?? []) {
                      const message = validate(value);
                      if (message !== undefined) return message;
                    }
                    if (field.required && (value === undefined || value === '')) {
                      return `${field.label} is required`;
                    }
                    return undefined;
                  },
                }}
              >
                {(api) => {
                  const errors = api.state.meta.errors;
                  const firstError =
                    typeof errors[0] === 'string' ? errors[0] : String(errors[0] ?? '');
                  return (
                    <FieldRow schema={field}>
                      <FieldControl
                        schema={field}
                        value={api.state.value as unknown}
                        error={firstError || undefined}
                        disabled={field.disabled}
                        onChange={(next) => api.handleChange(next as never)}
                      />
                      {firstError !== '' && (
                        <p
                          id={`pro-field-${field.name}-error`}
                          className='text-xs font-medium text-destructive'
                          role='alert'
                        >
                          {firstError}
                        </p>
                      )}
                      {field.type === 'switch' || field.type === 'checkbox' ? (
                        <Label
                          htmlFor={`pro-field-${field.name}`}
                          className='mt-1 text-xs text-muted-foreground'
                        >
                          {field.description ?? field.label}
                        </Label>
                      ) : null}
                    </FieldRow>
                  );
                }}
              </form.Field>
            ))}
          </div>
        </section>
      ))}

      {resolvedSubmitError !== undefined && resolvedSubmitError !== null && (
        <p className='text-sm font-medium text-destructive' role='alert'>
          {resolvedSubmitError instanceof Error ? resolvedSubmitError.message : String(resolvedSubmitError)}
        </p>
      )}

      <div className='flex items-center justify-end gap-2 border-t pt-4'>
        {onCancel !== undefined && (
          <Button type='button' variant='outline' onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button type='submit' disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
