# Architecture — py-expense-cli

## Modules

Everything lives in one file, [`expense.py`](../../expense.py), split into five sections:

1. **Error types** — `ExpenseError` (base; the CLI maps it to exit code 1),
   `ValidationError` (rejected input), `StoreError` (store read/parse/write failure).
2. **Input validation** — `strip_control_chars` (removes Cc/Cf characters),
   `sanitize_text` (strip → required check → length cap), `parse_amount`
   (`Decimal` → finite → positive → `<= MAX_AMOUNT` → at most 2 decimals → quantize to cents),
   `validate_month` (`^\d{4}-(0[1-9]|1[0-2])$`), `has_at_most_decimals`.
3. **Store layer** — `resolve_data_dir` (`--data-dir` > `EXPENSE_DATA_DIR` > `<script>/data`),
   `load_store` (existence → stat size cap → bounded binary read → UTF-8 decode → JSON parse
   → `validate_store`), `validate_store`/`_record_error` (schema check per record),
   `save_store` (temp file in the same directory → write → flush → `fsync` → `os.replace`,
   temp unlinked on any failure).
4. **Commands** — `cmd_add` (validate everything first, append, then persist),
   `cmd_list` (sort by `(created, id)`, optional category filter),
   `cmd_total` (optional month filter, `Decimal` sum).
5. **CLI** — `build_parser` (argparse subcommands + global `--data-dir`), `main(argv)`
   (load store once, dispatch, catch `ExpenseError` → `error: ...` on stderr + return 1).

`tests/test_expense.py` drives `main([...])` in-process with `--data-dir` pointed at a
per-test `TemporaryDirectory`; one test patches `os.replace` to simulate a failed write.

## Data flow

```
argv → argparse → resolve_data_dir → load_store (cap + parse + schema validate)
     → command:
         add   : validate input → build record (id = max+1, created = UTC now)
                 → append in memory → save_store (atomic replace) → stdout "added ..."
         list  : sort (created, id) → optional filter → stdout lines
         total : optional month filter → Decimal sum → stdout "total ...: X.YZ"
     → exit code 0, or 1 on ExpenseError (store untouched), or argparse's 2 on usage errors
```

The store file is the only persistent state. JSON is written with `sort_keys=True`,
`indent=2`, LF newlines, and no BOM.

## Trust boundaries

- **CLI arguments are untrusted input.** All of it is parsed as text and validated before
  use; nothing is interpolated into paths or shell commands, and the amount is never a
  float.
- **The store file is untrusted on read** (it may be hand-edited, truncated, or replaced).
  It is size-capped (1 MiB), decoded strictly as UTF-8, schema-validated per record, and
  any doubt results in a `StoreError` — the command aborts with exit 1 and never writes,
  so a bad file is never overwritten silently.
- **Output is safe data.** Only sanitized fields (control/format characters removed,
  length-capped) are persisted and printed; raw input is not echoed into the store.
- **No network, no subprocesses, no third-party code.** A static test asserts the source
  imports no network-capable modules.
- **Not a security boundary:** file permissions are the only access control; there is no
  encryption, authentication, or multi-process locking (see HARDENING.md limits).
