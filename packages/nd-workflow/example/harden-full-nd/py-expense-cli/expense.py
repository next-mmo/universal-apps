#!/usr/bin/env python3
"""expense - a hardened small expense tracker CLI.

Python standard library only. No network access.

Commands:
    add <amount> <category> [--note TEXT]
    list [--category NAME]
    total [--month YYYY-MM]

Storage: <data-dir>/expenses.json, written with an atomic replace
(temp file in the same directory + os.replace). The store is read with a
size cap and validated before use; a corrupt or unreadable store aborts the
command with a non-zero exit code and is never overwritten silently.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import unicodedata
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation

STORE_FILENAME = "expenses.json"
STORE_VERSION = 1

# Upper bound for reading the JSON store (bytes). Guards against a runaway or
# hostile file being loaded into memory.
MAX_STORE_BYTES = 1_048_576  # 1 MiB

# Amount policy. MAX_AMOUNT is inclusive; anything above is "absurdly large".
MAX_AMOUNT = Decimal("1000000")
MAX_AMOUNT_DECIMALS = 2
CENTS = Decimal("0.01")

MAX_CATEGORY_LEN = 40
MAX_NOTE_LEN = 200

MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
CREATED_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")

FORBIDDEN_IMPORT_ROOTS = (
    "socket",
    "ssl",
    "http",
    "urllib",
    "ftplib",
    "smtplib",
    "telnetlib",
    "requests",
    "asyncio",
)


class ExpenseError(Exception):
    """Base class for user-facing failures; the CLI exits 1 on any of these."""


class ValidationError(ExpenseError):
    """Rejected user input."""


class StoreError(ExpenseError):
    """Store cannot be read, parsed, or written safely."""


# --------------------------------------------------------------------------
# Input sanitizing and validation
# --------------------------------------------------------------------------


def strip_control_chars(text: str) -> str:
    """Remove control (Cc) and format (Cf) characters, e.g. NUL, ESC, bidi overrides."""
    return "".join(ch for ch in text if unicodedata.category(ch) not in ("Cc", "Cf"))


def sanitize_text(raw: str, field: str, max_len: int, required: bool = True) -> str:
    cleaned = strip_control_chars(raw).strip()
    if required and not cleaned:
        raise ValidationError(f"{field} must not be empty")
    if len(cleaned) > max_len:
        raise ValidationError(f"{field} must be at most {max_len} characters (got {len(cleaned)})")
    return cleaned


def parse_amount(raw: str) -> Decimal:
    """Parse and validate an amount, returning an exact 2-decimal Decimal."""
    text = raw.strip()
    if not text:
        raise ValidationError("amount must not be empty")
    try:
        value = Decimal(text)
    except (InvalidOperation, ValueError):
        raise ValidationError(f"amount is not a number: {raw!r}") from None
    if not value.is_finite():
        raise ValidationError(f"amount must be a finite number: {raw!r}")
    if value < 0:
        raise ValidationError(f"amount must not be negative: {raw!r}")
    if value == 0:
        raise ValidationError(f"amount must be greater than zero: {raw!r}")
    if value > MAX_AMOUNT:
        raise ValidationError(f"amount must not exceed {MAX_AMOUNT}: {raw!r}")
    if not has_at_most_decimals(value, MAX_AMOUNT_DECIMALS):
        raise ValidationError(f"amount must have at most {MAX_AMOUNT_DECIMALS} decimal places: {raw!r}")
    return value.quantize(CENTS, rounding=ROUND_HALF_UP)


def has_at_most_decimals(value: Decimal, places: int) -> bool:
    exponent = value.as_tuple().exponent
    if not isinstance(exponent, int):
        return False
    return exponent >= 0 or -exponent <= places


def validate_month(raw: str) -> str:
    if not MONTH_RE.match(raw):
        raise ValidationError(f"month must use the YYYY-MM format with a real month 01-12: {raw!r}")
    return raw


# --------------------------------------------------------------------------
# Store
# --------------------------------------------------------------------------


def resolve_data_dir(cli_value: str | None) -> str:
    """CLI flag > EXPENSE_DATA_DIR env var > <script dir>/data."""
    if cli_value:
        return os.path.abspath(cli_value)
    env_value = os.environ.get("EXPENSE_DATA_DIR")
    if env_value:
        return os.path.abspath(env_value)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def empty_store() -> dict:
    return {"version": STORE_VERSION, "expenses": []}


def validate_store(payload: object, path: str) -> dict:
    if not isinstance(payload, dict):
        raise StoreError(f"store file is corrupt (root is not an object) and was not modified: {path}")
    if payload.get("version") != STORE_VERSION or not isinstance(payload.get("expenses"), list):
        raise StoreError(f"store file is corrupt (unsupported layout) and was not modified: {path}")
    records = []
    for index, item in enumerate(payload["expenses"]):
        reason = _record_error(item)
        if reason:
            raise StoreError(f"store file is corrupt (record {index}: {reason}) and was not modified: {path}")
        records.append(
            {
                "id": item["id"],
                "created": item["created"],
                "amount": item["amount"],
                "category": item["category"],
                "note": item.get("note", ""),
            }
        )
    return {"version": STORE_VERSION, "expenses": records}


def _record_error(item: object) -> str | None:
    if not isinstance(item, dict):
        return "not an object"
    for key in ("id", "created", "amount", "category"):
        if key not in item:
            return f"missing {key!r}"
    if isinstance(item["id"], bool) or not isinstance(item["id"], int) or item["id"] < 1:
        return "id must be a positive integer"
    if not isinstance(item["created"], str) or not CREATED_RE.match(item["created"]):
        return "created must be an ISO-8601 UTC timestamp"
    if not isinstance(item["amount"], str):
        return "amount must be a string"
    try:
        amount = Decimal(item["amount"])
    except (InvalidOperation, ValueError):
        return "amount is not a number"
    if not amount.is_finite() or amount <= 0 or amount > MAX_AMOUNT or not has_at_most_decimals(amount, MAX_AMOUNT_DECIMALS):
        return "amount is outside the accepted range"
    if not isinstance(item["category"], str) or not item["category"]:
        return "category must be a non-empty string"
    note = item.get("note", "")
    if not isinstance(note, str):
        return "note must be a string"
    return None


def load_store(path: str) -> dict:
    """Read and validate the store. Raises StoreError; never writes."""
    if not os.path.exists(path):
        return empty_store()
    try:
        size = os.path.getsize(path)
    except OSError as exc:
        raise StoreError(f"cannot stat store file {path}: {exc.strerror or exc}") from exc
    if size > MAX_STORE_BYTES:
        raise StoreError(f"store file exceeds the {MAX_STORE_BYTES} byte size limit: {path}")
    try:
        with open(path, "rb") as handle:
            data = handle.read(MAX_STORE_BYTES + 1)
    except OSError as exc:
        raise StoreError(f"cannot read store file {path}: {exc.strerror or exc}") from exc
    if len(data) > MAX_STORE_BYTES:
        raise StoreError(f"store file exceeds the {MAX_STORE_BYTES} byte size limit: {path}")
    try:
        payload = json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise StoreError(f"store file is corrupt and was not modified: {path} ({exc})") from exc
    return validate_store(payload, path)


def save_store(path: str, store: dict) -> None:
    """Atomically replace the store: temp file in the same directory + os.replace."""
    directory = os.path.dirname(path) or "."
    try:
        os.makedirs(directory, exist_ok=True)
    except OSError as exc:
        raise StoreError(f"cannot create data directory {directory}: {exc.strerror or exc}") from exc
    payload = json.dumps(store, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    tmp_path = None
    try:
        descriptor, tmp_path = tempfile.mkstemp(prefix=".expenses-", suffix=".tmp", dir=directory)
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp_path, path)
        tmp_path = None
    except OSError as exc:
        raise StoreError(f"cannot write store file {path}: {exc.strerror or exc}") from exc
    finally:
        if tmp_path is not None:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass


# --------------------------------------------------------------------------
# Commands
# --------------------------------------------------------------------------


def cmd_add(args: argparse.Namespace, store: dict) -> int:
    amount = parse_amount(args.amount)
    category = sanitize_text(args.category, "category", MAX_CATEGORY_LEN)
    note = sanitize_text(args.note or "", "note", MAX_NOTE_LEN, required=False)
    record = {
        "id": max((item["id"] for item in store["expenses"]), default=0) + 1,
        "created": utc_now(),
        "amount": str(amount),
        "category": category,
        "note": note,
    }
    store["expenses"].append(record)
    print(f"added {record['amount']} {record['category']}")
    return 0


def cmd_list(args: argparse.Namespace, store: dict) -> int:
    records = sorted(store["expenses"], key=lambda item: (item["created"], item["id"]))
    if args.category is not None:
        wanted = sanitize_text(args.category, "category", MAX_CATEGORY_LEN)
        records = [item for item in records if item["category"] == wanted]
    if not records:
        print("no expenses")
        return 0
    for item in records:
        line = f"{item['created']}  {item['amount']:>10}  {item['category']}"
        if item["note"]:
            line += f"  {item['note']}"
        print(line)
    return 0


def cmd_total(args: argparse.Namespace, store: dict) -> int:
    records = store["expenses"]
    label = "total"
    if args.month is not None:
        month = validate_month(args.month)
        records = [item for item in records if item["created"][:7] == month]
        label = f"total {month}"
    total = sum((Decimal(item["amount"]) for item in records), Decimal("0"))
    print(f"{label}: {total:.2f}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="expense",
        description="Hardened expense tracker CLI (stdlib only, no network).",
    )
    parser.add_argument(
        "--data-dir",
        default=None,
        help="directory holding expenses.json (default: $EXPENSE_DATA_DIR or <script dir>/data)",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    add = subparsers.add_parser("add", help="add one expense")
    add.add_argument("amount", help="positive amount, at most 2 decimal places")
    add.add_argument("category", help=f"category name (max {MAX_CATEGORY_LEN} chars)")
    add.add_argument("--note", default="", help=f"optional note (max {MAX_NOTE_LEN} chars)")

    listing = subparsers.add_parser("list", help="list expenses in deterministic order")
    listing.add_argument("--category", default=None, help="only show this category")

    total = subparsers.add_parser("total", help="sum expenses")
    total.add_argument("--month", default=None, help="only sum this month, YYYY-MM")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    store_path = os.path.join(resolve_data_dir(args.data_dir), STORE_FILENAME)
    try:
        store = load_store(store_path)
        if args.command == "add":
            code = cmd_add(args, store)
            save_store(store_path, store)
            return code
        if args.command == "list":
            return cmd_list(args, store)
        if args.command == "total":
            return cmd_total(args, store)
    except ExpenseError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    parser.error(f"unknown command {args.command!r}")  # pragma: no cover
    return 2  # pragma: no cover


if __name__ == "__main__":
    sys.exit(main())
