# Agent Instructions — py-logstat

Project-local ND Workflow policy. Parent repo policy: `../../../.agents/docs/WORKFLOW.md`; highest applicable risk wins.

## Identity

- System: `logstat.py`, a single-file streaming analyzer for combined-style web access logs, plus stdlib unit tests.
- Stack: Python 3.8+ standard library only. No pip installs; no network in code, tests, or CI.

## Risk tiers

- Low: report wording, README/docs edits. Focused check, single turn.
- Medium: parser shape, counters, CLI flags, output format, tests. Run the full suite; keep output deterministic.
- High/Critical: size caps, exit codes, memory bounds, anything that weakens streaming or accepts untrusted input unsafely. Plan, negative tests, converge-check.

## Verification (run from this directory)

- `python -m unittest discover -s tests -v`
- Smoke: `python logstat.py <logfile>` on a temp-dir fixture.
- Record observed output; never claim an unrun check.

## Scope limits

- Write scope: `example/harden-full-nd/py-logstat/` only.
- Stdlib only. Tests write inside `tempfile` directories only; no network.
- Do not add dependencies, untested output formats, or persistence.
- Preserve the invariant total = parsed + malformed + blank + oversize; document behavior changes in HARDENING.md.
