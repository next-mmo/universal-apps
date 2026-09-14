# Non-author onboarding drill: protocol

Candidate: `candidate-003` (working tree at revision `94a4d1c` plus uncommitted local changes; fingerprint in `../manifest.json`).
Purpose: satisfy RR-005 / H4 and provide the U1 and U3 observations for this candidate.
Status: **NOT YET RUN.** This file is preparation only; it is not evidence of onboarding.

## Participant

- One developer who did not author ND Workflow and has not run this drill before.
- Record only a role label (for example "non-author developer, backend"). Do not record personal data beyond what the participant agrees to.
- The participant works from published instructions only: `START-HERE.md` and `docs/ONBOARDING.md`. No author may guide the run. If the participant asks for help, the helper records the question and the answer; that help is a correction, not a silent rescue.

## Preconditions

- A clean machine state for the host tool the participant uses (the tool's own session state must not already contain this repository's instructions from an earlier attempt).
- One empty scratch directory for the adopted project. Nothing else on the machine is touched.
- The workflow package/host route being tested is recorded before the run starts.

## Steps the participant performs

1. Read `START-HERE.md` and follow it to set up the workflow for a **fresh empty project** in the scratch directory.
2. Start a genuinely new agent session in that project and confirm what loads: the root instruction file, and which skills are discovered.
3. Ask the session which rule applies to "a one-line auth fix". The expected answer is the highest applicable risk tier (critical), not a low-risk fast path.
4. Create one deliberately paused task (specification-only or blocked), then start a second fresh session and recover the next action from the task files alone.
5. Locate the documented failure/recovery guidance without unpublished help.

## What must be recorded, verbatim

- Start and end timestamps, and elapsed minutes for the whole drill.
- Every command run, with its exact output or exit status.
- Correction count: each retry, backtrack, or wrong turn, with what triggered it.
- Every question asked, who answered it, and every point where the participant had to guess or consult something outside the published instructions.
- Every missing instruction or broken link encountered, quoted exactly.
- The observed session state for step 2 (which instruction file loaded, which skills appeared, and how discovery happened).
- Whether any write happened outside the scratch directory (expected: none).

## Integrity rules

- No commits, tags, pushes, or publications from the drill.
- No credentials, tokens, or private session data in the record; host authentication stays with the participant in the host UI.
- Failures and dead ends are recorded, never smoothed over. A failed or partial run is valid evidence; a fabricated clean run invalidates the drill.
- The author must not edit the candidate during the drill; if the candidate changes, the run is invalidated and restarted against a fresh fingerprint.

## Output

- A filled copy of `record-template.md`, returned to the maintainer.
- The maintainer sanitizes and stores it under this directory before it is used as evidence.
- This drill alone does not award a readiness score and does not authorize release.
