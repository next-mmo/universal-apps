"""CLI-level regressions for `nd context` and `nd index`: exit codes, bounded output, truthfulness."""
import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path

from scripts.nd import (
    ROOT, cmd_context_check, cmd_context_locate, cmd_handover, cmd_index_build, cmd_index_check,
)

CATALOG = """# Documentation Catalog

| Topic | Canonical path | Read when |
|---|---|---|
| Handover guide | [HANDOVER.md](HANDOVER.md) | Pausing and transferring ownership |
"""


class NdContextCli(unittest.TestCase):
    def setUp(self):
        scratch = ROOT / '.validation'
        scratch.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=scratch, prefix='ctx-cli-')
        self.target = Path(self.temp.name)
        self.put('AGENTS.md', '# Agent Instructions\n\n- policy\n')
        self.put('docs/README.md', CATALOG)
        self.put('docs/HANDOVER.md', '# Handover\n\nResume steps for successors.\n')
        self.put('docs/tasks/wip-0001-alpha.md',
                 '# Task: Alpha\n\n- Owner / integration: root session\n'
                 '- Scope approval: approved 2026-01-01\n'
                 '- Execution authorization: explicit start given\n'
                 '- Next action: continue alpha work\n- Status: active\n')

    def tearDown(self):
        self.temp.cleanup()

    def put(self, name, text):
        path = self.target / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
        return path

    def call_cli(self, function, *args, **kwargs):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = function(*args, **kwargs)
        return code, output.getvalue()

    def json_part(self, text):
        return json.loads(text.split('\nOutput footprint:')[0])

    def test_index_build_then_check_exit_codes(self):
        code, output = self.call_cli(cmd_index_build, str(self.target))
        self.assertEqual(code, 0, output)
        self.assertIn('disposable', output)
        code, output = self.call_cli(cmd_index_check, str(self.target))
        self.assertEqual(code, 0, output)
        self.assertIn('FRESH', output)
        path = self.target / 'docs' / 'HANDOVER.md'
        path.write_text('# Handover\n\nEdited content.\n', encoding='utf-8')
        code, output = self.call_cli(cmd_index_check, str(self.target))
        self.assertEqual(code, 2)
        self.assertIn('docs/HANDOVER.md', output)

    def test_index_check_without_cache_explains_and_fails(self):
        code, output = self.call_cli(cmd_index_check, str(self.target))
        self.assertEqual(code, 2)
        self.assertIn('MISSING', output)
        self.assertIn('nd index build', output)

    def test_context_check_ready_only_when_truthful(self):
        code, output = self.call_cli(cmd_context_check, str(self.target))
        self.assertEqual(code, 0, output)  # no cache is allowed; live lookup still works
        report = self.json_part(output)
        self.assertEqual(report['checkpoint'], 'COMPLETE')
        self.assertEqual(report['status'], 'READY')
        self.assertEqual(report['cache'], 'MISSING')
        self.call_cli(cmd_index_build, str(self.target))
        code, output = self.call_cli(cmd_context_check, str(self.target))
        self.assertEqual(code, 0, output)
        task = self.target / 'docs/tasks/wip-0001-alpha.md'
        task.write_text(task.read_text(encoding='utf-8') + '- Extra checkpoint line\n', encoding='utf-8')
        code, output = self.call_cli(cmd_context_check, str(self.target))
        self.assertEqual(code, 2, output)  # a stale cache must not stay READY
        report = self.json_part(output)
        self.assertEqual(report['status'], 'ATTENTION')
        self.assertEqual(report['cache_freshness'], 'STALE')
        self.assertEqual(report['host_loading'], 'UNVERIFIED')

    def test_context_check_output_stays_bounded(self):
        self.call_cli(cmd_index_build, str(self.target))
        _, output = self.call_cli(cmd_context_check, str(self.target))
        self.assertLessEqual((len(output) + 3) // 4, 500, output)

    def test_locate_returns_bounded_routes_and_footprint(self):
        self.call_cli(cmd_index_build, str(self.target))
        code, output = self.call_cli(cmd_context_locate, 'handover resume', str(self.target), 9, False)
        self.assertEqual(code, 0, output)
        report = self.json_part(output)
        self.assertTrue(report['results'])
        self.assertLessEqual(len(report['results']), 5)
        for item in report['results']:
            self.assertLessEqual(len(item['excerpt']), 208)
            self.assertTrue(item['verified'])
        self.assertIn('Output footprint:', output)

    def test_locate_absent_topic_exits_two_without_fabrication(self):
        code, output = self.call_cli(cmd_context_locate, 'zzz-no-such-topic', str(self.target), 5, False)
        self.assertEqual(code, 2)
        self.assertIn('not proof', output.lower())

    def test_locate_history_opt_in(self):
        self.put('docs/tasks/done/done-0001-old.md', '# Done: old work\n\nHistoric albatross details.\n')
        code, output = self.call_cli(cmd_context_locate, 'albatross', str(self.target), 5, False)
        self.assertEqual(code, 2, output)
        code, output = self.call_cli(cmd_context_locate, 'albatross', str(self.target), 5, True)
        self.assertEqual(code, 0, output)
        report = self.json_part(output)
        self.assertTrue(any(item['path'].endswith('done-0001-old.md') for item in report['results']))

    def test_context_subcommands_reachable_via_argparse(self):
        import subprocess
        import sys
        result = subprocess.run(
            [sys.executable, str(ROOT / 'scripts/nd.py'), 'context', 'locate', 'handover',
             '--target', str(self.target)],
            capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('docs/HANDOVER.md', result.stdout)

    def test_handover_command_and_prompt(self):
        code, output = self.call_cli(cmd_handover, str(self.target))
        self.assertEqual(code, 0, output)
        data = json.loads(output)
        self.assertEqual(data['status'], 'HANDOVER_READY')
        self.assertEqual(data['task'], 'docs/tasks/wip-0001-alpha.md')
        self.assertEqual(data['owner'], 'root session')
        self.assertEqual(data['scope_approval'], 'approved 2026-01-01')

        # Test prompt mode
        code, prompt_out = self.call_cli(cmd_handover, str(self.target), prompt=True)
        self.assertEqual(code, 0, prompt_out)
        self.assertIn('ND FRESH-SESSION HANDOVER PROMPT', prompt_out)
        self.assertIn('docs/tasks/wip-0001-alpha.md', prompt_out)
        self.assertIn('root session', prompt_out)

        # Test no active task
        task_path = self.target / 'docs/tasks/wip-0001-alpha.md'
        task_path.unlink()
        code, no_task_out = self.call_cli(cmd_handover, str(self.target))
        self.assertEqual(code, 1, no_task_out)
        self.assertIn('NO_ACTIVE_TASK', no_task_out)


if __name__ == '__main__':
    unittest.main()
