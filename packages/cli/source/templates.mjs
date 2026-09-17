import { getReactTemplateFiles } from './templates/react.mjs';
import { getVueTemplateFiles } from './templates/vue.mjs';
import { getSvelteTemplateFiles } from './templates/svelte.mjs';
import { getNativeTemplateFiles } from './templates/native.mjs';
import { getNativeBareTemplateFiles } from './templates/native-bare.mjs';
import { getTauriTemplateFiles } from './templates/tauri.mjs';
import { getGoEchoTemplateFiles } from './templates/go-echo.mjs';

export function getTemplateFiles(name, options = {}) {
  const framework = options.framework ?? 'react';

  // Backend Go Echo starter
  if (['go-echo', 'go', 'echo'].includes(framework)) {
    return getGoEchoTemplateFiles(name, options);
  }

  // Bare React Native starter (Metro + Uniwind)
  if (['uniwind-bare', 'native-bare'].includes(framework)) {
    return getNativeBareTemplateFiles(name, options);
  }

  const files = new Map();

  // Shared web assets
  const mainScript = framework === 'react' || framework === 'native' ? '/src/main.tsx' : '/src/main.ts';
  files.set('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${mainScript}"></script>
  </body>
</html>
`);

  // Shared index.css
  files.set('src/index.css', `@import "tailwindcss";
`);

  let frameworkFiles;
  if (framework === 'react') {
    frameworkFiles = getReactTemplateFiles(name, options);
  } else if (framework === 'vue') {
    frameworkFiles = getVueTemplateFiles(name, options);
  } else if (framework === 'svelte') {
    frameworkFiles = getSvelteTemplateFiles(name, options);
  } else if (framework === 'native') {
    frameworkFiles = getNativeTemplateFiles(name, options);
  } else {
    throw new Error(`Unsupported framework template: ${framework}`);
  }

  for (const [key, val] of frameworkFiles.entries()) {
    files.set(key, val);
  }

  // If --tauri requested
  if (options.tauri) {
    const tauriFiles = getTauriTemplateFiles(name, options);
    for (const [key, val] of tauriFiles.entries()) {
      files.set(key, val);
    }
  }

  return files;
}
