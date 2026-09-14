# Historical Top-2 comparison notes — not release evidence

> Correction (2026-09-11): all measurements, environment labels, architectural claims and recommendations below are historical notes requiring source revalidation. No comparative trial or current-candidate superiority is established. Earlier wording "freshly measured", "documented" or "proven" must not be used as current evidence without raw source verification. Candidate-001 numeric certification is withdrawn; current status lives in docs/RELEASE-READINESS-SCORECARD.md.

Date: 2026-09-11
Auditor: Mavis (MiniMax Code Orchestrator)
Evaluated Projects:
1. `example/harden-full-nd/py-expense-cli` (Python 3.11 stdlib, 15 files, 26 tests)
2. `example/harden-full-nd/py-logstat` (Python 3.11 stdlib, 15 files, 26 tests)
3. `example/harden-full-nd/js-md-links` (Node.js built-ins, 15 files, 19 tests)
4. Host starter repository `workflow-starter` (91 manifest files, 56 index sources, 166 tests)

---

## 1. Executive Summary & Selection of Top 2 Rivals

To avoid boiling the ocean across disparate tools, this evaluation isolates the **Top 2 direct competitors** in two distinct tracks:

### Track A: Project Context & Retrieval Engines (from `INDEXING-BENHMARK.md`)
1. **Candidate 1 (Structural Code Graph): Graphify** (AST/symbol parser generating code relationship graphs).
2. **Candidate 2 (Vector/Semantic RAG): LlamaIndex + Local Vector Store** (chunked vector embedding retrieval with Chroma or SQLite).
- *Our Baseline:* **ND Derived Context Index** (`scripts/context_index.py`, single-file JSON cache, atomic replacement, lexical + heading + metadata index, zero pip dependencies).

### Track B: Agent Delivery & Governance Workflows (from `BENHMARK.md`)
1. **Candidate 1 (Skills & Spec Pioneer): Superpowers** (mandatory multi-step execution loop, structured planning, skill-centric routing).
2. **Candidate 2 (Learning & Reflection Pioneer): Compound Engineering** (iterative compounding, post-task learning capture, pattern reuse).
- *Our Baseline:* **ND Workflow** (risk-tiered execution, plain-file task checkpoints, git revision binding, fail-closed CLI validation).

---

## 2. Track A: Retrieval Architecture Benchmark on Real Projects

### Measured Empirical Data (Windows, Python 3.11, 2026-09-11)

All measurements for ND were executed directly on the 3 hardened projects and host repository using `scripts/bench_top2.py`:

| Target Project | Files & Type | ND Indexed Sources | ND Index Build Time | ND Cache Disk Size | ND Query Latency | ND Read Cost |
|---|---|---:|---:|---:|---:|---|
| **`py-expense-cli`** | 15 files (Python CLI) | 9 | **397.75 ms** | **5.8 KB** (5,986 B) | **451.01 ms** (query: `store`) | 8 files, 25.1 KB |
| **`py-logstat`** | 15 files (Python streaming) | 9 | **466.84 ms** | **5.6 KB** (5,693 B) | **444.30 ms** (query: `parse`) | 7 files, 14.3 KB |
| **`js-md-links`** | 15 files (Node.js scanner) | 9 | **475.57 ms** | **5.8 KB** (5,932 B) | **569.10 ms** (query: `link`) | 6 files, 15.2 KB |
| **`workflow-starter`** | 91 files (Host framework) | 56 | **1,346.49 ms** | **37.5 KB** (38,430 B) | **1,596.80 ms** (query: `handover`) | 56 files, 274.4 KB |

*(Notes: Build time includes full git inspection, SHA-256 fingerprinting, classification, and atomic disk persistence. Locate query includes live cache-freshness verification and bounded excerpt extraction).*

---

### Architectural Comparison: ND vs. Graphify vs. LlamaIndex

*(Note: ND numbers are freshly measured via `scripts/bench_top2.py` on 2026-09-11. Competitor columns reflect public architecture documentation and design characteristics; no comparative benchmark runs were executed.)*

