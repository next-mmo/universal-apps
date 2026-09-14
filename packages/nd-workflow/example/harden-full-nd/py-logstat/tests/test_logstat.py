#!/usr/bin/env python3
"""Unit tests for logstat.py.

Deterministic, stdlib-only, no network. All fixtures are written inside a
per-test temporary directory that unittest removes on teardown; nothing is
written outside it.
"""

from __future__ import annotations

import io
import os
import re
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import logstat  # noqa: E402  (path setup must run first)

CLI = os.path.join(PROJECT_ROOT, "logstat.py")
TS = "10/Oct/2026:13:55:36 +0700"


def line(
    ip: str = "10.0.0.1",
    ts: str = TS,
    method: str = "GET",
    path: str = "/index.html",
    status: int = 200,
    size: str = "1234",
    ident: str = "-",
    user: str = "-",
) -> str:
    """Build one well-formed combined-style log line."""
    return f'{ip} {ident} {user} [{ts}] "{method} {path} HTTP/1.1" {status} {size}'


class LogstatTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory(prefix="logstat-test-")
        self.tmpdir = self._tmp.name

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def write(self, name: str, data: bytes) -> str:
        path = os.path.join(self.tmpdir, name)
        with open(path, "wb") as fh:
            fh.write(data)
        return path

    def write_text(self, name: str, text: str) -> str:
        return self.write(name, text.encode("utf-8"))

    def run_cli(self, *args: str):
        env = dict(os.environ)
        env["PYTHONIOENCODING"] = "utf-8"
        return subprocess.run(
            [sys.executable, CLI, *args],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env=env,
            cwd=self.tmpdir,
            timeout=60,
        )


class HappyPathTests(LogstatTestCase):
    def test_happy_path_counts(self) -> None:
        content = "\n".join(
            [
                line(path="/index.html", status=200),
                line(path="/old", status=301),
                line(path="/missing", status=404),
                line(path="/api/x", status=500),
            ]
        )
        stats = logstat.analyze_file(self.write_text("ok.log", content + "\n"))
        self.assertEqual(stats.total_lines, 4)
        self.assertEqual(stats.parsed, 4)
        self.assertEqual(stats.malformed, 0)
        self.assertEqual(stats.blank, 0)
        self.assertEqual(stats.oversize, 0)
        self.assertEqual(
            stats.status_classes, {2: 1, 3: 1, 4: 1, 5: 1}
        )
        self.assertEqual(stats.other_status, 0)
        self.assertEqual(stats.error_rate(), 0.25)

    def test_combined_log_trailing_referrer_and_user_agent_parses(self) -> None:
        content = (
            line(path="/assets/app.js", status=200)
            + ' "https://example.test/" "Mozilla/5.0 (Windows NT 10.0)"'
            + "\n"
        )
        stats = logstat.analyze_file(self.write_text("combined.log", content))
        self.assertEqual(stats.parsed, 1)
        self.assertEqual(stats.path_counts["/assets/app.js"], 1)

    def test_last_line_without_trailing_newline_is_counted(self) -> None:
        path = self.write_text("noline.log", line(path="/only"))
        stats = logstat.analyze_file(path)
        self.assertEqual(stats.total_lines, 1)
        self.assertEqual(stats.parsed, 1)

    def test_whitespace_only_file_is_all_blank(self) -> None:
        stats = logstat.analyze_file(self.write_text("empty.log", ""))
        self.assertEqual(stats.total_lines, 0)
        self.assertEqual(stats.error_rate(), None)
        report = logstat.render_report("empty.log", stats)
        self.assertIn("error rate (5xx/parsed): n/a (no parsed lines)", report)


