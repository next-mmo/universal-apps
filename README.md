<div align="center">
  <img
    src="https://github.com/RoyRao2333/template-tauri-vite-react-ts-tailwind/assets/31413093/91cdcd1b-2387-4c01-9710-9b2f44c10329"
    height="100"
    alt="Tauri logo"
  />
  <img
    src="https://user-images.githubusercontent.com/31413093/197097625-5b3bd3cf-2bd6-4a3a-8059-a1fe9f28100b.svg"
    height="100"
    alt="Vite logo"
  />
</div>

<h1 align="center">template-tauri-vite-react-ts-tailwind</h1>

<p align="center">
  An opinionated Tauri v2 starter template organized as a pnpm monorepo.
</p>

<p align="center">
  <a href="https://react.dev/">
    <img src="https://img.shields.io/static/v1?label=React&message=19&style=for-the-badge&labelColor=FFFFFF&logo=react&color=61DAFB" alt="React 19" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/static/v1?label=TypeScript&message=5&style=for-the-badge&labelColor=FFFFFF&logo=typescript&color=3178C6" alt="TypeScript 5" />
  </a>
  <a href="https://vite.dev/">
    <img src="https://img.shields.io/static/v1?label=Vite&message=7&style=for-the-badge&labelColor=FFFFFF&logo=vite&color=646CFF" alt="Vite 7" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/static/v1?label=Tailwind%20CSS&message=4&style=for-the-badge&labelColor=FFFFFF&logo=tailwindcss&color=06B6D4" alt="Tailwind CSS 4" />
  </a>
  <a href="https://tauri.app/">
    <img src="https://img.shields.io/static/v1?label=Tauri&message=2&style=for-the-badge&labelColor=FFFFFF&logo=tauri&color=FFC131" alt="Tauri 2" />
  </a>
</p>

## Overview

This repository provides a practical foundation for building cross-platform
desktop applications with Tauri. The frontend uses React, TypeScript, Vite,
and Tailwind CSS, while reusable modules are organized as pnpm workspace
packages.

The template includes:

