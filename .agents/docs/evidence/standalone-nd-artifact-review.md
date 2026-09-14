# ND extracted-artifact regression review

## Scope

Follow-up to the owner's pre-review request for PR #3. Input revision:
`038de79434f4ca8d72c0b134fba9d5fdae80833b`. Its Standalone ND Workflow,
Agent Workflow, and Source distribution runs all completed successfully
(runs 34868817447, 34868817440, and 34868817448 respectively).
Those results apply to that input revision, not to this follow-up commit.

## Actual artifact check

The standalone artifact from run 34868817447 was downloaded through the
GitHub connection and checked against its reported SHA-256:
`8c4c43bb195e5e9d88b17698bcdac4fcbaabc7234baebd8b82287c23201b04d6`.
Its npm transport was extracted outside the monorepo. Source validation and
all five Node launcher tests passed on the extracted package.

Running shipped tests from the extracted transport revealed authoring-only
filename assumptions that source-tree CI had not exercised: the tooling
fixture builder copied logical filenames directly, and the transport test
read the root .gitignore file directly. The npm transport intentionally stores
that resource under its explicit gitignore.template mapping. Both failing
cases were reproduced locally before editing.

## Correction

The tooling fixture builder now validates the source manifest and all source
content, then copies canonical bytes through the existing read_source_file
helper. The transport test compares the canonical resource instead of assuming
its physical filename. Existing tests, validation guards, and missing-resource
checks remain intact; no runtime or dependency changes are made.

A new regression executes the shipped positive-validation and packaging tests,
then the transport alias test, from inside a freshly extracted package. It
uses bounded subprocesses and excludes recursive self-execution. It also
rejects zero-test success. The focused new regression passed locally, including
ten fixture/packaging cases and the alias-restoration case. Python syntax checks
passed for both edited test files.

## Limits and final gate

Local Python was 3.13.5, Node 22.16.0, and npm 10.9.2. Broader local test runs
exceeded the execution limit and are not claimed as completed. The complete
source regression and supported-platform matrix must pass on the new PR head.
Consult the PR's current checks and review summary for final results. No main
merge, release, publication, host-policy adoption, or public-repository change
is part of this correction.
