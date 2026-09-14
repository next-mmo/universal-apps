# Benchmark and Tool Compatibility

[Back to README](README.md) | Repository documents: `INDEXING-BENHMARK.md` (indexing benchmark) | `docs/RELEASE-READINESS-AND-BENCHMARK-AUDIT.md` (pre-release audit)

## Why choose ND Workflow?

**For small teams, ND offers a shared delivery policy without requiring the full planning-and-delegation loop for every change.** Keep routine work direct, raise verification requirements when risk rises, and leave a checkpoint another developer or agent can resume. Choose it for that combination—not a claim of higher coding success or broader tool support.

| Team problem | ND mechanism | Intended benefit | Evidence and limit |
|---|---|---|---|
| Small fixes trigger too much process | Low-risk, single-turn work needs a scoped edit and focused check; no mandatory PRD or delegation | Less procedural overhead on routine changes | [Root policy](AGENTS.md), [workflow](.agents/docs/WORKFLOW.md); time savings not measured |
| A tiny change hides serious risk | Highest applicable risk wins; auth, security, payments and data integrity use critical gates | Review effort follows impact, not patch size | [Risk tiers](.agents/docs/WORKFLOW.md); written policy is not runtime enforcement |
| Work disappears into chat history | Task ownership, tested state, blockers and next action survive in repository checkpoints | Easier transfer between people, sessions and tools | [Handover guide](docs/HANDOVER.md); real-team recovery success rate unmeasured |
| Adoption might overwrite existing project knowledge | Preview, reviewed merges, hash-bound apply and recovery journal | Reviewable adoption into an existing repository | [Onboarding](docs/ONBOARDING.md); manual recovery, not automatic rollback |
| A passing build gets called a shipped feature | Separate implemented, integrated and deployed states; evidence tied to affected behavior | Clearer delivery status and fewer unsupported completion claims | [Verification policy](AGENTS.md); no production-readiness certification |
| Framework-specific automation becomes a dependency | Repository policy and canonical skill files; Python standard-library maintenance tooling | Inspectable workflow that can be adapted to different hosts | [Tool setup](START-HERE.md); loading still needs host-specific verification; examples have their own dependencies |

**Positioning:** Lightweight on low-risk work, explicit on high-risk work, portable at handover. These are design choices, not exclusive features: the peer frameworks also provide planning, verification and continuity in different forms.

## Score status: 9.7 is a target, not a result

The earlier 9.5 rating and claims of superior delivery speed/token consumption are withdrawn. No controlled, independent comparison establishes ND as better than Superpowers or Compound Engineering. Replacing that rating with another precise score would repeat the error.

Assess setup safety, context overhead, feature correctness, continuity, and host UX separately. Local file checks and unit tests support only their tested behaviors. A score requires a preregistered rubric, equally configured workflows, pinned versions, independent runs, real model usage, and blinded acceptance checks.

## Workflow feature tradeoffs

| Team scenario | ND approach | Peer approach worth considering | Selection advice |
|---|---|---|---|
| Isolated, low-risk fix | Scoped edit and focused check; no required spec/task/delegation ceremony | Superpowers emphasizes mandatory skill-driven design, planning and TDD [S1] | ND for a deliberately lighter policy; Superpowers for consistency through a stricter methodology |
| Multi-file feature with stable requirements | Reuse approved scope; inline task plan; spec only for unresolved scope | OpenSpec maintains explicit proposal/spec/design/task artifacts [S2] | ND for pragmatic task delivery; OpenSpec when specification lifecycle is the main need |
| Sensitive one-line change | Critical risk gates regardless of patch size | Superpowers emphasizes TDD/review; CE provides review/testing skills [S1][S3] | ND when explicit risk classification is central; no framework replaces security expertise |
| Teammate resumes unfinished work | Record owner, scope, current evidence, blockers and next action | GSD persists state/context; CE has a handoff skill [S3][S4] | ND for explicit repository handover policy; compare actual recovery in a pilot |
| Team wants knowledge to improve future work | Compound only durable learnings; deduplicate and retire stale guidance | CE makes reusable solutions a central engineering loop [S3] | ND for selective learning; CE when the learning loop is the primary workflow |
| Large milestone needs coordinated execution | Optional delegation with disjoint ownership and integration checks | GSD uses phased, fresh-context execution waves [S4] | ND for flexible coordination; GSD for a more prescribed milestone engine |
| Team wants ready-made multi-host installs | Local beta bundles and manual loading routes; runtime checks still needed | Superpowers, OpenSpec and CE document broad host integrations [S1][S2][S3] | Do not choose ND on an unproven claim of best compatibility |

