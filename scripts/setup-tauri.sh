#!/bin/bash

# Initialize Tauri in the Next.js project
echo "Initializing Tauri v2..."

# Install Tauri CLI
cargo install tauri-cli@^2.0.0

# Initialize Tauri project
cargo tauri init \
  --app-name "smart-app" \
  --window-title "Smart Clinic Desktop" \
  --dist-dir ../dist \
  --dev-path http://localhost:3000 \
  --before-dev-command "bun run dev" \
  --before-build-command "bun run build"

# Install additional Rust dependencies for sidecar support
cd src-tauri
cargo add tauri-plugin-shell
cargo add tauri-plugin-fs
cargo add tauri-plugin-http
cargo add serde_json
cargo add anyhow

# Create sidecar directory for Node.js runtime
mkdir -p sidecar

# Create package.json for sidecar
cat > sidecar/package.json << EOF
{
  "name": "app-sidecar",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "better-auth": "^1.0.0",
    "ioredis": "^5.0.0",
    "pino": "^8.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "prisma": "^5.0.0"
  }
}
EOF

# Create sidecar server
cat > sidecar/server.js << EOF
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { auth } from 'better-auth';
import Redis from 'ioredis';
import pino from 'pino';

const app = express();
const port = 3030;

// Logger configuration
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino/file',
    options: { destination: './logs/app.log' }
  }
});

// Database client
const prisma = new PrismaClient();

// Redis client (with fallback)
let redis;
try {
  redis = new Redis({
    host: 'localhost',
    port: 6379,
    retryStrategy: (times) => null // Don't retry
  });
} catch (error) {
  logger.warn('Redis connection failed, running without cache');
  redis = null;
}

// Auth configuration
const authHandler = auth({
  database: prisma,
  providers: []
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    redis: redis ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.use('/api/auth', authHandler);

// Database endpoints
app.post('/api/query', async (req, res) => {
  try {
    const { query, params } = req.body;
    const result = await prisma.$queryRawUnsafe(query, ...params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redis endpoints (if available)
app.get('/api/cache/:key', async (req, res) => {
  if (!redis) {
    return res.status(503).json({ error: 'Redis unavailable' });
  }
  const value = await redis.get(req.params.key);
  res.json({ value });
});

app.post('/api/cache', async (req, res) => {
  if (!redis) {
    return res.status(503).json({ error: 'Redis unavailable' });
  }
  const { key, value, ttl } = req.body;
  if (ttl) {
    await redis.set(key, value, 'EX', ttl);
  } else {
    await redis.set(key, value);
  }
  res.json({ success: true });
});

// Logging endpoint
app.post('/api/log', (req, res) => {
  const { level, message, ...meta } = req.body;
  logger[level]({ ...meta }, message);
  res.json({ success: true });
});

// Start server
app.listen(port, () => {
  logger.info(\`Sidecar server running on port \${port}\`);
});
EOF

# Create Rust commands for Tauri
cd src-tauri/src

cat > commands.rs << EOF
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};
use std::process::Command;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct LogEntry {
    level: String,
    message: String,
    metadata: Option<serde_json::Value>,
}

#[command]
pub async fn write_log(app: AppHandle, entry: LogEntry) -> Result<(), String> {
    let app_data_dir = app.path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;

    let log_path = app_data_dir.join("app.log");
    let log_entry = format!(
        "[{}] {}: {}\n",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
        entry.level,
        entry.message
    );

    fs::write(&log_path, log_entry).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn get_app_data_path(app: AppHandle) -> Result<String, String> {
    app.path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory".to_string())
        .map(|p| p.to_string_lossy().to_string())
}

#[command]
pub async fn check_sidecar_status() -> Result<bool, String> {
    // Check if sidecar is running
    #[cfg(target_os = "windows")]
    let output = Command::new("cmd")
        .args(["/C", "tasklist /FI \"IMAGENAME eq node.exe\""])
        .output()
        .map_err(|e| e.to_string())?;

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("sh")
        .arg("-c")
        .arg("pgrep -f 'node.*sidecar'")
        .output()
        .map_err(|e| e.to_string())?;

    Ok(output.status.success())
}
EOF

# Update main.rs
cat > main.rs << EOF
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            commands::write_log,
            commands::get_app_data_path,
            commands::check_sidecar_status,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
EOF

# Update Cargo.toml
cat > Cargo.toml << EOF
[package]
name = "app"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2.0.0-beta" }

[dependencies]
tauri = { version = "2.0.0-beta", features = [] }
tauri-plugin-shell = "2.0.0-beta"
tauri-plugin-fs = "2.0.0-beta"
tauri-plugin-http = "2.0.0-beta"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = "0.4"
anyhow = "1.0"

[features]
custom-protocol = ["tauri/custom-protocol"]
EOF

echo "Setup complete! Run 'cd src-tauri && cargo tauri dev' to start development."
