import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface StarterFile {
  path: string;
  content: string;
}

export interface AgentStarter {
  id: string;
  summary: string;
  files: readonly StarterFile[];
  verify: readonly string[];
}

export interface StarterFilePlan {
  path: string;
  status: 'create' | 'exists' | 'conflict';
}

export interface StarterPlan {
  id: string;
  summary: string;
  output: string;
  files: StarterFilePlan[];
  verify: string[];
}

const todoStarter: AgentStarter = {
  id: 'todo',
  summary: 'A bounded Todo product brief and first implementation task.',
  files: [
    {
      path: 'AGENTS.md',
      content: `# Todo starter

Start with the approved task and the smallest useful slice.

- Read ".agents/docs/prd/0001-todo.md" and the active task before editing.
- Reuse the repository catalog and installed components before adding code.
- Keep validation, accessibility, persistence, and error handling in scope.
- Run the verification command recorded in the task and report evidence briefly.
`,
    },
    {
      path: 'README.md',
      content: `# Todo starter

This starter gives an agent a small, reviewable Todo product increment. It contains the product brief and first task; it does not duplicate an application framework or component library.

Begin with:

\`\`\`bash
pnpm context "build the Todo starter"
\`\`\`

Then read the PRD and task under \`.agents/docs/\`, discover reusable components, and implement only the approved slice.
`,
    },
    {
      path: '.agents/docs/prd/0001-todo.md',
      content: `# PRD-0001: Todo starter

> Status: draft  
> Scope: first vertical slice

## Outcome

Users can add, complete, edit, delete, and filter Todo items. Data survives a reload through the platform storage boundary.

## Acceptance

- Empty, loading, and error states are clear.
- Keyboard and screen-reader users can complete every action.
- Input is trimmed and empty items are rejected.
- Browser and desktop persistence use the same domain contract.
- The smallest relevant consumer build and regression checks pass.

## Non-goals

Authentication, collaboration, reminders, remote sync, and speculative abstractions.
`,
    },
    {
      path: '.agents/docs/tasks/wip-0001-build-todo.md',
      content: `# Task 0001: Build Todo starter

> **Status:** wip  
> **PRD:** ../prd/0001-todo.md

## Change Contract

- **Outcome:** deliver the first Todo vertical slice.
- **Non-goals:** authentication, sync, reminders, and unrelated cleanup.
- **Approach:** inspect the existing domain, storage, UI, and catalog contracts before writing code.
- **Verification:** run the narrowest consumer build plus the relevant regression and accessibility checks.

## Discovery

- [ ] Locate the Todo domain and persistence boundary.
- [ ] Reuse existing input, checkbox, button, list, and empty-state components.
- [ ] Name the first unresolved question before expanding context.

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| Acceptance criterion | command, test, or visible flow | pending |
`,
    },
  ],
  verify: ['pnpm agent check --changed'],
};

const starters: readonly AgentStarter[] = [todoStarter];

function safeRelative(filePath: string): string {
  const normalized = filePath.replaceAll('\\', '/');
  if (
    normalized.startsWith('/') ||
    normalized.includes(':') ||
    normalized.split('/').some((segment) => segment === '..' || segment === '')
  ) {
    throw new Error(`starter file path must stay relative: ${filePath}`);
  }
  return normalized;
}

async function pathStatus(filePath: string): Promise<'create' | 'exists' | 'conflict'> {
  try {
    const details = await stat(filePath);
    return details.isFile() ? 'exists' : 'conflict';
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return 'create';
    throw error;
  }
}

export function listStarters(): Array<Pick<AgentStarter, 'id' | 'summary'>> {
  return starters.map(({ id, summary }) => ({ id, summary }));
}

export function resolveStarter(id: string): AgentStarter | undefined {
  return starters.find((starter) => starter.id === id);
}

export async function planStarter(starter: AgentStarter, output: string): Promise<StarterPlan> {
  const files = await Promise.all(
    starter.files.map(async (file) => {
      const relative = safeRelative(file.path);
      return {
        path: relative,
        status: await pathStatus(path.join(output, relative)),
      } satisfies StarterFilePlan;
    }),
  );
  return {
    id: starter.id,
    summary: starter.summary,
    output,
    files,
    verify: [...starter.verify],
  };
}

export async function writeStarter(starter: AgentStarter, output: string): Promise<StarterPlan> {
  const plan = await planStarter(starter, output);
  const conflict = plan.files.find((file) => file.status === 'conflict');
  if (conflict !== undefined) {
    throw new Error(`cannot create ${conflict.path}: a directory already exists at that path`);
  }

  await mkdir(output, { recursive: true });
  await Promise.all(
    starter.files
      .filter((file) => plan.files.find((planned) => planned.path === file.path)?.status === 'create')
      .map(async (file) => {
        const relative = safeRelative(file.path);
        const destination = path.join(output, relative);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, file.content, { encoding: 'utf8', flag: 'wx' });
      }),
  );
  return plan;
}