## What these scores cannot claim

No estimated success rate, token savings, cycle-time gain, or defect-reduction percentage is supplied. Existing local test counts measure starter/example checks—not the probability that an agent delivers a feature correctly.

For a real comparison, run the same representative tasks with pinned framework revisions, the same model/version and tools, equal token/time budgets, the same starting repository and human-intervention rules. Repeat runs, vary execution order, record failures, and use a reviewer unaware of which workflow produced each result where practical.

| Outcome to measure | Definition | Current evidence |
|---|---|---|
| Task success rate | Tasks meeting all predeclared acceptance criteria / tasks attempted; report sample size and uncertainty | Unmeasured across frameworks |
| Delivery time | Median and spread of elapsed time to accepted result, including review and repair | Unmeasured across frameworks |
| Token cost | Total input/output tokens and actual model charges per accepted task, including failed runs | Unmeasured across frameworks |
| Handover recovery rate | Paused tasks resumed by a fresh person/session without hidden chat context and meeting acceptance / recovery attempts | Unmeasured across frameworks |
| Human intervention | Clarifications, corrections and manual repair time per task, separately from mandatory safety approvals | Unmeasured across frameworks |
| Regression/defect rate | Failed predeclared regression checks and defects found during a fixed follow-up window | Unmeasured across frameworks |

**Adoption decision:** Pilot one small fix, one cross-file feature, one sensitive-change scenario in an isolated test environment, and one interrupted handover. Choose the workflow your team can operate reliably; do not treat the editorial score above as a purchasing or production-readiness guarantee.

---

## Readiness report: team use, context budget and release evidence

This section incorporates the supplied **ND Workflow: Pre-Release Competitive Review & Recommendations** report from local research `.validation/mavis-deep-research/20260910_012424_readiness/final_turn_001.md` (2026-09-10). It is a corrected synthesis, not an endorsement of every original claim. The source was an internal research turn without live search; the upstream documentation cited as [S1]–[S4] in this comparison provides stronger evidence for competitor support. The ephemeral research note is not part of the release distribution; this section is self-contained.

### Example: three developers and one PM

Illustrative operating model, not an observed team trial. Setup duration and delivery gains have not been measured.

| Stage | Team action with ND | Concrete output or gate | Limit |
|---|---|---|---|
| Adopt into an existing project | Preview additions, review instruction conflicts, authorize the exact merge, then verify host loading | Reviewed adoption plan, preserved project facts and recovery evidence | Do not blindly copy over `.agents/`, `AGENTS.md` or `CLAUDE.md`; follow [onboarding](docs/ONBOARDING.md) |
| Shape a feature | PM and developer resolve scope with `spec-feature` when needed; reuse already approved requirements | Delta PRD or referenced existing spec, task acceptance criteria and owner | Skill invocation/discovery varies by host; a command name alone does not prove loading |
| Implement a task | Developer follows the highest applicable risk tier and records progress | Scoped changes, relevant test evidence, checkpoint for multi-step work | Test-first is preferred where practical; an OAuth/authentication change requires critical gates |
| Prepare review | Use `converge-check` for applicable risk tiers to map acceptance criteria to fresh evidence | Explicit pass, fail or blocked/unverified result against the tested state | A passing build is not a deployed release; human signoff still applies where required |
| Resume or transfer work | Another developer or fresh agent reads the checkpoint and rechecks state | Current owner, changed paths, blockers, tested revision/state and next action | Old evidence must be refreshed when relevant inputs change |
| Capture learning | Use `compound` only for durable, non-obvious lessons | Canonical knowledge updated, deduplicated or retired; no-op when nothing qualifies | More notes do not automatically improve future delivery |

The intended advantage is a repeatable team contract: **what is being changed, who owns it, what proves it works, and what the next person must do**. Actual adoption speed and handover reliability require the pilot described above.

### Context-efficiency design, not proven token savings

