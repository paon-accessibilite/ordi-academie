#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
struct SmokeReport(Option<std::path::PathBuf>);

#[tauri::command]
fn desktop_fullscreen(window: tauri::Window, enabled: Option<bool>) -> Result<bool, String> {
    if let Some(value) = enabled {
        window.set_fullscreen(value).map_err(|error| error.to_string())?;
    }
    window.is_fullscreen().map_err(|error| error.to_string())
}

fn main() {
    let arguments: Vec<String> = std::env::args().collect();
    let report = arguments.iter().position(|arg| arg == "--smoke-test")
        .and_then(|index| arguments.get(index + 1)).map(std::path::PathBuf::from);
    let smoke_report = report.clone();
    tauri::Builder::default()
        .manage(SmokeReport(report))
        .invoke_handler(tauri::generate_handler![desktop_fullscreen, desktop_smoke_report])
        .setup(move |app| {
            let mut builder = tauri::WebviewWindowBuilder::from_config(app, &app.config().app.windows[0])?;
            if let Some(path) = &smoke_report {
                let parent = path.parent().ok_or("Le rapport de test doit avoir un dossier parent")?;
                std::fs::create_dir_all(parent)?;
                builder = builder.data_directory(parent.join("webview-test")).visible(false).fullscreen(false);
            }
            let window = builder.build()?;
            if smoke_report.is_some() {
                let handle = app.handle().clone();
                std::thread::spawn(move || {
                    // Attendre que le document embarqué et ses scripts soient prêts.
                    std::thread::sleep(std::time::Duration::from_secs(2));
                    let _ = window.eval(include_str!("../smoke.js"));
                    std::thread::sleep(std::time::Duration::from_secs(25));
                    handle.exit(2);
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Impossible de démarrer Ordi Académie");
}

#[tauri::command]
fn desktop_smoke_report(app: tauri::AppHandle, state: tauri::State<'_, SmokeReport>, report: serde_json::Value) -> Result<(), String> {
    let path = state.0.as_ref().ok_or("Le mode test est désactivé")?;
    let content = serde_json::to_vec_pretty(&report).map_err(|error| error.to_string())?;
    std::fs::write(path, content).map_err(|error| error.to_string())?;
    app.exit(if report["ok"] == true { 0 } else { 1 });
    Ok(())
}
