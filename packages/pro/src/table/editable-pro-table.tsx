import { useState, useMemo } from 'react';
import { Button } from '@package/ui/button';
import { Input } from '@package/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@package/ui/table';
import { Badge } from '@package/ui/badge';
import { Skeleton } from '@package/ui/skeleton';

import type { ReactNode } from 'react';
import type { ProColumnDef } from '@package/pro-core/table';

export interface EditableConfig<T> {
  editableKeys?: string[];
  onChange?: (keys: string[]) => void;
  onSave?: (row: T, originalRow: T, index: number) => Promise<void> | void;
  onDelete?: (row: T, index: number) => Promise<void> | void;
  actionRender?: (
    row: T,
    config: {
      isEditing: boolean;
      save: () => Promise<void>;
      cancel: () => void;
      deleteRow: () => Promise<void>;
    },
  ) => ReactNode;
}

export interface RecordCreatorProps<T> {
  position?: 'top' | 'bottom';
  creatorButtonText?: string;
  record: () => Partial<T>;
  onAdd?: (record: T) => void;
}

export interface EditableProTableProps<T extends Record<string, any>> {
  columns: Array<ProColumnDef<T>>;
  value: T[];
  onChange?: (value: T[]) => void;
  editable?: EditableConfig<T>;
  recordCreatorProps?: RecordCreatorProps<T> | false;
  getRowId?: (row: T, index: number) => string;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
}

/**
 * EditableProTable: Inline row editing, creation, and deletion matching Ant Design Pro parity.
 * Supports single and multiple editable rows, asynchronous persistence, and typed cell editors.
 */
