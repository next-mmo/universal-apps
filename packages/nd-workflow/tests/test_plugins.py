from pathlib import Path
import hashlib
import json
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from build_plugins import build, collect, ADAPTER, TARGETS
from stage_project import stage, STAGE

class PluginTests(unittest.TestCase):
    def setUp(self):
        base = ROOT / '.validation' / 'plugin-tests'
        base.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=base)
        self.root = Path(self.temp.name)
    def tearDown(self):
        self.temp.cleanup()
    def extract(self, target='claude-code'):
        out = self.root / (target + '.zip')
        build(ROOT, target, out)
        dest = self.root / target
        dest.mkdir()
        with zipfile.ZipFile(out) as archive:
            archive.extractall(dest)  # Only locally generated, allowlisted archive.
        return dest
    def test_three_manifest_formats_and_shared_bodies(self):
        for target, manifest in TARGETS.items():
            entries = collect(ROOT, target)
            metadata = json.loads(entries[manifest])
            self.assertEqual(metadata['name'], 'workflow-starter')
            self.assertEqual(metadata['version'], '0.1.0-beta.1')
            for name in json.loads((ROOT/'plugins/plugin-config.json').read_text(encoding='utf-8'))['skills']:
                original = (ROOT/f'.agents/skills/{name}/SKILL.md').read_text(encoding='utf-8')
                header, body = original.split('\n---\n', 1)
                generated = entries[f'skills/{name}/SKILL.md'].decode()
                self.assertTrue(generated.startswith(header+'\n---\n'))
                self.assertIn(ADAPTER, generated)
                self.assertTrue(generated.endswith(body.lstrip('\n')))
                self.assertIn('starter/.agents/templates/TASK.md', entries)
            self.assertFalse(any(name.startswith(('hooks/', 'mcp')) for name in entries))
    def test_codex_schema_and_presentation(self):
        data = json.loads(collect(ROOT, 'codex')['plugin.json'])
        self.assertEqual(data['$schema'], 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json')
        self.assertEqual(len(data['extensions']['com.openai']['interface']['defaultPrompt']), 3)
        self.assertFalse(set(data) - {'$schema','name','version','description','extensions'})
    def test_chatgpt_instructions_and_presentation(self):
        entries = collect(ROOT, 'chatgpt')
        data = json.loads(entries['.chatgpt/plugin.json'])
        self.assertEqual(data['name'], 'workflow-starter')
        self.assertIn('instructions', data)
        self.assertIn('INSTRUCTIONS.md', entries)
        self.assertIn('Core Workflow Principles', entries['INSTRUCTIONS.md'].decode('utf-8'))
    def test_windsurf_and_continue_targets(self):
        windsurf_entries = collect(ROOT, 'windsurf')
        self.assertIn('.windsurf/plugin.json', windsurf_entries)
        self.assertIn('.windsurfrules', windsurf_entries)
        self.assertIn('.windsurf/rules/workflow.md', windsurf_entries)

        continue_entries = collect(ROOT, 'continue')
        self.assertIn('.continue/plugin.json', continue_entries)
        self.assertIn('.continue/prompts/nd-spec-feature.prompt', continue_entries)
        self.assertIn('.continue/prompts/nd-converge-check.prompt', continue_entries)
    def test_deterministic_zip_and_collision(self):
        a=self.root/'a.zip'; b=self.root/'b.zip'
        result=build(ROOT,'cursor',a); build(ROOT,'cursor',b)
        self.assertEqual(a.read_bytes(), b.read_bytes())
        self.assertEqual(result['sha256'],hashlib.sha256(a.read_bytes()).hexdigest())
        with self.assertRaises(FileExistsError): build(ROOT,'cursor',a)
        self.assertEqual(a.read_bytes(),b.read_bytes())

    def test_skills_toggle_and_cli_override(self):
        # Override to bundle only a single skill
        entries = collect(ROOT, 'claude-code', skills_override=['nd-setup-project'])
        self.assertIn('skills/nd-setup-project/SKILL.md', entries)
        self.assertNotIn('skills/nd-doc-lookup/SKILL.md', entries)
        self.assertNotIn('skills/nd-converge-check/SKILL.md', entries)

        # Empty override should raise ValueError
        with self.assertRaises(ValueError):
            collect(ROOT, 'claude-code', skills_override=[])
    def test_unknown_target_and_outside_destination(self):
        with self.assertRaises(ValueError): collect(ROOT,'not-supported')
        with self.assertRaises(ValueError): build(ROOT,'cursor',ROOT.parent/'outside-plugin-test.zip')
    def test_preview_and_apply_preserve_live_project(self):
        plugin=self.extract(); project=self.root/'project'; project.mkdir()
        (project/'AGENTS.md').write_text('User policy',encoding='utf-8')
        result=stage(plugin,project)
        self.assertEqual(result['status'],'PREVIEW')
        self.assertFalse((project/STAGE).exists())
        self.assertIn('AGENTS.md',result['project_collisions'])
        stage(plugin,project,True)
        self.assertEqual((project/'AGENTS.md').read_text(encoding='utf-8'),'User policy')
        self.assertEqual((project/STAGE/'AGENTS.md').read_bytes(),(ROOT/'AGENTS.md').read_bytes())
        with self.assertRaises(FileExistsError): stage(plugin,project,True)
    def test_tampered_bundle_rejected_before_write(self):
        plugin=self.extract(); project=self.root/'project'; project.mkdir()
        (plugin/'starter/AGENTS.md').write_text('tampered',encoding='utf-8')
        with self.assertRaises(ValueError): stage(plugin,project,True)
        self.assertFalse((project/STAGE).exists())
    def test_unsafe_path_rejected_before_write(self):
        plugin=self.extract(); project=self.root/'project'; project.mkdir()
        meta=plugin/'bundle.json'; value=json.loads(meta.read_text(encoding='utf-8')); value['canonical_sha256']['../escape']='x'; meta.write_text(json.dumps(value), encoding='utf-8', newline='\n')
        with self.assertRaises(ValueError): stage(plugin,project,True)
        self.assertFalse((project/STAGE).exists())
    def test_all_resources_match_hashes(self):
        entries=collect(ROOT,'codex'); hashes=json.loads(entries['bundle.json'])['canonical_sha256']
        for name,digest in hashes.items():
            self.assertEqual(hashlib.sha256(entries['starter/'+name]).hexdigest(),digest)
        self.assertEqual(entries['scripts/stage_project.py'],(ROOT/'scripts/stage_project.py').read_bytes())

    def test_core_export_is_closed_and_validates(self):
        from validate import validate_repo
        plugin = self.extract()
        core = plugin / 'starter'
        manifest = json.loads((core / 'package-files.json').read_text(encoding='utf-8'))
        self.assertFalse(any(p.startswith(('example/', 'examples/')) for p in manifest['files']))
        report = validate_repo(core)
        self.assertEqual(report['status'], 'PASS', report['errors'])

    def test_source_preview_and_apply_match_plugin(self):
        project = self.root / 'existing'; project.mkdir()
        original = b'Existing policy\n'
        (project / 'AGENTS.md').write_bytes(original)
        preview = stage(ROOT, project)
        self.assertFalse((project / STAGE).exists())
        self.assertIn('AGENTS.md', preview['project_collisions'])
        stage(ROOT, project, True)
        plugin = self.extract()
        metadata = json.loads((plugin / 'bundle.json').read_text(encoding='utf-8'))
        for name in metadata['canonical_sha256']:
            self.assertEqual((project / STAGE / name).read_bytes(), (plugin / 'starter' / name).read_bytes(), name)
        self.assertEqual((project / 'AGENTS.md').read_bytes(), original)
        self.assertFalse((project / STAGE / 'example').exists())

    def test_source_unsafe_paths_rejected_before_content_read(self):
        from unittest.mock import patch
        source = self.root / 'source'; source.mkdir()
        project = self.root / 'project'; project.mkdir()
        (source / 'package-files.json').write_text(json.dumps({'files': ['../outside.txt']}), encoding='utf-8')
        with patch.object(Path, 'read_bytes', side_effect=AssertionError('content read before path validation')):
            with self.assertRaises(ValueError):
                stage(source, project, True)
        self.assertFalse((project / STAGE).exists())

    def test_extracted_staging_cli_works_outside_repository(self):
        import subprocess
        plugin = self.extract()
        project = self.root / 'cli-project'; project.mkdir()
        result = subprocess.run([sys.executable, str(plugin / 'scripts/stage_project.py'), '--target', str(project), '--apply'], cwd=project, capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertEqual(json.loads(result.stdout)['status'], 'STAGED')
        self.assertTrue((project / STAGE / '.agents/templates/TASK.md').is_file())

    def test_bundle_windows_unsafe_names_rejected_before_reads(self):
        from unittest.mock import patch
        plugin = self.root / 'invalid'; plugin.mkdir()
        project = self.root / 'project'; project.mkdir()
        for name in ('NUL.txt', 'trailing.', 'file:stream', 'bad?.md', '../escape', '/absolute', '.env'):
            with self.subTest(name=name):
                (plugin / 'bundle.json').write_text(json.dumps({'canonical_sha256': {name: 'a' * 64}}), encoding='utf-8')
                with patch.object(Path, 'read_bytes', side_effect=AssertionError('unsafe read')):
                    with self.assertRaises(ValueError):
                        stage(plugin, project, True)
                self.assertFalse((project / STAGE).exists())

    def test_source_link_rejected_before_content_reads(self):
        from unittest.mock import patch
        source = self.root / 'source'; source.mkdir()
        outside = self.root / 'outside'; outside.write_bytes(b'fixture')
        link = source / 'linked.md'
        try:
            link.symlink_to(outside)
        except OSError:
            self.skipTest('Symlink privilege unavailable')
        (source / 'package-files.json').write_text(json.dumps({'files': ['linked.md']}), encoding='utf-8')
        project = self.root / 'project'; project.mkdir()
        with patch.object(Path, 'read_bytes', side_effect=AssertionError('linked read')):
            with self.assertRaises(ValueError):
                stage(source, project, True)
        self.assertFalse((project / STAGE).exists())

    def test_malformed_bundle_fails_closed(self):
        plugin = self.root / 'bad'; plugin.mkdir()
        project = self.root / 'project'; project.mkdir()
        for metadata in ([], {'canonical_sha256': []}, {'canonical_sha256': {'safe.md': 'bad'}}):
            with self.subTest(metadata=metadata):
                (plugin / 'bundle.json').write_text(json.dumps(metadata), encoding='utf-8')
                with self.assertRaises(ValueError):
                    stage(plugin, project, True)
                self.assertFalse((project / STAGE).exists())

if __name__ == '__main__': unittest.main()
