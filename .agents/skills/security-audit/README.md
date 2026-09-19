# security-audit (vendored)

Vendored copy of [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill)
(`skills/security-audit/`), pinned at upstream commit `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`.
MIT licensed, © Cloudflare — see [LICENSE](LICENSE). This folder is upstream content: keep local
edits out so updates stay a clean copy-over.

`SKILL.md` is the discovery entry point; the `validate-*.cjs` scripts are zero-dependency Node
validators (their `*.test.cjs` files are self-checks). In this workspace this vendored copy
takes precedence over any user-global install of the same skill name.

## Platform note (Windows)

Upstream's `validate-findings.cjs` CLI refuses file input without POSIX `O_NOFOLLOW`/`O_NONBLOCK`,
which Windows does not provide, so on Windows its CLI mode reports
`OS no-follow and nonblocking input protection is unavailable` by design (no opt-out). The
coverage-ledger validator and the skill's guidance content are platform-independent; run the
findings-validator CLI under WSL or another POSIX environment when a full audit needs it.

## Update from upstream

```bash
rm -rf .tmp && git clone --depth 1 https://github.com/cloudflare/security-audit-skill .tmp/security-audit-upstream
git -C .tmp/security-audit-upstream rev-parse HEAD   # update the pinned commit above
cp -r .tmp/security-audit-upstream/skills/security-audit/. .agents/skills/security-audit/
cp .tmp/security-audit-upstream/LICENSE .agents/skills/security-audit/LICENSE
rm -rf .tmp
node .agents/skills/security-audit/validate-findings.test.cjs
node .agents/skills/security-audit/validate-coverage-ledger.test.cjs
```
