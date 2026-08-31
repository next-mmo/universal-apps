import type { ReactNode } from 'react';

export interface PageContainerProps {
  title: string;
  description?: string;
  breadcrumbs?: string[];
  /** Right-aligned action buttons. */
  extra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** PageContainer-style wrapper: breadcrumb trail, title block, actions, body. */
export function PageContainer({
  title,
  description,
  breadcrumbs = [],
  extra,
  footer,
  children,
}: PageContainerProps) {
  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          {breadcrumbs.length > 0 && (
            <nav aria-label='Breadcrumb' className='text-xs text-muted-foreground'>
              {breadcrumbs.join(' / ')}
            </nav>
          )}
          <h1 className='text-2xl font-bold tracking-[-0.02em]'>{title}</h1>
          {description !== undefined && (
            <p className='text-sm text-muted-foreground'>{description}</p>
          )}
        </div>
        {extra !== undefined && <div className='flex items-center gap-2'>{extra}</div>}
      </div>

      <div className='flex flex-col gap-6'>{children}</div>

      {footer !== undefined && (
        <footer className='border-t pt-4 text-xs text-muted-foreground'>{footer}</footer>
      )}
    </div>
  );
}
