"""End-user profile excludes package tooling without removing existing files."""
from pathlib import Path
import contextlib
import io
import json
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from setup_project import adoption_files, warn_nested_source
from build_plugins import collect
from workflow_doctor import inspect_project


class EndUserAdoptionTests(unittest.TestCase):
    def test_source_and_plugin_profile(self):
        files = adoption_files(ROOT)
        self.assertNotIn('docs/PLUGINS.md', files)
        self.assertNotIn('docs/ONBOARDING.md', files)
        for skill in ('nd-setup-project', 'nd-skill-creator', 'nd-skill-editor'):
            self.assertFalse(any(p.startswith('.agents/skills/' + skill + '/') for p in files))
        self.assertIn('.agents/skills/nd-user-testing/SKILL.md', files)
        self.assertNotIn(b'nd-setup-project', files['AGENTS.md'])
        selection = json.loads(files['.agents/skill-selection.json'])
        self.assertNotIn('nd-setup-project', selection['skills'])
        with tempfile.TemporaryDirectory() as temp:
            target = Path(temp)
            for p, data in files.items():
                out = target / p
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(data)
            result = inspect_project(target)
            self.assertEqual(result['missing'], [])
            self.assertEqual(result['findings'], [])
        with tempfile.TemporaryDirectory() as temp:
            plugin = Path(temp)
            for p, data in collect(ROOT, 'claude-code').items():
                out = plugin / p
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(data)
            self.assertEqual(adoption_files(plugin), files)

    def test_nested_source_warns_without_moving(self):
        with tempfile.TemporaryDirectory() as temp:
            target = Path(temp)
            source = target / 'nd-workflow-src'
            source.mkdir()
            evidence = io.StringIO()
            with contextlib.redirect_stderr(evidence):
                warn_nested_source(source, target)
            self.assertIn('REVIEW_REQUIRED', evidence.getvalue())
            self.assertTrue(source.is_dir())
            with self.assertRaises(ValueError):
                warn_nested_source(target, target)


if __name__ == '__main__':
    unittest.main()
