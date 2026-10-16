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
        .invoke_handler(tauri::generate_handler![desktop_fullscreen, desktop_smoke_report, desktop_smoke_right_click, desktop_speech])
        .setup(move |app| {
            let mut builder = tauri::WebviewWindowBuilder::from_config(app, &app.config().app.windows[0])?;
            if let Some(path) = &smoke_report {
                let parent = path.parent().ok_or("Le rapport de test doit avoir un dossier parent")?;
                std::fs::create_dir_all(parent)?;
                builder = builder.data_directory(parent.join("webview-test")).visible(cfg!(target_os = "linux")).fullscreen(cfg!(target_os = "linux"));
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
        .expect("Impossible de démarrer Ordi Academie");
}

// Test Linux : vrai clic X11, réservé au processus lancé avec --smoke-test.
#[tauri::command]
async fn desktop_smoke_right_click(state: tauri::State<'_, SmokeReport>, x: i32, y: i32, button: Option<u8>) -> Result<bool, String> {
    if state.0.is_none() { return Err("Le mode test est désactivé".into()); }
    let button = button.unwrap_or(3);
    if ![1,3].contains(&button) { return Err("Bouton de test invalide".into()); }
    #[cfg(not(target_os = "linux"))]
    { let _ = (x, y, button); Ok(false) }
    #[cfg(target_os = "linux")]
    {
        let pid = std::process::id().to_string();
        tauri::async_runtime::spawn_blocking(move || {
            let output = std::process::Command::new("xdotool").args(["search", "--onlyvisible", "--pid", &pid]).output().map_err(|e| e.to_string())?;
            let ids = String::from_utf8_lossy(&output.stdout);
            // GTK crée aussi des fenêtres temporaires pour les dialogues et menus.
            // Choisir la fenêtre principale, plutôt que le premier identifiant X11.
            let mut windows = Vec::new();
            for id in ids.lines() {
                let geometry = std::process::Command::new("xdotool").args(["getwindowgeometry", "--shell", id]).output().map_err(|e| e.to_string())?;
                let text = String::from_utf8_lossy(&geometry.stdout);
                let size = |key: &str| text.lines().find_map(|line| line.strip_prefix(key)).and_then(|value| value.parse::<u64>().ok()).unwrap_or(0);
                windows.push((size("WIDTH=") * size("HEIGHT="), id));
            }
            let id = windows.into_iter().max_by_key(|(area, _)| *area).map(|(_, id)| id).ok_or("Fenêtre de test introuvable")?;
            let result = std::process::Command::new("xdotool").args(["windowfocus", "--sync", id, "mousemove", "--window", id, &x.to_string(), &y.to_string(), "sleep", "0.1", "click", &button.to_string()]).status().map_err(|e| e.to_string())?;
            if !result.success() { return Err("Clic X11 impossible".into()); }
            Ok(true)
        }).await.map_err(|e| e.to_string())?
    }
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
                .env("LD_LIBRARY_PATH", format!("{}:{}", root.display(), std::env::var("LD_LIBRARY_PATH").unwrap_or_default()))
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
    use tauri::Manager;
    let path = state.0.as_ref().ok_or("Le mode test est désactivé")?;
    let mut report = report;
    if let Some(window) = app.get_webview_window("main") {
        report["nativeTitle"] = window.title().map_err(|error| error.to_string())?.into();
    }
    let content = serde_json::to_vec_pretty(&report).map_err(|error| error.to_string())?;
    std::fs::write(path, content).map_err(|error| error.to_string())?;
    app.exit(if report["ok"] == true { 0 } else { 1 });
    Ok(())
}
