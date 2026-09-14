# Architecture — js-md-links

One module, one test file, no runtime dependencies.

## Modules

| Module | Responsibility |
|---|---|
| `check-links.mjs` | Everything: CLI parsing, walking, markdown scanning, path policy, reporting |
| `test/check-links.test.mjs` | `node --test` suite; spawns the CLI and calls the exported API against `mkdtemp` fixtures |

## Flow

1. **CLI (`main`)** — parses arguments (`--help`, unknown options, exactly one root), resolves the root, and exits `2` on any usage or accessibility problem. Otherwise it calls `checkLinks` and maps the summary to exit `0` or `1`.
2. **Walk (`collectMarkdownFiles`)** — breadth of the tree via `readdir(..., { withFileTypes: true })`, entries sorted by name before recursion so ordering never depends on the filesystem. `.git`, `node_modules`, `dist`, `build` are skipped; symlinks are never followed; any entry named `*.md` (file or anomalous directory) becomes a candidate.
3. **Read guard** — each candidate is `stat`-ed, then rejected as an `ERRORS` entry when it is a directory / not a regular file, skipped with a `SKIPPED` note when it exceeds `maxFileBytes` (default 1 MiB), and reported as `unreadable` when `readFile` throws.
4. **Scan (`extractLinks`, `headingSlugs`, `slugify`)** — line-oriented scan that ignores fenced code blocks and inline code, then collects `[text](target)`, `![alt](target)` and `[label]: target` definitions with line numbers; heading slugs are computed per file for anchor checks.
5. **Classify (`classifyTarget`)** — decides `anchor` / `external` / `absolute` / `relative` **before** any filesystem access. External targets are counted and never fetched; absolute targets become violations without being touched.
6. **Resolve (`isInsideRoot`)** — relative targets are resolved against the containing directory and checked for containment in the root. Escapes become violations and are never `stat`-ed; only contained targets get a `stat`, which decides `broken` (`ENOENT`/`ENOTDIR`) or a readable-clean result.
7. **Report (`formatReport`, `summarize`)** — files, issues, errors, notes and skipped entries are sorted before printing, so two runs on unchanged inputs are byte-identical.

## Trust boundaries

- The checked repository is **untrusted input**. Link targets are data, not instructions: nothing outside the root is ever read, even to "verify" a traversal attempt.
- The only filesystem calls made by `checkLinks` are `readdir` (walk), `stat` (candidates and contained targets), and `readFile` (candidates). `options.fs` injects all three, which is what lets the tests prove no out-of-root access happens.
- No network access, by design and by dependency: there is no HTTP client in the program.
- The size cap bounds memory when scanning hostile input; the unreadable-file path prevents a hostile tree from crashing the run.

## Decisions

- A single module keeps the trust boundary auditable in one file; splitting would widen the review surface without benefit.
- Directory targets are treated as valid (`[docs](docs)` is a legitimate link), so containment — not file type — is the security property enforced.
- Cross-file fragments (`other.md#section`) are deliberately not verified; see [HARDENING.md](../../HARDENING.md).
