---
id: "0015"
title: "Vanilla Web UI source target"
status: in-progress
last-audit: 2026-09-29
---

# Change Proposal: Vanilla Web UI source target

## Problem and scope

- **User / problem / desired outcome:** Companies should be able to use Universal Apps with plain web platform APIs, without React, Vue, Svelte, or a Universal runtime package. The existing source CLI should keep the shadcn-style flow: initialize once, add named components, own the generated source.
- **In scope:** a first-class `vanilla` framework in the source CLI; a `packages/ui-vanilla` source catalog; a Vite + Tailwind v4 vanilla starter; framework-aware short aliases such as `add button`; smoke and compile coverage; documentation.
- **Non-goals:** duplicating every Pro/CRUD adapter in vanilla in this increment; npm publication; a registry service; Shadow DOM; framework wrappers around the vanilla components.
- **Implementation model:** standards-based Custom Elements in the light DOM, backed by native HTML controls and progressive enhancement. Generated source remains editable and carries no React/Vue/Svelte or Universal runtime dependency.

## Approval record

- **Scope approval:** approved.
- **Approver / decision date:** repository owner request in the current project conversation, 2026-09-29.
- **Approved scope:** the six-part implementation plan presented for vanilla UI support: CLI framework plumbing, `ui-vanilla`, framework-aware aliases, starter, verification, and docs.
- **Execution authorization:** explicit "do it" received 2026-09-29.
- **Publication/deployment authorization:** not granted; this change prepares source and verification only.

## Requirements

- **VAN-01 Framework contract.** `universal create/init/list/add/diff/doctor` accept or operate with framework `vanilla` wherever the existing frontend framework contract applies.
- **VAN-02 Source ownership.** Vanilla generated components contain no `@package/*`, Universal CLI, React, Vue, Svelte, or framework runtime dependency.
- **VAN-03 Familiar naming.** In a vanilla project, `universal add button` resolves to the vanilla button item; in React it continues to resolve to the React button item. Exact registry item names remain available.
- **VAN-04 Starter.** `universal create <name> --framework vanilla` produces a runnable Vite + Tailwind v4 project with a plain DOM entry point and a generated local button.
- **VAN-05 Component baseline.** The vanilla package provides source-owned counterparts for the current React UI primitive catalog where browser platform semantics are applicable. Interactive controls use native semantics and keyboard/focus behavior rather than JSX translation.
- **VAN-06 Styling.** Components share Universal design tokens, render in light DOM, and remain styleable from company CSS.
- **VAN-07 Verification.** Packed CLI smoke covers vanilla; consumer compilation installs and builds the vanilla starter and imports generated modules; vanilla is a gated verified framework.
- **VAN-08 Compatibility.** Existing React/Vue/Svelte/native behavior and default React framework detection remain unchanged.

## Acceptance and delivery

- [ ] `pnpm source:test`
- [ ] `pnpm source:build`
- [ ] `pnpm source:smoke`
- [ ] `pnpm source:compile --only vanilla`
- [ ] Existing framework source tests remain green.
- [ ] Generated vanilla consumer has no React/Vue/Svelte/Universal runtime dependency.
- [ ] README and source CLI guide document the vanilla flow.

## Recovery

Work is isolated on `feat/vanilla-ui`. No migration or persistent data is involved. Recovery is to discard/revert this branch; existing framework registry items are additive and remain unchanged.
