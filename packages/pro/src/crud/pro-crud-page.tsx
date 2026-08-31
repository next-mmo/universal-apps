import { useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';

import { ProDataTable } from '../data-table/pro-data-table';
import { ProFormDialog } from '../form/pro-form-dialog';
import { PageContainer } from '../layout/page-container';
import { Button } from '@package/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@package/ui/dialog';

import type { ReactNode } from 'react';
import type { ProFormValues } from '@package/pro-core/form';
import type { ProColumnDef } from '@package/pro-core/table';
import type { ProResourceConfig } from '@package/pro-core/resource';
import type { RowData } from '@tanstack/react-table';

export { defineProResource } from '@package/pro-core/resource';
export type { ProResourceConfig } from '@package/pro-core/resource';

type Awaitable<T> = T | Promise<T>;

export interface ProCrudController<TRow, TValues extends object> {
  rows: TRow[];
  loading?: boolean;
  error?: unknown;
  refresh?: () => Awaitable<unknown>;
  create?: (values: TValues) => Awaitable<unknown>;
  update?: (row: TRow, values: TValues) => Awaitable<unknown>;
  remove?: (row: TRow) => Awaitable<unknown>;
}

export interface ProCrudAction<TRow> {
  label: string;
  destructive?: boolean;
  hidden?: (row: TRow) => boolean;
  disabled?: (row: TRow) => boolean;
  onSelect: (row: TRow) => Awaitable<unknown>;
}

export interface ProCrudPageProps<TRow extends RowData, TValues extends object> {
  resource: ProResourceConfig<TRow, TValues>;
  controller: ProCrudController<TRow, TValues>;
  actions?: Array<ProCrudAction<TRow>>;
  headerActions?: ReactNode;
  toolbar?: ReactNode;
  empty?: ReactNode;
  footer?: ReactNode;
}

type FormState<TRow> = { mode: 'create' } | { mode: 'edit'; row: TRow };
type PendingOperation = 'create' | 'edit' | 'remove' | 'action';

const defaultLabels = {
  create: 'New',
  edit: 'Edit',
  remove: 'Delete',
  removeTitle: 'Delete record?',
  removeDescription: 'This action cannot be undone.',
  cancel: 'Cancel',
  confirmRemove: 'Delete',
};

export function ProCrudPage<TRow extends RowData, TValues extends object>({
  resource,
  controller,
  actions = [],
  headerActions,
  toolbar,
  empty,
  footer,
}: ProCrudPageProps<TRow, TValues>) {
  const labels = { ...defaultLabels, ...resource.labels };
  const [formState, setFormState] = useState<FormState<TRow>>();
  const [removeRow, setRemoveRow] = useState<TRow>();
  const [pending, setPending] = useState<PendingOperation>();
  const [formError, setFormError] = useState<unknown>();
  const [removeError, setRemoveError] = useState<unknown>();
  const [actionError, setActionError] = useState<unknown>();

  const canCreate = resource.form?.create !== undefined && controller.create !== undefined;
  const canEdit = resource.form?.edit !== undefined && controller.update !== undefined;
  const busy = pending !== undefined;

  const columns = useMemo<Array<ProColumnDef<TRow>>>(() => {
    const rowActions: NonNullable<Extract<ProColumnDef<TRow>, { valueType: 'actions' }>['actions']> = actions.map(
      (action) => ({
        ...action,
        disabled: (row) => busy || action.disabled?.(row) === true,
        onSelect: (row) => {
          setPending('action');
          setActionError(undefined);
          void Promise.resolve(action.onSelect(row))
            .catch(setActionError)
            .finally(() => setPending(undefined));
        },
      }),
    );
    if (canEdit) {
      rowActions.push({
        label: labels.edit,
        disabled: busy,
        onSelect: (row) => {
          setFormError(undefined);
          setFormState({ mode: 'edit', row });
        },
      });
    }
    if (controller.remove !== undefined) {
      rowActions.push({
        label: labels.remove,
        destructive: true,
        disabled: busy,
        onSelect: (row) => {
          setRemoveError(undefined);
          setRemoveRow(row);
        },
      });
    }
    return rowActions.length === 0
      ? resource.columns
      : [...resource.columns, { key: '__actions', header: '', valueType: 'actions', actions: rowActions }];
  }, [actions, busy, canEdit, controller.remove, labels.edit, labels.remove, resource.columns]);

  const formMode =
    formState?.mode === 'create' ? resource.form?.create : resource.form?.edit;
  const formValues =
    formState?.mode === 'create'
      ? typeof resource.form?.create?.values === 'function'
        ? resource.form.create.values()
        : resource.form?.create?.values
      : formState?.mode === 'edit'
        ? resource.form?.edit?.values(formState.row)
        : undefined;
  const refresh =
    controller.refresh !== undefined || actionError !== undefined
      ? () => {
          setActionError(undefined);
          void controller.refresh?.();
        }
      : undefined;

  async function submit(values: ProFormValues): Promise<boolean> {
    if (formState === undefined) return false;
    const operation = formState.mode;
    setPending(operation);
    setFormError(undefined);
    try {
      if (formState.mode === 'create') await controller.create?.(values as TValues);
      else await controller.update?.(formState.row, values as TValues);
      setFormState(undefined);
      return true;
    } catch (error) {
      setFormError(error);
      return false;
    } finally {
      setPending(undefined);
    }
  }

  async function confirmRemove(): Promise<void> {
    if (removeRow === undefined || controller.remove === undefined) return;
    setPending('remove');
    setRemoveError(undefined);
    try {
      await controller.remove(removeRow);
      setRemoveRow(undefined);
    } catch (error) {
      setRemoveError(error);
    } finally {
      setPending(undefined);
    }
  }

  return (
    <PageContainer
      title={resource.title}
      description={resource.description}
      breadcrumbs={resource.breadcrumbs}
      extra={headerActions}
      footer={footer}
    >
      <ProDataTable<TRow>
        columns={columns}
        data={controller.rows}
        loading={controller.loading}
        error={actionError ?? controller.error}
        onRetry={refresh}
        getRowId={resource.getRowId}
        features={resource.table?.features}
        searchPlaceholder={resource.table?.searchPlaceholder}
        onRefresh={refresh}
        empty={empty}
        toolbarExtra={
          toolbar !== undefined || canCreate ? (
            <div className='flex items-center gap-2'>
              {toolbar}
              {canCreate && (
                <Button
                  size='sm'
                  disabled={busy}
                  onClick={() => {
                    setFormError(undefined);
                    setFormState({ mode: 'create' });
                  }}
                >
                  <PlusIcon />
                  {labels.create}
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {resource.form !== undefined && formMode !== undefined && formValues !== undefined && (
        <ProFormDialog
          open={formState !== undefined}
          onOpenChange={(open) => {
            if (!open && !busy) setFormState(undefined);
          }}
          title={formMode.title}
          description={formMode.description}
          schema={resource.form.schema}
          defaultValues={formValues as ProFormValues}
          submitLabel={formMode.submitLabel}
          cancelLabel={labels.cancel}
          pending={pending === 'create' || pending === 'edit'}
          submitError={formError}
          onSubmit={submit}
        />
      )}

      <Dialog open={removeRow !== undefined} onOpenChange={(open) => !open && !busy && setRemoveRow(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.removeTitle}</DialogTitle>
            <DialogDescription>{labels.removeDescription}</DialogDescription>
          </DialogHeader>
          {removeError !== undefined && (
            <p className='text-sm font-medium text-destructive' role='alert'>
              {removeError instanceof Error ? removeError.message : String(removeError)}
            </p>
          )}
          <DialogFooter>
            <Button variant='outline' disabled={busy} onClick={() => setRemoveRow(undefined)}>
              {labels.cancel}
            </Button>
            <Button variant='destructive' disabled={busy} onClick={() => void confirmRemove()}>
              {pending === 'remove' ? 'Deleting…' : labels.confirmRemove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
