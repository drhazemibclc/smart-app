#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use tauri::api::path::app_data_dir;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LogEntry {
    level: String,
    message: String,
    metadata: Option<serde_json::Value>,
    timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct LogPayload {
    entries: Vec<LogEntry>,
}

#[tauri::command]
async fn write_logs(
    app_handle: tauri::AppHandle,
    entries: Vec<LogEntry>,
) -> Result<(), String> {
    let app_data_dir = app_data_dir(&app_handle.config())
        .ok_or_else(|| "Failed to get app data directory".to_string())?;

    let log_dir = app_data_dir.join("smart-clinic").join("logs");
    fs::create_dir_all(&log_dir)
        .map_err(|e| format!("Failed to create log directory: {}", e))?;

    let log_file = log_dir.join(format!("app-{}.log", chrono::Local::now().format("%Y-%m-%d")));

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file)
        .map_err(|e| format!("Failed to open log file: {}", e))?;

    for entry in entries {
        let json_line = serde_json::to_string(&entry)
            .map_err(|e| format!("Failed to serialize log entry: {}", e))?;

        writeln!(file, "{}", json_line)
            .map_err(|e| format!("Failed to write to log file: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
async fn get_log_files(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_data_dir = app_data_dir(&app_handle.config())
        .ok_or_else(|| "Failed to get app data directory".to_string())?;

    let log_dir = app_data_dir.join("smart-clinic").join("logs");

    if !log_dir.exists() {
        return Ok(vec![]);
    }

    let mut files = Vec::new();
    let entries = fs::read_dir(log_dir)
        .map_err(|e| format!("Failed to read log directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        if path.is_file() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                files.push(name.to_string());
            }
        }
    }

    files.sort();
    Ok(files)
}

#[tauri::command]
async fn read_log_file(
    app_handle: tauri::AppHandle,
    filename: String,
) -> Result<String, String> {
    let app_data_dir = app_data_dir(&app_handle.config())
        .ok_or_else(|| "Failed to get app data directory".to_string())?;

    let log_path = app_data_dir
        .join("smart-clinic")
        .join("logs")
        .join(&filename);

    // Security: ensure the path is within the logs directory
    if !log_path.starts_with(app_data_dir.join("smart-clinic").join("logs")) {
        return Err("Invalid log file path".to_string());
    }

    let content = fs::read_to_string(&log_path)
        .map_err(|e| format!("Failed to read log file: {}", e))?;

    Ok(content)
}

fn main() {
      app_lib::run();

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            write_logs,
            get_log_files,
            read_log_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
