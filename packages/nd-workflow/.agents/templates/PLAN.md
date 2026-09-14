# Implementation Plan: <Objective>

Use for multi-phase features, architectural transitions, or complex refactoring. Routine multi-step work can keep plans inline in tasks; use this template when execution spans multiple decoupled phases, components, or rollback boundaries.

## Objective & Context
- Outcome / problem being solved:
- Linked PRD / issue / requirement IDs:
- Mode: technical plan (implementation requires separate task authorization).

## Architecture Impact
- Modules, directories, and files touched:
- New dependencies / runtime services (requires user approval):
- Invariants, contracts, or trust boundaries affected:
- State / schema / data migrations:

## Execution Phases
Break into sequentially verifiable phases. Each phase must produce a working, testable state.

### Phase 1: <Name>
- Scope & changes:
- Verification gate:
- Rollback trigger & command:

### Phase 2: <Name>
- Scope & changes:
- Verification gate:
- Rollback trigger & command:

### Phase N: <Final Phase & Cutover>
- Scope & changes:
- Verification gate:
- Rollback trigger & command:

## Verification Strategy
- Phase-by-phase test commands and expected observations:
- Regression and integration test suite:
- End-to-end / user-visible verification:

## Rollback & Safety Plan
- Rollback point for each phase:
- Data backup / restore steps (if persistent data modified):
- Abort thresholds / failure signals:
- Irreversible operations (explicit user confirmation required before running):
