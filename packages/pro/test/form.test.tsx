// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProForm } from '../src/form/pro-form.tsx';
import type { ProFormProps } from '../src/form/pro-form.tsx';
import type { ProFormGroup } from '@package/pro-core/form';

// `defaultValues` is required by the component, so the helper supplies it and a test overrides it
// by passing its own.
const Form = (props: Omit<ProFormProps, 'defaultValues'> & Partial<Pick<ProFormProps, 'defaultValues'>>) => (
  <ProForm defaultValues={{}} {...props} />
);

const groups: ProFormGroup[] = [
  {
    title: 'Details',
    description: 'Who the record is about.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', description: 'Optional context.' },
    ],
  },
  {
    layout: 'grid-2',
    fields: [{ name: 'age', label: 'Age', type: 'number' }],
  },
];

describe('ProForm', () => {
  it('renders the group headings and every field label', () => {
    render(<Form schema={groups} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    expect(screen.getByText('Details')).toBeDefined();
    expect(screen.getByText('Who the record is about.')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Notes')).toBeDefined();
    expect(screen.getByText('Age')).toBeDefined();
  });

  it('associates each label with its control', () => {
    render(<Form schema={groups} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    // A label whose htmlFor points at no element is invisible to assistive technology.
    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByLabelText('Notes')).toBeDefined();
    expect(screen.getByLabelText('Age')).toBeDefined();
  });

  it('starts from the supplied default values', () => {
    render(<Form schema={groups} defaultValues={{ name: 'Ada', age: 36 }} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Ada');
    expect((screen.getByLabelText('Age') as HTMLInputElement).value).toBe('36');
  });

  it('submits the edited values', async () => {
    const onSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    render(<Form schema={groups} defaultValues={{ name: 'Ada' }} onSubmit={onSubmit} />);

    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.type(screen.getByLabelText('Name'), 'Grace');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ name: 'Grace' });
  });

  it('blocks submission while a required field is empty', async () => {
    const onSubmit = vi.fn<() => Promise<void>>(async () => {});
    render(<Form schema={groups} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toBeDefined();
  });

  it('announces a field error and points the control at it', async () => {
    render(<Form schema={groups} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const alert = await screen.findByRole('alert');
    const control = screen.getByLabelText('Name');

    expect(alert.textContent).toContain('required');
    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(control.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('reports a validation failure from a custom validator', async () => {
    const schema: ProFormGroup[] = [
      {
        fields: [
          {
            name: 'code',
            label: 'Code',
            type: 'text',
            validators: [(value) => (value === 'bad' ? 'Code is not allowed' : undefined)],
          },
        ],
      },
    ];
    const onSubmit = vi.fn<() => Promise<void>>(async () => {});
    render(<Form schema={schema} defaultValues={{ code: 'bad' }} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Code is not allowed')).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cancels without submitting', async () => {
    const onSubmit = vi.fn<() => Promise<void>>(async () => {});
    const onCancel = vi.fn<() => void>();
    render(<Form schema={groups} onSubmit={onSubmit} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('uses the caller’s button labels', () => {
    render(<Form schema={groups} onSubmit={vi.fn<() => Promise<void>>(async () => {})} submitLabel='Create' cancelLabel='Back' onCancel={vi.fn<() => void>()} />);

    expect(screen.getByRole('button', { name: 'Create' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDefined();
  });

  it('shows a submit error reported by the caller', () => {
    render(<Form schema={groups} onSubmit={vi.fn<() => Promise<void>>(async () => {})} submitError={new Error('Server rejected the record')} />);

    expect(screen.getByText('Server rejected the record')).toBeDefined();
  });

  it('disables the submit button and relabels it while pending', () => {
    render(<Form schema={groups} onSubmit={vi.fn<() => Promise<void>>(async () => {})} pending />);

    const button = screen.getByRole('button', { name: 'Saving…' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  it('renders a select field with its options', () => {
    const schema: ProFormGroup[] = [
      {
        fields: [
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'Viewer', value: 'viewer' },
            ],
          },
        ],
      },
    ];
    render(<Form schema={schema} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    expect(screen.getByLabelText('Role')).toBeDefined();
  });

  it('submits the option chosen from a select', async () => {
    const schema: ProFormGroup[] = [
      {
        fields: [
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'Viewer', value: 'viewer' },
            ],
          },
        ],
      },
    ];
    const onSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    render(<Form schema={schema} onSubmit={onSubmit} />);

    const trigger = screen.getByLabelText('Role');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(await screen.findByRole('option', { name: 'Viewer' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ role: 'viewer' });
  });

  it('renders a checkbox field associated with its label', () => {
    const schema: ProFormGroup[] = [
      { fields: [{ name: 'subscribe', label: 'Subscribe', type: 'checkbox' }] },
    ];
    render(<Form schema={schema} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    expect(screen.getByLabelText('Subscribe')).toBeDefined();
  });

  it('submits a checked checkbox as true', async () => {
    const schema: ProFormGroup[] = [
      { fields: [{ name: 'subscribe', label: 'Subscribe', type: 'checkbox' }] },
    ];
    const onSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    render(<Form schema={schema} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByLabelText('Subscribe'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ subscribe: true });
  });

  it('renders a switch field associated with its label', () => {
    const schema: ProFormGroup[] = [
      { fields: [{ name: 'active', label: 'Active', type: 'switch' }] },
    ];
    render(<Form schema={schema} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    expect(screen.getByLabelText('Active')).toBeDefined();
  });

  it('lays out a grid-2 group as two columns', () => {
    const { container } = render(
      <Form
        schema={[{ layout: 'grid-2', fields: [{ name: 'a', label: 'A', type: 'text' }] }]}
        onSubmit={vi.fn<() => Promise<void>>(async () => {})}
      />,
    );

    expect(container.querySelector('.sm\\:grid-cols-2')).not.toBeNull();
  });

  it('passes a placeholder through to the control', () => {
    const schema: ProFormGroup[] = [
      { fields: [{ name: 'q', label: 'Query', type: 'text', placeholder: 'Search…' }] },
    ];
    render(<Form schema={schema} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    expect(screen.getByPlaceholderText('Search…')).toBeDefined();
  });

  it('disables a field the schema marks disabled', () => {
    const schema: ProFormGroup[] = [
      { fields: [{ name: 'id', label: 'ID', type: 'text', disabled: true }] },
    ];
    render(<Form schema={schema} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    expect((screen.getByLabelText('ID') as HTMLInputElement).disabled).toBe(true);
  });

  it('submits a textarea value', async () => {
    const schema: ProFormGroup[] = [{ fields: [{ name: 'notes', label: 'Notes', type: 'textarea' }] }];
    const onSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    render(<Form schema={schema} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Notes'), 'line one');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ notes: 'line one' });
  });

  it('submits a number field as a number', async () => {
    const schema: ProFormGroup[] = [{ fields: [{ name: 'age', label: 'Age', type: 'number' }] }];
    const onSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    render(<Form schema={schema} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Age'), '42');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ age: 42 });
  });

  it('submits an emptied number field as undefined rather than zero', async () => {
    const schema: ProFormGroup[] = [{ fields: [{ name: 'age', label: 'Age', type: 'number' }] }];
    const onSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    render(<Form schema={schema} defaultValues={{ age: 7 }} onSubmit={onSubmit} />);

    await userEvent.clear(screen.getByLabelText('Age'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0].age).toBeUndefined();
  });

  it('submits a toggled switch as true', async () => {
    const schema: ProFormGroup[] = [{ fields: [{ name: 'active', label: 'Active', type: 'switch' }] }];
    const onSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    render(<Form schema={schema} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByLabelText('Active'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ active: true });
  });

  it('points a required control with an error at its message', async () => {
    const schema: ProFormGroup[] = [
      { fields: [{ name: 'name', label: 'Name', type: 'text', required: true }] },
    ];
    render(<Form schema={schema} onSubmit={vi.fn<() => Promise<void>>(async () => {})} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    const alert = await screen.findByRole('alert');

    expect(screen.getByLabelText('Name').getAttribute('aria-describedby')).toBe(alert.id);
  });
});
