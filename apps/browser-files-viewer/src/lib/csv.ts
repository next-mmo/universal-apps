/** Delimiter-separated value parsing (CSV/TSV/PSV) with quoted field support. */

export function detectDelimiter(name: string, text: string): string {
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (ext === 'tsv') return '\t';
  if (ext === 'psv') return '|';
  // Sniff the first line outside quotes.
  const firstLine = text.slice(0, 4096).split(/\r?\n/)[0] ?? '';
  const counts: Array<[string, number]> = [
    [',', 0], [';', 0], ['\t', 0], ['|', 0],
  ];
  let inQuotes = false;
  for (const ch of firstLine) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes) {
      for (const [d] of counts) if (ch === d) counts.find(([dd]) => dd === d)![1]++;
    }
  }
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ',';
}

/**
 * RFC-4180-style parsing with the detected delimiter: quoted fields may
 * contain delimiters, escaped quotes (""), and newlines.
 */
export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === delimiter) { pushField(); i++; continue; }
    if (ch === '\r') {
      if (text[i + 1] === '\n') i++;
      pushRow(); i++; continue;
    }
    if (ch === '\n') { pushRow(); i++; continue; }
    field += ch; i++;
  }
  // Final field/row when the file does not end with a newline; skip when empty.
  if (field !== '' || row.length > 0) pushRow();
  return rows;
}

export interface CsvTable {
  /** Header row; falls back to generated names when the file has none. */
  columns: string[];
  /** Data rows as objects keyed by column name. */
  rows: Array<Record<string, string>>;
  truncated: boolean;
  hasHeaderRow: boolean;
}

const MAX_ROWS = 5000;
const MAX_CELL = 512;

function looksLikeHeader(first: string[]): boolean {
  return first.every((cell) => cell.trim() !== '' && !/^-?[\d.,%\s]+$/.test(cell.trim()));
}

export function toCsvTable(name: string, text: string, maxRows = MAX_ROWS): CsvTable {
  const delimiter = detectDelimiter(name, text);
  const all = parseDelimited(text, delimiter);
  if (all.length === 0) return { columns: [], rows: [], truncated: false, hasHeaderRow: false };

  const hasHeaderRow = looksLikeHeader(all[0]);
  const header = hasHeaderRow ? all[0].map((h, i) => h.trim() || `Column ${i + 1}`) : all[0].map((_, i) => `Column ${i + 1}`);
  const body = hasHeaderRow ? all.slice(1) : all;

  const limited = body.slice(0, maxRows);
  const rows = limited.map((cells) => {
    const row: Record<string, string> = {};
    header.forEach((col, i) => {
      const cell = cells[i] ?? '';
      row[col] = cell.length > MAX_CELL ? cell.slice(0, MAX_CELL) + '…' : cell;
    });
    return row;
  });
  return { columns: header, rows, truncated: body.length > limited.length, hasHeaderRow };
}
