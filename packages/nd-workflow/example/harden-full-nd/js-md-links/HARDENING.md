# HARDENING.md — evidence log

Every command below was executed from
`example/harden-full-nd/js-md-links` on Windows 11 (PowerShell 5.1) with
Node.js v24.16.0. Outputs are pasted verbatim from the captured runs; nothing
here is projected or intended-to-be-run.

## 1. Test suite

```powershell
node --test
```

Captured result (full output):

```text
✔ clean fixture: no issues, external links counted, CLI exits 0 (152.032ms)
✔ broken relative link is reported grouped by file and CLI exits 1 (158.1244ms)
✔ traversal outside root is a violation and the outside path is never touched (6.7924ms)
✔ absolute path target is a violation and is never touched (5.4298ms)
✔ skipped directories are not walked (136.599ms)
✔ oversized file is skipped with an explicit note (116.415ms)
✔ directory named *.md is reported as an unreadable error, not a crash (117.873ms)
✔ injected read failure (EACCES) is reported as an unreadable error (4.1664ms)
✔ same-file anchor links verify headings when present (4.788ms)
✔ missing same-file anchor is reported as broken (140.0075ms)
✔ external links are counted but never checked (121.468ms)
✔ usage errors exit 2 and --help exits 0 (568.3686ms)
✔ output is deterministic: files and issues are sorted (269.3158ms)
✔ fenced code, inline code, and reference definitions are handled (10.4456ms)
✔ extractLinks reports line numbers and parses inline, image, title, and paren targets (0.3232ms)
✔ headingSlugs approximates GitHub slugs and numbers duplicates (0.2065ms)
✔ isInsideRoot rejects siblings with a shared path prefix (0.2522ms)
✔ CLI smoke: report text is printed from a fixture in a temp directory (133.5786ms)
✔ fixtures are readable and rows stay untouched after a run (11.616ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2179.7736
```

Process exit code: `0`. Repeat runs of the identical command after the
documentation edits reported `tests 19 / pass 19 / fail 0 / cancelled 0 /
skipped 0 / todo 0` with `duration_ms` `2320.9718` and `2505.2093`, exit `0`
on both.

Intermediate runs during development failed and were fixed, not hidden:
first run was `tests 19 / pass 15 / fail 4` (three wrong test expectations plus
the real `C:\...` classification defect in section 4), second run was
`pass 18 / fail 1` (one line-number expectation off by one).

## 2. CLI smoke run — fixture with problems

Fixture `$env:TEMP\mdlinks-smoke-fixture`: `README.md` linking `docs/guide.md`
(ok), `docs/gone.md` (missing), `https://example.com` (external), `#usage`
(heading exists); `docs/guide.md` linking `../../etc/passwd` (escape) and
`#nope` (missing anchor); `node_modules/pkg/junk.md` containing a broken link.

```powershell
node check-links.mjs "$env:TEMP\mdlinks-smoke-fixture"
```

stdout:

```text
Root: C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-fixture
Files: 2 scanned, 0 skipped | Links: 6 (external: 1, same-file anchors checked: 2)

BROKEN
  README.md
    L4 [broken] docs/gone.md -> target does not exist
  docs/guide.md
    L3 [violation] ../../etc/passwd -> path escapes root (resolved C:\Users\dila\AppData\Local\Temp\etc\passwd)
    L4 [broken] #nope -> heading "#nope" not found in this file

Summary: 2 broken, 1 violations, 0 errors, 0 notes
```

stderr:

```text
check-links: FAILED with 3 problem(s) under C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-fixture
```

Process exit code: `1`. `Files: 2 scanned` proves `node_modules/pkg/junk.md` was
never scanned.

## 3. CLI smoke run — clean fixture

```powershell
node check-links.mjs "$env:TEMP\mdlinks-smoke-clean"
```

stdout:

```text
Root: C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-clean
Files: 2 scanned, 0 skipped | Links: 4 (external: 1, same-file anchors checked: 1)

Summary: 0 broken, 0 violations, 0 errors, 0 notes
check-links: OK under C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-clean
```

Process exit code: `0`.

## 4. Hardening measures and their evidence

