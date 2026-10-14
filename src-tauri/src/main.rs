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
        .invoke_handler(tauri::generate_handler![desktop_fullscreen, desktop_smoke_report, desktop_speech])
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

// La voix est embarquée sur Linux ; Windows conserve ses voix système.
#[tauri::command]
async fn desktop_speech(app: tauri::AppHandle, text: String) -> Result<Option<Vec<u8>>, String> {
    #[cfg(not(target_os = "linux"))]
    { let _ = (app, text); Ok(None) }
    #[cfg(target_os = "linux")]
    {
        use tauri::Manager;
        use std::io::Write;
        if text.chars().count() > 4000 { return Err("Consigne trop longue".into()); }
        tauri::async_runtime::spawn_blocking(move || {
            let root = app.path().resource_dir().map_err(|e| e.to_string())?.join("piper");
            let mut child = std::process::Command::new(root.join("piper"))
                .args(["--model", root.join("voices/fr_FR-siwis-medium.onnx").to_str().ok_or("Chemin de voix invalide")?, "--output_raw"])
                .stdin(std::process::Stdio::piped()).stdout(std::process::Stdio::piped()).stderr(std::process::Stdio::null())
                .spawn().map_err(|e| e.to_string())?;
            child.stdin.take().ok_or("Entrée vocale indisponible")?.write_all(format!("{}\n", text.replace(['\r', '\n'], " ")).as_bytes()).map_err(|e| e.to_string())?;
            let output = child.wait_with_output().map_err(|e| e.to_string())?;
            if !output.status.success() || output.stdout.is_empty() { return Err("La voix française n'a pas pu démarrer".into()); }
            let pcm = output.stdout;
            let size = u32::try_from(pcm.len()).map_err(|e| e.to_string())?;
            let mut wav = Vec::with_capacity(pcm.len() + 44);
            wav.extend(b"RIFF"); wav.extend((size + 36).to_le_bytes()); wav.extend(b"WAVEfmt ");
            wav.extend(16u32.to_le_bytes()); wav.extend(1u16.to_le_bytes()); wav.extend(1u16.to_le_bytes());
            wav.extend(22050u32.to_le_bytes()); wav.extend(44100u32.to_le_bytes());
            wav.extend(2u16.to_le_bytes()); wav.extend(16u16.to_le_bytes()); wav.extend(b"data"); wav.extend(size.to_le_bytes()); wav.extend(pcm);
            Ok(Some(wav))
        }).await.map_err(|e| e.to_string())?
    }
}

#[tauri::command]
fn desktop_smoke_report(app: tauri::AppHandle, state: tauri::State<'_, SmokeReport>, report: serde_json::Value) -> Result<(), String> {
    let path = state.0.as_ref().ok_or("Le mode test est désactivé")?;
    let content = serde_json::to_vec_pretty(&report).map_err(|error| error.to_string())?;
    std::fs::write(path, content).map_err(|error| error.to_string())?;
    app.exit(if report["ok"] == true { 0 } else { 1 });
    Ok(())
}
