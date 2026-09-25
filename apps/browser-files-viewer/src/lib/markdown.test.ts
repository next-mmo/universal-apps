import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders basic markdown to sanitized html', () => {
    const html = renderMarkdown('# Title\n\nsome **bold** text');
    expect(html).toContain('<h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('strips scripts and inline styles', () => {
    const html = renderMarkdown('hello <script>alert(1)</script> <style>x{}</style> world');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<style');
  });

  it('forces preview links into a new tab so the viewer never navigates away', () => {
    const html = renderMarkdown('[docs](https://example.com) and [relative](./other.md)');
    const matches = html.match(/<a [^>]*>/g) ?? [];
    expect(matches.length).toBe(2);
    for (const tag of matches) {
      expect(tag).toContain('target="_blank"');
      expect(tag).toContain('rel="noopener noreferrer"');
    }
  });
});