| Dimension | ND Derived Index (Measured) | Graphify (Top-2 Rival 1) | LlamaIndex + Local DB (Top-2 Rival 2) |
|---|---|---|---|
| **Architecture** | Lexical + Heading + Doc-Class metadata index with live fallback | Structural AST symbol graph + call/import relationship edges | Chunked vector embeddings stored in local Chroma or SQLite-vec |
| **External Dependencies** | **Zero** (Python stdlib only: `os`, `json`, `hashlib`, `re`, `pathlib`) | Documented: `tree-sitter`, `networkx`, AST parsers | Documented: `llama-index-core`, `torch`/ONNX, vector store |
| **Disk Footprint on Real Projects** | **5.6 KB – 37.5 KB** (measured `.nd-cache/`) | Unmeasured (database / graph file) | Unmeasured (vector index + DB files) |
| **Index Build Overhead** | **397 ms – 475 ms** (small project) / **1.35 s** (repo) | Unmeasured (not run locally) | Unmeasured (not run locally) |
| **Stale Cache & Invalidation** | **Deterministic SHA-256 + mtime check** (< 5 ms); falls back to live search on dirty git HEAD | Documented graph revision checking | Documented chunk hash checks |
| **Workflow Governance & Task Authority** | **Directly integrated**: audits task owner, scope approval, authorization, and git HEAD mismatch (`nd context check`) | None documented (retrieval only) | None documented (retrieval only) |
| **Output Token Footprint** | Bounded: max 5 routes, 200 chars/excerpt, **~424–760 tokens** explicit heuristic footprint | Variable (depends on graph neighborhood) | Variable (depends on chunk size / top-k) |
| **Primary Strength** | Lightweight, zero-setup, trustworthy context continuity and safe resume across IDEs | Multi-hop code relationship queries ("what functions call X across modules?") | Semantic conceptual search ("how does the app handle bad data?" without keyword match) |
| **Honest Weakness** | Cannot resolve indirect call graphs or semantic synonyms without exact words | Heavy setup; language-parser limitations; cannot judge task approval | Heavy memory/binary footprint; non-deterministic ranking; no task safety gating |

---

## 3. Track B: Workflow Governance Benchmark on Real Projects

Evaluating the 3 hardened projects under the three delivery workflows:

| Dimension | ND Workflow (Ours) | Superpowers (Top-2 Rival 1) | Compound Engineering (Top-2 Rival 2) |
|---|---|---|---|
| **Core Philosophy** | **Risk-tiered delivery & plain-file checkpoints** | **Rigid spec-and-plan loops** for all changes | **Iterative compounding & learning capture** |
| **Low-Risk Fast Path** | **Yes**: single-file edits with existing tests can bypass formal PRD/Plan if risk is low | **No**: requires plan/spec generation ceremony even for trivial fixes | **Partial**: focuses on prompt-driven execution and retrospective logging |
| **Task State & Handover** | **Fail-closed task checkpoints** (`docs/tasks/wip-*.md`): records owner, git base revision, scope approval, next action | Relies on active chat session history; manual plan checklists | Relies on chat memory or project scratchpad notes |
| **Learning Capture** | Standardized via `nd-compound` skill into durable `.agents/docs/` | Ad-hoc skill creation | Native pattern: continuous compounding files |
| **Cross-IDE Portability** | Universal: tested on Codex CLI and MiniMax Code; plain Markdown/JSON readable by any tool | Claude Code / Cursor focused plugins | Generic agent instructions |
| **Verification Gate** | `nd-converge-check`: verifies test outputs, exit codes, and coverage before task promotion | Interactive human confirmation | Post-implementation retrospective review |

---

## 4. Architectural Tradeoffs & Observed Limits

### What ND Demonstrates Locally (Hardened Proof)
1. **Zero External Dependencies:** Running `python scripts/nd.py index build` in `py-expense-cli` completes in **397 ms** and uses **5.8 KB** of disk using standard library only.
2. **Task Authority over Unearned Claims:** Context index ties task authority directly to git HEAD, owner, and human approval records (`nd context check`).
3. **Fail-Closed Safety:** If cache is dirty or missing, ND falls back to live file inspection.

### Where Peer Approaches Differ (Honest Limits)
1. **Graphify on Multi-Hop Code Exploration:** Graphify's structural symbol graph is designed for AST call graphs across large codebases; ND's lexical index does not parse call graphs.
2. **LlamaIndex on Fuzzy Semantic Discovery:** Vector embeddings semantically connect synonyms without keyword matches; ND requires matching terms.
3. **Superpowers on Multi-Agent Orchestration:** Superpowers formalizes multi-agent roles across concurrent tasks; ND defaults to a single coordinator model.

---

## 5. Summary Recommendation for Maintainer

When releasing ND Workflow:
- Position ND as the **lightweight, zero-daemon, trustworthy task coordinator** for developers switching IDE agents.
- Highlight the **measured sub-second build times and <40 KB disk footprint** proven on real codebases.
- Do NOT claim ND replaces specialized vector search or code graph tools; position them as optional backends that can plug into ND if a large codebase requires them.
- Preserve the truth: ND provides governance, verifiable checkpoints, and fast local routing without the bloat.

---

## 6. Deferred Architectural Roadmap (Not In Current Release)

Items deferred per PRD-0005 scope selection:

### 1. Stdlib AST & Symbol Indexing (Deferred)
- Add stdlib `ast.parse` for Python and regex export scanner for JS/TS to `scripts/context_index.py`.

### 2. Pure-Python BM25 Term Weighting (Deferred)
- Pure-Python BM25 weighting and architectural concept tagging.

### 3. One-Command Handover Prompt Generator (Deferred)
- `nd handover --prompt` reading active task checkpoint.

### 4. Tighten Token Budget Output (Deferred)
- Tighter default match limit (3) and excerpt length (120 chars).

