import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Monaco is bundled locally (no CDN loader) — workers come from the vite pipeline.
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    switch (label) {
      case 'json': return new jsonWorker();
      case 'css': case 'scss': case 'less': return new cssWorker();
      case 'html': case 'handlebars': case 'razor': return new htmlWorker();
      case 'typescript': case 'javascript': return new tsWorker();
      default: return new editorWorker();
    }
  },
};

const bgDark = '#0a0a0c';
const bgLight = '#ffffff';

function defineThemes(): void {
  monaco.editor.defineTheme('bfv-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: { 'editor.background': bgDark, 'editorGutter.background': bgDark },
  });
  monaco.editor.defineTheme('bfv-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: { 'editor.background': bgLight, 'editorGutter.background': bgLight },
  });
}
defineThemes();

export { monaco };
