import { useForm } from '@tanstack/react-form';

import { Button } from '@package/ui/src/components/ui/button';
import { Checkbox } from '@package/ui/src/components/ui/checkbox';
import { Input } from '@package/ui/src/components/ui/input';
import { Label } from '@package/ui/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui/src/components/ui/select';
import { Switch } from '@package/ui/src/components/ui/switch';
import { Textarea } from '@package/ui/src/components/ui/textarea';
import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';
import type {
  ProFieldSchema,
  ProFormGroup,
  ProFormValues,
} from '@package/pro-core/src/form/schema';

export interface ProFormProps {
  schema: Array<ProFormGroup>;
  defaultValues: ProFormValues;
  submitLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onSubmit: (values: ProFormValues) => Promise<void> | void;
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
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={schema.placeholder}
          disabled={disabled}
          aria-invalid={error !== undefined}
        />
      );
    case 'number':
      return (
        <Input
          type='number'
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(event) =>
            onChange(event.target.value === '' ? undefined : Number(event.target.value))
          }
          placeholder={schema.placeholder}
          disabled={disabled}
          aria-invalid={error !== undefined}
        />
      );
    case 'select':
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={(next) => onChange(next)}
          disabled={disabled}
        >
          <SelectTrigger className='w-full' aria-invalid={error !== undefined}>
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
          <Checkbox checked={!!value} onCheckedChange={(checked) => onChange(!!checked)} />
          <span className='text-sm'>{schema.placeholder ?? schema.label}</span>
        </div>
      );
    case 'switch':
      return (
        <Switch checked={!!value} onCheckedChange={(checked) => onChange(checked)} />
      );
    default:
      return (
        <Input
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={schema.placeholder}
          disabled={disabled}
          aria-invalid={error !== undefined}
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
  onSubmit,
  onCancel,
  className,
}: ProFormProps) {
  const form = useForm({
    defaultValues: defaultValues as ProFormValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

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
                        <p className='text-xs font-medium text-destructive' role='alert'>
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
