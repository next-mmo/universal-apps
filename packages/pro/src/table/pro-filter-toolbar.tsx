import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, RotateCcwIcon, SearchIcon } from 'lucide-react';

import { Button } from '@package/ui/button';
import { cn } from '@package/ui/cn';
import { DatePicker } from '@package/ui/date-picker';
import { Input } from '@package/ui/input';
import { Label } from '@package/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui/select';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date';
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: unknown;
}

export interface ProFilterToolbarProps {
  fields: FilterField[];
  values?: Record<string, unknown>;
  /**
   * Receives every edit. Supplying it together with `values` makes the toolbar controlled; without
   * it the toolbar owns its state and `values` is only the starting point.
   */
  onValuesChange?: (values: Record<string, unknown>) => void;
  onFilter: (filters: Record<string, unknown>) => void;
  onReset?: () => void;
  collapseThreshold?: number;
  searchLabel?: string;
  resetLabel?: string;
  className?: string;
}

/** A `date` field may be fed from a query string or a form, so the value is narrowed here. */
const asDate = (value: unknown): Date | undefined => (value instanceof Date ? value : undefined);

/**
 * Collapsible search and filter toolbar for ProDataTable and resource views.
 * Matches Ant Design Pro QueryFilter workflow with zero runtime CSS overhead.
 */
export function ProFilterToolbar({
  fields,
  values: controlledValues,
  onValuesChange,
  onFilter,
  onReset,
  collapseThreshold = 3,
  searchLabel = 'Search',
  resetLabel = 'Reset',
  className,
}: ProFilterToolbarProps) {
  const initialValues = () => {
    const acc: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.defaultValue !== undefined) acc[f.name] = f.defaultValue;
    }
    return acc;
  };

  // Edits can only be controlled when the caller can also write them back. With `values` alone the
  // toolbar owns the state and starts from the supplied map, instead of ignoring every keystroke.
  const valuesControlled = controlledValues !== undefined && onValuesChange !== undefined;
  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(() => ({
    ...initialValues(),
    ...(controlledValues ?? {}),
  }));
  const [collapsed, setCollapsed] = useState(true);

  const values = valuesControlled ? controlledValues! : internalValues;

  const setValue = (name: string, val: unknown) => {
    const next = { ...values, [name]: val };
    if (valuesControlled) onValuesChange!(next);
    else setInternalValues(next);
  };

  const handleSearch = () => {
    onFilter(values);
  };

  const handleReset = () => {
    const fresh = initialValues();
    setInternalValues(fresh);
    if (valuesControlled) onValuesChange!(fresh);
    onReset?.();
    onFilter(fresh);
  };

  const shouldShowCollapse = fields.length > collapseThreshold;
  const visibleFields = shouldShowCollapse && collapsed ? fields.slice(0, collapseThreshold) : fields;

  return (
    <div
      data-slot='pro-filter-toolbar'
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 text-card-foreground shadow-xs',
        className,
      )}
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-end'>
        {visibleFields.map((field) => (
          <div key={field.name} className='flex flex-col gap-1.5'>
            <Label htmlFor={`filter-${field.name}`} className='text-xs font-medium text-muted-foreground'>
              {field.label}
            </Label>

            {field.type === 'text' && (
              <Input
                id={`filter-${field.name}`}
                value={String(values[field.name] ?? '')}
                onChange={(e) => setValue(field.name, e.target.value)}
                placeholder={field.placeholder ?? `Filter by ${field.label.toLowerCase()}...`}
                className='h-9 text-sm'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
            )}

            {field.type === 'select' && (
              <Select
                value={String(values[field.name] ?? '')}
                onValueChange={(val) => setValue(field.name, val)}
              >
                <SelectTrigger id={`filter-${field.name}`} className='h-9 text-sm'>
                  <SelectValue placeholder={field.placeholder ?? 'Select option...'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === 'date' && (
              <DatePicker
                id={`filter-${field.name}`}
                value={asDate(values[field.name])}
                onValueChange={(date) => setValue(field.name, date)}
                placeholder={field.placeholder ?? 'Pick date...'}
                className='h-9'
              />
            )}
          </div>
        ))}

        {/* Action Controls */}
        <div className='flex items-center gap-2 pt-2 sm:pt-0'>
          <Button size='sm' onClick={handleSearch} className='gap-1.5'>
            <SearchIcon className='size-3.5' />
            {searchLabel}
          </Button>

          <Button size='sm' variant='outline' onClick={handleReset} className='gap-1.5'>
            <RotateCcwIcon className='size-3.5' />
            {resetLabel}
          </Button>

          {shouldShowCollapse && (
            <Button
              size='sm'
              variant='ghost'
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
              className='gap-1 text-xs text-muted-foreground hover:text-foreground'
            >
              {collapsed ? (
                <>
                  More <ChevronDownIcon className='size-3.5' />
                </>
              ) : (
                <>
                  Collapse <ChevronUpIcon className='size-3.5' />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