| # | Measure | Where | Evidence |
|---|---|---|---|
| 1 | `..` escapes outside the root are violations and are never touched | `classifyTarget` + `isInsideRoot` in `check-links.mjs` | test "traversal outside root is a violation and the outside path is never touched": spy `fs.stat` records `C:\Users\dila\AppData\Local\Temp\md-links-*\docs\note.md` only — the resolved outside path never appears |
| 2 | Absolute targets (POSIX, Windows drive, UNC) are violations and are never touched | `classifyTarget` | test "absolute path target is a violation and is never touched": 2 violations for `/etc/passwd` and `C:\Windows\win.ini`, and every spy `stat` path is inside the root |
| 3 | Protocol-relative `//host/x` counts as external, not as a UNC violation | `classifyTarget` ordering | test "external links are counted but never checked": `//cdn.nonexistent.invalid/four` in `external: 5`, 0 issues |
| 4 | Skipped directories | `collectMarkdownFiles` | test "skipped directories are not walked": broken links planted in `.git/`, `node_modules/`, `dist/`, `build/`; result `files == ['keep.md', 'ok.md']`, 0 issues, CLI exit 0 |
| 5 | Symlinks never followed | `collectMarkdownFiles` | `entry.isSymbolicLink()` is filtered before recursion, so walks cannot loop or escape through links (no dedicated test; stated limit below) |
| 6 | Per-file read cap with explicit note | `checkLinks` | test "oversized file is skipped with an explicit note": `SKIPPED` row `big.md -> size 4102 bytes exceeds cap 1024 bytes; not scanned`; the same file with the default 1 MiB cap is scanned and its broken link reported (`L3 [broken] missing.md`) |
| 7 | Unreadable files are errors, not crashes | `checkLinks` stat/read guards | tests "directory named \*.md ..." (`unreadable: path is a directory, not a file`, exit 1) and "injected read failure (EACCES) ..." (`unreadable: EACCES`, 0 issues, no crash) |
| 8 | External links counted, never fetched | `checkLinks` | test "external links are counted but never checked": `Links: 5 (external: 5, ...)`, exit 0 — and the module imports no network API at all |
| 9 | Same-file anchors verified against headings | `headingSlugs`, `slugify` | tests "same-file anchor links verify headings when present" (`#usage-notes`, `#whats-new`, `#` accepted) and "missing same-file anchor is reported as broken" (`L3 [broken] #does-not-exist`) |
| 10 | Deterministic sorted output | `byKey` sorting + sorted `readdir` | test "output is deterministic": two CLI runs byte-identical; file order `a.md`, `b.md`, `c/inner.md`; within `b.md`, line order `missing-z.md` then `missing-a.md` |
| 11 | Exit codes 0 / 1 / 2 | `main` | test "usage errors exit 2 and --help exits 0": 0 args → 2, `--wat` → 2, missing root → 2, two roots → 2, `--help` → 0; smoke runs cover 1 and 0 |
| 12 | No network, no dependencies | whole module | imports are `node:fs/promises`, `node:path`, `node:process`, `node:url` only; no `package.json`, no install step |
| 13 | Tests write only to temp | `test/check-links.test.mjs` | every fixture comes from `mkdtemp(path.join(tmpdir(), 'md-links-'))` and is removed in `after()`; test "fixtures are readable and rows stay untouched after a run" proves sources are unmodified |

### Defect found by the hardening tests

Fixture `[win](C:\Windows\win.ini)` was initially counted as an external link,
because the generic URI-scheme rule (`^[a-zA-Z][a-zA-Z0-9+.-]*:`) matches the
`C:` prefix. A hostile or careless document could therefore have used a Windows
drive path to reference data outside the root without being flagged. Fixed by
adding `classifyTarget`, which decides drive/UNC/protocol-relative/scheme/
absolute **before** any filesystem access; the regression is covered by the
"absolute path target is a violation" test.

## 5. Self-check on this directory

```powershell
node check-links.mjs .
```

Captured after the final documentation edits (see section 6 for the earlier,
failing run that caught two documentation defects):

