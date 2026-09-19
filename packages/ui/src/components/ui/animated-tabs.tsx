import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '../../lib/cn';

export const AnimatedTabs = TabsPrimitive.Root;

export function AnimatedTabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const [indicatorStyle, setIndicatorStyle] = React.useState<{
    left: number;
    width: number;
    ready: boolean;
  }>({
    left: 0,
    width: 0,
    ready: false,
  });
  const listRef = React.useRef<HTMLDivElement>(null);

  const updateIndicator = React.useCallback(() => {
    if (!listRef.current) return;
    const activeTab = listRef.current.querySelector<HTMLElement>('[data-state="active"]');
    if (activeTab) {
      const listRect = listRef.current.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
        ready: true,
      });
    }
  }, []);

  React.useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  React.useEffect(() => {
    if (!listRef.current) return;
    const observer = new MutationObserver(updateIndicator);
    observer.observe(listRef.current, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-state'],
    });
    return () => observer.disconnect();
  }, [updateIndicator]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      className={cn(
        'relative inline-flex h-10 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    >
      {indicatorStyle.ready && (
        <span
          className='pointer-events-none absolute left-0 h-[calc(100%-8px)] rounded-lg bg-card shadow-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
}

export function AnimatedTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export const AnimatedTabsContent = TabsPrimitive.Content;
