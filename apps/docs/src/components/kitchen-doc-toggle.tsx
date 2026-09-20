import { useNavigate, useRouterState } from '@tanstack/react-router';
import { cn } from '@package/ui/cn';

export function KitchenDocToggle({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isDocs = pathname.startsWith('/docs');

  return (
    <div
      role='tablist'
      aria-label='Section switcher'
      className={cn(
        'inline-flex h-8 items-center rounded-lg bg-muted p-1 text-muted-foreground',
        className,
      )}
    >
      <button
        type='button'
        role='tab'
        aria-selected={!isDocs}
        onClick={() => {
          if (isDocs) {
            navigate({ to: '/' });
          }
        }}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-all outline-none cursor-pointer',
          !isDocs
            ? 'bg-background text-foreground shadow-xs font-semibold'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Kitchen
      </button>
      <button
        type='button'
        role='tab'
        aria-selected={isDocs}
        onClick={() => {
          if (!isDocs) {
            navigate({ to: '/docs' });
          }
        }}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-all outline-none cursor-pointer',
          isDocs
            ? 'bg-background text-foreground shadow-xs font-semibold'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Docs
      </button>
    </div>
  );
}
