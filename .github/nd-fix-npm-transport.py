"""Apply the narrowly scoped npm ignore-resource mapping on the review branch."""
from pathlib import Path
import ast

root = Path.cwd()
nd = root / 'packages/nd-workflow'


def patch(name, old, new):
    file = nd / name
    text = file.read_text(encoding='utf-8')
    assert text.count(old) == 1, (name, old[:80], text.count(old))
    text = text.replace(old, new, 1)
    if file.suffix == '.py':
        ast.parse(text, filename=str(file))
    file.write_text(text, encoding='utf-8')


patch('scripts/validate.py', '    return data, []\n\n\ndef _is_under', '''    # npm removes .gitignore during extraction. Only the explicit npm
    # transport may store this logical resource under a non-special name.
    # Ordinary source manifests still require the real .gitignore file.
    if "source_paths" in data or "transport" in data:
        if (data.get("transport") != "npm"
                or data.get("source_paths") != {".gitignore": "gitignore.template"}
                or ".gitignore" not in files or "gitignore.template" in files):
            return {}, ["invalid npm source-path mapping"]
        logical = root / ".gitignore"
        if logical.exists() or logical.is_symlink():
            return {}, ["npm transport must have one unambiguous ignore resource"]
    return data, []


def source_path(root: Path, name: str, manifest: dict) -> Path:
    """Resolve a logical resource after full manifest/path validation."""
    return root / manifest.get("source_paths", {}).get(name, name)


def read_source_file(root: Path, name: str, manifest: dict) -> bytes:
    """Read a validated source, normalizing transport metadata for export."""
    if name == MANIFEST_FILENAME and "source_paths" in manifest:
        canonical = {key: value for key, value in manifest.items()
                     if key not in ("transport", "source_paths")}
        return (json.dumps(canonical, ensure_ascii=False, indent=2) + "\\n").encode("utf-8")
    return source_path(root, name, manifest).read_bytes()


def _is_under''')
patch('scripts/validate.py',
      '    path_errors = validate_manifest_paths(root, files)\n',
      '''    paths = data.get("source_paths", {})
    physical_files = [paths.get(name, name) if isinstance(name, str) else name for name in files]
    path_errors = validate_manifest_paths(root, physical_files)
''')
patch('scripts/validate.py',
      'def check_utf8_and_links(root: Path, files: list) -> tuple[list[str], dict]:',
      'def check_utf8_and_links(root: Path, files: list, source_paths=None) -> tuple[list[str], dict]:')
patch('scripts/validate.py',
      '                if not link_path.exists():\n',
      '''                logical_target = link_path.relative_to(root_resolved).as_posix()
                link_path = root_resolved / (source_paths or {}).get(logical_target, logical_target)
                if not link_path.exists():
''')
patch('scripts/validate.py',
      '                elif link_path.is_file() and link_path.relative_to(root_resolved).as_posix() not in files:',
      '                elif link_path.is_file() and logical_target not in files:')
patch('scripts/validate.py',
      '    link_errors, link_counts = check_utf8_and_links(root, files)',
      '    link_errors, link_counts = check_utf8_and_links(root, files, paths)')
patch('scripts/core_export.py',
      'from validate import load_manifest, validate_repo',
      'from validate import load_manifest, read_source_file, validate_repo')
patch('scripts/core_export.py',
      '        data = (root / name).read_bytes()',
      '        data = read_source_file(root, name, manifest)')
patch('scripts/core_export.py',
      "    entries['package-files.json'] = encode({**manifest, 'files': files})",
      "    canonical = json.loads(entries['package-files.json'])\n    entries['package-files.json'] = encode({**canonical, 'files': files})")
patch('scripts/package.py',
      'from validate import load_manifest, validate_repo  # noqa: E402',
      'from validate import load_manifest, read_source_file, source_path, validate_repo  # noqa: E402')
patch('scripts/package.py',
      '    output_path_errors = _check_output_path(root, output, files)',
      '    output_path_errors = _check_output_path(root, output, files + list(data.get("source_paths", {}).values()))')
patch('scripts/package.py',
      '                src = root / rel',
      '                src = source_path(root, rel, data)')
