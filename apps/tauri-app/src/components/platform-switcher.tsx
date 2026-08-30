/**
 * Platform switcher for the docs sidebar: persists the chosen platform
 * to localStorage and navigates to that platform's docs home on change.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { useRouter } from '@tanstack/react-router';
import { ChevronsUpDownIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@package/ui/src/components/ui/dropdown-menu';

export type Platform = 'react' | 'vue' | 'svelte' | 'react-native';

const PLATFORMS: { value: Platform; label: string; docsPath: string }[] = [
  { value: 'react', label: 'React', docsPath: '/docs' },
  { value: 'vue', label: 'Vue', docsPath: '/docs/platforms/vue' },
  { value: 'svelte', label: 'Svelte', docsPath: '/docs/platforms/svelte' },
  { value: 'react-native', label: 'React Native', docsPath: '/docs/platforms/react-native-web' },
];

const STORAGE_KEY = 'tauri-app-docs-platform';

function readInitialPlatform(): Platform {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PLATFORMS.some((p) => p.value === stored)) return stored as Platform;
  } catch {
    // localStorage unavailable — fall through to the default
  }
  return 'react';
}

interface PlatformContextValue {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatformState] = useState<Platform>(readInitialPlatform);

  const setPlatform = (next: Platform) => {
    setPlatformState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // persistence is best-effort; the in-memory state still updates
    }
  };

  return <PlatformContext.Provider value={{ platform, setPlatform }}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within a PlatformProvider');
  return ctx;
}

export function PlatformSwitcher() {
  const { platform, setPlatform } = usePlatform();
  const router = useRouter();
  const current = PLATFORMS.find((p) => p.value === platform) ?? PLATFORMS[0];

  const selectPlatform = (next: Platform) => {
    if (next === platform) return;
    setPlatform(next);
    const target = PLATFORMS.find((p) => p.value === next);
    if (target) router.history.push(target.docsPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='flex w-full min-w-0 items-center gap-2 rounded-md border border-fd-border bg-fd-secondary/50 px-2.5 py-1.5 text-[0.8125rem] font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring'
        >
          <span className='truncate'>{current.label}</span>
          <ChevronsUpDownIcon className='ms-auto size-3.5 shrink-0' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-44'>
        <DropdownMenuLabel>Platform</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PLATFORMS.map((p) => (
          <DropdownMenuCheckboxItem
            key={p.value}
            checked={p.value === platform}
            onSelect={() => selectPlatform(p.value)}
          >
            {p.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
