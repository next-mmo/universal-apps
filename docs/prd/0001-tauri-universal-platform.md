# PRD-0001: Tauri Universal Platform

> Status: draft  
> Created: 2026-09-03  
> Source: current repository README and package layout; human confirmation required

## Product goal

Provide token-first application building blocks that let teams share product contracts and UI across React, Vue, Svelte, React Native Web, browser, and Tauri desktop consumers without copying component source into each application.

## Current requirement baseline

- Consumers use declared stable package subpaths rather than package-root or internal source imports.
- The main frontend can run in a browser or Tauri shell through typed platform adapters with browser fallbacks.
- Framework-neutral contracts remain separate from framework and platform adapters.
- CLI, MCP, `llms.txt`, and focused generated documentation let agents retrieve one relevant capability or recipe within bounded output.
- Shared-package changes retain compatibility across their declared framework and application consumers.

## Non-goals for this draft

- It does not approve a new feature, release, migration, authentication change, or production action.
- It does not treat existing code or passing tests as proof that every requirement is complete.
- It does not define roadmap priority; the human product owner must refine and approve future increments.

## Acceptance model

Each product increment declares its user outcome, affected public boundary, compatibility expectations, real-consumer evidence, recovery path, and human acceptance in an active task.
