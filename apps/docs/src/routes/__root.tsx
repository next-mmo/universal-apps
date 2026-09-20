import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { useState } from 'react';

import { AppHeader } from '../components/app-header';
import { Toaster } from '@package/ui/toast';
import { TooltipProvider } from '@package/ui/tooltip';
import '../index.css';

function RootDocument() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='theme-color' content='#f7f7f8' />
        <link rel='icon' type='image/svg+xml' href='/vite.svg' />
        <title>Tauri Universal — Kitchen and UI documentation</title>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className='flex min-h-screen flex-col bg-background text-foreground'>
              <AppHeader />
              <div className='flex min-h-0 flex-1 flex-col'>
                <Outlet />
              </div>
              <Toaster position='bottom-right' />
            </div>
          </TooltipProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  component: RootDocument,
});
