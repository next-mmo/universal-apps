"""Regressions for the derived context index: classification, freshness, atomicity, bounded lookup."""
import json
import os
import tempfile
import unittest
from pathlib import Path

from scripts import context_index
from scripts.context_index import (
    MAX_EXCERPT_CHARS, MAX_LIMIT, build_index, check_freshness, classify_path, context_check,
    iter_source_files, load_cache, locate, parse_catalog, save_cache,
)
from scripts.nd import ROOT

CATALOG = """# Documentation Catalog

| Topic | Canonical path | Read when |
|---|---|---|
| Handover guide | [HANDOVER.md](HANDOVER.md) | Pausing and transferring ownership |
| Missing guide | [NOPE.md](NOPE.md) | Never |
| Outside example | [GUIDE.md](../example/demo/GUIDE.md) | Demo questions |
| External site | [Docs](https://example.com/x) | Online only |
| Not adopted | Root orientation files remain reusable templates | Adopt from target-project source |
"""


class ContextIndexBase(unittest.TestCase):
    def setUp(self):
        scratch = ROOT / '.validation'
        scratch.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=scratch, prefix='ctx-')
        self.target = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def put(self, name, text):
        path = self.target / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
        return path

    def fixture(self):
        self.put('AGENTS.md', '# Agent Instructions\n\n- policy text\n')
        self.put('docs/README.md', CATALOG)
        self.put('docs/HANDOVER.md', '# Handover\n\nResume steps for successors.\n')
        self.put('docs/prd/prd-0001-draft.md', '---\nstatus: draft\n---\n\n# Draft proposal\n')
        self.put('docs/prd/prd-0002-done.md', '---\nstatus: implemented\n---\n\n# Finished proposal\n')
        self.put('docs/plans/plan-0001-x.md', '# Plan X\n')
        self.put('docs/tasks/wip-0001-alpha.md',
                 '# Task: Alpha\n\n- Owner / integration: root session\n'
                 '- Scope approval: approved 2026-01-01\n'
                 '- Execution authorization: explicit start given\n'
                 '- Next action: continue alpha work\n- Status: active\n')
        self.put('docs/tasks/done/done-0001-old.md', '# Done: old work\n\nHistoric albatross details.\n')
        self.put('.agents/docs/PROJECT.md', '# Project\n\nFacts.\n')
        self.put('.agents/docs/WORKFLOW.md', '# Workflow\n\nRules.\n')
        self.put('.agents/skills/nd-demo/SKILL.md', '---\nname: nd-demo\ndescription: Demo skill\n---\n\nBody.\n')


class TestCatalogAndClassification(ContextIndexBase):
    def test_catalog_parses_routes_and_skips_external(self):
        self.fixture()
        routes = parse_catalog(self.target)
        self.assertIn('docs/HANDOVER.md', routes)
        self.assertIn('example/demo/GUIDE.md', routes)
        self.assertNotIn('https://example.com/x', routes)
        self.assertEqual(routes['docs/HANDOVER.md']['topic'], 'Handover guide')

    def test_classification_is_deterministic(self):
        self.fixture()
        expected = {
            'AGENTS.md': context_index.CURRENT_POLICY,
            'docs/README.md': context_index.CURRENT_POLICY,
            'docs/HANDOVER.md': context_index.CURRENT_BEHAVIOR,
            'docs/prd/prd-0001-draft.md': context_index.DRAFT,
            'docs/prd/prd-0002-done.md': context_index.HISTORICAL,
            'docs/plans/plan-0001-x.md': context_index.DRAFT,
            'docs/tasks/wip-0001-alpha.md': context_index.ACTIVE_TASK,
            'docs/tasks/done/done-0001-old.md': context_index.HISTORICAL,
            '.agents/skills/nd-demo/SKILL.md': context_index.CURRENT_POLICY,
            '.agents/docs/WORKFLOW.md': context_index.CURRENT_POLICY,
            '.agents/docs/PROJECT.md': context_index.CURRENT_BEHAVIOR,
        }
        payload = build_index(self.target)
        found = {entry['path']: entry['class'] for entry in payload['entries']}
        for path, klass in expected.items():
            self.assertEqual(found.get(path), klass, path)

    def test_classify_accepts_path_objects_and_backslashes(self):
        self.assertEqual(classify_path(Path('docs/tasks/wip-0002-beta.md')), context_index.ACTIVE_TASK)
        self.assertEqual(classify_path('docs\\tasks\\done\\done-0009-x.md'), context_index.HISTORICAL)

    def test_ignored_and_secret_trees_never_indexed(self):
        self.fixture()
        self.put('docs/node_modules/pkg/readme.md', '# Vendored\n')
        self.put('docs/__pycache__/cached.md', '# Cache\n')
        listed = iter_source_files(self.target)
        self.assertNotIn('docs/node_modules/pkg/readme.md', listed)
        self.assertNotIn('docs/__pycache__/cached.md', listed)

    def test_symlinked_directory_not_traversed(self):
        self.fixture()
        outside = self.target / 'outside'
        outside.mkdir()
        (outside / 'secret.md').write_text('# Outside\n', encoding='utf-8')
        link = self.target / 'docs' / 'linked'
        try:
            link.symlink_to(outside, target_is_directory=True)
        except OSError:
            self.skipTest('OS does not permit symlink creation')
        self.assertNotIn('docs/linked/secret.md', iter_source_files(self.target))

    def test_oversized_source_recorded_not_indexed(self):
        self.fixture()
        self.put('docs/oversized.md', '# Big\n' + ('x' * (context_index.MAX_SOURCE_BYTES + 10)))
        payload = build_index(self.target)
        entry = next(e for e in payload['entries'] if e['path'] == 'docs/oversized.md')
        self.assertTrue(entry['exists'])
        self.assertIsNone(entry['content_sha256'])
        self.assertIn('not indexed', entry['note'])


