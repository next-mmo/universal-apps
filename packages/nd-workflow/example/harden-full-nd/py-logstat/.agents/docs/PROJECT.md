# Project Orientation — py-logstat

## Purpose

`py-logstat` is a self-contained ND Workflow hardening example: a small but
production-minded web access-log analyzer. It reads one combined-style log
file in a streaming fashion and reports line accounting, status classes,
error rate, and top paths. It exists to demonstrate hardened behavior —
bounded memory, explicit input limits, tolerance for hostile input bytes —
backed by a real unit suite.

## Entry points

- `logstat.py` — CLI (`python logstat.py <logfile> [--top N] [--max-bytes N]`)
  and importable API (`analyze_file`, `iter_lines`, `parse_line`,
  `render_report`, `main`).
- `tests/test_logstat.py` — 26 unittest cases, stdlib only.

## Runtime

- Python 3.11.13 (observed 2026-09-11, Windows). Declared floor: Python 3.8+
  (`from __future__ import annotations`, `dataclasses`).
- Standard library only: `argparse`, `os`, `re`, `sys`, `collections`,
  `dataclasses`, `typing`, `io`, `subprocess`, `tempfile`, `unittest`,
  `unittest.mock`. No pip installs, no network.

## Exact commands and last observed results

Run from `example/harden-full-nd/py-logstat`:

| Command | Last observed result (2026-09-11) |
|---|---|
| `python -m unittest discover -s tests -v` | `Ran 26 tests in 1.374s` / `OK`, exit code 0 (duration varies between runs; 26/26 stable) |
| `python logstat.py $env:TEMP\logstat-smoke\sample.log` | exit code 0; `total lines: 8`, `parsed: 6`, `malformed: 1`, `blank: 1`, `oversize: 0`, `error rate (5xx/parsed): 33.33%`, top path `/api/users 3` |

Full smoke output and evidence log: `HARDENING.md`.

## Layout

```
py-logstat/
  logstat.py            # single-file analyzer (CLI + API)
  tests/test_logstat.py # unittest suite (26 cases)
  HARDENING.md          # evidence log: commands, outputs, limits
  README.md             # usage, behavior contract, observed results
  AGENTS.md / CLAUDE.md # agent policy
  docs/                 # catalog + completed task record
  .agents/docs/         # orientation, architecture, workflow
```

## Provenance

- Created 2026-09-11 as part of the parent repo's `example/harden-full-nd/`
  hardening examples, following the parent policy in
  `../../../.agents/docs/WORKFLOW.md`.
- Source fingerprint at verification: `logstat.py` SHA-256
  `53EBAC91DAC7561587BC8E6958611B75219E1713E91965A5C9326429EFF3E2D4`;
  `tests/test_logstat.py` SHA-256
  `C354A4F82B20DB795044AC8672091871DA08A07E1C19DFD87EAE18EAB7E44907`.

## Known limits

- One input file per run; no directory globbing, no compressed logs.
- Single process, single pass; no streaming watch mode.
- `oversize` lines are counted, not parsed (prefix truncated at 8 KiB).
