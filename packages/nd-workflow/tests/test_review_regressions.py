"""Regression coverage for reviewed packaging and bounded diagnosis defects."""
from pathlib import Path
import json
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from build_plugins import collect
from workflow_doctor import evaluate_token_efficiency, inspect_project


class ReviewRegressionTests(unittest.TestCase):
    def test_oversize_audit_is_unknown_without_read_text(self):
        with tempfile.TemporaryDirectory(dir=ROOT / '.validation') as temp:
            target = Path(temp)
            (target / 'AGENTS.md').write_bytes(b'x' * 100001)
            with patch.object(Path, 'read_text', side_effect=AssertionError('Unbounded text read')):
                result = evaluate_token_efficiency(target, ['AGENTS.md'])
            self.assertEqual(result['status'], 'UNKNOWN')
            self.assertIsNone(result['file_breakdown'][0]['estimated_tokens'])

    def test_invalid_utf8_is_unknown(self):
        with tempfile.TemporaryDirectory(dir=ROOT / '.validation') as temp:
            target = Path(temp)
            (target / 'bad.md').write_bytes(b'\xff')
            self.assertEqual(evaluate_token_efficiency(target, ['bad.md'])['status'], 'UNKNOWN')

    def test_filtered_starter_and_doctor_selection(self):
        entries = collect(ROOT, 'claude-code', ['nd-setup-project'])
        self.assertNotIn('starter/.agents/skills/nd-user-testing/SKILL.md', entries)
        manifest = json.loads(entries['starter/package-files.json'])
        starter = {p[len('starter/'):]: data for p, data in entries.items() if p.startswith('starter/')}
        self.assertEqual(set(manifest['files']), set(starter))
        metadata = json.loads(entries['bundle.json'])
        self.assertEqual(set(metadata['canonical_sha256']), set(starter))
        with tempfile.TemporaryDirectory(dir=ROOT / '.validation') as temp:
            target = Path(temp)
            for p, data in starter.items():
                out = target / p
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(data)
            result = inspect_project(target)
            self.assertEqual(result['missing'], [])
            self.assertEqual(result['findings'], [])
            (target / '.agents/skills/nd-setup-project/SKILL.md').rename(target / 'saved.md')
            self.assertIn('.agents/skills/nd-setup-project/SKILL.md', inspect_project(target)['missing'])


if __name__ == '__main__':
    unittest.main()
