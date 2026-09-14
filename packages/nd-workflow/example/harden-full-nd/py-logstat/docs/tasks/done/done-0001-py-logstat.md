# Task: py-logstat hardened example (0001)

## Goal and scope

- Mode: implementation.
- Outcome / why: one fully hardened, real, runnable ND Workflow example — a
  stdlib-only streaming web-access-log analyzer with unit tests, evidence log,
  and full agent documentation — as part of the parent repo's
  `example/harden-full-nd/` set.
- Requirement: parent task brief (direct implementation request).
- In scope: `logstat.py`, `tests/test_logstat.py`, `README.md`, `AGENTS.md`,
  `CLAUDE.md`, `.agents/docs/{PROJECT,ARCHITECTURE,WORKFLOW}.md`,
  `docs/README.md`, this task record, `HARDENING.md`.
- Non-goals: packaging/publishing, CI wiring, third-party dependencies,
  network features, directory globbing, gzip input, per-IP reporting.
- Risk tier: Medium (new feature with tests), with High-risk surfaces
  (input validation, memory bounds, exit codes) covered by negative tests.

## Ownership and integration

- Exact task path: `example/harden-full-nd/py-logstat/docs/tasks/done/done-0001-py-logstat.md`.
- Owner: Worker session `mvs_d8bf943b7afb4f3e81b64780f4f318ee`.
- Owned write paths: `example/harden-full-nd/py-logstat/**` (nothing outside).
- Dependencies / outstanding workers: none; directory did not exist before
  this task (verified).
- Integration owner: parent session; no shared files were touched.

## Implementation plan (all completed)

- [x] Step 1: Implement `logstat.py` — argparse CLI, streaming chunked reader,
      combined-log regex parser, `Stats` counters, deterministic report.
- [x] Step 2: Implement hardening — file size cap (`--max-bytes`), growth
      guard, `errors="replace"` decoding, 8 KiB line cap with oversize
      accounting, exit code 2 for input errors.
- [x] Step 3: Write 26 unittest cases covering happy path, malformed, blank,
      non-UTF8, oversize, size cap, missing/directory/unreadable, top-N,
      status classes, error-rate math, ordering, determinism, streaming.
- [x] Step 4: Run the suite and a CLI smoke run in a temp directory; record
      exact outputs.
- [x] Step 5: Write README, AGENTS.md, CLAUDE.md, `.agents/docs/*`, catalog,
      this record, HARDENING.md — all with observed results, no placeholders.

## Acceptance criteria and observed results

- [x] Streaming read with bounded memory (never loads whole file) — PASS:
      `test_iter_lines_bounded_read_sizes` asserts every read is exactly
      `chunk_bytes` and multiple reads occur for multi-chunk payloads; source
      reads via `iter_lines` byte chunks only.
- [x] Explicit max file size cap with clear error — PASS:
      `test_size_cap_exceeded_raises_and_cli_exits_2` (raises `LogStatError`
      "exceeds limit"; CLI exit code 2, message on stderr).
- [x] Non-UTF8 bytes tolerated (`errors="replace"`) — PASS:
      `test_non_utf8_bytes_decoded_with_replacement_and_no_crash` (both lines
      parsed, path contains U+FFFD).
- [x] Extremely long lines truncated safely — PASS:
      `test_very_long_line_is_oversize_and_neighbors_still_parse` (20,000-byte
      line counted `oversize=1`, neighbors parsed) and
      `test_iter_lines_cap_boundary_exact` (exact-cap line parses; cap+1 is
      oversize).
- [x] Directory / unreadable / missing paths rejected with clear message and
      exit code 2 — PASS: `test_directory_argument_raises_and_cli_exits_2`,
      `test_missing_file_raises_and_cli_exits_2`,
      `test_unreadable_path_reports_clear_error` (PermissionError via mock).
- [x] Blank lines handled explicitly and documented — PASS:
      `test_blank_lines_counted_not_malformed` (3 blank, 0 malformed); README
      and AGENTS.md state the policy.
- [x] Deterministic ordering for equal counts (path ascending) — PASS:
      `test_deterministic_ordering_for_equal_counts`,
      `test_repeated_analysis_is_byte_identical`.
- [x] Status classes, error rate (5xx/parsed), top N (default 10) — PASS:
      `test_status_class_buckets_and_other`, `test_error_rate_math_exact_and_rendered`,
      `test_top_n_limit_respected_by_api_and_cli`.
- [x] No network — PASS: `test_source_imports_no_network_modules` (static
      import scan of `logstat.py` finds no socket/urllib/http/... imports);
      tests only touch `tempfile` directories.
- [x] CLI smoke run against a small sample log in a temp dir — PASS: exit
      code 0 with the output recorded below.

## Verification evidence

Environment: Windows, Python 3.11.13, working directory
`example/harden-full-nd/py-logstat`, 2026-09-11.

Command:

```
python -m unittest discover -s tests -v
```

Observed result (final run):

```
Ran 26 tests in 1.374s

OK
```

Exit code: 0. (Earlier runs of the same suite: `Ran 26 tests in 1.438s`,
`1.382s`, and `1.360s`, all `OK`; duration varies, count stable.)

Command (fixture written to `$env:TEMP\logstat-smoke\sample.log`; 6 valid
lines, 1 malformed, 1 blank):

```
python logstat.py $env:TEMP\logstat-smoke\sample.log
```

Observed output (exit code 0):

```
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

Source fingerprints at verification:
`logstat.py` SHA-256
`53EBAC91DAC7561587BC8E6958611B75219E1713E91965A5C9326429EFF3E2D4`,
`tests/test_logstat.py` SHA-256
`C354A4F82B20DB795044AC8672091871DA08A07E1C19DFD87EAE18EAB7E44907`.

## Resume state

- Completed: all deliverables written and verified.
- Failed / skipped checks: none required were skipped. Unreadable-file denial
  is not reproducible via `chmod` on Windows, so that branch is covered with
  a mocked `PermissionError` instead — noted in HARDENING.md.
- Recovery: re-run the two commands above from this directory.

Status: completed.
