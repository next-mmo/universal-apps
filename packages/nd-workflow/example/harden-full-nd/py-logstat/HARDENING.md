# Hardening Evidence Log — py-logstat

All outputs below were observed on 2026-09-11, Windows, Python 3.11.13, from
`example/harden-full-nd/py-logstat`. Nothing here is projected or copied from
a different run.

## Verification commands and observed results

### Unit suite

```
> python -m unittest discover -s tests -v
...
Ran 26 tests in 1.374s

OK
```

Exit code 0. `Ran 26 tests in 1.374s` is the final observed run (earlier runs
of the same unchanged suite: `1.438s`, `1.382s`, `1.360s`, all `OK`; only
duration varies).

### CLI smoke run

Fixture: `$env:TEMP\logstat-smoke\sample.log` — 8 lines: 6 valid, 1 garbage,
1 blank.

```
> python logstat.py $env:TEMP\logstat-smoke\sample.log
file: C:\Users\dila\AppData\Local\Temp\logstat-smoke\sample.log
total lines: 8
parsed: 6
malformed: 1
blank: 1
oversize (truncated and skipped): 0
status classes: 2xx=2 3xx=0 4xx=2 5xx=2 other=0
error rate (5xx/parsed): 33.33%
top 4 paths:
  1. /api/users 3
  2. /api/login 1
  3. /index.html 1
  4. /missing 1
```

Exit code 0. (The fixture was written by PowerShell `Set-Content -Encoding
UTF8`, which prepends a UTF-8 BOM; the first line still parsed — incidental
confirmation of tolerant decoding.)

## Hardening measures → implementation → test evidence

| Measure | Implementation | Test evidence (all passing in the 26-test run) |
|---|---|---|
| Streaming, bounded memory | `iter_lines` reads fixed 64 KiB chunks; only a carry buffer (≤ line cap + chunk) is held; `analyze_file` never calls `.read()` without a size | `test_iter_lines_bounded_read_sizes`: every recorded read size equals `chunk_bytes`, multiple reads for a 200-line payload; `test_small_chunk_sizes_keep_line_accounting_correct` with `chunk_bytes=7` |
| Max file size cap (default 64 MiB, `--max-bytes`) | `validate_input_path` rejects size > cap before reading; `_CappedReader` aborts if the file grows past the cap mid-read | `test_size_cap_exceeded_raises_and_cli_exits_2` (API raise + CLI exit 2, stderr "exceeds limit"); `test_capped_reader_aborts_when_stream_exceeds_cap` |
| Non-UTF8 tolerance | `raw.decode("utf-8", errors="replace")` per line (binary-mode reads) | `test_non_utf8_bytes_decoded_with_replacement_and_no_crash`: invalid bytes in IP and path fields; 2/2 lines parsed |
| Extremely long lines | Line cap 8 KiB: longer lines are truncated, counted in `oversize`, remainder dropped without buffering | `test_very_long_line_is_oversize_and_neighbors_still_parse` (20,000-byte line); `test_iter_lines_cap_boundary_exact` (exactly-cap passes, cap+1 oversize) |
| Path rejection with clear message + exit 2 | `validate_input_path` checks directory → exists → regular file → stat → read probe; `main` maps `LogStatError` to stderr message + code 2 | `test_directory_argument_raises_and_cli_exits_2`, `test_missing_file_raises_and_cli_exits_2`, `test_unreadable_path_reports_clear_error`, `test_invalid_top_value_exits_2` |
| Blank lines explicit | Whitespace-only lines counted in `blank`, never malformed/parsed (documented in README + AGENTS.md) | `test_blank_lines_counted_not_malformed`, `test_whitespace_only_file_is_all_blank` |
| Deterministic ordering | `top_paths` sorts by count desc, then path ascending; report order fixed | `test_deterministic_ordering_for_equal_counts`, `test_repeated_analysis_is_byte_identical` |
| No network | Stdlib-only imports; no socket/urllib/http usage; tests write only in `tempfile` dirs | `test_source_imports_no_network_modules` (static scan of `logstat.py`) |
| Accounting invariant | `total = parsed + malformed + blank + oversize` holds structurally | `test_line_counter_accounting_invariant_holds` |
| Error-rate math | `5xx / parsed`, rendered `%.2f%%`, `n/a` when `parsed == 0` | `test_error_rate_math_exact_and_rendered` (25.00%), `test_error_rate_is_none_without_parsed_lines` |

## Honest limits (not claimed as covered)

- **Oversize lines are counted, not parsed.** A syntactically valid but longer
  than 8 KiB line lands in `oversize` (not `parsed`). This is the documented
  truncation policy, chosen so parsing never works on silently cut data.
- **Memory bound is structural, not measured.** The bound (~2×chunk +
  line cap ≈ 136 KiB with defaults) follows from the read sizes asserted in
  tests and code review; no RSS/heap profiling was run.
- **Growth guard is best-effort.** A file that grows during the read is
  detected after at most one extra chunk is consumed, then the run aborts
  with exit code 2 — the cap is a safety limit, not a hard byte-exact fence.
- **Unreadable-file branch uses a mocked `PermissionError`.** On Windows
  `chmod` does not deny the file owner, so real-FS denial could not be
  reproduced deterministically; directory and missing-path cases use real
  filesystem state.
- **Parser strictness is deliberate.** Uppercase methods and an `HTTP/x.y`
  token are required; `HTTP/2`, lowercase methods, or non-combined formats
  count as malformed rather than being guess-parsed.
- **No coverage measurement.** `coverage` is a third-party tool and this
  example stays dependency-free; the 26 cases are the full evidence.
- **Single file, single pass, single process.** No gzip, no globbing, no
  tail/watch mode, no per-IP metrics — out of scope by design.
- **Test durations vary between runs** (1.360s / 1.374s / 1.382s / 1.438s
  observed); pass counts and outputs were identical.
