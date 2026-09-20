// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProStepForm } from '../src/form/pro-step-form.tsx';
import type { ProStepItem } from '../src/form/pro-step-form.tsx';

const steps: ProStepItem[] = [
  { title: 'Account', schema: [{ fields: [{ name: 'email', label: 'Email', type: 'text' }] }] },
  { title: 'Company', schema: [{ fields: [{ name: 'company', label: 'Company', type: 'text' }] }] },
];

const renderWizard = (props: Partial<Parameters<typeof ProStepForm>[0]> = {}) =>
  render(<ProStepForm steps={steps} defaultValues={{}} onSubmit={vi.fn<() => Promise<void>>(async () => {})} {...props} />);

const next = () => screen.getByRole('button', { name: /next step/i });
const previous = () => screen.getByRole('button', { name: /previous/i });

describe('ProStepForm', () => {
  it('renders every step title and starts on the first step', () => {
    renderWizard();

    expect(screen.getByText('Account')).toBeDefined();
    expect(screen.getByText('Company')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.queryByLabelText('Company')).toBeNull();
  });

  it('advances to the next step after a successful step submit', async () => {
    const onStepSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    renderWizard({ steps: [{ ...steps[0]!, onStepSubmit }, steps[1]!] });

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.click(next());

    expect(await screen.findByLabelText('Company')).toBeDefined();
    expect(onStepSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: 'ada@example.com' }));
  });

  it('stays on the step when the step submit refuses to advance', async () => {
    const onStepSubmit = vi.fn<(values: Record<string, unknown>) => Promise<boolean | void>>(async () => false);
    renderWizard({ steps: [{ ...steps[0]!, onStepSubmit }, steps[1]!] });

    await userEvent.click(next());

    await waitFor(() => expect(onStepSubmit).toHaveBeenCalled());
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.queryByLabelText('Company')).toBeNull();
  });

  it('stays on the step and reports the failure when a step submit rejects', async () => {
    const onStepSubmit = vi.fn<(values: Record<string, unknown>) => Promise<boolean | void>>(async () => {
      throw new Error('Email is already taken');
    });
    renderWizard({ steps: [{ ...steps[0]!, onStepSubmit }, steps[1]!] });

    await userEvent.click(next());

    // The rejection used to escape as an unhandled rejection with no feedback and no way forward.
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Email is already taken');
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.queryByLabelText('Company')).toBeNull();
  });

  it('reports a failed final submit and stays on the last step', async () => {
    const onSubmit = vi.fn<() => Promise<void>>(async () => {
      throw new Error('Server refused');
    });
    renderWizard({ onSubmit });

    await userEvent.click(next());
    await screen.findByLabelText('Company');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Server refused');
    expect(screen.getByLabelText('Company')).toBeDefined();
  });

  it('goes back without submitting', async () => {
    const onSubmit = vi.fn<() => Promise<void>>(async () => {});
    renderWizard({ onSubmit });

    await userEvent.click(next());
    await screen.findByLabelText('Company');
    await userEvent.click(previous());

    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('carries the values entered on an earlier step into the final submit', async () => {
    const onSubmit = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {});
    renderWizard({ onSubmit });

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.click(next());
    await screen.findByLabelText('Company');
    await userEvent.type(screen.getByLabelText('Company'), 'Analytical Engines');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      email: 'ada@example.com',
      company: 'Analytical Engines',
    });
  });

  it('offers no previous control on the first step', () => {
    renderWizard();

    expect(screen.queryByRole('button', { name: /previous/i })).toBeNull();
  });

  it('reports the step change to a controlled caller', async () => {
    const onCurrentChange = vi.fn<(current: number) => void>();
    renderWizard({ current: 0, onCurrentChange });

    await userEvent.click(next());

    expect(onCurrentChange).toHaveBeenCalledWith(1);
  });

  it('shows the step a controlled caller selects', async () => {
    const { rerender } = render(
      <ProStepForm steps={steps} defaultValues={{}} onSubmit={vi.fn<() => Promise<void>>(async () => {})} current={0} onCurrentChange={vi.fn<(current: number) => void>()} />,
    );
    expect(screen.getByLabelText('Email')).toBeDefined();

    rerender(
      <ProStepForm steps={steps} defaultValues={{}} onSubmit={vi.fn<() => Promise<void>>(async () => {})} current={1} onCurrentChange={vi.fn<(current: number) => void>()} />,
    );

    expect(screen.getByLabelText('Company')).toBeDefined();
  });

  it('uses the caller’s labels', () => {
    renderWizard({ submitLabel: 'Finish', nextLabel: 'Continue' });

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDefined();
  });

  it('shows the final submit label only on the last step', async () => {
    renderWizard({ submitLabel: 'Finish' });
    expect(screen.getByRole('button', { name: /continue|next step/i })).toBeDefined();

    await userEvent.click(next());
    expect(await screen.findByRole('button', { name: 'Finish' })).toBeDefined();
  });

  it('disables the submit while the wizard is pending', () => {
    renderWizard({ pending: true });

    // ProForm relabels its submit control while pending, so the wizard inherits that label.
    expect((screen.getByRole('button', { name: 'Saving…' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders a step description', () => {
    renderWizard({ steps: [{ ...steps[0]!, description: 'Who you are' }] });

    expect(screen.getByText('Who you are')).toBeDefined();
  });

  it('cancels from the first step', async () => {
    const onCancel = vi.fn<() => void>();
    renderWizard({ onCancel, cancelLabel: 'Abort' });

    await userEvent.click(screen.getByRole('button', { name: 'Abort' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
