import { describe, expect, it } from 'vitest';
import { detectDelimiter, parseDelimited, toCsvTable } from './csv';

describe('parseDelimited', () => {
  it('parses simple rows', () => {
    expect(parseDelimited('a,b,c\n1,2,3', ',')).toEqual([['a', 'b', 'c'], ['1', '2', '3']]);
  });

  it('handles quoted delimiters, escaped quotes and newlines', () => {
    const src = 'name,note\n"Smith, John","said ""hi"""\n"multi\nline",2';
    const rows = parseDelimited(src, ',');
    expect(rows[1]).toEqual(['Smith, John', 'said "hi"']);
    expect(rows[2]).toEqual(['multi\nline', '2']);
  });

  it('handles CRLF and missing trailing newline', () => {
    expect(parseDelimited('a,b\r\n1,2', ',')).toEqual([['a', 'b'], ['1', '2']]);
    expect(parseDelimited('a,b\n1,2\n', ',')).toEqual([['a', 'b'], ['1', '2']]);
  });
});

describe('detectDelimiter', () => {
  it('respects extension and sniffs punctuation', () => {
    expect(detectDelimiter('t.tsv', 'a\tb')).toBe('\t');
    expect(detectDelimiter('p.psv', 'a|b')).toBe('|');
    expect(detectDelimiter('e.csv', 'a;b;c')).toBe(';');
    expect(detectDelimiter('e.csv', 'x,y\n1,"2,5"')).toBe(',');
  });
});

describe('toCsvTable', () => {
  it('uses a header row when present and truncates', () => {
    const rows = ['h1,h2', 'a,1', 'b,2', 'c,3'];
    const table = toCsvTable('x.csv', rows.join('\n'), 2);
    expect(table.columns).toEqual(['h1', 'h2']);
    expect(table.rows).toEqual([{ h1: 'a', h2: '1' }, { h1: 'b', h2: '2' }]);
    expect(table.truncated).toBe(true);
    expect(table.hasHeaderRow).toBe(true);
  });

  it('generates columns when the first row is numeric data', () => {
    const table = toCsvTable('x.csv', '1,2\n3,4');
    expect(table.columns).toEqual(['Column 1', 'Column 2']);
    expect(table.rows).toEqual([{ 'Column 1': '1', 'Column 2': '2' }, { 'Column 1': '3', 'Column 2': '4' }]);
    expect(table.hasHeaderRow).toBe(false);
  });

  it('caps very long cells', () => {
    const long = 'x'.repeat(600);
    const table = toCsvTable('x.csv', `h\n${long}`);
    expect(table.rows[0].h!.endsWith('…')).toBe(true);
    expect(table.rows[0].h!.length).toBeLessThan(600);
  });
});
