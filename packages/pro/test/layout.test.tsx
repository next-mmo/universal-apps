// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppFrame } from '../src/layout/app-frame.tsx';
import type { AppFrameProps, NavigationRenderProps } from '../src/layout/app-frame.tsx';
import { PageContainer } from '../src/layout/page-container.tsx';

// `children` is required, so the helper supplies it for the cases that do not care about content.
const Frame = (props: Omit<AppFrameProps, 'children'> & { children?: React.ReactNode }) => (
  <AppFrame {...props}>{props.children ?? null}</AppFrame>
);

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Orders', to: '/orders' },
  { label: 'Settings', to: '/settings' },
];

// The frame renders a desktop and a mobile navigation, so every item appears twice in the DOM.
const linksFor = (name: string) => screen.getAllByRole('link', { name });

describe('AppFrame', () => {
  it('renders the title in both the sidebar and the header', () => {
    render(
      <Frame title='Acme' navItems={navItems}>
        <p>Body</p>
      </Frame>,
    );

    expect(screen.getAllByText('Acme')).toHaveLength(2);
  });

  it('renders every navigation item in both navigations', () => {
    render(<Frame title='Acme' navItems={navItems} />);

    for (const item of navItems) {
      expect(linksFor(item.label)).toHaveLength(2);
    }
  });

  it('renders the main content', () => {
    render(
      <Frame title='Acme' navItems={navItems}>
        <p>Body</p>
      </Frame>,
    );

    expect(screen.getByText('Body')).toBeDefined();
  });

  it('marks the matching route as the current page', () => {
    render(<Frame title='Acme' navItems={navItems} pathname='/orders' />);

    for (const link of linksFor('Orders')) {
      expect(link.getAttribute('aria-current')).toBe('page');
    }
    for (const link of linksFor('Settings')) {
      expect(link.getAttribute('aria-current')).toBeNull();
    }
  });

  it('keeps a parent route current for a nested path', () => {
    render(<Frame title='Acme' navItems={navItems} pathname='/orders/42/edit' />);

    // A user deep in a section must still see which section they are in.
    expect(linksFor('Orders')[0]!.getAttribute('aria-current')).toBe('page');
  });

  it('does not treat a sibling with the same prefix as current', () => {
    render(
      <Frame title='Acme' navItems={[{ label: 'Orders', to: '/orders' }, { label: 'Order archive', to: '/orders-archive' }]} pathname='/orders-archive' />,
    );

    expect(linksFor('Orders')[0]!.getAttribute('aria-current')).toBeNull();
    expect(linksFor('Order archive')[0]!.getAttribute('aria-current')).toBe('page');
  });

  it('marks the root route current only for the root path', () => {
    render(<Frame title='Acme' navItems={navItems} pathname='/' />);
    expect(linksFor('Dashboard')[0]!.getAttribute('aria-current')).toBe('page');

    render(<Frame title='Acme' navItems={navItems} pathname='/orders' />);
    // The second frame's links come after the first frame's in document order.
    expect(linksFor('Dashboard')[2]!.getAttribute('aria-current')).toBeNull();
  });

  it('tolerates a trailing slash on the navigation target', () => {
    render(
      <Frame title='Acme' navItems={[{ label: 'Orders', to: '/orders/' }]} pathname='/orders/42' />,
    );

    expect(linksFor('Orders')[0]!.getAttribute('aria-current')).toBe('page');
  });

  it('renders an icon in the sidebar navigation only', () => {
    const Icon = ({ className }: { className?: string }) => (
      <svg data-testid='nav-icon' className={className} />
    );
    render(<Frame title='Acme' navItems={[{ label: 'Orders', to: '/orders', icon: Icon }]} />);

    // The mobile navigation renders labels alone, so the icon appears once.
    expect(screen.getAllByTestId('nav-icon')).toHaveLength(1);
  });

  it('delegates link rendering to the caller', () => {
    const renderLink = vi.fn<(props: NavigationRenderProps) => React.ReactNode>(({ item, active }) => (
      <button type='button' data-active={active}>
        {item.label}
      </button>
    ));
    render(<Frame title='Acme' navItems={navItems} pathname='/orders' renderLink={renderLink} />);

    // A router-aware caller takes over the anchor entirely.
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(renderLink).toHaveBeenCalled();
    const buttons = screen.getAllByRole('button', { name: 'Orders' });
    expect(buttons[0]!.getAttribute('data-active')).toBe('true');
  });

  it('renders the header extra and sidebar action', () => {
    render(
      <Frame
        title='Acme'
        navItems={navItems}
        headerExtra={<span>Search</span>}
        sidebarAction={<span>Collapse</span>}
      />,
    );

    expect(screen.getByText('Search')).toBeDefined();
    expect(screen.getByText('Collapse')).toBeDefined();
  });

  it('accepts per-region class overrides', () => {
    const { container } = render(
      <Frame
        title='Acme'
        navItems={navItems}
        className='custom-frame'
        classNames={{ sidebar: 'custom-sidebar', content: 'custom-content' }}
      />,
    );

    expect(container.querySelector('[data-slot="app-frame"]')!.className).toContain('custom-frame');
    expect(container.querySelector('[data-slot="app-sidebar"]')!.className).toContain('custom-sidebar');
    expect(container.querySelector('[data-slot="app-content"]')!.className).toContain('custom-content');
  });

  it('exposes both navigations to assistive technology', () => {
    render(<Frame title='Acme' navItems={navItems} />);

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined();
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeDefined();
  });
});

describe('PageContainer', () => {
  it('renders the title as the page heading', () => {
    render(
      <PageContainer title='Orders'>
        <p>Body</p>
      </PageContainer>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Orders' })).toBeDefined();
  });

  it('renders the description and the body', () => {
    render(
      <PageContainer title='Orders' description='Everything you have sold.'>
        <p>Body</p>
      </PageContainer>,
    );

    expect(screen.getByText('Everything you have sold.')).toBeDefined();
    expect(screen.getByText('Body')).toBeDefined();
  });

  it('renders a breadcrumb trail when given one', () => {
    render(
      <PageContainer title='Orders' breadcrumbs={['Home', 'Sales', 'Orders']}>
        <p>Body</p>
      </PageContainer>,
    );

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' }).textContent).toContain('Home');
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' }).textContent).toContain('Orders');
  });

  it('omits the breadcrumb navigation when the trail is empty', () => {
    render(
      <PageContainer title='Orders'>
        <p>Body</p>
      </PageContainer>,
    );

    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).toBeNull();
  });

  it('renders the actions and the footer', () => {
    render(
      <PageContainer title='Orders' extra={<button type='button'>New order</button>} footer={<span>Updated hourly</span>}>
        <p>Body</p>
      </PageContainer>,
    );

    expect(screen.getByRole('button', { name: 'New order' })).toBeDefined();
    expect(screen.getByText('Updated hourly')).toBeDefined();
  });

  it('omits the description, actions, and footer when they are not given', () => {
    const { container } = render(
      <PageContainer title='Orders'>
        <p>Body</p>
      </PageContainer>,
    );

    expect(container.querySelector('footer')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
