import { ProForm } from './pro-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@package/ui/src/components/ui/dialog';

import type { ProFormGroup, ProFormValues } from '@package/pro-core/src/form/schema';

export interface ProFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  schema: Array<ProFormGroup>;
  /** Key this by the edited record so defaults reset between opens. */
  defaultValues: ProFormValues;
  submitLabel?: string;
  pending?: boolean;
  onSubmit: (values: ProFormValues) => Promise<void> | void;
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
  pending,
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
            pending={pending}
            onCancel={() => onOpenChange(false)}
            onSubmit={async (values) => {
              await onSubmit(values);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
