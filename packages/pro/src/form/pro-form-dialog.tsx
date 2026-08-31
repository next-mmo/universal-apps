import { ProForm } from './pro-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@package/ui/dialog';

import type { ProFormGroup, ProFormValues } from '@package/pro-core/form';

export interface ProFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  schema: Array<ProFormGroup>;
  /** Key this by the edited record so defaults reset between opens. */
  defaultValues: ProFormValues;
  submitLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  submitError?: unknown;
  onSubmit: (values: ProFormValues) => Promise<boolean | void> | boolean | void;
}

/** Dialog wrapper around ProForm for create/edit flows. */
export function ProFormDialog({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  submitLabel,
  cancelLabel,
  pending,
  submitError,
  onSubmit,
}: ProFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description !== undefined && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {open && (
          <ProForm
            key={JSON.stringify(defaultValues)}
            schema={schema}
            defaultValues={defaultValues}
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            pending={pending}
            submitError={submitError}
            onCancel={() => onOpenChange(false)}
            onSubmit={async (values) => {
              const result = await onSubmit(values);
              if (result !== false) onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