patch('scripts/package.py',
      '                data_bytes = src.read_bytes()',
      '                data_bytes = read_source_file(root, rel, data)')
patch('scripts/package.py',
      '            if zf.read(rel) != (root / rel).read_bytes():',
      '            if zf.read(rel) != read_source_file(root, rel, data):')
patch('scripts/package.py',
      '            "Byte-identical to source files",',
      '            "Canonical bytes; npm transport aliases normalized" if data.get("source_paths") else "Byte-identical to source files",')
patch('scripts/package_npm.py',
      '    metadata = json.loads(entries[\'package.json\'])',
      '''    # npm always renames or drops .gitignore on extraction. Store its bytes
    # under an explicit transport alias; canonical source/ZIP exports restore
    # the logical name without postinstall hooks or writes during validation.
    if 'gitignore.template' in entries:
        raise ValueError('Reserved npm transport resource already exists')
    entries['gitignore.template'] = entries.pop('.gitignore')
    manifest = json.loads(entries['package-files.json'])
    manifest.update(transport='npm', source_paths={'.gitignore': 'gitignore.template'})
    entries['package-files.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\\n').encode('utf-8')
    metadata = json.loads(entries['package.json'])''')
patch('tests/test_standalone_package.py',
      "        entries = json.loads((self.package / 'package-files.json').read_text())['files']",
      "        manifest = json.loads((self.package / 'package-files.json').read_text())\n        entries = [manifest.get('source_paths', {}).get(name, name) for name in manifest['files']]")
patch('tests/test_standalone_package.py',
      "        installed = consumer / 'node_modules/@next-mmo/nd-workflow'\n",
      '''        installed = consumer / 'node_modules/@next-mmo/nd-workflow'
        validated = subprocess.run([sys.executable, str(installed / 'scripts/validate.py')],
                                   cwd=consumer, env=env, capture_output=True, text=True, timeout=30)
        self.assertEqual(validated.returncode, 0, validated.stdout + validated.stderr)
        before = (consumer / 'package.json').read_bytes()
        preview = subprocess.run([shutil.which('npm'), 'exec', '--offline', '--no', '--', 'nd', 'init', '.'],
                                 cwd=consumer, env=env, capture_output=True, text=True, timeout=30)
        self.assertEqual(preview.returncode, 0, preview.stdout + preview.stderr)
        self.assertFalse((consumer / 'AGENTS.md').exists())
        self.assertEqual((consumer / 'package.json').read_bytes(), before)
''')
patch('tests/test_standalone_package.py',
      '    def test_reproducible_archive(self):',
      '''    def test_transport_alias_is_explicit_and_canonical_export_restores_it(self):
        from validate import validate_repo
        from package import package_repo
        import zipfile
        canonical = collect_core(self.package)
        self.assertIn('.gitignore', canonical)
        self.assertNotIn('gitignore.template', canonical)
        self.assertNotIn('source_paths', json.loads(canonical['package-files.json']))
        self.assertEqual(canonical['.gitignore'], (ROOT / '.gitignore').read_bytes())
        output = self.package / 'artifacts' / 'canonical.zip'
        report = package_repo(self.package, output)
        self.assertEqual(report['status'], 'PASS', report)
        with zipfile.ZipFile(output) as archive:
            self.assertEqual(archive.read('.gitignore'), canonical['.gitignore'])
            self.assertNotIn('source_paths', json.loads(archive.read('package-files.json')))
        manifest_path = self.package / 'package-files.json'
        original = manifest_path.read_bytes()
        try:
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

    def test_reproducible_archive(self):''')
patch('STANDALONE.md',
      'The tarball builder uses the validated, example-free core export, preserves dotfiles and the MIT notice, and verifies inventory and bytes.',
      'The tarball builder uses the validated, example-free core export, preserves workflow resources and the MIT notice, and verifies inventory and bytes. npm removes `.gitignore` during extraction, so this transport stores it as `gitignore.template` with an explicit, validated manifest mapping. Native source and ZIP exports retain `.gitignore`; there is no install hook or silent missing-file fallback.')
patch('package.json',
      '    "IMPORT.json"\n',
      '    "IMPORT.json",\n    "gitignore.template"\n')
print('Applied npm transport mapping, installed-command regression, and canonical export checks.')
