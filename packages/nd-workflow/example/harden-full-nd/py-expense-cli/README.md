# py-expense-cli

Hardened, runnable example deliverable for ND Workflow: a small expense tracker CLI
written in Python with the **standard library only**. No pip installs, no network
access at runtime or in tests.

- Source: [`expense.py`](expense.py) (argparse-based, single module)
- Tests: [`tests/test_expense.py`](tests/test_expense.py) (unittest, 26 test methods)
- Hardening evidence log: [`HARDENING.md`](HARDENING.md)
- Agent policy: [`AGENTS.md`](AGENTS.md), orientation in [`.agents/docs/PROJECT.md`](.agents/docs/PROJECT.md)

## Requirements

- Python 3.11 or newer (verified on Python 3.11.13, Windows). No third-party packages.
- No network access is used or needed. `expense.py` imports only stdlib modules and
  a static test asserts no network-capable imports exist in the source.

## Commands

```
python expense.py add <amount> <category> [--note TEXT]
python expense.py list [--category NAME]
python expense.py total [--month YYYY-MM]
```

Data directory resolution order:

1. `--data-dir PATH` flag (global, before the subcommand)
2. `EXPENSE_DATA_DIR` environment variable
3. `<script dir>/data` fallback

The store is `<data-dir>/expenses.json`. Writes are atomic: a temp file is created in
the same directory, flushed and `fsync`ed, then swapped in with `os.replace`.

## Quick start (exact commands, observed output)

Ran on 2026-09-11 in a scratch data directory (`EXPENSE_DATA_DIR` pointed at a temp dir,
so no other data was touched):

```
$ python expense.py add 12.50 food --note lunch
added 12.50 food

$ python expense.py add 7.25 transport
added 7.25 transport

$ python expense.py list
2026-09-10T20:03:25Z       12.50  food  lunch
2026-09-10T20:03:25Z        7.25  transport

$ python expense.py total
total: 19.75

$ python expense.py total --month 2026-09
total 2026-09: 19.75
```

`list` output order is deterministic: sorted by `created` timestamp, then by record `id`.
The stored JSON is serialized with `sort_keys=True`, so the file bytes are stable too.

## Tests

```
python -m unittest discover -s tests -v
```

Observed result:

```
Ran 26 tests in 0.432s

OK
```

Every test runs inside its own `tempfile.TemporaryDirectory`; the store path is always
passed via `--data-dir` or `EXPENSE_DATA_DIR`, so tests never write outside that temp
directory.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success (including empty `list` / `total` on an empty store) |
| 1 | Rejected input or a store problem (unreadable, corrupt, oversized, write failure) |
| 2 | Bad invocation (argparse usage error, unknown command, missing argument) |

Errors go to stderr as `error: ...` and never silently overwrite a store file.

## Hardening summary

Rejected: non-numeric, negative, zero, NaN/Infinity, `> 1000000`, sub-cent precision.
Sanitized: control (Cc) and format (Cf) characters stripped from category and note;
category max 40 chars, note max 200 chars, both measured after stripping.
Store: 1 MiB read cap, full schema validation on load, fail-closed on corrupt/unreadable
files (exit 1, original bytes untouched), atomic replace on write.

Full evidence and explicit limits: [`HARDENING.md`](HARDENING.md).
