# Universal source CLI

Copy Universal Apps implementations into a company's existing project. The CLI is a development-time generator, not an application runtime dependency. Generated files include their transitive local helpers and types; internal `@package/*` imports become relative imports. Required third-party packages remain normal dependencies.

## Before first release

This source tree does not establish that `@next-mmo/universal-cli` has been published. Build and pack it in the repository:

```sh
pnpm source:build
pnpm source:pack
```

Use the resulting `dist/next-mmo-universal-cli-0.1.0.tgz` with `npm exec --package /absolute/path/to/the.tgz -- universal ...`, or run the packed CLI with Node. Publishing the package is a separate owner-approved release step.

## Consumer flow

### 1. Scaffold a new starter application from scratch

To generate a complete, runnable starter application with Vite, Tailwind CSS v4, TypeScript, and pre-configured Universal components:

```sh
# Web starter (React, Vue, Svelte, or React Native Web)
npx @next-mmo/universal-cli create my-app --framework react

# Mobile starter (Bare React Native + Uniwind + Metro + Tailwind v4)
npx @next-mmo/universal-cli create my-mobile-app --framework uniwind-bare

# Desktop starter (Tauri 2 + React + Vite + Tailwind v4)
npx @next-mmo/universal-cli create my-desktop-app --framework react --tauri
```

### 2. Add to an existing project

The following `npx` form applies to configure an existing project:

```sh
npx @next-mmo/universal-cli init --css src/index.css
npx @next-mmo/universal-cli add button pro-crud
npx @next-mmo/universal-cli diff button
npx @next-mmo/universal-cli doctor
```

Web projects must already have their framework and Tailwind v4 integration configured. `init` detects common global stylesheets, or accepts `--css`. It leaves `components.json`, bundler configuration, and the company's dependency versions untouched. Use `--path` at initialization to change the generated directory. No global CLI installation is required.

By default, files go under `src/lib/universal` when `src` exists, otherwise `lib/universal`. For example:

```tsx
import { Button } from '@/lib/universal/ui/components/ui/button';
import { ProCrudPage, defineProResource } from '@/lib/universal/pro/crud/pro-crud-page';
```

Use your project's actual import alias or a relative path. The generated files themselves use relative imports and do not require a specific alias.

`add` copies implementation files, adds missing dependency declarations, links local token CSS, and runs the detected npm/pnpm/yarn/bun installer. Existing dependency versions are preserved, not upgraded; verify compatibility with your application's versions. `--no-install` defers installation; `--dry-run` performs no writes. The CLI never adds itself or an internal runtime package to the consumer's manifest.

Company edits are protected. Re-adding an identical file is a no-op; differing files stop the complete write plan unless `--overwrite` is explicitly supplied. `--yes` does not authorize overwrites. Review `diff` before updating. `universal.lock.json` records installed items and source hashes; it is not a runtime requirement or a substitute for the package-manager lockfile.

## Frameworks and coverage

```sh
universal list --framework react
universal add --all --framework react
```

Supported source catalogs cover `core`, `utils`, `ui`, `pro-core`, `pro`, `pro-vue`, `pro-svelte`, `ui-native`, and `tauri-api`. Framework-neutral items can be used in every project. `--all` requires an explicit framework and never mixes Vue, Svelte, React, and Native component implementations.

The build discovers every non-legacy public export. Packages without exports maps expose their source entries. A missing export, unresolved module, unportable dependency version, source escape, or conflicting dependency version fails the build. Package aggregates include every discovered entry. This is source-distribution coverage, not a claim that every framework/platform combination has been compiled or tested.

Tauri adapters retain their ordinary Tauri dependencies and browser fallbacks. They do not generate an application's Rust commands, capabilities, signing configuration, or platform toolchains. Native components likewise need their normal React Native/Uniwind setup.

## Official shadcn registry interoperability

The build emits self-contained standard registry items into `dist/universal-cli/registry`. Each item uses `registry:file` targets under `@lib/universal`, includes its local dependency graph, and declares external dependencies. No internal registry server or library is required at runtime.

In an initialized shadcn project, use the official CLI with a generated item file:

```sh
npx shadcn@latest add /absolute/path/to/dist/universal-cli/registry/ui-button.json
```

The official CLI resolves `@lib` through that project's `components.json`. When using that CLI directly, follow the item's printed instruction to import the generated `ui/styles/tokens.css` in the application's Tailwind v4 stylesheet. The Universal CLI links this stylesheet automatically. Do not mix both installers into different target directories in the same project.

To host a registry, serve the generated JSON files from a location your consumers can access. No registry deployment or package publication is performed by the build. This project implements the requested source-ownership workflow; it does not claim parity with every official shadcn CLI option, authentication feature, framework initializer, or release.

## Licensing and verification

Generated code includes the repository's existing LICENSE. Original source notices are preserved because source is copied rather than reconstructed. Third-party package licenses still apply; this is not a legal compliance audit.

Maintainers run `pnpm source:test`, `pnpm source:build`, and `pnpm source:smoke`. The smoke check unpacks an actual CLI tarball and generates each framework's catalog in isolated projects. A separate full framework build is still required before publishing a production release. `doctor` checks source ownership and missing generated files, not type safety, accessibility, or license compliance.
