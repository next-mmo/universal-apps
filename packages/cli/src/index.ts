import { parseArgs } from 'node:util';
import { fail, loadConfig } from './config';
import { add, list } from './add';

const usage = `usage: pnpm scaffold <command> [args]

commands:
  add <target> <kebab-name>   scaffold a component (e.g. add ui slider)
  list                        show available templates per target
`;

async function main(): Promise<void> {
  const { positionals } = parseArgs({
    allowPositionals: true,
    args: process.argv.slice(2),
  });

  const [command, ...rest] = positionals;
  const config = await loadConfig();

  switch (command) {
    case 'add':
      await add(config, rest);
      break;
    case 'list':
      await list(config);
      break;
    default:
      console.log(usage);
      if (command !== undefined) fail(`unknown command "${command}"`);
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