class ClassificationTests(LogstatTestCase):
    def test_blank_lines_counted_not_malformed(self) -> None:
        content = "\n".join([line(), "", "   ", "\t", line(status=404)]) + "\n"
        stats = logstat.analyze_file(self.write_text("blanks.log", content))
        self.assertEqual(stats.total_lines, 5)
        self.assertEqual(stats.parsed, 2)
        self.assertEqual(stats.blank, 3)
        self.assertEqual(stats.malformed, 0)

    def test_malformed_lines_counted_and_never_crash(self) -> None:
        content = "\n".join(
            [
                line(),
                "this is not a log line at all",
                '127.0.0.1 - - [x] "GET / HTTP/1.1" 20x 1',
                '127.0.0.1 - - [x] "GET / HTTP/1.1"',
                "",
            ]
        )
        stats = logstat.analyze_file(self.write_text("bad.log", content + "\n"))
        self.assertEqual(stats.total_lines, 5)
        self.assertEqual(stats.parsed, 1)
        self.assertEqual(stats.malformed, 3)
        self.assertEqual(stats.blank, 1)

    def test_non_utf8_bytes_decoded_with_replacement_and_no_crash(self) -> None:
        bad_ip = b"10.0.0.\xff"
        bad_path = b"/caf\xe9"
        data = (
            bad_ip + b' - - [' + TS.encode() + b'] "GET /a HTTP/1.1" 200 1\n'
            + b'10.0.0.2 - - [' + TS.encode() + b'] "GET ' + bad_path
            + b' HTTP/1.1" 200 2\n'
        )
        stats = logstat.analyze_file(self.write("nonutf8.log", data))
        self.assertEqual(stats.total_lines, 2)
        self.assertEqual(stats.parsed, 2)
        self.assertEqual(stats.malformed, 0)
        self.assertIn("/caf\ufffd", stats.path_counts)

    def test_very_long_line_is_oversize_and_neighbors_still_parse(self) -> None:
        data = (
            (line(path="/before") + "\n").encode()
            + b"a" * 20000
            + b"\n"
            + (line(path="/after") + "\n").encode()
        )
        stats = logstat.analyze_file(self.write("long.log", data))
        self.assertEqual(stats.total_lines, 3)
        self.assertEqual(stats.parsed, 2)
        self.assertEqual(stats.oversize, 1)
        self.assertEqual(stats.malformed, 0)
        self.assertEqual(sorted(stats.path_counts), ["/after", "/before"])

    def test_status_class_buckets_and_other(self) -> None:
        statuses = [204, 302, 418, 503, 100, 999]
        content = "".join(line(path=f"/s{s}", status=s) + "\n" for s in statuses)
        stats = logstat.analyze_file(self.write_text("statuses.log", content))
        self.assertEqual(stats.parsed, 6)
        self.assertEqual(stats.status_classes, {2: 1, 3: 1, 4: 1, 5: 1})
        self.assertEqual(stats.other_status, 2)

    def test_line_counter_accounting_invariant_holds(self) -> None:
        content = "\n".join(
            [line(), "junk", "", line(status=500), "x" * 9000]
        )
        stats = logstat.analyze_file(
            self.write_text("mixed.log", content + "\n")
        )
        self.assertEqual(
            stats.parsed + stats.malformed + stats.blank + stats.oversize,
            stats.total_lines,
        )


class ErrorRateAndOrderingTests(LogstatTestCase):
    def test_error_rate_math_exact_and_rendered(self) -> None:
        content = ""
        for i in range(8):
            status = 500 if i < 2 else 200
            content += line(path=f"/p{i}", status=status) + "\n"
        stats = logstat.analyze_file(self.write_text("rate.log", content))
        self.assertEqual(stats.parsed, 8)
        self.assertEqual(stats.error_rate(), 0.25)
        report = logstat.render_report("rate.log", stats)
        self.assertIn("error rate (5xx/parsed): 25.00%", report)

    def test_error_rate_is_none_without_parsed_lines(self) -> None:
        stats = logstat.analyze_file(self.write_text("nomatch.log", "junk\njunk\n"))
        self.assertIsNone(stats.error_rate())
        self.assertNotIn("%", logstat.render_report("nomatch.log", stats).splitlines()[-2])

    def test_deterministic_ordering_for_equal_counts(self) -> None:
        content = "".join(
            line(path=p) + "\n" for p in ["/c", "/a", "/b"]
        )
        stats = logstat.analyze_file(self.write_text("order.log", content))
        self.assertEqual(
            [p for p, _ in stats.top_paths(10)], ["/a", "/b", "/c"]
        )

    def test_top_n_limit_respected_by_api_and_cli(self) -> None:
        content = "".join(line(path=f"/p{i}") + "\n" for i in range(15))
        path = self.write_text("many.log", content)
        stats = logstat.analyze_file(path)
        self.assertEqual(len(stats.top_paths(10)), 10)
        self.assertEqual(len(stats.top_paths(3)), 3)
        result = self.run_cli(path, "--top", "3")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("top 3 paths:", result.stdout)
        rendered_paths = [
            row for row in result.stdout.splitlines() if row.strip().startswith(tuple("1234567890"))
        ]
        self.assertEqual(len(rendered_paths), 3)

    def test_repeated_analysis_is_byte_identical(self) -> None:
        content = "".join(
            [line(path="/b") + "\n", line(path="/a", status=500) + "\n", "junk\n"]
        )
        path = self.write_text("determinism.log", content)
        first = logstat.analyze_file(path)
        second = logstat.analyze_file(path)
        self.assertEqual(first.status_classes, second.status_classes)
        self.assertEqual(first.top_paths(10), second.top_paths(10))
        self.assertEqual(
            logstat.render_report("x", first), logstat.render_report("x", second)
        )


