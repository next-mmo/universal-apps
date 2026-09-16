#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { getGoEchoTemplateFiles } from '../templates/starter.mjs';

export function scaffoldGoEchoProject(targetDir, name) {
  const projectDir = path.resolve(targetDir, name);
  if (fs.existsSync(projectDir) && fs.readdirSync(projectDir).length > 0) {
    throw new Error(`Target directory already exists and is not empty: ${projectDir}`);
  }

  const files = getGoEchoTemplateFiles(name);
  fs.mkdirSync(projectDir, { recursive: true });

  for (const [relPath, content] of files.entries()) {
    const fullPath = path.join(projectDir, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  return {
    name,
    projectDir,
    filesCount: files.size,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  const [name] = process.argv.slice(2);
  if (!name) {
    console.error('Usage: node scaffold.mjs <project-name>');
    process.exit(1);
  }
  try {
    const result = scaffoldGoEchoProject(process.cwd(), name);
    console.log(`Successfully scaffolded Go Echo v5 starter at ${result.projectDir} (${result.filesCount} files)`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