| Design choice in ND | Why it could reduce avoidable context | What must be measured |
|---|---|---|
| Short root policy and on-demand references | Keeps task-specific procedures out of the mandatory root document | Actual host prompt, loaded skill bodies, repeated context and cache behavior |
| Catalog-directed `doc-lookup` | Can locate relevant material without reading every document | Total tokens across searches, reads and follow-up reads; bounded reads can require more calls |
| Reuse approved scope | Avoids drafting another specification for unchanged requirements | Planning tokens and human clarification time for matched tasks |
| Focused acceptance evidence | Directs verification toward affected criteria and consumers | Full verification cost, including failed checks and repair loops |
| Selective compounding | Avoids accumulating generic or stale notes | Knowledge retrieval cost and downstream task quality over multiple changes |

These mechanisms do not establish that ND uses less context than every peer. Superpowers has composable skills, OpenSpec has configurable skills/commands, CE has skills and persistent learning, and GSD explicitly addresses context management [S1]–[S4]. Root word counts alone cannot measure complete prompts, tokenizer output, cached-token charges, or total task cost.

### Hypothetical token-budget sensitivity

Retain the report's team-size assumption only as an arithmetic example: **3 developers × 50 agent turns per developer per day × 5 working days = 750 turns**. The PM is not included. No evidence establishes 50 turns/day or any token reduction below as typical.

Let `delta` be baseline input tokens minus ND input tokens per turn under equivalent accepted outcomes. Five-day input-token difference = `750 × delta`. Positive means fewer tokens with ND; negative means more. This does not estimate output tokens, model charges, or delivery speed.

| Assumed input-token difference per turn | Calculated five-day difference | Interpretation |
|---|---:|---|
| -500 tokens | -375,000 tokens | ND consumes more input tokens in this hypothetical case |
| 0 tokens | 0 tokens | No input-token advantage |
| 500 tokens | 375,000 tokens | Hypothetical reduction, not measured |
| 2,000 tokens | 1,500,000 tokens | Lower end of the original report's proposed saving, still unvalidated |
| 3,000 tokens | 2,250,000 tokens | Upper end of the original report's proposed saving, still unvalidated |

**Do not advertise “1.5M–2.25M tokens saved per sprint” from this table.** Those numbers follow from assumed inputs, not observed performance. Measure complete tasks—including extra turns, retries and failed attempts—and actual cached/uncached billing before making a cost claim.

### Pre-release evidence checklist

Adapted from the report as future acceptance checks, not a fresh audit of repository or release status. Historical recommendations may already be addressed; inspect current files and results before treating any item as missing. Listing an action here does not authorize installs, commits, pushes or publishing.

| Priority | Check before making the associated claim | Evidence needed |
|---|---|---|
| P0 | Freeze the exact release candidate and distinguish local changes from published source | Candidate revision plus dirty-state fingerprint or artifact hashes; authorized source publication if claimed |
| P0 | Verify declared OS and runtime support | CI/local results for the current supported matrix, including each claimed minimum runtime; do not assume old Node-version notes are current |
| P0 | Run relevant starter and reference-app gates against that candidate | Commands, environment, pass/fail/skip counts and reasons tied to the candidate |
| P1 | Exercise at least two intended plugin hosts end-to-end | Install/load, fresh-session discovery and actual skill invocation; manifest validation alone is insufficient |
| P1 | Check contribution and issue/PR guidance | Current contributor instructions and usable templates, if community readiness is claimed |
| P1 | Test paused-work recovery with a fresh developer or session | Checkpoint-only recovery result without hidden chat history; recorded interventions and missing context |
| P2 | Prepare versioned distribution and upgrade information | Reviewed release notes/changelog, verified archive contents/hashes and explicit authorization before publication |
| P2 | Add a short walkthrough and evidence-backed badges | Demonstration of the actual workflow; badges backed by real release/CI metadata rather than implied certification |

### Corrections to the supplied report

- **Competitor support:** Do not import its “Claude-only,” “no plugins,” “single-agent,” or blanket “no verification” cells. Several conflict with the primary documentation already cited here; missing overview evidence is not proof of absence.
- **Numerical claims:** Its 392-word root, 76-test count, competitor word estimates and “10-minute adoption” are historical or unsupported inputs, not fresh measurements. They do not update the historical test table below or the editorial fit scores above.
- **Exclusivity:** “Lowest token cost” and “only framework” claims lack comparative evidence. ND's defensible pitch remains its particular combination of risk-scaled policy, lightweight task routing and durable handover.
- **Dependencies and examples:** Python standard-library claims apply to starter tooling, not all reference applications or agent hosts. The current README lists both Todo and CMS Portfolio examples; the report's “single example” statement is stale.
- **Adoption and publication:** Replace blind-copy advice with reviewed onboarding. Commit/push/install/release recommendations are proposals requiring separate authorization, not steps executed by this documentation update.
- **Community and licensing:** No current stars, adoption, community maturity or per-project license comparison was established by that report. Do not turn its unsupported labels into purchasing claims.

