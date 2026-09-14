#!/usr/bin/env python3
"""logstat -- streaming analyzer for combined-style web access logs.

Reads one log file in fixed-size chunks (never loads the whole file), counts
status classes and top paths, and classifies every line as parsed, malformed,
blank, or oversize. Standard library only; no network access anywhere.

Accepted line shape (combined log style):

    <ip> <ident> <user> [<timestamp>] "<METHOD> <path> HTTP/<x.y>" <status> [<bytes>]
    ... optionally followed by the standard combined-log referrer and
    user-agent fields:  "referrer" "user-agent"

Anything else is counted as malformed. Lines longer than the configured line
cap are truncated and counted as oversize (never parsed) so that memory stays
bounded and malformed junk can never crash the run.

Exit codes:
    0  success
    2  input error (missing path, directory/non-regular file, unreadable file,
       file larger than the size cap, or invalid CLI arguments)
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from typing import BinaryIO, Dict, Iterator, List, Optional, Tuple

__version__ = "1.0.0"

PROG = "logstat.py"
DEFAULT_TOP = 10
DEFAULT_MAX_FILE_BYTES = 64 * 1024 * 1024  # 64 MiB
DEFAULT_CHUNK_BYTES = 64 * 1024            # 64 KiB read window
DEFAULT_MAX_LINE_BYTES = 8 * 1024          # 8 KiB per line before oversize

EXIT_OK = 0
EXIT_INPUT_ERROR = 2

#: Line shape accepted by the parser (documented in README.md and HARDENING.md).
_LINE_RE = re.compile(
    r"^(?P<ip>\S+)\s+(?P<ident>\S+)\s+(?P<user>\S+)\s+"
    r"\[(?P<ts>[^\]]*)\]\s+"
    r'"(?P<method>[A-Z]+)\s+(?P<path>\S+)\s+HTTP/(?P<httpver>\d\.\d)"\s+'
    r"(?P<status>\d{3})"
    r"(?:\s+(?P<bytes>\d+|-))?"
    r'(?:\s+"[^"]*"\s+"[^"]*")?'
    r"\s*\Z"
)


class LogStatError(Exception):
    """Raised for input errors that map to exit code 2."""


@dataclass(frozen=True)
class ParsedLine:
    """Fields extracted from one accepted log line."""

    method: str
    path: str
    status: int
    http_version: str


def parse_line(text: str) -> Optional[ParsedLine]:
    """Return a ParsedLine for an accepted shape, or None if malformed."""
    match = _LINE_RE.match(text)
    if match is None:
        return None
    return ParsedLine(
        method=match.group("method"),
        path=match.group("path"),
        status=int(match.group("status")),
        http_version=match.group("httpver"),
    )


@dataclass
class Stats:
    """Aggregated counters for one analyzed file."""

    total_lines: int = 0
    parsed: int = 0
    malformed: int = 0
    blank: int = 0
    oversize: int = 0
    status_classes: Dict[int, int] = field(
        default_factory=lambda: {2: 0, 3: 0, 4: 0, 5: 0}
    )
    other_status: int = 0
    path_counts: Counter = field(default_factory=Counter)

    def error_rate(self) -> Optional[float]:
        """5xx / parsed, or None when there are no parsed lines."""
        if self.parsed == 0:
            return None
        return self.status_classes[5] / self.parsed

    def top_paths(self, limit: int) -> List[Tuple[str, int]]:
        """Top ``limit`` paths by count desc, then path ascending."""
        ordered = sorted(self.path_counts.items(), key=lambda item: (-item[1], item[0]))
        return ordered[: max(limit, 0)]


class _CappedReader:
    """Binary reader that aborts if the file grows past the size cap mid-read."""

    def __init__(self, fileobj: BinaryIO, max_bytes: int) -> None:
        self._fileobj = fileobj
        self._max_bytes = max_bytes
        self._consumed = 0

    def read(self, size: int = -1) -> bytes:
        chunk = self._fileobj.read(size)
        self._consumed += len(chunk)
        if self._consumed > self._max_bytes:
            raise LogStatError(
                "file grew beyond the "
                f"{self._max_bytes}-byte limit while reading; aborting"
            )
        return chunk


def iter_lines(
    fileobj: BinaryIO,
    *,
    chunk_bytes: int = DEFAULT_CHUNK_BYTES,
    max_line_bytes: int = DEFAULT_MAX_LINE_BYTES,
) -> Iterator[Tuple[bytes, bool]]:
    """Yield ``(line_bytes, oversize)`` pairs from a binary stream.

    Memory held at any moment is bounded by roughly ``2 * chunk_bytes +
    max_line_bytes``. A line longer than ``max_line_bytes`` is yielded once
    with ``oversize=True`` and only its first ``max_line_bytes`` are kept; the
    remainder is discarded without buffering.
    """
    if chunk_bytes <= 0:
        raise ValueError("chunk_bytes must be positive")
    if max_line_bytes <= 0:
        raise ValueError("max_line_bytes must be positive")

    carry = b""
    while True:
        chunk = fileobj.read(chunk_bytes)
        if not chunk:
            break
        data = carry + chunk
        start = 0
        while True:
            newline = data.find(b"\n", start)
            if newline == -1:
                break
            segment = data[start:newline]
            if len(segment) > max_line_bytes:
                yield segment[:max_line_bytes], True
            else:
                yield segment, False
            start = newline + 1
        carry = data[start:]
        if len(carry) > max_line_bytes:
            # No newline yet and already past the cap: report once, then drop
            # the remainder of this line without buffering it.
            yield carry[:max_line_bytes], True
            carry = b""
            while True:
                chunk = fileobj.read(chunk_bytes)
                if not chunk:
                    return
                newline = chunk.find(b"\n")
                if newline != -1:
                    carry = chunk[newline + 1 :]
                    break

    if carry:
        if len(carry) > max_line_bytes:
            yield carry[:max_line_bytes], True
        else:
            yield carry, False


def validate_input_path(path: str, max_file_bytes: int) -> None:
    """Raise LogStatError (exit code 2) for non-regular, missing, unreadable,
    or oversized inputs."""
    if os.path.isdir(path):
        raise LogStatError(f"not a regular file (directory): {path}")
    if not os.path.exists(path):
        raise LogStatError(f"file not found: {path}")
    if not os.path.isfile(path):
        raise LogStatError(f"not a regular file: {path}")
    try:
        size = os.path.getsize(path)
    except OSError as exc:
        raise LogStatError(f"cannot stat file: {path}: {exc}") from exc
    if size > max_file_bytes:
        raise LogStatError(
            f"file size {size} bytes exceeds limit {max_file_bytes} bytes "
            f"(--max-bytes): {path}"
        )
    try:
        with open(path, "rb") as probe:
            probe.read(1)
    except OSError as exc:
        detail = exc.strerror or str(exc)
        raise LogStatError(f"cannot read file: {path}: {detail}") from exc


def analyze_file(
    path: str,
    *,
    max_file_bytes: int = DEFAULT_MAX_FILE_BYTES,
    chunk_bytes: int = DEFAULT_CHUNK_BYTES,
    max_line_bytes: int = DEFAULT_MAX_LINE_BYTES,
) -> Stats:
    """Stream one log file and return aggregated Stats. Raises LogStatError."""
    validate_input_path(path, max_file_bytes)
    stats = Stats()
    with open(path, "rb") as fileobj:
        reader = _CappedReader(fileobj, max_file_bytes)
        for raw, oversize in iter_lines(
            reader, chunk_bytes=chunk_bytes, max_line_bytes=max_line_bytes
        ):
            stats.total_lines += 1
            if oversize:
                stats.oversize += 1
                continue
            text = raw.decode("utf-8", errors="replace").strip()
            if not text:
                stats.blank += 1
                continue
            parsed = parse_line(text)
            if parsed is None:
                stats.malformed += 1
                continue
            stats.parsed += 1
            status_class = parsed.status // 100
            if status_class in stats.status_classes:
                stats.status_classes[status_class] += 1
            else:
                stats.other_status += 1
            stats.path_counts[parsed.path] += 1
    return stats


def render_report(path: str, stats: Stats, *, top: int = DEFAULT_TOP) -> str:
    """Render a deterministic plain-text report."""
    rows = stats.status_classes
    rate = stats.error_rate()
    rate_text = "n/a (no parsed lines)" if rate is None else f"{rate * 100:.2f}%"
    top_paths = stats.top_paths(top)
    lines = [
        f"file: {path}",
        f"total lines: {stats.total_lines}",
        f"parsed: {stats.parsed}",
        f"malformed: {stats.malformed}",
        f"blank: {stats.blank}",
        f"oversize (truncated and skipped): {stats.oversize}",
        "status classes: "
        f"2xx={rows[2]} 3xx={rows[3]} 4xx={rows[4]} 5xx={rows[5]} "
        f"other={stats.other_status}",
        f"error rate (5xx/parsed): {rate_text}",
        f"top {len(top_paths)} paths:",
    ]
    for rank, (path_name, count) in enumerate(top_paths, start=1):
        lines.append(f"  {rank}. {path_name} {count}")
    return "\n".join(lines) + "\n"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog=PROG,
        description="Streaming analyzer for combined-style web access logs.",
    )
    parser.add_argument("logfile", help="path to the access log file")
    parser.add_argument(
        "--top",
        type=int,
        default=DEFAULT_TOP,
        metavar="N",
        help=f"number of top paths to report (default: {DEFAULT_TOP})",
    )
    parser.add_argument(
        "--max-bytes",
        type=int,
        default=DEFAULT_MAX_FILE_BYTES,
        metavar="N",
        help=f"maximum accepted file size in bytes (default: {DEFAULT_MAX_FILE_BYTES})",
    )
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.top < 1:
        parser.error("--top must be >= 1")
    if args.max_bytes < 1:
        parser.error("--max-bytes must be >= 1")
    try:
        stats = analyze_file(args.logfile, max_file_bytes=args.max_bytes)
    except LogStatError as exc:
        print(f"{PROG}: error: {exc}", file=sys.stderr)
        return EXIT_INPUT_ERROR
    sys.stdout.write(render_report(args.logfile, stats, top=args.top))
    return EXIT_OK


if __name__ == "__main__":
    raise SystemExit(main())