class TestFreshness(ContextIndexBase):
    def test_edit_delete_add_detected(self):
        self.fixture()
        payload = build_index(self.target)
        save_cache(self.target, payload)
        self.assertEqual(load_cache(self.target)[0], 'OK')
        self.assertEqual(check_freshness(self.target, payload)['state'], 'FRESH')

        edited = self.target / 'docs' / 'HANDOVER.md'
        edited.write_text('# Handover\n\nChanged text.\n', encoding='utf-8')
        stat = edited.stat()
        os.utime(edited, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1_000_000))
        report = check_freshness(self.target, payload)
        self.assertEqual(report['state'], 'STALE')
        self.assertIn('docs/HANDOVER.md', report['changed'])

        (self.target / 'docs' / 'new-note.md').write_text('# New\n', encoding='utf-8')
        report = check_freshness(self.target, payload)
        self.assertIn('docs/new-note.md', report['added'])

        (self.target / 'docs' / 'new-note.md').unlink()
        (self.target / 'docs' / 'HANDOVER.md').unlink()
        report = check_freshness(self.target, payload)
        self.assertIn('docs/HANDOVER.md', report['missing'])

    def test_missing_and_corrupted_cache_states(self):
        self.fixture()
        self.assertEqual(load_cache(self.target)[0], 'MISSING')
        cache_dir = self.target / context_index.CACHE_DIR
        cache_dir.mkdir()
        (cache_dir / context_index.CACHE_NAME).write_text('{not json', encoding='utf-8')
        self.assertEqual(load_cache(self.target)[0], 'CORRUPTED')
        (cache_dir / context_index.CACHE_NAME).write_text(json.dumps({'schema': 99}), encoding='utf-8')
        self.assertEqual(load_cache(self.target)[0], 'CORRUPTED')

    def test_interrupted_write_keeps_previous_cache(self):
        self.fixture()
        payload = build_index(self.target)
        final = save_cache(self.target, payload)
        before = final.read_bytes()
        original_replace = context_index.os.replace

        def boom(source, destination):
            raise OSError('simulated interruption')

        context_index.os.replace = boom
        try:
            with self.assertRaises(OSError):
                save_cache(self.target, {'schema': context_index.SCHEMA_VERSION, 'entries': []})
        finally:
            context_index.os.replace = original_replace
        self.assertEqual(final.read_bytes(), before)
        self.assertEqual(load_cache(self.target)[0], 'OK')
        leftovers = [p.name for p in final.parent.iterdir() if p.name.startswith('.tmp-')]
        self.assertEqual(leftovers, [])

    def test_non_git_project_still_fingerprints(self):
        self.fixture()
        payload = build_index(self.target)
        self.assertIn(payload['git'].get('status'), ('OK', 'UNKNOWN'))
        self.assertEqual(check_freshness(self.target, payload)['state'], 'FRESH')


