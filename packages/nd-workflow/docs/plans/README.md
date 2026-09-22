# Implementation Plans

This directory stores implementation plans for multi-step features, refactoring, or architectural transitions. Use [plan template](../../.agents/templates/PLAN.md) when drafting new plans.

Current maintainer planning proposal: adoption document closure and task routing
(`plan-0005-adoption-document-closure.md`). Plans stay local to the source package; like plans 0003
and 0004 they are not part of the distribution manifest, so this directory names them without linking
them.

## Plan Structure

1. **Objective & Context**: Problem being solved and linked PRD/issue.
2. **Architecture Impact**: Modules and files touched.
3. **Execution Phases**: Step-by-step changes.
4. **Verification Strategy**: How each phase will be proven.
5. **Rollback & Safety Plan**: How to revert safely if issues arise.
