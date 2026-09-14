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
        # Resolve only the test root's OS alias (/var on macOS), not output links.
        cls.base = Path(cls.sandbox.name).resolve()
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
        manifest = json.loads((self.package / 'package-files.json').read_text())
        entries = [manifest.get('source_paths', {}).get(name, name) for name in manifest['files']]
        actual = sorted(p.relative_to(self.package).as_posix() for p in self.package.rglob('*')
                        if p.is_file() and '__pycache__' not in p.parts)
        self.assertEqual(actual, sorted(entries))
        self.assertFalse(any(name.startswith(('example/', 'examples/')) for name in entries))
        self.assertEqual((self.package / 'LICENSE').read_bytes(), (ROOT / 'LICENSE').read_bytes())
        metadata = json.loads((self.package / 'package.json').read_text())
        self.assertEqual(metadata['name'], '@next-mmo/nd-workflow')
        for field in ('dependencies', 'peerDependencies', 'devDependencies', 'optionalDependencies'):
            self.assertFalse(metadata.get(field))
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
        # Explicitly approve the all-add plan for this disposable fixture only.
        data = json.loads(plan.read_text())
        self.assertTrue(all(e['action'] == 'add' for e in data['entries']))
        apply = self.run_nd('init', project, '--apply-plan', plan)
        self.assertEqual(apply.returncode, 0, apply.stdout + apply.stderr)
        self.assertTrue((project / 'AGENTS.md').is_file())
        self.assertFalse((project / 'package.json').exists())
        self.assertEqual(self.run_nd('task', 'Independent exercise', '--target', project).returncode, 0)
        tasks = list((project / 'docs/tasks').glob('wip-*.md'))
        self.assertEqual(len(tasks), 1)
        self.assertIn('Independent exercise', tasks[0].read_text())
        handover = self.run_nd('handover', '--prompt', project)
        self.assertEqual(handover.returncode, 0, handover.stdout + handover.stderr)
        lookup = self.run_nd('context', 'locate', 'handover', '--target', project)
        self.assertEqual(lookup.returncode, 0, lookup.stdout + lookup.stderr)
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
        validated = subprocess.run([sys.executable, str(installed / 'scripts/validate.py')],
                                   cwd=consumer, env=env, capture_output=True, text=True, timeout=30)
        self.assertEqual(validated.returncode, 0, validated.stdout + validated.stderr)
        before = (consumer / 'package.json').read_bytes()
        preview = subprocess.run([shutil.which('npm'), 'exec', '--offline', '--no', '--', 'nd', 'init', '.'],
                                 cwd=consumer, env=env, capture_output=True, text=True, timeout=30)
        self.assertEqual(preview.returncode, 0, preview.stdout + preview.stderr)
        self.assertFalse((consumer / 'AGENTS.md').exists())
        self.assertEqual((consumer / 'package.json').read_bytes(), before)
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

    def test_transport_alias_is_explicit_and_canonical_export_restores_it(self):
        from validate import validate_repo
        from package import package_repo
        import zipfile
        canonical = collect_core(self.package)
        self.assertIn('.gitignore', canonical)
        self.assertNotIn('gitignore.template', canonical)
        self.assertNotIn('source_paths', json.loads(canonical['package-files.json']))
        self.assertEqual(canonical['.gitignore'], collect_core(ROOT)['.gitignore'])
        output = self.package / 'artifacts' / 'canonical.zip'
        report = package_repo(self.package, output)
        self.assertEqual(report['status'], 'PASS', report)
        with zipfile.ZipFile(output) as archive:
            self.assertEqual(archive.read('.gitignore'), canonical['.gitignore'])
            self.assertNotIn('source_paths', json.loads(archive.read('package-files.json')))
        manifest_path = self.package / 'package-files.json'
        original = manifest_path.read_bytes()
        try:
            from validate import load_manifest
            for collision in ('.GITIGNORE', 'GitIgnore.template'):
                manifest = json.loads(original)
                manifest['files'].append(collision)
                manifest_path.write_text(json.dumps(manifest))
                self.assertIn('invalid npm source-path mapping', load_manifest(self.package)[1])
            manifest = json.loads(original)
            manifest['source_paths'] = {'.gitignore': '../outside'}
            manifest_path.write_text(json.dumps(manifest))
            self.assertEqual(validate_repo(self.package)['status'], 'FAIL')
            manifest.pop('source_paths')
            manifest.pop('transport')
            manifest_path.write_text(json.dumps(manifest))
            # An ordinary manifest never accepts a missing .gitignore.
            self.assertEqual(validate_repo(self.package)['status'], 'FAIL')
        finally:
            manifest_path.write_bytes(original)
        alias = self.package / 'gitignore.template'
        content = alias.read_bytes()
        try:
            alias.unlink()
            self.assertEqual(validate_repo(self.package)['status'], 'FAIL')
        finally:
            alias.write_bytes(content)

    def test_shipped_tests_work_from_the_extracted_transport(self):
        # Run shipped fixture/packaging checks, not just a source-tree test that
        # invokes the extracted CLI. This catches authoring-only paths.
        commands = [
            ['tests/test_tooling.py', 'TestValidatePositive', 'TestPackage', '-v'],
            ['-m', 'unittest', 'discover', '-s', 'tests', '-p',
             'test_standalone_package.py', '-k', 'transport_alias', '-v'],
        ]
        for command in commands:
            with self.subTest(command=command):
                result = subprocess.run([sys.executable, *command], cwd=self.package,
                                        capture_output=True, text=True, timeout=90)
                output = result.stdout + result.stderr
                self.assertEqual(result.returncode, 0, output)
                self.assertNotIn('Ran 0 tests', output)

    def test_reproducible_archive(self):
        second = self.source / 'artifacts' / 'second.tgz'
        package_npm(self.source, second)
        self.assertEqual(self.artifact.read_bytes(), second.read_bytes())


if __name__ == '__main__':
    unittest.main()
