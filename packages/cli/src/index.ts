import { fail, loadConfig } from './config';
import { add, list } from './add';
import { agent } from './agent';

const usage = `usage: pnpm scaffold <command> [args]

commands:
  add <target> <kebab-name>   scaffold a component (e.g. add ui slider)
  list                        show available templates per target
  agent <command>             query or verify the agent catalog
`;

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const config = await loadConfig();

  switch (command) {
    case 'add':
      await add(config, rest);
      break;
    case 'list':
      await list(config);
      break;
    case 'agent':
      await agent(config, rest);
      break;
    default:
      console.log(usage);
      if (command !== undefined) fail(`unknown command "${command}"`);
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
