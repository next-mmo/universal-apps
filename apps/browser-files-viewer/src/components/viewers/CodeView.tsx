import { useEffect, useRef } from 'react';
import { monaco } from '../../lib/monacoSetup';

export interface CodeViewProps {
  value: string;
  language: string;
  theme: 'dark' | 'light';
  /** Show plain text without editor chrome for the markdown source pane. */
  minimal?: boolean;
}

/** Monaco in strict read-only mode — the editor instance never exposes write commands. */
export function CodeView({ value, language, theme, minimal = false }: CodeViewProps): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const editor = monaco.editor.create(hostRef.current, {
      value,
      language,
      theme: theme === 'dark' ? 'bfv-dark' : 'bfv-light',
      readOnly: true,
      domReadOnly: true,
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 13,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'off',
      renderWhitespace: 'selection',
      padding: { top: 8 },
      folding: true,
      overviewRulerLanes: 0,
      scrollbar: { alwaysConsumeMouseWheel: false },
    });
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
      editor.dispose();
    };
    // Re-create only when going from/to minimal chrome; value/language update in place below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minimal]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.getValue() !== value) editor.setValue(value);
    const model = editor.getModel();
    if (model && model.getLanguageId() !== language) {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [value, language]);

  useEffect(() => {
    monaco.editor.setTheme(theme === 'dark' ? 'bfv-dark' : 'bfv-light');
  }, [theme]);

  return (
    <div
      ref={hostRef}
      className={minimal ? 'h-full w-full' : 'h-full w-full'}
    />
  );
}