---

## Internal Task Verification History (Not Cross-Framework Benchmark)

Historical delivery evidence from task records dated 2026-09-09; not a fresh test run or a controlled cross-framework benchmark against peers. Python starter checks used Windows PowerShell and Python 3.12.10; Todo API/browser checks used Node.js and Playwright. This tracks internal development progress across early milestone tasks (`done-0001` through `done-0005`), not competitive speed or quality scores.

| Task record | Test cases | Passed | Skipped | Separate validation evidence | Package evidence |
|---|---:|---:|---:|---|---|
| 1. Harden starter (`done-0001`) | — | — | — | 13/13 policy assertions | 20,549 B; 16 entries |
| 2. Workflow synthesis (`done-0002`) | — | — | — | 16/16 policy checks | CRC and source-byte checks passed; size not recorded |
| 3. Portable checks and handover (`done-0003`) | 62 | 59 | 3 | Validator passed; 25 manifest files (not 25 policy checks) | 44,372 B; 25 entries |
| 4. Todo RC (`done-0004`) | 82 | 79 | 3 | 63 core + 11 API + 8 Chromium cases | 90,901 B; 54 entries |
| 5. Platform plugins (`done-0005`) | 71 | 68 | 3 | Eight plugin tests passed within the suite; validator covered 59 files | Three bundles; 68–73 entries each |

**Counting convention:** Rows 3–5 sum to 215 test cases: 206 passed, 9 skipped, zero reported failures in their final runs. Counts include repeated/evolving suites across tasks, not 215 unique tests; source/extraction reruns are not counted twice. Skips required Windows symlink privileges. Only rows 1–2 report numeric policy-check scores; file counts are not policy scores.

These records establish historical local-scope results, not current runtime compatibility, production readiness, or faster/cheaper delivery. Cycle time, token cost, defect escape rate, and controlled competitor scores remain unmeasured.

---

## Tool Compatibility Comparison

ND Workflow compared with four selected peers: Superpowers, OpenSpec, Compound Engineering, and GSD Core. This is a documentation-based comparison, not a popularity ranking or performance leaderboard. Upstream sources retrieved 2026-09-10; moving branches may change.

**Evidence labels:** **Local** = ND bundle or adapter described in this repository, not verified end-to-end host operation. **Documented** = upstream provides a host installation route, not independently tested here. **Unknown** = not established by the cited sources; it does not mean unsupported.

| AI tool | ND Workflow | Superpowers [S1] | OpenSpec [S2] | Compound Engineering [S3] | GSD Core [S4] |
|---|---|---|---|---|---|
| Claude Code | Local plugin; historical native manifest validation passed | Documented marketplace plugin | Documented skills + commands | Documented marketplace plugin | Documented installer target |
| OpenAI Codex | Local plugin + repository skills | Documented App/CLI plugin | Documented `.agents/skills`; skills-only | Documented App/CLI custom marketplace | Documented installer target |
| Cursor | Local plugin bundle | Documented marketplace plugin | Documented skills + commands | Documented marketplace plugin | Documented installer target |
| Aider | Local manual `--read` route | Unknown | Unknown | Unknown | Unknown |
| ChatGPT Custom GPT | Local instructions/knowledge assets; upload behavior unverified | Unknown | Unknown | Unknown | Unknown |
| Windsurf | Local generated rules; host loading unverified | Unknown | Documented `windsurf` alias for `devin`; skills + workflows | Unknown | Documented installer target |
| Continue | Local generated prompt assets | Unknown | Documented skills + prompts | Unknown | Unknown |
| GitHub Copilot | Unknown | Documented CLI plugin | Documented integration; IDE/CLI/cloud distinctions apply | Documented VS Code and CLI plugin | Documented installer target |
| OpenCode | Unknown | Documented plugin install | Documented skills + commands | Documented native plugin | Documented installer target |

ND routes: [plugin packages](docs/PLUGINS.md) and [manual tool setup](START-HERE.md). Live fresh-session host drills were executed on Codex CLI (5 runs) and MiniMax Code (3 runs); Claude Code was BLOCKED (401 revoked OAuth) and Cursor was BLOCKED (`cursor-agent` CLI absent). Six generated bundle targets do not equal six tested host integrations. A generic `AGENTS.md` loading route is not an additional tool. Competitor cells describe upstream claims only; no competitor was installed or exercised for this comparison.