```text
Root: C:\Users\dila\Documents\GitHub\nd-workflow\example\harden-full-nd\js-md-links
Files: 9 scanned, 0 skipped | Links: 20 (external: 0, same-file anchors checked: 1)

Summary: 0 broken, 0 violations, 0 errors, 0 notes
check-links: OK under C:\Users\dila\Documents\GitHub\nd-workflow\example\harden-full-nd\js-md-links
```

stderr: empty. Process exit code: `0`.

## 6. Findings from the self-check run

The first `node check-links.mjs .` run exited `1` and reported, verbatim:

```text
Root: C:\Users\dila\Documents\GitHub\nd-workflow\example\harden-full-nd\js-md-links
Files: 8 scanned, 0 skipped | Links: 23 (external: 0, same-file anchors checked: 1)

BROKEN
  .agents/docs/ARCHITECTURE.md
    L33 [broken] ../../HARDENING.md -> target does not exist
  .agents/docs/PROJECT.md
    L24 [broken] ../../HARDENING.md -> target does not exist
  .agents/docs/WORKFLOW.md
    L3 [broken] ../../HARDENING.md -> target does not exist
    L3 [violation] ../../../../../.agents/docs/WORKFLOW.md -> path escapes root (resolved C:\Users\dila\Documents\GitHub\nd-workflow\.agents\docs\WORKFLOW.md)
    L3 [violation] ../../../../../AGENTS.md -> path escapes root (resolved C:\Users\dila\Documents\GitHub\nd-workflow\AGENTS.md)
  README.md
    L4 [violation] ../../../AGENTS.md -> path escapes root (resolved C:\Users\dila\Documents\GitHub\nd-workflow\AGENTS.md)
    L159 [broken] HARDENING.md -> target does not exist
  docs/README.md
    L10 [broken] ../HARDENING.md -> target does not exist
  docs/tasks/done/done-0001-js-md-links.md
    L43 [broken] ../../../HARDENING.md -> target does not exist
    L52 [broken] ../../../HARDENING.md -> target does not exist

Summary: 7 broken, 3 violations, 0 errors, 0 notes
```

stderr: `check-links: FAILED with 10 problem(s) under C:\Users\dila\Documents\GitHub\nd-workflow\example\harden-full-nd\js-md-links`

Two classes of real defects, both fixed:

1. `HARDENING.md` was still unwritten, so every `HARDENING.md` link was broken (7 issues). Fixed by writing this file.
2. Three links pointed at the parent repository (`../../../AGENTS.md`, `../../../../../AGENTS.md`, `../../../../../.agents/docs/WORKFLOW.md`). Root containment correctly classified them as violations. Since the checked root is this example directory, those references are now written as code paths instead of markdown links. This is expected tool behavior, not a bug: **any link leaving the checked root is a violation by design**; run the checker with a broader root if you need to validate such links.

Re-run performed after the two evidence code blocks above were inserted into
this file (the trailing sentence added no links): `Summary: 0 broken,
0 violations, 0 errors, 0 notes`, exit `0`.

## 7. Honest limits

- Cross-file fragments (`other.md#section`) are **not** verified; only the path exists check runs. Same-file anchors are verified.
- HTML anchors (`<a name="x"></a>`) and heading attributes are not recognized; only ATX headings (`# ...`) count.
- The slug function approximates GitHub's: punctuation is stripped and duplicates get `-1`, `-2` suffixes, but GitHub's full rule set (emoji, HTML entities, non-Latin transliteration) is not reproduced.
- Never-following symlinks is implemented but has no test; a symlinked `.md` file inside the root is silently ignored rather than reported.
- Link syntax support covers inline `[text](target)`, images, and reference definitions. Bare autolinks (`<https://…>`) and inline HTML links are not parsed.
- Unreadable-file coverage is split: the directory-named-`*.md` case is a real filesystem case on any platform, while `EACCES` is simulated through the injected `fs` seam because Windows does not enforce read-permission bits for the file owner.
- Content is assumed UTF-8; a binary file with an `.md` extension is decoded as text (`readFile(..., 'utf8')` replaces invalid bytes) rather than rejected.
- The 1 MiB cap is per file and applies before decoding, so a tree of many just-under-cap files is still fully read; there is no global budget.
- Report text is human-oriented; there is no `--json` output.
