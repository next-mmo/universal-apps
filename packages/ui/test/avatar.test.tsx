// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../src/components/ui/avatar.tsx';

const renderAvatar = () =>
  render(
    <Avatar>
      <AvatarImage src='/ada.png' alt='Ada' />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>,
  );

describe('Avatar', () => {
  it('renders its children', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('AB')).toBeDefined();
  });

  it('applies the size and shape variants', () => {
    const { container } = render(<Avatar size='xl' shape='square' />);
    const avatar = container.querySelector('[data-slot="avatar"]')!;

    expect(avatar.className).toContain('size-16');
    expect(avatar.className).toContain('rounded-xl');
  });

  it('defaults to the medium circle', () => {
    const { container } = render(<Avatar />);
    const avatar = container.querySelector('[data-slot="avatar"]')!;

    expect(avatar.className).toContain('size-10');
    expect(avatar.className).toContain('rounded-full');
  });

  it('lets a caller override the variant classes', () => {
    const { container } = render(<Avatar className='size-24' />);
    const avatar = container.querySelector('[data-slot="avatar"]')!;

    expect(avatar.className).toContain('size-24');
  });

  it('passes extra attributes through to the element', () => {
    render(<Avatar aria-label='Ada Lovelace' />);
    expect(screen.getByLabelText('Ada Lovelace')).toBeDefined();
  });
});

describe('AvatarImage', () => {
  it('renders the image when a source is given', () => {
    render(<AvatarImage src='/ada.png' alt='Ada' />);
    expect(screen.getByRole('img', { name: 'Ada' })).toBeDefined();
  });

  it('renders nothing without a source', () => {
    const { container } = render(<AvatarImage alt='Ada' />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders nothing once loading fails', () => {
    render(<AvatarImage src='/broken.png' alt='Ada' />);

    // A broken avatar must fall back to initials rather than a broken-image icon.
    act(() => {
      screen.getByRole('img', { name: 'Ada' }).dispatchEvent(new Event('error'));
    });

    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('AvatarFallback', () => {
  it('shows while the image has not loaded', () => {
    renderAvatar();
    expect(screen.getByText('AB')).toBeDefined();
  });

  it('hides once the image loads', () => {
    renderAvatar();

    act(() => {
      screen.getByRole('img').dispatchEvent(new Event('load'));
    });

    expect(screen.queryByText('AB')).toBeNull();
  });

  it('stays visible when the image fails to load', () => {
    renderAvatar();

    act(() => {
      screen.getByRole('img').dispatchEvent(new Event('error'));
    });

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('AB')).toBeDefined();
  });

  it('inherits the avatar radius instead of hard-coding one', () => {
    const { container } = render(
      <Avatar shape='square'>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    const fallback = container.querySelector('[data-slot="avatar-fallback"]')!;

    // `rounded-inherit` is not a Tailwind utility, so the fallback never followed the avatar.
    expect(fallback.className).toContain('rounded-[inherit]');
    expect(fallback.className).not.toContain('rounded-inherit');
  });
});
