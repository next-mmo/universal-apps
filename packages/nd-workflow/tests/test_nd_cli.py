"""Behavioral regressions for honest, non-destructive ND CLI commands."""
import contextlib
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.nd import (
    ROOT,
    cmd_check,
    cmd_context_check,
    cmd_context_locate,
    cmd_doctor,
    cmd_index_build,
    cmd_index_check,
    cmd_init,
    cmd_task,
    cmd_tokens,
    detect_stack,
    token_inventory,
)


class TestNdCli(unittest.TestCase):
    def setUp(self):
        scratch = ROOT / '.validation'
        scratch.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=scratch, prefix='cli-')
        self.target = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def put(self, name, text):
        path = self.target / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
        return path

    def test_unknown_stack_fails_closed(self):
        self.assertEqual(cmd_check(str(self.target)), 2)

    def test_node_without_script_not_invented(self):
        self.put('package.json', '{"name":"test"}')
        self.assertIsNone(detect_stack(self.target)['test_cmd'])
        self.assertEqual(cmd_check(str(self.target)), 2)

    def test_node_script_and_manager_provenance(self):
        self.put('package.json', '{"scripts":{"test":"node --test"},"packageManager":"pnpm@9.0.0"}')
        self.assertEqual(detect_stack(self.target)['argv'], ['pnpm', 'test'])
        self.put('package-lock.json', '{}')
        self.assertIsNone(detect_stack(self.target)['argv'])

    def test_python_not_assumed_unittest(self):
        self.put('pyproject.toml', '[project]\nname="test"')
        self.assertEqual(detect_stack(self.target)['name'], 'Python')
        self.assertEqual(cmd_check(str(self.target)), 2)

    def test_invalid_node_metadata_rejected(self):
        for value in ([], {'scripts': {'test': 'node --test'}, 'packageManager': 7}):
            self.put('package.json', json.dumps(value))
            with self.assertRaises(ValueError):
                detect_stack(self.target)

    def test_rust_command_preserved(self):
        self.put('Cargo.toml', '[package]\nname="test"')
        self.assertEqual(detect_stack(self.target)['test_cmd'], 'cargo test')

    def test_check_propagates_failure_without_shell(self):
        self.put('Cargo.toml', '[package]\nname="test"')
        with patch('scripts.nd.shutil.which', return_value='cargo'), patch('scripts.nd.subprocess.call', return_value=7) as call:
            self.assertEqual(cmd_check(str(self.target)), 7)
            self.assertFalse(call.call_args.kwargs['shell'])

    def test_missing_executable_does_not_install(self):
        self.put('Cargo.toml', '[package]\nname="test"')
        with patch('scripts.nd.shutil.which', return_value=None), patch('scripts.nd.subprocess.call') as call:
            self.assertEqual(cmd_check(str(self.target)), 2)
            call.assert_not_called()

    def test_init_preview_preserves_project_and_selection(self):
        self.put('AGENTS.md', 'Custom security policy\n')
        self.put('.agents/docs/PROJECT.md', 'Verified project facts\n')
        self.put('.agents/skill-selection.json', '{"schema":1,"skills":[]}\n')
        before = {p.relative_to(self.target): p.read_bytes() for p in self.target.rglob('*') if p.is_file()}
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/nd.py'), 'init', str(self.target)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        after = {p.relative_to(self.target): p.read_bytes() for p in self.target.rglob('*') if p.is_file()}
        self.assertEqual(before, after)
        self.assertIn('preview', result.stdout.lower())

    def test_init_empty_preview_no_files_created(self):
        self.assertEqual(cmd_init(str(self.target)), 0)
        self.assertEqual(list(self.target.iterdir()), [])

    def test_source_target_rejected(self):
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/nd.py'), 'init', str(ROOT)], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)

    def test_task_collision_preserves_checkpoint(self):
        self.assertEqual(cmd_task('Add search', str(self.target)), 0)
        path = next((self.target / 'docs/tasks').glob('wip-*.md'))
        content = path.read_bytes()
        self.assertIn(b'Mode: draft', content)
        self.assertIn(b'not authorize implementation', content)
        with self.assertRaises(FileExistsError):
            cmd_task('Add search', str(self.target))
        self.assertEqual(path.read_bytes(), content)

    def test_task_title_invalid_no_write(self):
        for title in ('', '   ', 'x\n- Mode: implementation', 'a' * 121):
            with self.subTest(title=title), self.assertRaises(ValueError):
                cmd_task(title, str(self.target))
        self.assertEqual(list(self.target.iterdir()), [])

    def test_token_estimate_only_actual_files(self):
        self.put('AGENTS.md', 'abcdefgh')
        self.put('CLAUDE.md', '@AGENTS.md\n')
        self.put('.agents/skills/test/SKILL.md', 'abcd')
        report = token_inventory(str(self.target))
        self.assertEqual(report['root_estimated_tokens'], 5)
        self.assertEqual(report['available_skill_body_estimated_tokens'], 1)
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            self.assertEqual(cmd_tokens(str(self.target)), 0)
        self.assertNotIn('940', output.getvalue())
        self.assertNotIn('slimmest', output.getvalue())
        self.assertIn('unmeasured', output.getvalue())

    def test_missing_root_is_unknown_not_zero_cost(self):
        self.assertEqual(token_inventory(str(self.target))['status'], 'UNKNOWN')
        self.assertEqual(cmd_tokens(str(self.target)), 2)

    def test_doctor_import_and_truthful_incomplete(self):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            self.assertEqual(cmd_doctor(str(self.target)), 1)
        self.assertIn('INCOMPLETE', output.getvalue())
        self.assertNotIn('100% complete', output.getvalue())

    def test_link_target_rejected(self):
        link = self.target / 'link'
        try:
            link.symlink_to(self.target, target_is_directory=True)
        except OSError:
            self.skipTest('OS does not permit symlink creation')
        with self.assertRaises(ValueError):
            token_inventory(str(link))

    def test_cli_resources_in_distribution_manifest(self):
        files = json.loads((ROOT / 'package-files.json').read_text(encoding='utf-8'))['files']
        for name in ('scripts/nd.py', 'scripts/context_index.py', 'tests/test_nd_cli.py',
                     'tests/test_context_index.py', 'bin/nd', 'bin/nd.cmd'):
            self.assertIn(name, files)

    def test_context_locate_and_check_cli(self):
        self.put('AGENTS.md', '# Agent Instructions\nMust verify safety rules.')
        self.put('docs/tasks/wip-001.md', '# Task: Safe\n- Owner: dev\n- Scope approval: approved v1\n- Execution authorization: authorized\n- Next action: test\n- Status: active\n')

        out_build = io.StringIO()
        with contextlib.redirect_stdout(out_build):
            self.assertEqual(cmd_index_build(str(self.target)), 0)
        self.assertIn('BUILT', out_build.getvalue())

        out_idx_check = io.StringIO()
        with contextlib.redirect_stdout(out_idx_check):
            self.assertEqual(cmd_index_check(str(self.target)), 0)
        self.assertIn('FRESH', out_idx_check.getvalue())

        out_loc = io.StringIO()
        with contextlib.redirect_stdout(out_loc):
            self.assertEqual(cmd_context_locate('safety', str(self.target)), 0)
        self.assertIn('AGENTS.md', out_loc.getvalue())
        self.assertIn('Output footprint:', out_loc.getvalue())

        out_chk = io.StringIO()
        with contextlib.redirect_stdout(out_chk):
            self.assertEqual(cmd_context_check(str(self.target)), 0)
        self.assertIn('"checkpoint": "COMPLETE"', out_chk.getvalue())


if __name__ == '__main__':
    unittest.main()
