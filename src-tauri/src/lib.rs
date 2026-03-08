#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
       .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    // Log to the terminal (stdout)
                    Target::new(TargetKind::Stdout),
                    // Log to the browser/webview console
                    Target::new(TargetKind::Webview),
                    // Log to a physical file in $APPDATA/smart-app/logs/
                    Target::new(TargetKind::LogDir {
                        file_name: Some("main".to_string()),
                    }),
                ])
                // Set the log level (Info is standard for production)
                .level(log::LevelFilter::Info)
                .build(),
        )
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
