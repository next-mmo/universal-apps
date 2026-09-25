import { useMemo } from 'react';
import { hexDump } from '../../lib/hex';

export function HexView({ bytes, truncatedNote }: { bytes: Uint8Array; truncatedNote?: string }): React.JSX.Element {
  const rows = useMemo(() => hexDump(bytes), [bytes]);

  return (
    <div className="flex h-full min-h-0 flex-col p-3">
      <p className="pb-2 text-xs text-(--muted-foreground)">
        Binary or unknown content — first {Math.min(bytes.length, 4096).toLocaleString()} of {bytes.length.toLocaleString()} bytes. {truncatedNote ?? ''}
      </p>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-xs leading-5">
          <tbody>
            {rows.map((row) => (
              <tr key={row.offset} className="whitespace-pre">
                <td className="select-none pr-4 text-right text-(--muted-foreground)">
                  {row.offset.toString(16).padStart(8, '0')}
                </td>
                <td className="pr-4">{row.hex.slice(0, 8).join(' ')}</td>
                <td className="pr-4 text-(--muted-foreground)">{row.hex.slice(8).join(' ')}</td>
                <td className="text-(--primary)">{row.ascii}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
