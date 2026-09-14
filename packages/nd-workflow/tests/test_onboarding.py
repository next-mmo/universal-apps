from pathlib import Path
import base64
import copy
import json
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from setup_project import preview, apply_plan, load_plan, JOURNAL, digest
from workflow_doctor import inspect_project


class OnboardingTests(unittest.TestCase):
    def setUp(self):
        base = ROOT / '.validation' / 'onboarding-tests'
        base.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=base)
        self.root = Path(self.temp.name)
        self.target = self.root / 'app'
        self.target.mkdir()
        self.files = {'AGENTS.md': b'ND policy\n', '.agents/docs/PROJECT.md': b'UNSET\n'}
        self.mock = patch('setup_project.adoption_files', return_value=self.files)
        self.mock.start()

    def tearDown(self):
        self.mock.stop()
        self.temp.cleanup()

    def test_preview_no_write_and_fresh_apply(self):
        plan = preview(ROOT, self.target)
        self.assertEqual(list(self.target.iterdir()), [])
        result = apply_plan(ROOT, self.target, plan)
        self.assertEqual(result['status'], 'APPLIED')
        self.assertEqual(result['host_loading'], 'UNVERIFIED')
        self.assertEqual((self.target / 'AGENTS.md').read_bytes(), self.files['AGENTS.md'])
        self.assertTrue((self.target / JOURNAL / 'COMPLETE').exists())

    def test_existing_conflict_preserves_dirty_work(self):
        (self.target / 'AGENTS.md').write_bytes(b'User policy\n')
        (self.target / 'app.js').write_bytes(b'dirty app')
        plan = preview(ROOT, self.target)
        with self.assertRaises(ValueError):
            apply_plan(ROOT, self.target, plan)
        self.assertEqual((self.target / 'app.js').read_bytes(), b'dirty app')
        self.assertFalse((self.target / JOURNAL).exists())

    def test_reviewed_merge_backs_up_exact_bytes(self):
        original = b'User policy\r\n'
        (self.target / 'AGENTS.md').write_bytes(original)
        plan = preview(ROOT, self.target)
        entry = next(e for e in plan['entries'] if e['path'] == 'AGENTS.md')
        entry.update(action='merge', merged_text='User policy\r\nND policy\r\n')
        apply_plan(ROOT, self.target, plan)
        recovery = json.loads((self.target / JOURNAL / 'recovery.json').read_text())
        record = next(e for e in recovery['files'] if e['path'] == 'AGENTS.md')
        self.assertEqual(base64.b64decode(record['before_base64']), original)
        self.assertEqual(record['before_sha256'], digest(original))

    def test_skip_and_reuse(self):
        (self.target / 'AGENTS.md').write_bytes(self.files['AGENTS.md'])
        plan = preview(ROOT, self.target)
        for entry in plan['entries']:
            if entry['action'] == 'add':
                entry['action'] = 'skip'
        self.assertEqual(apply_plan(ROOT, self.target, plan)['status'], 'NO_CHANGES')
        self.assertFalse((self.target / JOURNAL).exists())

    def test_stale_target_and_source(self):
        plan = preview(ROOT, self.target)
        (self.target / 'AGENTS.md').write_bytes(b'concurrent edit')
        with self.assertRaises(ValueError):
            apply_plan(ROOT, self.target, plan)
        plan = preview(ROOT, self.target)
        self.files['AGENTS.md'] = b'new source'
        with self.assertRaises(ValueError):
            apply_plan(ROOT, self.target, plan)
        self.assertFalse((self.target / JOURNAL).exists())

    def test_malformed_unsafe_and_duplicate_plans(self):
        original = preview(ROOT, self.target)
        for name in ('../escape', 'NUL.txt', '.env', 'file:stream', '/absolute'):
            plan = copy.deepcopy(original)
            plan['entries'][0]['path'] = name
            with self.subTest(name=name), self.assertRaises(ValueError):
                apply_plan(ROOT, self.target, plan)
        plan = copy.deepcopy(original)
        plan['entries'].append(plan['entries'][0])
        with self.assertRaises(ValueError):
            apply_plan(ROOT, self.target, plan)
        for plan in ([], {}, {'schema': True, 'target': str(self.target), 'entries': []}):
            with self.assertRaises(ValueError):
                apply_plan(ROOT, self.target, plan)
        self.assertEqual(list(self.target.iterdir()), [])

    def test_wrong_target_and_removed_entry(self):
        plan = preview(ROOT, self.target)
        plan['target'] = str(self.root)
        with self.assertRaises(ValueError):
            apply_plan(ROOT, self.target, plan)
        plan = preview(ROOT, self.target)
        plan['entries'].pop()
        with self.assertRaises(ValueError):
            apply_plan(ROOT, self.target, plan)

    def test_repeat_and_interrupted_apply(self):
        plan = preview(ROOT, self.target)
        import setup_project
        write = setup_project.write_exclusive
        def fail_done(path, data):
            if path.suffix == '.done':
                raise OSError('simulated interruption')
            return write(path, data)
        with patch('setup_project.write_exclusive', side_effect=fail_done):
            with self.assertRaises(OSError):
                apply_plan(ROOT, self.target, plan)
        self.assertTrue((self.target / JOURNAL / 'recovery.json').exists())
        self.assertFalse((self.target / JOURNAL / 'COMPLETE').exists())
        self.assertEqual(inspect_project(self.target)['journal'], 'INCOMPLETE_REVIEW_REQUIRED')
        fresh = preview(ROOT, self.target)
        with self.assertRaises(FileExistsError):
            apply_plan(ROOT, self.target, fresh)

    def test_symlink_rejected(self):
        outside = self.root / 'outside'
        outside.write_bytes(b'user')
        try:
            (self.target / 'AGENTS.md').symlink_to(outside)
        except OSError:
            self.skipTest('Symlink privilege unavailable')
        with self.assertRaises(ValueError):
            preview(ROOT, self.target)
        self.assertEqual(outside.read_bytes(), b'user')

    def test_doctor_read_only_and_migration_indicators(self):
        (self.target / 'AGENTS.md').write_text('Use Superpowers', encoding='utf-8')
        before = [(p.name, p.read_bytes()) for p in self.target.iterdir()]
        result = inspect_project(self.target)
        self.assertEqual(result['superpowers_references'], ['AGENTS.md'])
        self.assertEqual(result['host_loading'], 'UNVERIFIED')
        self.assertEqual(result['application_baseline'], 'NOT_RUN')
        self.assertEqual(before, [(p.name, p.read_bytes()) for p in self.target.iterdir()])
        self.assertIn('token_efficiency', result)
        self.assertEqual(result['token_efficiency']['status'], 'TOKEN_SAVER')

    def test_doctor_token_efficiency_evaluation(self):
        # Create a small file: within budget
        (self.target / 'AGENTS.md').write_text('Small agent policy', encoding='utf-8')
        res1 = inspect_project(self.target)
        self.assertEqual(res1['token_efficiency']['status'], 'TOKEN_SAVER')
        self.assertEqual(len(res1['token_efficiency']['warnings']), 0)

        # Create an over-budget file (>2500 estimated tokens, >10,000 chars)
        bloated_text = 'A' * 10500
        (self.target / 'AGENTS.md').write_text(bloated_text, encoding='utf-8')
        res2 = inspect_project(self.target)
        self.assertEqual(res2['token_efficiency']['status'], 'TOKEN_BURNER')
        self.assertEqual(res2['status'], 'ATTENTION')
        self.assertTrue(any('exceeds budget' in w for w in res2['token_efficiency']['warnings']))

    def test_case_collision_and_non_directory_ancestor(self):
        (self.target / 'agents.md').write_bytes(b'user')
        with self.assertRaises(ValueError):
            preview(ROOT, self.target)

    def test_completed_apply_refuses_repeat(self):
        apply_plan(ROOT, self.target, preview(ROOT, self.target))
        with self.assertRaises(FileExistsError):
            apply_plan(ROOT, self.target, preview(ROOT, self.target))

    def test_duplicate_json_keys(self):
        path = self.root / 'plan.json'
        path.write_text('{"schema":1,"schema":1}', encoding='utf-8')
        with self.assertRaises(ValueError):
            load_plan(path)

    def test_bundle_and_source_profile_and_cli(self):
        self.mock.stop()
        from build_plugins import collect
        entries = collect(ROOT, 'claude-code')
        plugin = self.root / 'plugin'
        for name, data in entries.items():
            path = plugin / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        source = preview(ROOT, self.target)
        self.assertEqual(source, preview(plugin, self.target))
        self.assertFalse(any(e['path'].startswith(('scripts/', 'tests/', 'example/')) for e in source['entries']))
        self.assertIn('skills/nd-setup-project/references/superpowers.md', entries)
        result = subprocess.run([sys.executable, str(plugin / 'scripts/setup_project.py'), '--target', str(self.target)], cwd=self.target, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(json.loads(result.stdout), source)
        self.assertEqual(list(self.target.iterdir()), [])
        plan_path = self.root / 'review.json'
        command = [sys.executable, str(plugin / 'scripts/setup_project.py'), '--target', str(self.target)]
        saved = subprocess.run(command + ['--plan', str(plan_path)], capture_output=True, text=True)
        self.assertEqual(saved.returncode, 0, saved.stdout + saved.stderr)
        applied = subprocess.run(command + ['--apply-plan', str(plan_path)], capture_output=True, text=True)
        self.assertEqual(applied.returncode, 0, applied.stdout + applied.stderr)
        diagnosis = inspect_project(self.target)
        self.assertEqual(diagnosis['missing'], [])
        self.assertEqual(diagnosis['findings'], [])
        self.assertEqual(diagnosis['host_loading'], 'UNVERIFIED')
        self.mock.start()


if __name__ == '__main__':
    unittest.main()
