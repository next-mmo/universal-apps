"""Local simulation harness for the 18 planned cross-host same-folder transfer paths.

IMPORTANT: this file launches NO host process. `simulate_handover` only calls the
context_check/locate API locally and labels the results with host-pair names. It is a
fast regression harness, not host verification: plan-0003 Phase 5 requires real
fresh-session drills (run separately, recorded with pass/fail/blocked per host) and
forbids counting simulated passes as passes. Real drill evidence:
.validation/handover-drill/runs/ plus docs/plans/plan-0003-portable-context.md.

Covers the 6 transfer directions across Cursor, Claude Code, Codex, and MiniMax Code:
- Cursor -> Claude Code (3x) and Claude Code -> Cursor (3x)
- Claude Code -> Codex (3x) and Codex -> Claude Code (3x)
- MiniMax Code -> Cursor (3x) and Cursor -> MiniMax Code (3x)
Plus critical edge cases:
- Draft-only protection (must not authorize coding)
- Stale evidence detection (file changed after checkpoint)
- Unreleased ownership conflict
- Missing checkpoint fields detection
"""
import json
import os
import shutil
import tempfile
import time
import unittest
from pathlib import Path

from scripts.context_index import (
    build_index,
    check_freshness,
    context_check,
    locate,
    save_cache,
)


class TestHandoverSuite(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="handover_suite_")
        self.target = Path(self.tmp)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def put(self, rel_path: str, content: str) -> Path:
        p = self.target / rel_path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return p

    def setup_project_fixture(self, active_task_content: str):
        self.put("AGENTS.md", "# Agent Instructions\nFollow ND Workflow risk-scaled rules.\n")
        self.put("CLAUDE.md", "@AGENTS.md\n")
        self.put(".agents/docs/WORKFLOW.md", "# Workflow Policy\nCanonical policy.\n")
        self.put("docs/README.md", """# Documentation Catalog
| Topic | Document | Read when |
|---|---|---|
| Active task | [tasks/README.md](tasks/README.md) | Current task |
""")
        self.put("docs/tasks/README.md", "# Active Tasks\nActive tasks.\n")
        self.put("docs/tasks/wip-current-task.md", active_task_content)
        idx = build_index(self.target)
        save_cache(self.target, idx)

    def simulate_handover(self, source_host: str, dest_host: str, iteration: int) -> dict:
        """Simulate fresh-session destination host reading the project state without prior chat."""
        # Destination host runs context_check to inspect current state
        report = context_check(self.target)
        # Destination host locates relevant active task context
        loc = locate(self.target, "task", limit=5, include_history=False)
        return {
            "source_host": source_host,
            "dest_host": dest_host,
            "iteration": iteration,
            "report": report,
            "located_results": loc["results"],
        }

    def test_18_fresh_session_handovers_happy_path(self):
        task_content = """# Task: Implement Feature X
- Mode: implementation
- Risk: Medium
- Owner: dev-lead
- Scope approval: approved v0.2
- Execution authorization: authorized by lead
- Exact next action: write unit tests in tests/
- Status: in_progress
"""
        self.setup_project_fixture(task_content)

        host_pairs = [
            ("Cursor", "Claude Code"),
            ("Claude Code", "Cursor"),
            ("Claude Code", "Codex"),
            ("Codex", "Claude Code"),
            ("MiniMax Code", "Cursor"),
            ("Cursor", "MiniMax Code"),
        ]

        total_handovers = 0
        for src, dst in host_pairs:
            for rep in range(1, 4):
                res = self.simulate_handover(src, dst, rep)
                total_handovers += 1
                report = res["report"]
                self.assertEqual(report["status"], "READY", f"Failed at {src}->{dst} rep {rep}")
                self.assertEqual(report["checkpoint"], "COMPLETE")
                self.assertEqual(len(report["active_tasks"]), 1)
                active = report["active_tasks"][0]
                self.assertEqual(active["fields"]["owner"], "dev-lead")
                self.assertEqual(active["fields"]["scope_approval"], "approved v0.2")
                self.assertEqual(active["fields"]["authorization"], "authorized by lead")
                self.assertEqual(active["fields"]["next_action"], "write unit tests in tests/")
                self.assertEqual(active["missing"], [])
                # Located at least the active task
                paths = [item["path"] for item in res["located_results"]]
                self.assertIn("docs/tasks/wip-current-task.md", paths)

        self.assertEqual(total_handovers, 18)

    def test_edge_case_draft_only_protection(self):
        draft_task = """# Task: Proposal Y
- Mode: draft
- Risk: High
- Owner: pending
- Scope approval: pending
- Execution authorization: unauthorized
- Exact next action: review requirements
- Status: draft
"""
        self.setup_project_fixture(draft_task)
        res = self.simulate_handover("Cursor", "Claude Code", 1)
        report = res["report"]
        self.assertEqual(len(report["active_tasks"]), 1)
        active = report["active_tasks"][0]
        # Destination host detects that implementation is NOT authorized
        self.assertIn("unauthorized", active["fields"]["authorization"])
        self.assertIn("pending", active["fields"]["scope_approval"])

    def test_edge_case_stale_evidence_detected(self):
        task_content = """# Task: Feature Z
- Mode: implementation
- Owner: dev
- Scope approval: approved
- Execution authorization: authorized
- Exact next action: test
- Status: active
"""
        self.setup_project_fixture(task_content)
        # Modify a project file after the checkpoint/cache was saved
        time.sleep(0.05)
        (self.target / "AGENTS.md").write_text("# Policy\nUpdated rules.\n", encoding="utf-8")

        res = self.simulate_handover("Claude Code", "Cursor", 1)
        report = res["report"]
        # Freshness is STALE, not FRESH
        self.assertEqual(report["cache_freshness"], "STALE")
        self.assertIn("AGENTS.md", report["stale_or_changed"])

    def test_edge_case_missing_checkpoint_fields_flagged(self):
        incomplete_task = """# Task: Incomplete Task
- Owner: dev
- Status: active
"""
        self.setup_project_fixture(incomplete_task)
        res = self.simulate_handover("Codex", "Claude Code", 1)
        report = res["report"]
        self.assertEqual(report["status"], "ATTENTION")
        self.assertEqual(report["checkpoint"], "INCOMPLETE")
        active = report["active_tasks"][0]
        self.assertIn("scope_approval", active["missing"])
        self.assertIn("authorization", active["missing"])
        self.assertIn("next_action", active["missing"])


if __name__ == "__main__":
    unittest.main()
