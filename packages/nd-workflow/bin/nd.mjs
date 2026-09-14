#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { runPython } from '../scripts/python-launcher.mjs';

process.exitCode = runPython(fileURLToPath(new URL('../scripts/nd.py', import.meta.url)), process.argv.slice(2));
