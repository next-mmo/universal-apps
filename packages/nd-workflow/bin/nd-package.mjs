#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { runPython } from '../scripts/python-launcher.mjs';

const args = process.argv.slice(2);
process.exitCode = runPython(fileURLToPath(new URL('../scripts/package_npm.py', import.meta.url)),
  args.length ? args : ['--output', fileURLToPath(new URL('../artifacts/nd-workflow.tgz', import.meta.url))]);
