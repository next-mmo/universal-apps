import type { ComponentType } from 'react';
import { useParams } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { AccordionDemo } from '../components/accordion-demo';
import {
  PageContainerDemo,
  ProDataTableDemo,
  ProFormDemo,
  ProFormDialogDemo,
} from '../components/blocks-demos';
import {
  BadgeDemo,
  ButtonDemo,
  CardDemo,
  CheckboxDemo,
  DialogDemo,
  DropdownMenuDemo,
  InputDemo,
  LabelDemo,
  PopoverDemo,
  SelectDemo,
  SeparatorDemo,
  SkeletonDemo,
  SwitchDemo,
  TableDemo,
  TabsDemo,
  TextareaDemo,
  TooltipDemo,
} from '../components/component-demos';
import { source } from '../lib/source';

const mdxComponents = {
  ...defaultMdxComponents,
  AccordionDemo,
  PageContainerDemo,
  ProDataTableDemo,
  ProFormDemo,
  ProFormDialogDemo,
  BadgeDemo,
  ButtonDemo,
  CardDemo,
  CheckboxDemo,
  DialogDemo,
  DropdownMenuDemo,
  InputDemo,
  LabelDemo,
  PopoverDemo,
  SelectDemo,
  SeparatorDemo,
  SkeletonDemo,
  SwitchDemo,
  TableDemo,
  TabsDemo,
  TextareaDemo,
  TooltipDemo,
};

export default function DocsRoute() {
  const params = useParams({ strict: false });
  const slugs = params._splat?.split('/') ?? [];
  const page = source.getPage(slugs);

  if (!page) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-2 p-16'>
        <h1 className='text-2xl font-semibold'>Page not found</h1>
        <p className='text-fd-muted-foreground'>No documentation page at /docs/{params._splat ?? ''}</p>
      </div>
    );
  }

  const data = page.data as unknown as {
    title: string;
    description?: string;
    body: ComponentType<{ components?: unknown }>;
    toc: TOCItemType[];
  };
  const markdownUrl = `/docs/${page.path.replace(/\.mdx?$/, '')}.md`;

  return (
    <RootProvider>
      <DocsLayout tree={source.getPageTree()}>
        <DocsPage toc={data.toc}>
          <div className='flex flex-row items-center gap-2 border-b pb-2'>
            <DocsTitle className='flex-1'>{data.title}</DocsTitle>
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            <ViewOptionsPopover markdownUrl={markdownUrl} />
          </div>
          {data.description ? <DocsDescription>{data.description}</DocsDescription> : null}
          <DocsBody>
            <data.body components={mdxComponents} />
          </DocsBody>
        </DocsPage>
      </DocsLayout>
    </RootProvider>
  );
}
