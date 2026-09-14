#!/usr/bin/env python3
"""Tests for expense.py.

Standard library only. Every test runs inside its own TemporaryDirectory and
never writes outside it (the store path is always passed via --data-dir or
EXPENSE_DATA_DIR).

Run from the project root:  python -m unittest discover -s tests -v
"""

from __future__ import annotations

import ast
import glob
import io
import json
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from unittest import mock

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import expense  # noqa: E402  (import after sys.path setup)


class ExpenseCliTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory(prefix="expense-test-")
        self.addCleanup(self._tmp.cleanup)
        self.data_dir = self._tmp.name

    # -- helpers ---------------------------------------------------------

    def run_cli(self, *argv: str) -> tuple[int, str, str]:
        stdout, stderr = io.StringIO(), io.StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            code = expense.main(["--data-dir", self.data_dir, *argv])
        return code, stdout.getvalue(), stderr.getvalue()

    def store_path(self) -> str:
        return os.path.join(self.data_dir, expense.STORE_FILENAME)

    def read_store(self) -> dict:
        with open(self.store_path(), "r", encoding="utf-8") as handle:
            return json.load(handle)

    def write_raw(self, text: str) -> bytes:
        payload = text.encode("utf-8")
        with open(self.store_path(), "wb") as handle:
            handle.write(payload)
        return payload

    def read_raw(self) -> bytes:
        with open(self.store_path(), "rb") as handle:
            return handle.read()

    def temp_leftovers(self) -> list[str]:
        return glob.glob(os.path.join(self.data_dir, ".expenses-*.tmp"))

    # -- happy paths -----------------------------------------------------

    def test_add_then_list_happy_path(self) -> None:
        code, out, err = self.run_cli("add", "12.50", "food", "--note", "lunch")
        self.assertEqual((code, err), (0, ""))
        self.assertIn("added 12.50 food", out)
        self.assertTrue(os.path.exists(self.store_path()))

        code, out, err = self.run_cli("list")
        self.assertEqual((code, err), (0, ""))
        self.assertIn("12.50", out)
        self.assertIn("food", out)
        self.assertIn("lunch", out)

        store = self.read_store()
        self.assertEqual(store["version"], expense.STORE_VERSION)
        self.assertEqual(len(store["expenses"]), 1)
        record = store["expenses"][0]
        self.assertEqual(record["id"], 1)
        self.assertEqual(record["amount"], "12.50")
        self.assertEqual(record["category"], "food")
        self.assertEqual(record["note"], "lunch")

    def test_data_dir_env_var_fallback(self) -> None:
        stdout, stderr = io.StringIO(), io.StringIO()
        with mock.patch.dict(os.environ, {"EXPENSE_DATA_DIR": self.data_dir}, clear=False):
            with redirect_stdout(stdout), redirect_stderr(stderr):
                code = expense.main(["add", "3.00", "coffee"])
        self.assertEqual(code, 0)
        self.assertTrue(os.path.exists(self.store_path()))

    def test_decimal_sum_is_exact(self) -> None:
        self.assertEqual(self.run_cli("add", "0.10", "a")[0], 0)
        self.assertEqual(self.run_cli("add", "0.20", "b")[0], 0)
        code, out, _ = self.run_cli("total")
        self.assertEqual(code, 0)
        self.assertEqual(out.strip(), "total: 0.30")

    def test_total_month_filter(self) -> None:
        with mock.patch.object(expense, "utc_now", side_effect=["2026-08-31T23:59:00Z", "2026-09-01T00:00:00Z"]):
            self.assertEqual(self.run_cli("add", "5.00", "food")[0], 0)
            self.assertEqual(self.run_cli("add", "7.00", "travel")[0], 0)
        code, out, _ = self.run_cli("total")
        self.assertEqual((code, out.strip()), (0, "total: 12.00"))
        code, out, _ = self.run_cli("total", "--month", "2026-09")
        self.assertEqual((code, out.strip()), (0, "total 2026-09: 7.00"))
        code, out, _ = self.run_cli("total", "--month", "2026-07")
        self.assertEqual((code, out.strip()), (0, "total 2026-07: 0.00"))

    def test_list_is_deterministically_ordered(self) -> None:
        times = [
            "2026-09-03T10:00:00Z",
            "2026-09-01T10:00:00Z",
            "2026-09-02T10:00:00Z",
            "2026-09-02T10:00:00Z",
        ]
        with mock.patch.object(expense, "utc_now", side_effect=times):
            for amount, category in (("1.00", "third"), ("2.00", "first"), ("3.00", "second-a"), ("4.00", "second-b")):
                self.assertEqual(self.run_cli("add", amount, category)[0], 0)
        code, out, _ = self.run_cli("list")
        self.assertEqual(code, 0)
        lines = out.strip().splitlines()
        self.assertEqual(len(lines), 4)
        self.assertTrue(lines[0].startswith("2026-09-01T10:00:00Z"))
        self.assertIn("first", lines[0])
        self.assertTrue(lines[1].startswith("2026-09-02T10:00:00Z"))
        self.assertIn("second-a", lines[1])
        self.assertIn("second-b", lines[2])
        self.assertTrue(lines[3].startswith("2026-09-03T10:00:00Z"))
        self.assertEqual(out, self.run_cli("list")[1])

    def test_list_category_filter(self) -> None:
        self.assertEqual(self.run_cli("add", "1.00", "food")[0], 0)
        self.assertEqual(self.run_cli("add", "2.00", "travel")[0], 0)
        code, out, err = self.run_cli("list", "--category", "food")
        self.assertEqual((code, err), (0, ""))
        self.assertIn("food", out)
        self.assertNotIn("travel", out)
        code, out, _ = self.run_cli("list", "--category", "nope")
        self.assertEqual((code, out.strip()), (0, "no expenses"))

    def test_float_free_amount_round_trip(self) -> None:
        self.assertEqual(self.run_cli("add", "1.5", "snack")[0], 0)
        self.assertEqual(self.read_store()["expenses"][0]["amount"], "1.50")
        self.assertEqual(self.run_cli("add", "1000000", "boundary")[0], 0)
        self.assertEqual(self.read_store()["expenses"][1]["amount"], "1000000.00")

    # -- amount hardening ------------------------------------------------

    def test_reject_non_numeric_amount(self) -> None:
        for bad in ("abc", "twelve", "", "12,50", "1.2.3", "12.5x", "$5"):
            with self.subTest(amount=bad):
                code, _, err = self.run_cli("add", bad, "food")
                self.assertEqual(code, 1)
                self.assertIn("error: amount", err)
                self.assertFalse(os.path.exists(self.store_path()))

    def test_reject_negative_and_zero_amount(self) -> None:
        for bad in ("-0.01", "-100", "0", "0.00"):
            with self.subTest(amount=bad):
                code, _, err = self.run_cli("add", bad, "food")
                self.assertEqual(code, 1)
                self.assertIn("error: amount", err)
                self.assertFalse(os.path.exists(self.store_path()))

    def test_reject_nan_and_infinity(self) -> None:
        for bad in ("nan", "NaN", "inf", "Infinity", "1e999"):
            with self.subTest(amount=bad):
                code, _, err = self.run_cli("add", bad, "food")
                self.assertEqual(code, 1)
                self.assertIn("error: amount", err)
                self.assertFalse(os.path.exists(self.store_path()))
        # "-inf" / "-nan" look like options to argparse, so they never reach the
        # CLI positional; the validator itself must still reject them.
        for bad in ("-inf", "-nan", "-Infinity"):
            with self.subTest(amount=bad, level="validator"):
                with self.assertRaises(expense.ValidationError):
                    expense.parse_amount(bad)

    def test_reject_absurdly_large_amount(self) -> None:
        for bad in ("1000000.01", "1e30", "99999999999999999999"):
            with self.subTest(amount=bad):
                code, _, err = self.run_cli("add", bad, "food")
                self.assertEqual(code, 1)
                self.assertIn("error: amount", err)

    def test_reject_sub_cent_precision(self) -> None:
        code, _, err = self.run_cli("add", "1.005", "food")
        self.assertEqual(code, 1)
        self.assertIn("decimal places", err)
        self.assertFalse(os.path.exists(self.store_path()))

    # -- text hardening --------------------------------------------------

    def test_note_length_cap(self) -> None:
        ok_code, _, err = self.run_cli("add", "1.00", "food", "--note", "x" * 200)
        self.assertEqual((ok_code, err), (0, ""))
        self.assertEqual(len(self.read_store()["expenses"][0]["note"]), 200)

        bad_code, _, err = self.run_cli("add", "1.00", "food", "--note", "x" * 201)
        self.assertEqual(bad_code, 1)
        self.assertIn("note", err)
        self.assertEqual(len(self.read_store()["expenses"]), 1)

    def test_category_length_cap(self) -> None:
        self.assertEqual(self.run_cli("add", "1.00", "c" * 40)[0], 0)
        code, _, err = self.run_cli("add", "1.00", "c" * 41)
        self.assertEqual(code, 1)
        self.assertIn("category", err)
        self.assertEqual(len(self.read_store()["expenses"]), 1)

    def test_control_characters_are_stripped(self) -> None:
        code, _, err = self.run_cli(
            "add", "2.00", "fo\x00o\x1b[31m", "--note", "lu\x07nch\n\u202e\u200b"
        )
        self.assertEqual((code, err), (0, ""))
        record = self.read_store()["expenses"][0]
        self.assertEqual(record["category"], "foo[31m")
        self.assertEqual(record["note"], "lunch")
        raw = self.read_raw().decode("utf-8")
        self.assertNotIn("\x07", raw)
        self.assertNotIn("\x1b", raw)
        self.assertNotIn("\u202e", raw)

    def test_reject_category_empty_after_strip(self) -> None:
        for bad in (" ", "\x00", "\t\n", "\u202e"):
            with self.subTest(category=bad):
                code, _, err = self.run_cli("add", "1.00", bad)
                self.assertEqual(code, 1)
                self.assertIn("category", err)
                self.assertFalse(os.path.exists(self.store_path()))

    # -- month hardening -------------------------------------------------

    def test_reject_unknown_month_formats(self) -> None:
        for bad in ("2026-13", "2026-00", "2026-1", "2026/01", "abc", "2026-01-01", ""):
            with self.subTest(month=bad):
                code, _, err = self.run_cli("total", "--month", bad)
                self.assertEqual(code, 1)
                self.assertIn("month", err)

    # -- store hardening -------------------------------------------------

    def test_corrupt_store_is_rejected_and_not_overwritten(self) -> None:
        original = self.write_raw("{not json at all")
        for argv in (("list",), ("total",), ("add", "1.00", "food")):
            with self.subTest(argv=argv):
                code, _, err = self.run_cli(*argv)
                self.assertEqual(code, 1)
                self.assertIn("corrupt", err)
                self.assertEqual(self.read_raw(), original)

    def test_empty_store_file_is_corrupt(self) -> None:
        self.write_raw("")
        code, _, err = self.run_cli("add", "1.00", "food")
        self.assertEqual(code, 1)
        self.assertIn("corrupt", err)
        self.assertEqual(self.read_raw(), b"")

    def test_store_with_invalid_record_shape_is_rejected(self) -> None:
        payload = json.dumps({"version": 1, "expenses": [{"id": 1, "amount": "1.00"}]})
        original = self.write_raw(payload)
        code, _, err = self.run_cli("list")
        self.assertEqual(code, 1)
        self.assertIn("corrupt", err)
        self.assertEqual(self.read_raw(), original)

    def test_store_size_cap(self) -> None:
        original = self.write_raw("0" * (expense.MAX_STORE_BYTES + 1))
        code, _, err = self.run_cli("add", "1.00", "food")
        self.assertEqual(code, 1)
        self.assertIn("size limit", err)
        self.assertEqual(self.read_raw(), original)

    def test_unreadable_store_is_reported(self) -> None:
        os.mkdir(self.store_path())  # reading this path raises OSError
        code, _, err = self.run_cli("add", "1.00", "food")
        self.assertEqual(code, 1)
        self.assertIn("error:", err)
        self.assertTrue(os.path.isdir(self.store_path()))

    # -- atomic write ----------------------------------------------------

    def test_atomic_replace_failure_preserves_store_and_cleans_temp(self) -> None:
        self.assertEqual(self.run_cli("add", "10.00", "food")[0], 0)
        before = self.read_raw()
        with mock.patch.object(expense.os, "replace", side_effect=OSError(28, "simulated replace failure")):
            code, _, err = self.run_cli("add", "20.00", "travel")
        self.assertEqual(code, 1)
        self.assertIn("cannot write store file", err)
        self.assertEqual(self.read_raw(), before)
        self.assertEqual(self.temp_leftovers(), [])

        code, out, _ = self.run_cli("total")
        self.assertEqual((code, out.strip()), (0, "total: 10.00"))

    def test_successful_write_leaves_no_temp_files(self) -> None:
        self.assertEqual(self.run_cli("add", "1.00", "food")[0], 0)
        self.assertEqual(self.temp_leftovers(), [])
        self.assertEqual(self.run_cli("add", "2.00", "travel")[0], 0)
        self.assertEqual(self.temp_leftovers(), [])
        self.assertEqual(len(self.read_store()["expenses"]), 2)

    # -- process-level contract ------------------------------------------

    def test_invalid_invocation_exits_two(self) -> None:
        for argv in (["bogus"], [], ["add"], ["add", "1.00"]):
            with self.subTest(argv=argv):
                with self.assertRaises(SystemExit) as ctx:
                    with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                        expense.main(["--data-dir", self.data_dir, *argv])
                self.assertEqual(ctx.exception.code, 2)

    def test_source_has_no_network_imports(self) -> None:
        source_path = os.path.join(PROJECT_ROOT, "expense.py")
        with open(source_path, "r", encoding="utf-8") as handle:
            tree = ast.parse(handle.read(), filename=source_path)
        imported: set[str] = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imported.update(alias.name.split(".")[0] for alias in node.names)
            elif isinstance(node, ast.ImportFrom) and node.module:
                imported.add(node.module.split(".")[0])
        offending = imported.intersection(expense.FORBIDDEN_IMPORT_ROOTS)
        self.assertEqual(offending, set(), f"network-capable imports found: {sorted(offending)}")


if __name__ == "__main__":
    unittest.main()
