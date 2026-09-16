import { Link } from '@tanstack/react-router';
import { KitchenDocToggle } from './kitchen-doc-toggle';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  return (
    <header
      data-slot='app-header'
      className='sticky top-0 z-40 flex h-[var(--app-header-height,3.5rem)] w-full shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-[var(--sidebar)] px-4 backdrop-blur-2xl md:px-6'
    >
      <div className='flex items-center gap-4'>
        <Link to='/' className='text-[15px] font-semibold text-foreground hover:opacity-90 transition-opacity'>
          Universal Todos
        </Link>
        <KitchenDocToggle />
      </div>
      <div className='flex items-center gap-2'>
        <ThemeToggle />
      </div>
    </header>
  );
}