- [Tauri 2](https://v2.tauri.app/) for the native desktop application shell
- [React 19](https://react.dev/) and
  [TypeScript 5](https://www.typescriptlang.org/) for the frontend
- [Vite 7](https://vite.dev/) for development and production builds
- [Tailwind CSS 4](https://tailwindcss.com/) through its Vite integration
- A [pnpm workspace](https://pnpm.io/workspaces) for application and shared
  packages
- [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) and
  [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) configuration
- A project renaming script that synchronizes the workspace, Tauri, and Rust
  package names

## Prerequisites

Before using the template, install the following tools:

- [Node.js](https://nodejs.org/) 20.19 or later, or 22.12 or later, as
  required by Vite 7
- [pnpm](https://pnpm.io/installation)
- [Rust](https://www.rust-lang.org/tools/install)
- The platform-specific dependencies listed in the
  [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/)

This repository is configured for pnpm. Using npm, Yarn, or another package
manager requires corresponding changes to the workspace scripts and
`apps/tauri-app/src-tauri/tauri.conf.json`.

## Getting Started

### Create a repository from the template

The recommended approach is to select **Use this template** on GitHub and
create a new repository from this template.

Alternatively, download the
[source archive](https://github.com/RoyRao2333/template-tauri-vite-react-ts-tailwind/archive/refs/heads/main.zip)
or create a clean local copy with [tiged](https://github.com/tiged/tiged):

```sh
pnpm dlx tiged royrao2333/template-tauri-vite-react-ts-tailwind my-app
cd my-app
```

### Install dependencies

```sh
pnpm install
```

### Rename the project

Rename the template before starting application development:

```sh
pnpm rename-project --name "My App" --id com.example.my-app
```

The command updates the application directory, workspace package name, root
scripts, Tauri product name, window title, bundle identifier, Cargo package,
Rust library name, Rust entry point, and application README reference.

| Argument | Required | Example              | Description                                                                                      |
| -------- | -------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| `--name` | Yes      | `"My App"`           | The project name, equivalent to the **Project name** field in `create-tauri-app`.                |
| `--id`   | Yes      | `com.example.my-app` | The application bundle identifier, equivalent to the **Identifier** field in `create-tauri-app`. |

#### Name normalization

Workspace package names use kebab-case. This name is applied to the
`apps/<workspace-package-name>` directory, the `@app/<workspace-package-name>`
package, and the root pnpm filter scripts.

Rust and Tauri package names follow the normalization behavior used by
`create-tauri-app`:

- Input is converted to lowercase.
- Colons, semicolons, spaces, and tildes are converted to hyphens.
- Periods, forward slashes, and backslashes are removed.
- Leading digits and hyphens are removed.
- An empty result falls back to `tauri-app`.

| Input              | Workspace package  | Rust package       | Rust library           |
| ------------------ | ------------------ | ------------------ | ---------------------- |
| `MyProjectHello`   | `my-project-hello` | `myprojecthello`   | `myprojecthello_lib`   |
| `myProjectHello`   | `my-project-hello` | `myprojecthello`   | `myprojecthello_lib`   |
| `my_project_hello` | `my-project-hello` | `my_project_hello` | `my_project_hello_lib` |

### Start the desktop application

```sh
pnpm tauri dev
```

### Run the same app in the browser

The frontend is platform-independent: a runtime check (`isTauri()`) selects a
storage adapter per platform, so the identical UI code runs in the browser.

```sh
pnpm dev:web    # Vite dev server for the browser
pnpm build:web  # Type-checked production web bundle (deploy dist/ anywhere)
```

Desktop builds persist todos through Rust commands backed by a JSON file in
the app data directory; browser builds fall back to `localStorage`. Platform
calls are wrapped in `@package/tauri-api` — keep raw `invoke()` calls out of
UI components and add a web fallback there when introducing new commands.

Note: Tailwind's automatic content detection only scans `apps/`; classes used
inside `packages/` require the explicit `@source` entries in
`apps/tauri-app/src/index.css`.

## Available Scripts

Run these commands from the repository root:

| Command                                                       | Description                                                     |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| `pnpm dev`                                                    | Start the Vite frontend development server.                     |
| `pnpm dev:web`                                                | Start the Vite development server for the browser.              |
| `pnpm build`                                                  | Type-check the frontend and create a production frontend build. |
| `pnpm build:web`                                              | Create the production web bundle for static hosting.            |
| `pnpm preview`                                                | Preview the production frontend build locally.                  |
| `pnpm tauri dev`                                              | Start the Tauri application in development mode.                |
| `pnpm tauri build`                                            | Build platform-specific desktop application bundles.            |
| `pnpm lint`                                                   | Check the workspace with Oxlint.                                |
| `pnpm lint:fix`                                               | Apply supported Oxlint fixes.                                   |
| `pnpm rename-project --name "My App" --id com.example.my-app` | Rename the template and update its application identifiers.     |

Oxfmt behavior is defined in `oxfmt.config.ts`. Oxlint rules are defined in
`oxlint.config.ts`.

## Project Structure

```text
.
├── apps/
│   └── tauri-app/       # React frontend and Tauri application
├── packages/
│   ├── core/            # Shared core modules
│   ├── tauri-api/       # Shared Tauri API integrations
│   ├── ui/              # Shared UI modules
│   └── utils/           # Shared utility modules
├── scripts/
│   └── renameProject.ts # Project renaming utility
├── oxfmt.config.ts      # Oxfmt configuration
├── oxlint.config.ts     # Oxlint configuration
└── pnpm-workspace.yaml  # pnpm workspace definition
```

## Related Projects

- [Tauri](https://github.com/tauri-apps/tauri)
- [Vite](https://github.com/vitejs/vite)
- [React](https://github.com/facebook/react)
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss)
- [Oxc](https://github.com/oxc-project/oxc)

## Contributing

Contributions are welcome. Before opening a pull request, run the relevant
build and lint commands and verify the application on the platform affected by
your changes.

Use the
[issue tracker](https://github.com/RoyRao2333/template-tauri-vite-react-ts-tailwind/issues/new)
to report bugs, request features, or propose significant changes.

## License

This project is available under the terms of the [MIT License](LICENSE).
