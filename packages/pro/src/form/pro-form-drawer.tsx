import { useState } from 'react';

import { ProForm } from './pro-form';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@package/ui/drawer';

import type { ReactNode } from 'react';
import type { ProFormGroup, ProFormValues } from '@package/pro-core/form';

export interface ProFormDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
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

/**
 * Slide-over drawer form wrapper around ProForm for fast create/edit flows.
 * Provides Ant Design Pro DrawerForm parity with zero runtime styling overhead.
 */
export function ProFormDrawer({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  title,
  description,
  schema,
  defaultValues,
  submitLabel,
  cancelLabel,
  pending,
  submitError,
  onSubmit,
}: ProFormDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (isControlled) controlledOnOpenChange?.(next);
    else setInternalOpen(next);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className='sm:max-w-md'>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description !== undefined && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        {open && (
          <div className='p-4 pt-0'>
            <ProForm
              key={JSON.stringify(defaultValues)}
              schema={schema}
              defaultValues={defaultValues}
              submitLabel={submitLabel}
              cancelLabel={cancelLabel}
              pending={pending}
              submitError={submitError}
              onCancel={() => setOpen(false)}
              onSubmit={async (values) => {
                const result = await onSubmit(values);
                if (result !== false) setOpen(false);
              }}
            />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
