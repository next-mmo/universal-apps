# ND Workflow: Pre-Release Benchmark Verification & Truthfulness Audit

Date: 2026-09-11
Auditor: Mavis (MiniMax Code Orchestrator)
Scope: Release readiness, benchmark verification, claim integrity, and prevention of deceptive marketing for user release.

---

## 1. Executive Verdict & Truthfulness Contract

**Primary directive: Avoid lying to users.**

ND Workflow has high-quality core tooling, rigorous fail-closed validation, and solid plain-file task management. However, **no controlled head-to-head empirical benchmark has proven ND superior to Superpowers, Compound Engineering, OpenSpec, or GSD Core.**

To release this workflow honestly:
1. **Never advertise a 9.7 or 9.5 score.** 9.7 is an unearned target, not an evaluation result.
2. **Never advertise "1.5M–2.25M tokens saved" or "40% faster delivery".** Those numbers are hypothetical arithmetic models based on arbitrary assumptions, not measured telemetry.
3. **Never claim 6+ tool compatibility as "tested and verified".** Live fresh-session agent handovers were only successfully executed on 2 hosts (Codex CLI and MiniMax Code). Claude Code was blocked on 401 OAuth revocation; Cursor was blocked on absence of a headless agent CLI (`cursor-agent`); other tools rely on unverified generated rules/adapters.
4. **Never present internal unit-test histories as competitive benchmarks.** The historical table of 215 test cases in `BENHMARK.md` is an internal task record from early development (`done-0001` through `done-0005`), not an empirical comparison against other frameworks.
5. **Never present the local 18-case handover suite as 18 host verifications.** `tests/test_handover_suite.py` is an in-process simulation harness that runs `nd context check` locally. Real fresh-session agent runs total 8 (5 on Codex, 3 on MiniMax Code).

---

## 2. Verification Matrix: Proven vs. Unverified Claims

| Claim / Dimension | User-Facing Claim Status | Fresh Observed Evidence (2026-09-11) | Release Boundary & What to Tell Users |
|---|---|---|---|
| **Python Tooling & CLI** | **VERIFIED (Windows, Python 3.11/3.12)** | `python scripts/validate.py`: PASS (91 manifest files, 0 errors). `unittest discover`: 166 tests PASS (159 passed, 7 skipped due to Windows symlink privileges, 0 failures). | Disclose minimum runtime (Python 3.10+ stdlib only). Note that Linux/macOS runs require separate CI confirmation. |
| **Package Distribution** | **VERIFIED** | `python scripts/package.py`: PASS (91 entries, 202,748 bytes, SHA-256 `f5683b7d...`). Extracted CLI executes correctly. | Ship verified archive. Manifest contains only production starter files; tests and examples remain in source repository. |
| **Reference Example Hardening** | **VERIFIED** | Three hardened projects in `example/harden-full-nd/` run 100% clean locally:<br>- `py-expense-cli`: 26 tests PASS<br>- `py-logstat`: 26 tests PASS<br>- `js-md-links`: 19 tests PASS | Documented as standalone hardened examples demonstrating ND patterns, NOT as framework comparison trials. |
| **Derived Context Indexing** | **VERIFIED (Locally)** | `nd index build`: BUILT 54 entries, cache size 36,534 bytes. `nd index check`: FRESH. `nd context locate`: bounded ranked routes with live fallback. | It is a lightweight lexical/metadata index with atomic cache replacement. It does NOT use embeddings or graph databases. |
| **Context Check Footprint** | **VERIFIED** | `nd context check`: 1,693 characters (~424 estimated tokens), within the 500-token budget. | Explicitly disclaim that character count / 4 is a heuristic, not exact LLM tokenizer billing. |
| **Cross-IDE Handover** | **PARTIALLY VERIFIED** | 8 real fresh-session handovers executed and verified (Codex CLI: 5, MiniMax Code: 3; zero unauthorized writes).<br>Claude Code: BLOCKED (401 revoked OAuth).<br>Cursor: BLOCKED (no headless CLI entry point). | Tell users handover is verified on Codex and MiniMax Code; Claude Code and Cursor require manual session setup and remain unverified. |
| **Peer Framework Comparison** | **UNVERIFIED / NOT RUN** | Zero comparative test runs executed against Superpowers, Compound Engineering, OpenSpec, or GSD Core. | Feature comparison table describes upstream documentation only. No performance or speed victory claimed. |
| **Indexing Competitor Comparison** | **UNVERIFIED / NOT RUN** | Zero benchmark runs executed against Graphify, Meilisearch, or LlamaIndex + Chroma. | `INDEXING-BENHMARK.md` is a proposed evaluation protocol and capability survey, not a leaderboard. |
| **Token Savings / Speedup** | **WITHDRAWN** | Earlier claims (40% speedup, 940/650/1200 competitor tokens, 1.5M token savings) were based on fixed constants or arithmetic assumptions. | Do not quote any token saving or delivery speed percentage. |
| **Rust Trial Benchmark** | **WITHDRAWN** | The two Rust Todo folders were sequentially written smoke fixtures with persistence disabled, not an isolated TDD comparison. | Withdrawn completely. Do not reference as benchmark evidence. |

