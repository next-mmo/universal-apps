# Standalone ND pre-review check

## Scope and revision

The owner requested a second check before human review of PR #3. Reviewed input:
`33916b853c4b997870f33677ad20735b9b039468`. This is a scoped correctness follow-up
to the already approved standalone-package migration, not approval to merge,
release, replace host policy, or retire the public source repository.

## Finding and correction

The shared output-path guard used by the ZIP and npm builders rejected explicit
macOS system-alias paths even when they resolved inside the package. The earlier
standalone test normalized its temporary root, hiding this remaining failure.

The guard now tolerates only ancestor aliases /tmp, /var, and /etc on macOS,
and only when each resolves to its expected /private target. The requested
output itself, project-created links, unexpected alias targets, and output
containment escapes remain rejected. No global path resolution or generic
symlink exemption was added.

`packages/nd-workflow/tests/test_package_paths.py` covers three valid alias
scenarios and five negative boundary scenarios in two unit test methods. A
third test exercises both actual builders through an unresolved /tmp path on
macOS. The test is included in the distribution allowlist and the existing
cross-platform unittest discovery; no new workflow or elevated permission was
added.

## Local evidence

The fetched input package.py was checked byte-for-byte against Git blob
`0f905bc4c1ea0d4532dbada4ce522812ff2a00a4` before modification. An isolated local
runner loaded its exact output-guard functions through the Python AST: all
three valid alias scenarios failed before the fix, and all eight modeled
scenarios passed after it. The real macOS integration test was skipped locally
on Linux. Python syntax compilation passed. This is focused reproduction and
regression evidence, not a local full-repository test run; local Git network
resolution was unavailable.

## Independence review

The package manifest has no npm/workspace dependencies; the optional Node
launcher delegates to package-relative Python tooling. The example-free
transport retains explicit ignore-resource mapping, canonical export, and
reviewed adoption safeguards. Existing extracted-package and installed-executable
tests remain in place. Host project instructions and task locations are not
adopted or replaced by this follow-up.

## Remaining gate

The reviewed input revision's three PR workflows were still action_required.
Current-revision full ND/platform, source-distribution, and host CI results must
be observed separately. Do not treat earlier green runs or the local helper
checks as final-revision approval. Human review and release approval remain
separate.
