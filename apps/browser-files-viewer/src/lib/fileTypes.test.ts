import { describe, expect, it } from 'vitest';
import { extensionOf, formatBytes, kindFromName, languageFor, looksBinary, resolveKind } from './fileTypes';

describe('kindFromName', () => {
  it('maps common types', () => {
    expect(kindFromName('photo.PNG')).toBe('image');
    expect(kindFromName('report.pdf')).toBe('pdf');
    expect(kindFromName('clip.mp4')).toBe('video');
    expect(kindFromName('song.flac')).toBe('audio');
    expect(kindFromName('notes.md')).toBe('markdown');
    expect(kindFromName('data.json')).toBe('json');
    expect(kindFromName('table.csv')).toBe('csv');
    expect(kindFromName('app.tsx')).toBe('text');
    expect(kindFromName('Dockerfile')).toBe('text');
  });

  it('returns null for unknown extensions so content can be sniffed', () => {
    expect(kindFromName('archive.zst')).toBeNull();
    expect(kindFromName('blob')).toBeNull();
  });
});

describe('languageFor', () => {
  it('maps extensions to monaco languages', () => {
    expect(languageFor('main.rs')).toBe('rust');
    expect(languageFor('styles.scss')).toBe('scss');
    expect(languageFor('run.ps1')).toBe('powershell');
    expect(languageFor('unknown.xyz')).toBe('plaintext');
  });
});

describe('looksBinary / resolveKind', () => {
  it('detects NUL bytes as binary', () => {
    expect(looksBinary(new Uint8Array([0x7f, 0x45, 0x00, 0x0a]))).toBe(true);
  });
  it('takes text path for printable bytes', () => {
    const text = new TextEncoder().encode('hello world\nplain text file with no nulls');
    expect(looksBinary(text)).toBe(false);
  });
  it('falls back to sniffing for unknown extensions', () => {
    expect(resolveKind('blob', new TextEncoder().encode('just text'))).toBe('text');
    expect(resolveKind('blob', new Uint8Array([0, 1, 2, 3]))).toBe('hex');
    expect(resolveKind('a.json', null)).toBe('json');
  });
});

describe('formatBytes', () => {
  it('formats buckets', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatBytes(Number.NaN)).toBe('—');
  });
});

describe('extensionOf', () => {
  it('handles dotfiles and multi-dots', () => {
    expect(extensionOf('archive.tar.gz')).toBe('gz');
    expect(extensionOf('.gitignore')).toBe('');
    expect(extensionOf('MAKEFILE')).toBe('makefile');
  });
});