class TestLocate(ContextIndexBase):
    def test_bounded_results_and_excerpts(self):
        self.fixture()
        payload = build_index(self.target)
        save_cache(self.target, payload)
        report = locate(self.target, 'handover resume', limit=99)
        self.assertLessEqual(len(report['results']), MAX_LIMIT)
        self.assertTrue(report['results'])
        for item in report['results']:
            self.assertLessEqual(len(item['excerpt']), MAX_EXCERPT_CHARS + 8)
            self.assertTrue(item['verified'])

    def test_history_excluded_until_opted_in(self):
        self.fixture()
        payload = build_index(self.target)
        save_cache(self.target, payload)
        default = locate(self.target, 'albatross')
        self.assertEqual(default['results'], [])
        opted = locate(self.target, 'albatross', include_history=True)
        self.assertTrue(any(item['path'].endswith('done-0001-old.md') for item in opted['results']))

    def test_missing_cache_falls_back_to_live_search(self):
        self.fixture()
        report = locate(self.target, 'handover')
        self.assertTrue(report['results'])
        self.assertEqual(report['cache'], 'MISSING')
        self.assertTrue(report['counts']['live_fallback'])
        self.assertGreater(report['read_cost']['bytes_read'], 0)

    def test_corrupted_cache_never_served(self):
        self.fixture()
        cache_dir = self.target / context_index.CACHE_DIR
        cache_dir.mkdir()
        (cache_dir / context_index.CACHE_NAME).write_text('garbage', encoding='utf-8')
        report = locate(self.target, 'handover')
        self.assertTrue(report['results'])
        self.assertEqual(report['cache'], 'CORRUPTED')
        self.assertTrue(all(item['source'] == 'live' for item in report['results']))

    def test_changed_entry_not_served_as_current(self):
        self.fixture()
        payload = build_index(self.target)
        save_cache(self.target, payload)
        path = self.target / 'docs' / 'HANDOVER.md'
        path.write_text('# Handover\n\nRewritten but still about handover resume steps.\n', encoding='utf-8')
        stat = path.stat()
        os.utime(path, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1_000_000))
        report = locate(self.target, 'handover')
        self.assertGreaterEqual(report['counts']['stale_excluded'], 1)
        for item in report['results']:
            self.assertTrue(item['verified'])
            self.assertIn(item['source'], ('cache', 'live'))
        self.assertEqual(report['counts']['cache_freshness'], 'STALE')

    def test_empty_topic_rejected(self):
        self.fixture()
        with self.assertRaises(ValueError):
            locate(self.target, '   ')


class TestContextCheck(ContextIndexBase):
    def test_complete_checkpoint_reported(self):
        self.fixture()
        report = context_check(self.target)
        self.assertEqual(report['checkpoint'], 'COMPLETE')
        self.assertEqual(report['ambiguous'], [])
        self.assertEqual(report['active_tasks'][0]['path'], 'docs/tasks/wip-0001-alpha.md')
        self.assertEqual(report['active_tasks'][0]['missing'], [])
        self.assertEqual(report['cache'], 'MISSING')
        self.assertEqual(report['host_loading'], 'UNVERIFIED')

    def test_incomplete_and_ambiguous_checkpoints(self):
        self.fixture()
        self.put('docs/tasks/wip-0002-beta.md', '# Task: Beta\n\n- Status: active\n')
        report = context_check(self.target)
        self.assertEqual(report['checkpoint'], 'INCOMPLETE')  # any incomplete active task counts
        self.assertIn('docs/tasks/wip-0002-beta.md', report['ambiguous'])
        self.assertEqual(report['status'], 'ATTENTION')

    def test_missing_catalog_anchor_reported(self):
        self.fixture()
        report = context_check(self.target)
        self.assertIn('docs/NOPE.md', report['missing_anchors'])

    def test_symbol_extraction_and_ast_lookup(self):
        self.fixture()
        self.put('service.py', '# Service module\n\nclass TaxEngine:\n    pass\n\ndef calculate_tax(amount):\n    return amount * 0.1\n')
        self.put('lib/api.js', '// API helper\nexport function fetchRates() {\n    return [];\n}\n')
        payload = build_index(self.target)
        entries_by_path = {e['path']: e for e in payload['entries']}
        self.assertIn('service.py', entries_by_path)
        self.assertIn('calculate_tax', entries_by_path['service.py']['symbols'])
        self.assertIn('TaxEngine', entries_by_path['service.py']['symbols'])
        self.assertIn('lib/api.js', entries_by_path)
        self.assertIn('fetchRates', entries_by_path['lib/api.js']['symbols'])

        # Test locate with live and cached symbols
        save_cache(self.target, payload)
        res_py = locate(self.target, 'calculate_tax')
        self.assertTrue(res_py['results'])
        self.assertEqual(res_py['results'][0]['path'], 'service.py')
        self.assertEqual(res_py['results'][0]['line'], 6)

        res_js = locate(self.target, 'fetchRates')
        self.assertTrue(res_js['results'])
        self.assertEqual(res_js['results'][0]['path'], 'lib/api.js')


if __name__ == '__main__':
    unittest.main()