class StreamingTests(LogstatTestCase):
    def test_iter_lines_bounded_read_sizes(self) -> None:
        payload = ("\n".join(line(path=f"/p{i}") for i in range(200)) + "\n").encode()
        stream = io.BytesIO(payload)
        reads = []

        class Recorder(io.BytesIO):
            def read(self, size=-1):  # type: ignore[override]
                reads.append(size)
                return super().read(size)

        data = Recorder(payload)
        yielded = list(
            logstat.iter_lines(data, chunk_bytes=64, max_line_bytes=8192)
        )
        self.assertEqual(len(yielded), 200)
        self.assertTrue(all(not oversize for _, oversize in yielded))
        self.assertGreater(len(reads), 1)
        self.assertTrue(all(size == 64 for size in reads))

    def test_iter_lines_cap_boundary_exact(self) -> None:
        exact = list(
            logstat.iter_lines(
                io.BytesIO(b"x" * 10 + b"\n"), chunk_bytes=4, max_line_bytes=10
            )
        )
        self.assertEqual(exact, [(b"x" * 10, False)])
        over = list(
            logstat.iter_lines(
                io.BytesIO(b"x" * 11 + b"\n"), chunk_bytes=4, max_line_bytes=10
            )
        )
        self.assertEqual(len(over), 1)
        self.assertEqual(over[0][0], b"x" * 10)
        self.assertTrue(over[0][1])

    def test_small_chunk_sizes_keep_line_accounting_correct(self) -> None:
        content = "".join(
            [line(path="/small-chunk") + "\n", line(path="/other") + "\n"]
        )
        path = self.write_text("chunked.log", content)
        stats = logstat.analyze_file(path, chunk_bytes=7, max_line_bytes=8192)
        self.assertEqual(stats.total_lines, 2)
        self.assertEqual(stats.parsed, 2)
        self.assertEqual(stats.path_counts["/small-chunk"], 1)

    def test_capped_reader_aborts_when_stream_exceeds_cap(self) -> None:
        reader = logstat._CappedReader(io.BytesIO(b"0123456789ABCDEF"), max_bytes=10)
        with self.assertRaises(logstat.LogStatError):
            reader.read(16)


class InputErrorTests(LogstatTestCase):
    def test_missing_file_raises_and_cli_exits_2(self) -> None:
        missing = os.path.join(self.tmpdir, "nope.log")
        with self.assertRaises(logstat.LogStatError) as ctx:
            logstat.analyze_file(missing)
        self.assertIn("file not found", str(ctx.exception))
        result = self.run_cli(missing)
        self.assertEqual(result.returncode, 2)
        self.assertIn("file not found", result.stderr)

    def test_directory_argument_raises_and_cli_exits_2(self) -> None:
        with self.assertRaises(logstat.LogStatError) as ctx:
            logstat.analyze_file(self.tmpdir)
        self.assertIn("directory", str(ctx.exception))
        result = self.run_cli(self.tmpdir)
        self.assertEqual(result.returncode, 2)
        self.assertIn("directory", result.stderr)

    def test_size_cap_exceeded_raises_and_cli_exits_2(self) -> None:
        path = self.write_text("big.log", line() + "\n" + "y" * 5000 + "\n")
        with self.assertRaises(logstat.LogStatError) as ctx:
            logstat.analyze_file(path, max_file_bytes=100)
        self.assertIn("exceeds limit", str(ctx.exception))
        result = self.run_cli(path, "--max-bytes", "100")
        self.assertEqual(result.returncode, 2)
        self.assertIn("exceeds limit", result.stderr)

    def test_unreadable_path_reports_clear_error(self) -> None:
        path = self.write_text("locked.log", line() + "\n")
        with mock.patch(
            "builtins.open", side_effect=PermissionError(13, "Permission denied")
        ):
            with self.assertRaises(logstat.LogStatError) as ctx:
                logstat.analyze_file(path)
        self.assertIn("cannot read file", str(ctx.exception))

    def test_invalid_top_value_exits_2(self) -> None:
        path = self.write_text("ok.log", line() + "\n")
        result = self.run_cli(path, "--top", "0")
        self.assertEqual(result.returncode, 2)


class CLISmokeTests(LogstatTestCase):
    def test_cli_smoke_report_and_exit_code(self) -> None:
        content = "".join(
            [
                line(path="/a", status=200) + "\n",
                line(path="/b", status=404) + "\n",
                line(path="/c", status=500) + "\n",
                "junk line\n",
                "\n",
            ]
        )
        path = self.write_text("smoke.log", content)
        result = self.run_cli(path)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("total lines: 5", result.stdout)
        self.assertIn("parsed: 3", result.stdout)
        self.assertIn("malformed: 1", result.stdout)
        self.assertIn("blank: 1", result.stdout)
        self.assertIn("status classes: 2xx=1 3xx=0 4xx=1 5xx=1 other=0", result.stdout)
        self.assertIn("error rate (5xx/parsed): 33.33%", result.stdout)
        self.assertIn("top 3 paths:", result.stdout)


class PolicyTests(LogstatTestCase):
    def test_source_imports_no_network_modules(self) -> None:
        with open(CLI, "r", encoding="utf-8") as fh:
            source = fh.read()
        offenders = re.findall(
            r"^\s*(?:import|from)\s+(socket|urllib|http|requests|ftplib|smtplib)\b",
            source,
            flags=re.MULTILINE,
        )
        self.assertEqual(offenders, [])


if __name__ == "__main__":
    unittest.main()
