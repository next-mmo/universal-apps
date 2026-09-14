"""Exercise the distributed package outside its authoring monorepo."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from core_export import collect_core
from package_npm import package_npm


class StandalonePackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sandbox = tempfile.TemporaryDirectory(prefix='nd-standalone-')
        cls.base = Path(cls.sandbox.name)
        # A self-contained copy, with no authoring workspace or node_modules.
        cls.source = cls.base / 'independent source'
        for name, data in collect_core(ROOT).items():
            path = cls.source / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        cls.artifact = cls.source / 'artifacts' / 'nd.tgz'
        cls.report = package_npm(cls.source, cls.artifact)
        cls.extracted = cls.base / 'extracted'
        with tarfile.open(cls.artifact, 'r:gz') as archive:
            for member in archive.getmembers():
                parts = Path(member.name).parts
                if not member.isfile() or parts[0] != 'package' or '..' in parts:
                    raise AssertionError('Unsafe member: ' + member.name)
                target = cls.extracted / member.name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(archive.extractfile(member).read())
        cls.package = cls.extracted / 'package'

    @classmethod
    def tearDownClass(cls):
        cls.sandbox.cleanup()

    def run_nd(self, *args, cwd=None):
        return subprocess.run([sys.executable, str(self.package / 'scripts/nd.py'), *map(str, args)],
                              cwd=cwd or self.base, capture_output=True, text=True, timeout=30)

    def test_closed_inventory_and_license(self):
        entries = json.loads((self.package / 'package-files.json').read_text())['files']
        actual = sorted(str(p.relative_to(self.package)).replace('\\', '/')
                        for p in self.package.rglob('*') if p.is_file() and '__pycache__' not in p.parts)
        self.assertEqual(actual, sorted(entries))
        self.assertFalse(any(name.startswith(('example/', 'examples/')) for name in entries))
        self.assertEqual((self.package / 'LICENSE').read_bytes(), (ROOT / 'LICENSE').read_bytes())
        metadata = json.loads((self.package / 'package.json').read_text())
        self.assertEqual(metadata['name'], '@next-mmo/nd-workflow')
        self.assertFalse(metadata.get('dependencies'))
        self.assertFalse(metadata.get('peerDependencies'))
        self.assertFalse(metadata.get('devDependencies'))
        self.assertFalse(metadata.get('optionalDependencies'))
        self.assertEqual(metadata['bin']['nd'], './bin/nd.mjs')

    def test_extracted_validation_and_native_help(self):
        result = subprocess.run([sys.executable, str(self.package / 'scripts/validate.py')],
                                cwd=self.base, capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.run_nd('--help').returncode, 0)

    def test_plain_project_adoption_task_and_handover(self):
        project = self.base / 'plain project'
        project.mkdir()
        (project / 'pyproject.toml').write_text('[project]\nname = "plain"\nversion = "0.1.0"\n')
        before = sorted(p.name for p in project.iterdir())
        plan = self.base / 'reviewed-plan.json'
        preview = self.run_nd('init', project, '--plan', plan)
        self.assertEqual(preview.returncode, 0, preview.stdout + preview.stderr)
        self.assertEqual(sorted(p.name for p in project.iterdir()), before)
        # This test explicitly reviews the all-add plan for its disposable fixture.
        data = json.loads(plan.read_text())
        self.assertTrue(all(e['action'] == 'add' for e in data['entries']))
        apply = self.run_nd('init', project, '--apply-plan', plan)
        self.assertEqual(apply.returncode, 0, apply.stdout + apply.stderr)
        self.assertTrue((project / 'AGENTS.md').is_file())
        self.assertFalse((project / 'package.json').exists())
        self.assertEqual(self.run_nd('task', 'Independent exercise', '--target', project).returncode, 0)
        self.assertEqual(len(list((project / 'docs/tasks').glob('wip-*.md'))), 1)
        handover = self.run_nd('handover', '--prompt', project)
        self.assertEqual(handover.returncode, 0, handover.stdout + handover.stderr)
        self.assertIn('Independent exercise', next((project / 'docs/tasks').glob('wip-*.md')).read_text())
        lookup = self.run_nd('context', 'locate', 'handover', '--target', project)
        self.assertEqual(lookup.returncode, 0, lookup.stdout + lookup.stderr)
        # Python manifest alone does not prove which test runner the owner chose.
        self.assertEqual(self.run_nd('check', project).returncode, 2)

    @unittest.skipUnless(shutil.which('node'), 'Node is only required for the optional facade')
    def test_node_facade_preserves_unrelated_cwd_and_exit_code(self):
        project = self.base / 'node caller'
        project.mkdir()
        env = {**os.environ, 'ND_PYTHON': sys.executable}
        result = subprocess.run([shutil.which('node'), str(self.package / 'bin/nd.mjs'),
                                 'task', 'Caller cwd'], cwd=project, env=env,
                                capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(list((project / 'docs/tasks').glob('wip-*.md'))), 1)
        self.assertEqual(list((self.package / 'docs/tasks').glob('wip-*')), [])
        failed = subprocess.run([shutil.which('node'), str(self.package / 'bin/nd.mjs'), 'check'],
                                cwd=project, env=env, capture_output=True, text=True, timeout=30)
        self.assertEqual(failed.returncode, 2)

    @unittest.skipUnless(shutil.which('node') and shutil.which('npm'), 'Optional npm transport')
    def test_offline_npm_install_and_plain_node_verification(self):
        consumer = self.base / 'npm consumer'
        consumer.mkdir()
        env = {**os.environ, 'ND_PYTHON': sys.executable, 'npm_config_cache': str(self.base / 'npm-cache')}
        result = subprocess.run([shutil.which('npm'), 'install', '--offline', '--ignore-scripts',
                                 '--no-audit', '--no-fund', '--no-package-lock', str(self.artifact)],
                                cwd=consumer, env=env, capture_output=True, text=True, timeout=60)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        installed = consumer / 'node_modules/@next-mmo/nd-workflow'
        result = subprocess.run([shutil.which('node'), str(installed / 'bin/nd.mjs'), '--help'],
                                cwd=consumer, env=env, capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertTrue(any((consumer / 'node_modules/.bin').glob('nd*')))
        plain = self.base / 'plain node project'
        plain.mkdir()
        (plain / 'package.json').write_text(json.dumps({'name': 'plain', 'version': '0.0.0',
                                                       'scripts': {'test': 'node check.cjs'}}))
        (plain / 'check.cjs').write_text("require('node:assert/strict').equal(2 + 2, 4);\n")
        self.assertEqual(self.run_nd('check', plain).returncode, 0)
        (plain / 'check.cjs').write_text('process.exit(7);\n')
        self.assertEqual(self.run_nd('check', plain).returncode, 7)

    def test_exclusive_output_and_containment(self):
        before = self.artifact.read_bytes()
        with self.assertRaises(FileExistsError):
            package_npm(self.source, self.artifact)
        self.assertEqual(self.artifact.read_bytes(), before)
        with self.assertRaises(ValueError):
            package_npm(self.source, self.base / 'outside.tgz')
        self.assertFalse((self.base / 'outside.tgz').exists())

    def test_reproducible_archive(self):
        second = self.source / 'artifacts' / 'second.tgz'
        package_npm(self.source, second)
        self.assertEqual(self.artifact.read_bytes(), second.read_bytes())


if __name__ == '__main__':
    unittest.main()
