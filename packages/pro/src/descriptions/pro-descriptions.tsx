import { Children, isValidElement } from 'react';

import { Badge } from '@package/ui/badge';
import { cn } from '@package/ui/cn';

import type { ReactNode } from 'react';
import type { ProFieldSchema } from '@package/pro-core/src/form/schema';

export type ProDescriptionsValueType =
  | 'text'
  | 'number'
  | 'badge'
  | 'boolean'
  | 'date'
  | 'code';

export interface ProDescriptionsItemConfig {
  key?: string;
  label: ReactNode;
  dataIndex?: string;
  value?: unknown;
  valueType?: ProDescriptionsValueType;
  span?: number;
  render?: (value: unknown, record: Record<string, unknown>) => ReactNode;
}

export interface ProDescriptionsItemProps {
  label: ReactNode;
  dataIndex?: string;
  value?: unknown;
  valueType?: ProDescriptionsValueType;
  span?: number;
  children?: ReactNode;
  className?: string;
}

/** Presentational item slot for declarative ProDescriptions layout */
export function ProDescriptionsItem(_props: ProDescriptionsItemProps) {
  return null;
}

export interface ProDescriptionsProps {
  title?: ReactNode;
  extra?: ReactNode;
  bordered?: boolean;
  column?: number;
  layout?: 'horizontal' | 'vertical';
  data?: Record<string, unknown>;
  schema?: ProFieldSchema[];
  items?: ProDescriptionsItemConfig[];
  children?: ReactNode;
  className?: string;
}

function renderFormattedValue(value: unknown, valueType?: ProDescriptionsValueType): ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className='text-muted-foreground/60 italic'>-</span>;
  }

  if (valueType === 'boolean' || typeof value === 'boolean') {
    return value ? (
      <Badge variant='outline' className='border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
        Yes
      </Badge>
    ) : (
      <Badge variant='outline' className='text-muted-foreground'>
        No
      </Badge>
    );
  }

  if (valueType === 'badge') {
    return <Badge variant='secondary'>{String(value)}</Badge>;
  }

  if (valueType === 'code') {
    return (
      <code className='rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>
        {String(value)}
      </code>
    );
  }

  if (valueType === 'date' && value instanceof Date) {
    return value.toLocaleDateString();
  }

  return String(value);
}

// Tailwind only generates the classes it can read as literals, so the span is mapped instead of
// assembled from a template string. `sm:col-span-${n}` produced a class that never existed.
const SPAN_CLASS: Record<number, string> = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
};

export function ProDescriptions({
  title,
  extra,
  bordered = true,
  column = 3,
  layout = 'horizontal',
  data = {},
  schema,
  items: directItems,
  children,
  className,
}: ProDescriptionsProps) {
  // Collect item descriptors from schema, items prop, or JSX children
  const resolvedItems: ProDescriptionsItemConfig[] = [];

  if (schema && schema.length > 0) {
    for (const field of schema) {
      resolvedItems.push({
        key: field.name,
        label: field.label,
        dataIndex: field.name,
        value: data[field.name],
        valueType: field.type === 'checkbox' || field.type === 'switch' ? 'boolean' : 'text',
      });
    }
  } else if (directItems && directItems.length > 0) {
    for (const item of directItems) {
      const val = item.dataIndex ? data[item.dataIndex] : item.value;
      resolvedItems.push({
        ...item,
        value: val,
      });
    }
  } else if (children) {
    Children.forEach(children, (child) => {
      if (isValidElement<ProDescriptionsItemProps>(child)) {
        const dataIndex = child.props.dataIndex;
        const val =
          dataIndex && data ? data[dataIndex] : child.props.value !== undefined ? child.props.value : child.props.children;
        resolvedItems.push({
          key: dataIndex,
          label: child.props.label,
          dataIndex,
          value: val,
          valueType: child.props.valueType,
          span: child.props.span,
        });
      }
    });
  }

  const colClass =
    column === 1
      ? 'grid-cols-1'
      : column === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : column === 4
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div
      data-slot='pro-descriptions'
      className={cn('flex flex-col gap-3', className)}
    >
      {(title || extra) && (
        <div className='flex items-center justify-between gap-4'>
          {title && <h4 className='text-base font-semibold text-foreground'>{title}</h4>}
          {extra && <div className='flex items-center gap-2'>{extra}</div>}
        </div>
      )}

      <div
        className={cn(
          'grid gap-px overflow-hidden rounded-xl bg-border text-sm',
          colClass,
          bordered ? 'border border-border' : 'border-0 bg-transparent gap-3',
        )}
      >
        {resolvedItems.map((item, idx) => {
          const rawValue = item.dataIndex ? data[item.dataIndex] : item.value;
          const displayContent = item.render
            ? item.render(rawValue, data)
            : renderFormattedValue(rawValue, item.valueType);

          const spanClass =
            item.span && item.span > 1
              ? (SPAN_CLASS[Math.min(item.span, column)] ?? '')
              : '';

          return (
            <div
              key={item.key ?? idx}
              className={cn(
                'flex bg-card p-3.5',
                layout === 'vertical' ? 'flex-col gap-1' : 'flex-row items-baseline gap-2',
                spanClass,
              )}
            >
              <span className='shrink-0 font-medium text-muted-foreground'>
                {item.label}
                {layout === 'horizontal' && ':'}
              </span>
              <div className='flex-1 text-foreground break-words'>
                {displayContent}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
