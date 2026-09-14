"""Static QA contracts and source/plugin resource integration, not live UI tests."""
from pathlib import Path
import json
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from build_plugins import collect, TARGETS
from validate import validate_repo

SKILL = '.agents/skills/nd-user-testing/SKILL.md'
REFERENCE = '.agents/skills/nd-user-testing/references/qa-handoff.md'


class UserTestingContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.skill = (ROOT / SKILL).read_text(encoding='utf-8')
        cls.reference = (ROOT / REFERENCE).read_text(encoding='utf-8')

    def test_frontmatter_budget_and_reference(self):
        self.assertTrue(self.skill.startswith('---\nname: nd-user-testing\ndescription:'))
        self.assertLessEqual((len(self.skill) + 3) // 4, 2500)
        self.assertIn('(references/qa-handoff.md)', self.skill)
        manifest = json.loads((ROOT / 'package-files.json').read_text(encoding='utf-8'))
        self.assertIn(REFERENCE, manifest['files'])
        report = validate_repo(ROOT)
        self.assertEqual(report['status'], 'PASS', report['errors'])

    def test_safety_and_required_surface_contract(self):
        for required in ('disposable test data', 'isolated backend',
                         'explicit confirmation', 'round-owned resources',
                         'visible-UI-only/Computer Use', 'no terminal, DOM, API',
                         'at most two', 'Redact credentials', 'untrusted evidence'):
            with self.subTest(required=required):
                self.assertIn(required, self.skill)

    def test_scope_and_completion_contract(self):
        for required in ('every mandatory criterion passed',
                         'no mandatory criteria exist', 'Always list remaining blockers',
                         'Report-only requests create no tasks',
                         'Task creation does not authorize remediation',
                         'READY_FOR_RETEST, not CLOSED'):
            with self.subTest(required=required):
                self.assertIn(required, self.skill)

    def test_status_events_and_developer_fields(self):
        for required in ('ROUND_STARTED', 'BUG_FOUND', 'TASK_LINKED', 'PRD_DRAFTED',
                         'FIX_REPORTED', 'RETEST_FAILED', 'BUG_REOPENED',
                         'previous/new status', 'superseding event',
                         'no automatic synchronization', 'review-only',
                         'execution authorization: not authorized',
                         'specification-only checkpoint', 'reproduction frequency',
                         'critical gates', 'Task and report link each other',
                         'DEFERRED requires owner/date/reason'):
            with self.subTest(required=required):
                self.assertIn(required, self.reference)

    def test_report_and_scenario_coverage(self):
        for heading in ('## Acceptance matrix', '## Bugs', '## Status events',
                        '## Developer handoff', '## Closure'):
            self.assertIn(heading, self.reference)
        for scenario in ('Confirmed broken Save', 'new Save approval workflow',
                         'Mandatory browser unavailable', 'Existing defect reproduced',
                         'Delete button reaches shared data', 'no UI retest',
                         'one unattempted mandatory check', 'Known fail plus blocked check'):
            self.assertIn(scenario, self.reference)

    def test_project_profile_initialization_and_proposal_contract(self):
        profile_path = '.agents/skills/nd-user-testing/references/project-profiles.md'
        profile = (ROOT / profile_path).read_text(encoding='utf-8')
        self.assertIn('(references/project-profiles.md)', self.skill)
        self.assertIn('(project-profiles.md)', self.reference)
        for required in ('app, game, CLI, workflow, mixed or unknown',
                         'Init-only stops here', 'no app launch',
                         'Mandatory criteria come from the requested/approved scope',
                         'Unknown required behavior is UNVERIFIED',
                         'QA_PLAN_INITIALIZED', 'QA_PLAN_REVISED',
                         'WORKFLOW_IMPROVEMENT_PROPOSED', 'approval PENDING',
                         'implementation not authorized', 'Report-only rounds',
                         'Never automatically apply proposals',
                         'correct instructions ignored by an agent',
                         'Tic-Tac-Toe', 'Endless runner', 'Admin app', 'CLI project',
                         'retain failure history'):
            with self.subTest(required=required):
                self.assertIn(required, profile)
        manifest = json.loads((ROOT / 'package-files.json').read_text(encoding='utf-8'))
        self.assertIn(profile_path, manifest['files'])

    def test_all_plugin_providers_include_reference_and_template(self):
        for target in TARGETS:
            with self.subTest(target=target):
                entries = collect(ROOT, target)
                self.assertEqual(entries['skills/nd-user-testing/references/qa-handoff.md'],
                                 (ROOT / REFERENCE).read_bytes())
                self.assertIn('starter/' + REFERENCE, entries)
                profile = '.agents/skills/nd-user-testing/references/project-profiles.md'
                self.assertEqual(entries['skills/nd-user-testing/references/project-profiles.md'],
                                 (ROOT / profile).read_bytes())
                self.assertIn('starter/' + profile, entries)
                self.assertIn('starter/.agents/templates/TASK.md', entries)
                self.assertIn('starter/.agents/templates/PRD.md', entries)
                self.assertIn(b'(references/qa-handoff.md)',
                              entries['skills/nd-user-testing/SKILL.md'])


if __name__ == '__main__':
    unittest.main()