export function EditableProTable<T extends Record<string, any>>({
  columns,
  value = [],
  onChange,
  editable = {},
  recordCreatorProps,
  getRowId = (row, index) => String(row.id ?? index),
  loading = false,
  empty,
  className = '',
}: EditableProTableProps<T>) {
  const [internalKeys, setInternalKeys] = useState<string[]>([]);
  const [editingDrafts, setEditingDrafts] = useState<Map<string, T>>(new Map());
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());

  const activeKeys = editable.editableKeys ?? internalKeys;
  const setActiveKeys = (keys: string[]) => {
    if (editable.onChange) {
      editable.onChange(keys);
    } else {
      setInternalKeys(keys);
    }
  };

  const startEditing = (row: T, rowKey: string) => {
    setEditingDrafts((prev) => new Map(prev).set(rowKey, { ...row }));
    if (!activeKeys.includes(rowKey)) {
      setActiveKeys([...activeKeys, rowKey]);
    }
  };

  const cancelEditing = (rowKey: string) => {
    setEditingDrafts((prev) => {
      const next = new Map(prev);
      next.delete(rowKey);
      return next;
    });
    setActiveKeys(activeKeys.filter((k) => k !== rowKey));
  };

  const updateDraftField = (rowKey: string, field: string, val: any) => {
    setEditingDrafts((prev) => {
      const draft = prev.get(rowKey);
      if (!draft) return prev;
      const next = new Map(prev);
      next.set(rowKey, { ...draft, [field]: val });
      return next;
    });
  };

  const saveRow = async (rowKey: string, index: number) => {
    const draft = editingDrafts.get(rowKey);
    const original = value[index];
    if (!draft || !original) return;

    setSavingKeys((prev) => new Set(prev).add(rowKey));
    try {
      if (editable.onSave) {
        await editable.onSave(draft, original, index);
      }
      const nextValue = [...value];
      nextValue[index] = draft;
      onChange?.(nextValue);
      cancelEditing(rowKey);
    } finally {
      setSavingKeys((prev) => {
        const next = new Set(prev);
        next.delete(rowKey);
        return next;
      });
    }
  };

  const deleteRow = async (row: T, index: number, rowKey: string) => {
    if (editable.onDelete) {
      await editable.onDelete(row, index);
    }
    const nextValue = value.filter((_, i) => i !== index);
    onChange?.(nextValue);
    cancelEditing(rowKey);
  };

  const addRecord = () => {
    if (!recordCreatorProps || !recordCreatorProps.record) return;
    const newRecord = recordCreatorProps.record() as T;
    const newRowKey = getRowId(newRecord, value.length);
    const position = recordCreatorProps.position ?? 'bottom';

    const nextValue = position === 'top' ? [newRecord, ...value] : [...value, newRecord];
    onChange?.(nextValue);
    recordCreatorProps.onAdd?.(newRecord);
    startEditing(newRecord, newRowKey);
  };

  // Render cell content based on valueType and editing state
  const renderCell = (col: ProColumnDef<T>, row: T, rowKey: string, isEditing: boolean) => {
    const field = col.key as string;
    const draft = editingDrafts.get(rowKey) ?? row;
    const cellValue = isEditing ? draft[field] : row[field];

    if (isEditing) {
      if (col.valueType === 'number') {
        return (
          <Input
            type='number'
            className='h-8 w-full text-xs'
            value={cellValue ?? ''}
            onChange={(e) => updateDraftField(rowKey, field, e.target.value === '' ? '' : Number(e.target.value))}
          />
        );
      }
      if (col.valueType === 'date') {
        return (
          <Input
            type='date'
            className='h-8 w-full text-xs'
            value={typeof cellValue === 'string' ? cellValue.split('T')[0] : ''}
            onChange={(e) => updateDraftField(rowKey, field, e.target.value)}
          />
        );
      }
      return (
        <Input
          className='h-8 w-full text-xs'
          value={cellValue ?? ''}
          onChange={(e) => updateDraftField(rowKey, field, e.target.value)}
        />
      );
    }

    // Read-only display
    if (cellValue === undefined || cellValue === null || cellValue === '') {
      return <span className='text-muted-foreground'>—</span>;
    }
    if (col.valueType === 'badge') {
      return <Badge variant='secondary'>{String(cellValue)}</Badge>;
    }
    if (col.valueType === 'status') {
      return <Badge variant={row.done ? 'outline' : 'secondary'}>{String(cellValue)}</Badge>;
    }
    if (col.valueType === 'date') {
      const d = new Date(cellValue);
      return Number.isNaN(d.getTime()) ? String(cellValue) : d.toLocaleDateString();
    }
    return String(cellValue);
  };

  const creatorButton = recordCreatorProps !== false && recordCreatorProps?.record && (
    <Button
      variant='outline'
      size='sm'
      onClick={addRecord}
      className='w-full border-dashed border-border py-2 text-xs text-muted-foreground hover:text-foreground'
    >
      + {recordCreatorProps.creatorButtonText ?? 'Add new row'}
    </Button>
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {recordCreatorProps && recordCreatorProps.position === 'top' && creatorButton}

      <div className='rounded-xl border border-border bg-card shadow-sm overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/40'>
              {columns.map((col) => (
                <TableHead key={String(col.key)} className='text-xs font-semibold text-muted-foreground'>
                  {col.header}
                </TableHead>
              ))}
              <TableHead className='w-[140px] text-right text-xs font-semibold text-muted-foreground'>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((c) => (
                    <TableCell key={String(c.key)}>
                      <Skeleton className='h-4 w-full' />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton className='h-4 w-16 ml-auto' />
                  </TableCell>
                </TableRow>
              ))
            ) : value.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className='h-24 text-center text-sm text-muted-foreground'>
                  {empty ?? 'No records available'}
                </TableCell>
              </TableRow>
            ) : (
              value.map((row, index) => {
                const rowKey = getRowId(row, index);
                const isEditing = activeKeys.includes(rowKey);
                const isSaving = savingKeys.has(rowKey);

                return (
                  <TableRow key={rowKey} className={isEditing ? 'bg-muted/30' : ''}>
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className='py-2.5 text-sm text-foreground'>
                        {renderCell(col, row, rowKey, isEditing)}
                      </TableCell>
                    ))}

                    <TableCell className='py-2.5 text-right'>
                      {editable.actionRender ? (
                        editable.actionRender(row, {
                          isEditing,
                          save: () => saveRow(rowKey, index),
                          cancel: () => cancelEditing(rowKey),
                          deleteRow: () => deleteRow(row, index, rowKey),
                        })
                      ) : isEditing ? (
                        <div className='flex items-center justify-end gap-1.5'>
                          <Button
                            variant='default'
                            size='sm'
                            disabled={isSaving}
                            onClick={() => void saveRow(rowKey, index)}
                            className='h-7 px-2.5 text-xs'
                          >
                            Save
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            disabled={isSaving}
                            onClick={() => cancelEditing(rowKey)}
                            className='h-7 px-2.5 text-xs'
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center justify-end gap-1.5'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => startEditing(row, rowKey)}
                            className='h-7 px-2 text-xs text-primary hover:text-primary/80'
                          >
                            Edit
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => void deleteRow(row, index, rowKey)}
                            className='h-7 px-2 text-xs text-destructive hover:text-destructive/80'
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {(!recordCreatorProps || recordCreatorProps.position !== 'top') && creatorButton}
    </div>
  );
}
