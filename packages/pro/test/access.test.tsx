// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Access, AccessProvider, useAccessContext } from '../src/access/access.tsx';

function PermissionProbe({ permission }: { permission: string }) {
  const { can, role } = useAccessContext();
  return <span data-testid='probe'>{`${role ?? 'none'}|${String(can(permission))}`}</span>;
}

describe('Access', () => {
  it('renders children when accessible', () => {
    render(
      <Access accessible>
        <span>secret</span>
      </Access>,
    );
    expect(screen.getByText('secret')).toBeDefined();
  });

  it('renders nothing by default when not accessible', () => {
    render(
      <Access accessible={false}>
        <span>secret</span>
      </Access>,
    );
    expect(screen.queryByText('secret')).toBeNull();
  });

  it('renders the fallback when not accessible', () => {
    render(
      <Access accessible={false} fallback={<span>denied</span>}>
        <span>secret</span>
      </Access>,
    );
    expect(screen.getByText('denied')).toBeDefined();
    expect(screen.queryByText('secret')).toBeNull();
  });
});

describe('AccessProvider', () => {
  it('grants exactly the permissions present in the access map', () => {
    render(
      <AccessProvider access={{ 'user:read': true }}>
        <PermissionProbe permission='user:read' />
      </AccessProvider>,
    );
    expect(screen.getByTestId('probe').textContent).toBe('none|true');
  });

  it('denies a permission that is absent or false', () => {
    render(
      <AccessProvider access={{ 'user:read': true, 'user:write': false }}>
        <PermissionProbe permission='user:write' />
      </AccessProvider>,
    );
    expect(screen.getByTestId('probe').textContent).toBe('none|false');
  });

  it('treats a wildcard grant as granting everything', () => {
    render(
      <AccessProvider access={{ '*': true }}>
        <PermissionProbe permission='anything:at:all' />
      </AccessProvider>,
    );
    expect(screen.getByTestId('probe').textContent).toBe('none|true');
  });

  it('prefers a caller-supplied can over the default lookup', () => {
    render(
      <AccessProvider access={{}} can={() => true}>
        <PermissionProbe permission='never:listed' />
      </AccessProvider>,
    );
    expect(screen.getByTestId('probe').textContent).toBe('none|true');
  });

  it('exposes the role to consumers', () => {
    render(
      // `role` here is the RBAC role domain prop on the provider component, not an ARIA attribute.
      // oxlint-disable-next-line jsx-a11y/aria-role
      <AccessProvider access={{}} role='admin'>
        <PermissionProbe permission='x' />
      </AccessProvider>,
    );
    expect(screen.getByTestId('probe').textContent).toBe('admin|false');
  });
});

describe('useAccessContext outside a provider', () => {
  it('denies by default rather than granting every permission', () => {
    // Failing open here would silently authorize an unmounted or misconfigured RBAC tree.
    render(<PermissionProbe permission='user:read' />);
    expect(screen.getByTestId('probe').textContent).toBe('none|false');
  });
});
