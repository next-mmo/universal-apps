# py-logstat

Hardened example project for ND Workflow: a streaming web-access-log analyzer
written with the Python standard library only (no pip installs, no network at
runtime or in tests).

## Requirements

- Python 3.8+ (observed on Python 3.11.13, Windows)
- No third-party packages

## Run

```powershell
python logstat.py <logfile> [--top N] [--max-bytes N]
```

Examples:

```powershell
python logstat.py .\sample.log
python logstat.py .\sample.log --top 3 --max-bytes 1048576
```

Accepted line shape (combined log style; anything else is counted as
malformed and never crashes the run):

```
<ip> <ident> <user> [<timestamp>] "<METHOD> <path> HTTP/<x.y>" <status> [<bytes>]
<ip> <ident> <user> [<timestamp>] "<METHOD> <path> HTTP/<x.y>" <status> [<bytes>] "referrer" "user-agent"
```

Report fields: total lines, parsed, malformed, blank, oversize
(truncated and skipped), status-class counts (2xx/3xx/4xx/5xx/other), error
rate (5xx / parsed, `n/a` when nothing parsed), and top N paths by count
(default 10) sorted by count descending then path ascending.

Behavior notes:

- **Blank lines** (empty or whitespace-only) are counted in the `blank`
  column; they are neither parsed nor malformed.
- **Oversize lines** longer than 8 KiB are truncated, counted once in the
  `oversize` column, and never parsed. Memory stays bounded.
- **Non-UTF8 bytes** are decoded with `errors="replace"` (U+FFFD).
- Accounting invariant: `total = parsed + malformed + blank + oversize`.

Exit codes: `0` success, `2` input error (missing file, directory or other
non-regular file, unreadable file, file larger than `--max-bytes`, invalid
CLI arguments).

## Test

```powershell
python -m unittest discover -s tests -v
```

Last observed result (2026-09-11, Python 3.11.13, Windows):

```
Ran 26 tests in 1.374s

OK
```

All fixtures are created in `tempfile` directories; tests never touch the
network.

## Observed CLI smoke run

Command (fixture in a temp directory):

```powershell
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

## Docs

See [docs/README.md](docs/README.md) for the catalog (architecture, hardening
log, task record, agent policy).
