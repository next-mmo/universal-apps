import { useState } from 'react';
import { CheckIcon } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@package/ui/card';
import { cn } from '@package/ui/cn';
import { ProForm } from './pro-form';

import type { ProFormGroup, ProFormValues } from '@package/pro-core/form';

export interface ProStepItem {
  title: string;
  description?: string;
  schema: ProFormGroup[];
  onStepSubmit?: (stepValues: ProFormValues) => Promise<boolean | void> | boolean | void;
}

export interface ProStepFormProps {
  steps: ProStepItem[];
  defaultValues?: ProFormValues;
  current?: number;
  onCurrentChange?: (current: number) => void;
  onSubmit: (values: ProFormValues) => Promise<boolean | void> | boolean | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  nextLabel?: string;
  prevLabel?: string;
  pending?: boolean;
  className?: string;
}

/**
 * Multi-step wizard form component with step validation, progress indicators,
 * and unified state preservation across steps.
 * Provides Ant Design Pro StepsForm parity with zero runtime styling overhead.
 */
export function ProStepForm({
  steps,
  defaultValues = {},
  current: controlledCurrent,
  onCurrentChange,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  nextLabel = 'Next Step →',
  prevLabel = '← Previous',
  pending = false,
  className,
}: ProStepFormProps) {
  const [internalCurrent, setInternalCurrent] = useState(0);
  const [accumulatedValues, setAccumulatedValues] = useState<ProFormValues>(defaultValues);
  const [stepPending, setStepPending] = useState(false);

  const isControlled = controlledCurrent !== undefined;
  const current = isControlled ? controlledCurrent : internalCurrent;

  const setCurrent = (index: number) => {
    if (isControlled) onCurrentChange?.(index);
    else setInternalCurrent(index);
  };

  const activeStep = steps[current] ?? steps[0];
  const isLastStep = current === steps.length - 1;
  const isFirstStep = current === 0;

  const handleStepSubmit = async (stepValues: ProFormValues) => {
    const nextValues = { ...accumulatedValues, ...stepValues };
    setAccumulatedValues(nextValues);

    if (activeStep.onStepSubmit) {
      setStepPending(true);
      try {
        const canProceed = await activeStep.onStepSubmit(stepValues);
        if (canProceed === false) return;
      } finally {
        setStepPending(false);
      }
    }

    if (isLastStep) {
      await onSubmit(nextValues);
    } else {
      setCurrent(current + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) setCurrent(current - 1);
  };

  return (
    <Card className={cn('w-full', className)}>
      {/* Step Indicators Header */}
      <CardHeader className='border-b border-border/60 pb-6'>
        <nav aria-label='Progress'>
          <ol className='flex items-center justify-between gap-2 overflow-x-auto sm:gap-4'>
            {steps.map((step, idx) => {
              const isCompleted = idx < current;
              const isCurrent = idx === current;

              return (
                <li key={step.title} className='flex flex-1 items-center gap-3'>
                  <div className='flex items-center gap-3'>
                    <div
                      data-slot='step-indicator'
                      aria-current={isCurrent ? 'step' : undefined}
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                        isCompleted && 'bg-primary text-primary-foreground',
                        isCurrent && 'border-2 border-primary bg-primary/10 text-primary font-bold',
                        !isCompleted && !isCurrent && 'border border-border bg-muted text-muted-foreground',
                      )}
                    >
                      {isCompleted ? <CheckIcon className='size-4' /> : idx + 1}
                    </div>
                    <div className='flex flex-col'>
                      <span
                        className={cn(
                          'text-xs font-semibold sm:text-sm',
                          isCurrent ? 'text-foreground font-bold' : 'text-muted-foreground',
                        )}
                      >
                        {step.title}
                      </span>
                      {step.description && (
                        <span className='hidden text-xs text-muted-foreground sm:inline-block'>
                          {step.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      aria-hidden='true'
                      className={cn(
                        'h-0.5 flex-1 min-w-4 transition-colors',
                        idx < current ? 'bg-primary' : 'bg-border/60',
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </CardHeader>

      {/* Active Step Form */}
      <CardContent className='pt-6'>
        <ProForm
          key={`step-${current}`}
          schema={activeStep.schema}
          defaultValues={accumulatedValues}
          submitLabel={isLastStep ? submitLabel : nextLabel}
          cancelLabel={!isFirstStep ? prevLabel : cancelLabel}
          pending={pending || stepPending}
          onCancel={!isFirstStep ? handlePrev : onCancel}
          onSubmit={handleStepSubmit}
        />
      </CardContent>
    </Card>
  );
}
