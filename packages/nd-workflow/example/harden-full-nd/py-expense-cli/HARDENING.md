# HARDENING.md — evidence log

Hardening claims in this document were produced by running the commands shown, from
`example/harden-full-nd/py-expense-cli`, on Windows with Python 3.11.13. Anything not
observed is listed under [Honest limits](#honest-limits).

## 1. Test suite

Command:

```
python -m unittest discover -s tests -v
```

Observed (tail of output):

```
test_total_month_filter (test_expense.ExpenseCliTestCase.test_total_month_filter) ... ok
test_unreadable_store_is_reported (test_expense.ExpenseCliTestCase.test_unreadable_store_is_reported) ... ok
----------------------------------------------------------------------
Ran 26 tests in 0.432s

OK
```

26/26 passed, 0 failures, 0 errors, 0 skips. The suite covers 26 test methods; several
use `subTest` loops, so the number of executed cases is higher (e.g. 7 non-numeric
amounts, 4 non-positive amounts, 5 non-finite values + 3 validator-level values,
3 oversized amounts, 7 month formats, 3 corrupt-store commands, 4 bad invocations).

Each test runs in its own `tempfile.TemporaryDirectory`; the store path is always
passed via `--data-dir` or `EXPENSE_DATA_DIR`, so nothing is written outside it.

## 2. CLI smoke run

Run against a scratch `EXPENSE_DATA_DIR` in the OS temp directory:

```
$ python expense.py add 12.50 food --note lunch
added 12.50 food                    # exit 0

$ python expense.py add 7.25 transport
added 7.25 transport                # exit 0

$ python expense.py list
2026-09-10T20:03:25Z       12.50  food  lunch
2026-09-10T20:03:25Z        7.25  transport   # exit 0
```

Store file produced (observed, byte-stable ordering via `sort_keys=True`):

```json
{
  "expenses": [
    { "amount": "12.50", "category": "food", "created": "2026-09-10T20:03:25Z", "id": 1, "note": "lunch" },
    { "amount": "7.25", "category": "transport", "created": "2026-09-10T20:03:25Z", "id": 2, "note": "" }
  ],
  "version": 1
}
```

Totals observed: `python expense.py total` → `total: 19.75`;
`python expense.py total --month 2026-09` → `total 2026-09: 19.75`.

## 3. Error-path evidence (observed, in-process capture)

```
$ python expense.py add nan food
exit = 1, stderr = error: amount must be a finite number: 'nan'

$ python expense.py add -5 food
exit = 1, stderr = error: amount must not be negative: '-5'

$ python expense.py add 1000000.01 food
exit = 1, stderr = error: amount must not exceed 1000000: '1000000.01'

# store pre-filled with "{broken json":
$ python expense.py add 1.00 food
exit = 1, stderr = error: store file is corrupt and was not modified: ...\expenses.json (Expecting property name enclosed in double quotes: line 1 column 2 (char 1))

$ python expense.py list
exit = 1, same corrupt-store error

corrupt store unchanged: True        # sha256 before == after
tmp leftovers: []                    # no .expenses-*.tmp files
```

## 4. Hardening measures and where each is proven

| Measure | Implementation | Test evidence |
|---|---|---|
| Reject non-numeric amount | `parse_amount` via `Decimal` | `test_reject_non_numeric_amount` (7 values) |
| Reject negative and zero | explicit range check | `test_reject_negative_and_zero_amount` (4 values) |
| Reject NaN / Infinity | `Decimal.is_finite()` | `test_reject_nan_and_infinity` (CLI + validator level) |
| Reject absurdly large amounts | `MAX_AMOUNT = 1000000` inclusive | `test_reject_absurdly_large_amount`, `test_float_free_amount_round_trip` (boundary accepted) |
| Reject sub-cent precision (no silent rounding) | `has_at_most_decimals` | `test_reject_sub_cent_precision` |
| Exact decimal arithmetic | `Decimal`, stored as canonical string | `test_decimal_sum_is_exact` (0.10 + 0.20 → `0.30`) |
| Note length cap (200) | `sanitize_text` | `test_note_length_cap` (200 ok / 201 rejected) |
| Category length cap (40) | `sanitize_text` | `test_category_length_cap` (40 ok / 41 rejected) |
| Strip control characters | Cc and Cf removed before validation | `test_control_characters_are_stripped` (NUL, ESC, BEL, LF, U+202E, U+200B) |
| Reject empty category after stripping | `sanitize_text(required=True)` | `test_reject_category_empty_after_strip` |
| Reject unknown month formats | `MONTH_RE` = `^\d{4}-(0[1-9]\|1[0-2])$` | `test_reject_unknown_month_formats` (7 values) |
| Cap store read size (1 MiB) | stat check + bounded read | `test_store_size_cap` |
| Refuse to overwrite corrupt store | `load_store` raises before any write | `test_corrupt_store_is_rejected_and_not_overwritten`, `test_empty_store_file_is_corrupt` |
| Refuse store with invalid record shape | `validate_store` / `_record_error` | `test_store_with_invalid_record_shape_is_rejected` |
| Report unreadable store | `OSError` caught, exit 1 | `test_unreadable_store_is_reported` |
| Atomic write (temp + `os.replace`) | `save_store` `mkstemp` + `fsync` + `os.replace` | `test_successful_write_leaves_no_temp_files` |
| Failure during replace leaves store intact, temp cleaned | `finally` unlink of temp path | `test_atomic_replace_failure_preserves_store_and_cleans_temp` (patched `os.replace` → exit 1, bytes unchanged, no leftovers) |
| Deterministic output ordering | sort by `(created, id)`; JSON `sort_keys=True` | `test_list_is_deterministically_ordered` (identical repeated output) |
| No network | no network imports in source | `test_source_has_no_network_imports` (AST scan against a forbidden-import list) |

## 5. Honest limits

- **No multi-process locking.** Two concurrent writers can each read-modify-write and the
  last one wins. The atomic replace prevents torn/partial files, not lost updates.
- **No directory fsync.** `fsync` covers the temp file; the rename itself is not made
  durable against power loss (Windows also makes directory fsync non-portable here).
- **Single environment.** Verified only on Windows with Python 3.11.13. No Linux/macOS
  or other-version run was performed.
- **Store must be written by this tool (or match its canonical form).** A UTF-8 BOM prefix
  is rejected as corrupt; a hand-edited amount with more than 2 decimals is also rejected.
  The tool fails closed instead of repairing.
- **Cf stripping is intentionally aggressive.** Zero-width and bidi-override characters are
  removed; this would also strip a ZWJ inside some emoji sequences.
- **The per-expense 1,000,000 cap is policy, not a security boundary.** Totals, the number
  of records, and category/note content beyond the length caps are otherwise unbounded
  (the whole store is still capped at 1 MiB).
- **Confidentiality rests on file permissions only.** No authentication, encryption, or
  access control; it is a single-user local tool and must not hold sensitive production data.
- **Not covered:** symlinks/junctions on the data path, ACL/permission edge cases beyond
  "path is a directory", antivirus file locking, disk-full behavior, `Decimal` context
  precision beyond the default 28 significant digits, and cross-file or concurrent-reader
  semantics.
