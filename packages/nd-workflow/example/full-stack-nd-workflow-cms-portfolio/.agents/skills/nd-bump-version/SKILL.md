---
name: nd-bump-version
description: Safely bump version, build target environment, package release distribution zip, update changelog, and prepare git release tags. Use when asked to "bump version", "cut release", "prepare release", "build zip", "new release vX.Y.Z", or "bump to X.Y.Z".
---

# Bump Version & Release Packaging Workflow

This skill handles semantic version bumping, environment-specific builds, artifact zipping, and release tagging.

---

## Safety Rules

- Inspect existing package manifests and scripts first. Do not run commands that do not exist.
- A build or zip request does not automatically authorize a version bump.
- Bump exactly once per intended release.
- **Commit & Publish Guard**: Never commit, tag, push, or publish without explicit human confirmation immediately before the action.

---

## Step-by-Step Workflow

### Step 1: Resolve Scope & Version
Run only the operations the user requested. A ZIP-only request skips version and changelog edits; a version-only request does not trigger builds or packaging. For an ambiguous release request, resolve target version and required artifacts before mutation.
If a version bump is authorized, identify bump type (`patch`, `minor`, `major`) or explicit target version:
- Update version in existing project manifests (`package.json`, `Cargo.toml`, `pyproject.toml`).
- Update lockfile if applicable; do not use a command that implicitly commits or tags without the required confirmation.

### Step 2: Build & Package Artifact
- Finalize authorized version/changelog edits before building or packaging; use Step 3 guidance. A later source edit invalidates affected artifact evidence and requires a new output name.
- For this starter distribution, run `python scripts/validate.py`, its documented tests, then `python scripts/package.py --output artifacts/<new-name>.zip`. Use the adopted project's own release pipeline for application artifacts.
- If a build is requested or required for the requested artifact, run the discovered command (e.g. `npm run build`, `cargo build --release`). For a documentation/source bundle with no build, skip compilation and state why.
- Package only requested output using an explicit file allowlist; preserve required hidden files. Exclude secrets, unrelated files, local backups, validation scratch, and prior archives.
- Verify archive entries against the allowlist and generated artifact existence, size, and checksum. Do not overwrite an existing artifact without resolving the collision.

### Step 3: Record in Changelog
Only when release/changelog scope is authorized or required by existing release policy, add a concise entry to the project's existing changelog location. Skip for ZIP-only work. Do not invent a new changelog location when the project already has one:

```markdown
## [vX.Y.Z] - YYYY-MM-DD

### Added
- Concise bullet describing new feature.

### Fixed
- Concise bullet describing bug fix.
```

### Step 4: Human Handoff
Report version, build status, artifact path, and size. Await explicit user authorization before creating Git commits or pushing tags.
