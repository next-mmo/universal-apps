# Agent Instructions — CMS Portfolio

Follow the ND Workflow starter policy. This project adopts the full workflow with Delta PRDs, risk-tiered gates, converge-check verification, and compound learnings.

## Project identity
- **System**: Developer portfolio CMS with authenticated admin dashboard.
- **Stack**: Express 5 + vanilla JavaScript, JSON file persistence, session-based auth.
- **Scope**: Local demo; not a production service. No external database, no cloud deployment, no real user data.

## Risk precedence
- Low: Styling, copy, new static page. Implement and verify.
- Medium: New API endpoint, store schema change, auth flow change. Plan in task file, test, converge-check.
- High: Security boundary change, data migration, new persistence backend. PRD required, human signoff before merge.
- Critical: Auth bypass, data deletion without confirmation. Block and escalate.

## Verification
- Run `npm run check` (syntax) and `npm run test:api` before marking tasks done.
- Use converge-check skill for medium+ risk tasks.
- Capture reusable learnings with compound skill; skip trivial findings.

## Token budget
Keep this file under 250 words. Use on-demand skills for detailed procedures.
