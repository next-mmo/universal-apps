import type { ComponentType, LazyExoticComponent } from 'react';
import { lazy, Suspense } from 'react';
import { useParams } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage as FumaDocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';

import { FrameworkPreview, resolvePreviewComponent } from '../components/framework-preview';
import { PlatformProvider, PlatformSwitcher } from '../components/platform-switcher';
import { source } from '../lib/source';

type MdxData = {
  title: string;
  description?: string;
  load: () => Promise<{
    body: ComponentType<{ components?: unknown }>;
    toc: TOCItemType[];
  }>;
};

type MdxPage = {
  path: string;
  data: MdxData;
};

const mdxComponents = {
  ...defaultMdxComponents,
  AccordionDemo: lazy(() => import('../demos/accordion').then((module) => ({ default: module.AccordionDemo }))),
  PageContainerDemo: lazy(() => import('../components/blocks-demos').then((module) => ({ default: module.PageContainerDemo }))),
  ProDataTableDemo: lazy(() => import('../components/blocks-demos').then((module) => ({ default: module.ProDataTableDemo }))),
  ProFormDemo: lazy(() => import('../components/blocks-demos').then((module) => ({ default: module.ProFormDemo }))),
  ProFormDialogDemo: lazy(() => import('../components/blocks-demos').then((module) => ({ default: module.ProFormDialogDemo }))),
  BadgeDemo: lazy(() => import('../demos/badge').then((module) => ({ default: module.BadgeDemo }))),
  ButtonDemo: lazy(() => import('../demos/button').then((module) => ({ default: module.ButtonDemo }))),
  CardDemo: lazy(() => import('../demos/card').then((module) => ({ default: module.CardDemo }))),
  CheckboxDemo: lazy(() => import('../demos/checkbox').then((module) => ({ default: module.CheckboxDemo }))),
  DialogDemo: lazy(() => import('../demos/dialog').then((module) => ({ default: module.DialogDemo }))),
  DropdownMenuDemo: lazy(() => import('../demos/dropdown-menu').then((module) => ({ default: module.DropdownMenuDemo }))),
  InputDemo: lazy(() => import('../demos/input').then((module) => ({ default: module.InputDemo }))),
  LabelDemo: lazy(() => import('../demos/label').then((module) => ({ default: module.LabelDemo }))),
  PopoverDemo: lazy(() => import('../demos/popover').then((module) => ({ default: module.PopoverDemo }))),
  SelectDemo: lazy(() => import('../demos/select').then((module) => ({ default: module.SelectDemo }))),
  SeparatorDemo: lazy(() => import('../demos/separator').then((module) => ({ default: module.SeparatorDemo }))),
  SkeletonDemo: lazy(() => import('../demos/skeleton').then((module) => ({ default: module.SkeletonDemo }))),
  SwitchDemo: lazy(() => import('../demos/switch').then((module) => ({ default: module.SwitchDemo }))),
  TableDemo: lazy(() => import('../demos/table').then((module) => ({ default: module.TableDemo }))),
  TabsDemo: lazy(() => import('../demos/tabs').then((module) => ({ default: module.TabsDemo }))),
  TextareaDemo: lazy(() => import('../demos/textarea').then((module) => ({ default: module.TextareaDemo }))),
  TooltipDemo: lazy(() => import('../demos/tooltip').then((module) => ({ default: module.TooltipDemo }))),
};

const pageComponents = new Map<string, LazyExoticComponent<ComponentType>>();

function getPageComponent(page: MdxPage): LazyExoticComponent<ComponentType> {
  const cached = pageComponents.get(page.path);
  if (cached) return cached;

  const component = lazy(async () => {
    const { body: Body, toc } = await page.data.load();
    return {
      default: function LoadedMdxPage() {
        const markdownUrl = `/docs/${page.path.replace(/\.mdx?$/, '')}.md`;
        const previewComponent = resolvePreviewComponent(page.path);
        return (
          <FumaDocsPage toc={toc}>
            <div className='flex flex-row items-center gap-2 border-b pb-2'>
              <DocsTitle className='flex-1'>{page.data.title}</DocsTitle>
              <MarkdownCopyButton markdownUrl={markdownUrl} />
              <ViewOptionsPopover markdownUrl={markdownUrl} />
            </div>
            {page.data.description ? <DocsDescription>{page.data.description}</DocsDescription> : null}
            {previewComponent ? <FrameworkPreview componentId={previewComponent} /> : null}
            <DocsBody>
              <Body components={mdxComponents} />
            </DocsBody>
          </FumaDocsPage>
        );
      },
    };
  });
  pageComponents.set(page.path, component);
  return component;
}

export default function DocsRoute() {
  const params = useParams({ strict: false });
  const slugs = params._splat?.split('/') ?? [];
  const found = source.getPage(slugs);

  if (!found) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-2 p-16'>
        <h1 className='text-2xl font-semibold'>Page not found</h1>
        <p className='text-fd-muted-foreground'>No documentation page at /docs/{params._splat ?? ''}</p>
      </div>
    );
  }

  const page = found as unknown as MdxPage;
  const PageContent = getPageComponent(page);

  return (
    <RootProvider search={{ enabled: false }}>
      <PlatformProvider>
        <DocsLayout
          tree={source.getPageTree()}
          nav={{ enabled: false }}
          containerProps={{ style: { minHeight: 'calc(100vh - var(--app-header-height, 3.5rem))' } }}
          sidebar={{ banner: <PlatformSwitcher /> }}
        >
          <Suspense
            fallback={
              <div role='status' className='flex min-h-64 items-center justify-center text-sm text-fd-muted-foreground'>
                Loading documentation…
              </div>
            }
          >
            <PageContent />
          </Suspense>
        </DocsLayout>
      </PlatformProvider>
    </RootProvider>
  );
}
