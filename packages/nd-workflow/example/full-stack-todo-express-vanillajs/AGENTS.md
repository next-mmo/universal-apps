# Agent Instructions — full-stack-todo-express-vanillajs

Follow ND Workflow risk-scaled delivery. Keep routine work direct, verify with evidence.

## Project Identity
- Stack: Node.js / TypeScript
- Verification command: `npm test`
- Check command: `npm run check`

## Risk Tiers
| Tier | Trigger | Required Gate |
|---|---|---|
| Low | Styling, docs, isolated bug fix | Direct edit + run `npm test` |
| Medium | New API endpoint, store schema change | Record checkpoint in TASK.md + test proof |
| High | Security boundaries, data migrations | Delta PRD + review + full test suite |
| Critical | Auth bypass, destructive operations | Block, escalate, human signoff |

## Verification Policy
Run `npm test` before marking tasks done. No heavy ceremony for routine work.
