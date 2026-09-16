export function getTauriTemplateFiles(name, options = {}) {
  const pm = options.packageManager ?? 'npm';
  const crateName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const libName = crateName + '_lib';
  const safeIdent = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  const files = new Map();

  files.set('src-tauri/Cargo.toml', `[package]
name = "${crateName}"
version = "0.1.0"
description = "A Tauri App"
authors = [""]
edition = "2021"

[lib]
name = "${libName}"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
`);

  files.set('src-tauri/build.rs', `fn main() {
    tauri_build::build()
}
`);

  files.set('src-tauri/src/main.rs', `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ${libName}::run()
}
`);

  files.set('src-tauri/src/lib.rs', `#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`);

  files.set('src-tauri/capabilities/default.json', JSON.stringify({
    $schema: '../gen/schemas/desktop-schema.json',
    identifier: 'default',
    description: 'Capability for the main window',
    windows: ['main'],
    permissions: ['core:default', 'opener:default']
  }, null, 2) + '\n');

  files.set('src-tauri/tauri.conf.json', JSON.stringify({
    $schema: 'https://schema.tauri.app/config/2',
    productName: name,
    version: '0.1.0',
    identifier: `com.${safeIdent || 'app'}.app`,
    build: {
      beforeDevCommand: `${pm} run dev`,
      beforeBuildCommand: `${pm} run build`,
      devUrl: 'http://localhost:5173',
      frontendDist: '../dist'
    },
    app: {
      windows: [
        {
          title: name,
          width: 1024,
          height: 768
        }
      ],
      security: {
        csp: "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: asset:; font-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost"
      }
    },
    bundle: {
      active: true,
      targets: 'all'
    }
  }, null, 2) + '\n');

  return files;
}