---

## 3. Forensic Review of Benchmark Deliverables

### A. `BENHMARK.md`

1. **Title vs. Filename Typo:**
   - The file is titled `# Benchmark and Tool Compatibility` (spelled with `ch`), but the filename is `BENHMARK.md` (missing the letter `c`).
   - The same misspelling occurs in `INDEXING-BENHMARK.md`.
   - *Impact on Release:* Users reading the repo will notice the typo immediately. However, `package-files.json`, `tests/test_tooling.py`, and `README.md` are coupled to `BENHMARK.md`.
   - *Recommendation:* Keep `BENHMARK.md` in the manifest for backward compatibility, add an alias/rename plan for v1.0, and document the spelling in the release notes.

2. **Section "Score status: 9.7 is a target, not a result":**
   - Correctly retracts the former 9.5 rating.
   - Accurately states that replacing it with 9.7 would repeat the error.
   - *Action:* Retain this prominent caveat at the top of the file.

3. **Section "Benchmark Score Table":**
   - Retitling this section from "Benchmark Score Table" to "Internal Task Verification History" eliminates confusion.
   - Summing test counts from historical tasks (done-0001 through done-0005) to claim "215 test cases" is an internal milestone count, not an external benchmark score.

4. **Section "Readiness report & Token Budget Sensitivity":**
   - Reference to `.validation/mavis-deep-research/20260910_012424_readiness/final_turn_001.md` points to an ephemeral local scratch directory not included in the git repository or release package.
   - The 750-turn / 1.5M–2.25M token savings table is a mathematical sensitivity exercise ($750 \times \Delta$), not an empirical measurement.
   - *Action:* Clearly emphasize that this table is an arithmetic model, not telemetry.

5. **Section "9.7 Challenge Acceptance Checklist":**
   - Update verified counts to current state: 166 unit tests, package SHA-256 `f5683b7d...`, 202,748 bytes, context check footprint ~424 tokens.
   - Unticked items (repeated testing, real host UX, fair comparison) must remain unchecked.

### B. `INDEXING-BENHMARK.md`

1. **Orphan File Issue:**
   - The file was created in commit `c7dd5c4` but was never linked from `README.md`, `docs/README.md`, or `BENHMARK.md`.
   - *Action:* Add bidirectional links between `BENHMARK.md`, `INDEXING-BENHMARK.md`, and `docs/README.md`.

2. **Competitor Status:**
   - Graphify, Meilisearch, and LlamaIndex + Chroma are evaluated based on public documentation and integration architecture, not empirical test runs.
   - The result board table correctly marks all retrieval scores, latencies, and token costs as "Not measured" or "Unranked".
   - *Action:* Retain this honesty. Do not fill in arbitrary scores.

3. **Handover Matrix Truthfulness:**
   - Explicitly note that while `tests/test_handover_suite.py` simulates all 18 handover directions locally, only 8 real agent sessions were executed (on Codex and MiniMax Code).

---

## 4. Release Checklist for Maintainer

Before publishing or announcing ND Workflow to users:

- [x] Run full validation: `python scripts/validate.py` (0 errors across 91 files).
- [x] Run full unit test suite: `python -m unittest discover -s tests` (166 tests passed/skipped, 0 failures).
- [x] Verify reference implementations: run test suites in all 3 hardened projects (71 tests total, all pass).
- [x] Verify package generation: `python scripts/package.py` creates valid deterministic zip with verified CRC and allowlist.
- [x] Link all benchmark deliverables into the documentation catalog (`docs/README.md`).
- [x] Remove any lingering claims of guaranteed token savings or delivery speedups in README and marketing text.
- [x] Explicitly state supported and partially verified hosts in `START-HERE.md` and `README.md`.
- [ ] Set up continuous integration (GitHub Actions) for Linux, macOS, and Windows to verify cross-platform claims.
- [ ] Conduct at least one blinded test of fresh-project onboarding with an external human developer.

---

## Reconciliation note (2026-09-13)

Appended, not a rewrite: the audit above records 2026-09-11 observations and stays historical.

- Test counts here are superseded. The suite now runs 191 tests. On the 2026-09-13 local candidate it completed OK with 0 failures and 0 skips; the earlier Windows symlink skips do not reproduce on a host where Python can create symlinks.
- Continuous integration now exists (`.github/workflows/ci.yml`: ubuntu/windows/macos x Python 3.10/3.11 x Node 20). The run for revision `94a4d1c` passed the ubuntu and windows cells and failed both macOS cells with `Path contains link/reparse point` from `scripts/stage_project.py` `reject_links`, which rejected OS-level aliases such as macOS `/var -> /private/var`. A local fix (platform top-level boundary) with regression tests was prepared; it was published as revision `299237d` on 2026-09-14 and CI run `34773737906` then passed all six cells, so the macOS cells are verified for that revision.
- Score and release gate remain governed by [RELEASE-READINESS-SCORECARD.md](RELEASE-READINESS-SCORECARD.md): readiness UNASSESSED, release BLOCKED. The two unchecked items above remain unchecked.