### Workflow and delivery approach

| Dimension | ND Workflow | Superpowers [S1] | OpenSpec [S2] | Compound Engineering [S3] | GSD Core [S4] |
|---|---|---|---|---|---|
| Main focus | Risk-scaled delivery and evidence-backed handover | Design, detailed plans, TDD and reviewed execution | Artifact-guided specification and change lifecycle | Plan, build, review and reusable learning | Context engineering and milestone delivery |
| Planning artifacts | Delta PRD when scope unresolved; task checkpoints | Design document and bite-sized implementation plan | Proposal, specs, design and tasks | Unified plan enriched from requirements to execution | Discuss, research and phase plans |
| Execution | Small tasks stay direct; delegation optional | Subagent execution or batches with checkpoints | Apply tasks from change artifacts | Work skills; optional autonomous pipeline | Parallel waves with fresh-context executors |
| Verification | Four risk tiers; impact-based checks; acceptance evidence | RED-GREEN-REFACTOR and verification before completion | Optional expanded verify workflow | Code/doc review and browser/Xcode test skills | Verify phase and generated fix plans |
| Continuity | Task handover; compound deduplication and stale-knowledge retirement | Saved plans and execution checkpoints | Change artifacts, spec sync and archive | `docs/solutions/` learning loop and handoff skill | Persistent `STATE.md` and `CONTEXT.md` |
| Adoption | Guided fresh/existing setup and Superpowers migration | Per-host installation | `openspec init`; selectable tool/profile setup | Host installation and `ce-setup` | Installer plus new-project/onboard commands |

ND test-first is preferred where practical, not universally enforced. Its delta headings are a local convention, not OpenSpec CLI compatibility. See [workflow policy](.agents/docs/WORKFLOW.md).

**Selection guide:** Choose ND for explicit risk routing and portable handover; Superpowers for an opinionated TDD/review workflow; OpenSpec for maintained specs and change artifacts; Compound Engineering for a reusable learning loop; GSD Core for phase-based execution with fresh contexts. These are differences in documented approach, not measured superiority. Comparable speed, cost, reliability, and task-success scores require the same tasks, models, budgets, environments, and scoring rules across all five.

