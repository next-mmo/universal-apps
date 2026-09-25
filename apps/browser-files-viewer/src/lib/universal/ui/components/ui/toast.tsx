import { CheckCircle2Icon, AlertCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  action?: ToastAction;
  duration?: number;
}

type ToastSubscriber = (toasts: ToastData[]) => void;

class ToastStore {
  private toasts: ToastData[] = [];
  private subscribers = new Set<ToastSubscriber>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  subscribe = (sub: ToastSubscriber) => {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  };

  getSnapshot = () => this.toasts;

  private notify() {
    this.toasts = [...this.toasts];
    for (const sub of this.subscribers) sub(this.toasts);
  }

  show(title: string, options: Omit<ToastData, 'id' | 'title'> = {}) {
    const id = Math.random().toString(36).slice(2, 9);
    const duration = options.duration ?? 4000;
    const toastItem: ToastData = { id, title, ...options };

    this.toasts.push(toastItem);
    this.notify();

    if (duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timers.set(id, timer);
    }
    return id;
  }

  dismiss = (id?: string) => {
    if (!id) {
      for (const timer of this.timers.values()) clearTimeout(timer);
      this.timers.clear();
      this.toasts = [];
    } else {
      const timer = this.timers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(id);
      }
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }
    this.notify();
  };
}

export const toastStore = new ToastStore();

export function toast(title: string, options?: Omit<ToastData, 'id' | 'title'>) {
  return toastStore.show(title, options);
}

toast.success = (title: string, options?: Omit<ToastData, 'id' | 'title' | 'variant'>) =>
  toastStore.show(title, { ...options, variant: 'success' });

toast.error = (title: string, options?: Omit<ToastData, 'id' | 'title' | 'variant'>) =>
  toastStore.show(title, { ...options, variant: 'error' });

toast.warning = (title: string, options?: Omit<ToastData, 'id' | 'title' | 'variant'>) =>
  toastStore.show(title, { ...options, variant: 'warning' });

toast.info = (title: string, options?: Omit<ToastData, 'id' | 'title' | 'variant'>) =>
  toastStore.show(title, { ...options, variant: 'info' });

toast.dismiss = (id?: string) => toastStore.dismiss(id);

export interface ToasterProps {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  className?: string;
}

const positionClasses: Record<NonNullable<ToasterProps['position']>, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-left': 'bottom-4 left-4 items-start',
};

const EMPTY_TOASTS: ToastData[] = [];
const getEmptySnapshot = () => EMPTY_TOASTS;

export function Toaster({ position = 'bottom-right', className }: ToasterProps) {
  const toasts = React.useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    // Must be a stable reference: useSyncExternalStore compares snapshots, so returning a fresh
    // array here loops during server rendering and hydration.
    getEmptySnapshot,
  );

  if (toasts.length === 0) return null;

  return (
    <div
      data-slot='toaster'
      className={cn(
        'pointer-events-none fixed z-50 flex w-full max-w-sm flex-col gap-2 p-2 sm:p-0',
        positionClasses[position],
        className,
      )}
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          data-slot='toast'
          data-variant={item.variant ?? 'default'}
          // A toast is transient, so it needs a live region to be announced at all. Errors
          // interrupt; everything else waits for a pause in speech.
          role={item.variant === 'error' ? 'alert' : 'status'}
          aria-live={item.variant === 'error' ? 'assertive' : 'polite'}
          className={cn(
            'pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in-0',
            item.variant === 'error' && 'border-destructive/40 bg-destructive/5 text-destructive',
            item.variant === 'success' && 'border-green/40 bg-green/5 text-foreground',
            item.variant === 'warning' && 'border-orange/40 bg-orange/5 text-foreground',
          )}
        >
          {item.variant === 'success' && <CheckCircle2Icon className='mt-0.5 size-5 shrink-0 text-green' />}
          {item.variant === 'error' && <AlertCircleIcon className='mt-0.5 size-5 shrink-0 text-destructive' />}
          {item.variant === 'warning' && <AlertTriangleIcon className='mt-0.5 size-5 shrink-0 text-orange' />}
          {item.variant === 'info' && <InfoIcon className='mt-0.5 size-5 shrink-0 text-primary' />}

          <div className='flex-1 gap-1'>
            <div className='text-sm font-medium leading-none'>{item.title}</div>
            {item.description && (
              <div className='mt-1 text-xs text-muted-foreground'>{item.description}</div>
            )}
          </div>

          {item.action && (
            <button
              type='button'
              onClick={() => {
                item.action?.onClick();
                toast.dismiss(item.id);
              }}
              className='ml-auto shrink-0 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80'
            >
              {item.action.label}
            </button>
          )}

          <button
            type='button'
            onClick={() => toast.dismiss(item.id)}
            className='shrink-0 rounded-xs opacity-70 transition-opacity hover:opacity-100'
          >
            <XIcon className='size-4' />
            <span className='sr-only'>Close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
