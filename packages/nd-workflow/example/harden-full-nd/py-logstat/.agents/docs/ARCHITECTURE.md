# Architecture — py-logstat

## Modules

| Module | Responsibility |
|---|---|
| `logstat.py` | Everything: CLI parsing, input validation, streaming line reader, line parser, counters, report renderer. |
| `tests/test_logstat.py` | Unit + CLI subprocess tests over temp-dir fixtures. |

Key symbols in `logstat.py`:

- `validate_input_path` — rejects directories, missing paths, non-regular
  files, unreadable files, and files over the size cap (`LogStatError` →
  exit code 2).
- `_CappedReader` — wraps the open binary stream; aborts if the file grows
  past the cap after validation (TOCTOU guard).
- `iter_lines` — chunked reader yielding `(line_bytes, oversize)`; drops the
  tail of oversize lines without buffering.
- `parse_line` — single compiled regex for the documented combined-log shape.
- `Stats` — counters plus `error_rate()` and `top_paths()` (count desc, path
  asc).
- `render_report` / `main` — deterministic text output and exit codes.

## Streaming data flow

```
CLI (argparse) ─→ validate_input_path ─→ open(path, "rb")
      │                                        │
      │                             _CappedReader (growth guard)
      │                                        │
      │                     iter_lines: 64 KiB chunks, ≤ 8 KiB line cap
      │                                        │
      │            per line: decode(utf-8, errors="replace") → strip
      │                                        │
      │        classify: oversize | blank | parse (regex) → malformed | parsed
      │                                        │
      │                        Stats: totals, status classes 2/3/4/5/other,
      │                               Counter[path]
      └─────────────────→ render_report → stdout (exit 0)
                         LogStatError  → stderr (exit 2)
```

Memory bound at any moment is approximately `2 × chunk_bytes +
max_line_bytes` (≈ 136 KiB with defaults); the file is never fully loaded.

## Trust boundaries

- **Untrusted input**: the log file is hostile data. It is never executed,
  never `eval`-ed, size-capped before and during reading, decoded with
  `errors="replace"`, and length-capped per line. Parse failure is a counter,
  never an exception or crash.
- **Untrusted path argument**: validated as a regular, readable file inside
  the cap before any read; failures produce a clear stderr message and exit
  code 2, never a traceback.
- **Output**: derived, deterministic text only; no file writes, no network,
  no environment mutation. The only side effect is reading the input file.

## Deliberate non-goals

- No persistence, no config files, no server mode.
- No third-party parser dependency; regex is the contract and is tested.
- No per-IP or per-method reporting (out of scope for this example).
