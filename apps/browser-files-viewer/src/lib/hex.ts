/** Hex dump rendering for binary and unknown files. */

export interface HexRow {
  offset: number;
  /** Two-digit hex per byte, exactly 16 entries (padded with nulls on the last row). */
  hex: string[];
  /** Printable ASCII rendering; control bytes become dots. */
  ascii: string;
}

const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));

function toAscii(byte: number): string {
  return byte >= 0x20 && byte < 0x7f ? String.fromCharCode(byte) : '.';
}

export function hexDump(bytes: Uint8Array, maxBytes = 4096): HexRow[] {
  const view = bytes.subarray(0, maxBytes);
  const rows: HexRow[] = [];
  for (let base = 0; base < view.length; base += 16) {
    const chunk = view.subarray(base, base + 16);
    const hex: string[] = [];
    let ascii = '';
    for (let i = 0; i < 16; i++) {
      if (i < chunk.length) {
        hex.push(HEX[chunk[i]]);
        ascii += toAscii(chunk[i]);
      } else {
        hex.push('  ');
        ascii += ' ';
      }
    }
    rows.push({ offset: base, hex, ascii });
  }
  return rows;
}
