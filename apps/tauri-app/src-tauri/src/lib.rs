// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{Manager, State};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Todo {
    id: u64,
    text: String,
    done: bool,
}

#[derive(Serialize)]
struct TodoState {
    file_path: PathBuf,
    todos: Mutex<Vec<Todo>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn load_todos(state: State<'_, TodoState>) -> Vec<Todo> {
    state.todos.lock().expect("todo mutex poisoned").clone()
}

#[tauri::command]
fn save_todos(state: State<'_, TodoState>, todos: Vec<Todo>) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&todos).map_err(|error| error.to_string())?;
    fs::write(&state.file_path, json).map_err(|error| error.to_string())?;
    *state.todos.lock().expect("todo mutex poisoned") = todos;
    Ok(())
}

fn read_todos_from_disk(file_path: &PathBuf) -> Vec<Todo> {
    fs::read_to_string(file_path)
        .ok()
        .and_then(|contents| serde_json::from_str(&contents).ok())
        .unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            fs::create_dir_all(&data_dir)?;
            let file_path = data_dir.join("todos.json");
            let todos = read_todos_from_disk(&file_path);
            app.manage(TodoState {
                file_path,
                todos: Mutex::new(todos),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, load_todos, save_todos])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