**Sources (primary project documentation, retrieved 2026-09-10):**
- **[S1]** [Superpowers README](https://github.com/obra/superpowers/blob/main/README.md): installation routes, skills, TDD and review workflow.
- **[S2]** [OpenSpec README](https://github.com/Fission-AI/OpenSpec/blob/main/README.md) and [supported tools](https://github.com/Fission-AI/OpenSpec/blob/main/docs/supported-tools.md): artifacts, profiles, host-specific paths and invocation limits.
- **[S3]** [Compound Engineering README](https://github.com/EveryInc/compound-engineering-plugin/blob/main/README.md): host installation, core loop, review, learning and handoff.
- **[S4]** [GSD Core README](https://github.com/open-gsd/gsd-core/blob/main/README.md): installer targets, phase loop and persistent context. The former `gsd-build/get-shit-done` repository redirects to this project.

---

## Rust trial correction

The two Rust Todo directories are smoke-test fixtures, not independent framework executions. Their near-identical backend code was authored sequentially in one session. There is no verified full Superpowers skill execution or isolated ND comparison. Tests were written after implementation; the earlier strict-TDD claim is unsupported.

- Nine authored tests and eight HTTP smoke steps do not establish full UI behavior, restart durability, failure recovery, coverage, or production hardening.
- The microbenchmark uses in-process requests with persistence disabled, not a concurrent live-server load test. It does not justify attributing throughput variation to workflow quality.
- Estimated 6/10 minute delivery times were not captured by a controlled timer. The claimed 40% advantage is withdrawn.
- Competitor token figures (940/650/1200) were constants, not measured inputs. Percentage/session/context-window savings and industry-best claims are withdrawn.
- File size divided by four is a heuristic, not model token accounting. Host metadata, indexes, imported policy, caches, tool outputs and conversation history matter. Skill files on disk do not prove zero idle context cost.
- The full doctor reported incomplete adoption and unverified loading. A per-file TOKEN_SAVER label is not full workflow acceptance.

## Hardened example verification (2026-09-11, measured locally)

Three example projects were added under `example/harden-full-nd/` and verified by running their suites on this machine (Windows, Python 3.11.13, Node v24.16.0). These are local verification runs of real example projects, not framework comparisons, and they change no score in this report.

| Example | Stack | Command (from project dir) | Observed result | Hardening focus |
|---|---|---|---|---|
| `py-expense-cli` | Python, stdlib only | `python -m unittest discover -s tests` | Ran 26 tests, OK (exit 0) | numeric/non-finite/negative/oversize rejection, length caps, atomic store replace, corrupt-store refusal with non-zero exit, no temp leftovers |
| `py-logstat` | Python, stdlib only | `python -m unittest discover -s tests` | Ran 26 tests, OK (exit 0) | streaming bounded read, size cap, malformed-line counting, non-UTF8 tolerance, overlong-line truncation, explicit exit codes |
| `js-md-links` | Node, built-in modules only | `node --test` | tests 19, pass 19, fail 0 (exit 0) | `..`/absolute traversal rejection, skipped trees, per-file size cap, unreadable-file reporting, deterministic ordering, exit codes |

Each project ships `AGENTS.md`, a `CLAUDE.md` `@AGENTS.md` adapter, `.agents/docs/` orientation, a completed task record with observed results, and `HARDENING.md` containing the exact commands, outputs and stated limits. Verification is re-running the suites; no result here is inferred from file presence.

Limits: single machine and OS; the Node project's permission-failure paths are simulated through injected `fs`; the Python projects claim neither multi-process locking nor directory fsync; no competitor framework was installed or run; the derived context index is separate from these examples.

## 9.7 challenge acceptance checklist



Use pass/fail/unverified for each item; do not average missing evidence into a flattering score. Evidence below was re-checked on 2026-09-11; unticked items stay unticked because the evidence does not exist yet.

- [x] Safe adoption: repeatable preview and reviewed apply, collision preservation, recovery, disabled skill selection, symlink/reparse rejection. Evidence: tests/test_onboarding.py and tests/test_tooling.py exercise preview/apply, journal recovery, collisions and link rejection; full suite green.
- [x] Slim context: report measured file estimates separately from actual model usage; preserve all safety/risk gates and necessary routing. Evidence: `nd tokens` and `nd context check` print heuristic estimates with explicit limits (`nd context check` measured ~424 estimated tokens on this repo, budget 500); no model-usage claim is made.
- [x] Honest verification: unknown commands fail closed, command failures propagate, zero-test success is not acceptance. Evidence: tests/test_nd_cli.py asserts fail-closed unknown stacks, propagated failures and UNVERIFIED when no test command exists.
- [x] Feature/context parity: task scope, owner, decisions, docs/index consumers and next action survive handover; no automatic implementation approval. Evidence: 8 real fresh-session drills passed on the two usable hosts (Codex CLI: 5, MiniMax Code: 3); `nd context check` reports the fields from task files only and never grants approval. Coverage is partial (see below).
- [x] Distribution parity: documented CLI and launchers included; packaged CLI exercised outside source checkout. Evidence: package built (91 entries, ~205 KB, deterministic zip with verified CRC and byte-identical sources), extracted, and both `scripts/nd.py context check/index build` and `bin/nd.cmd context check/index check` were executed from the extraction.
- [x] Documentation sync: descriptions match commands, no stale score/token claims, affected links and manifest validated. Evidence: docs updated with the commands; `python scripts/validate.py` PASS (91 manifest files, 0 errors) after the updates.
- [ ] Repeated testing: focused regressions then full suite, repeated clean fixture runs, and independent review. Partial: focused suites plus the full 168-test suite (160 passed, 8 skipped on Windows symlinks, 0 failures) and repeated fixture runs were executed; independent external review is being recorded separately.
- [ ] Real host UX: fresh-user onboarding and fresh-session discovery in pinned hosts, with observed correction count and time to verified outcome. Partial only: Codex and MiniMax Code fresh sessions verified; Claude Code blocked (401 revoked OAuth) and Cursor blocked (no headless agent entry point); no correction-count or time-to-outcome data collected.
- [ ] Fair comparison: same task, starting state, model, budget, cache policy and acceptance tests; multiple independent runs per workflow. Not started: no competitor framework was installed or run.

Current local audit evidence is delivered separately. Host UX beyond two hosts, runtime token savings, fair competitor comparison and a 9.7 score remain unverified until those rounds exist.
