use std::sync::Mutex;
use tauri::Manager;

struct OpenedUrls(Mutex<Vec<tauri::Url>>);

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn opened_urls(app: tauri::AppHandle) -> Vec<tauri::Url> {
    let urls = app.state::<OpenedUrls>();
    let urls = urls.0.lock().unwrap().clone();
    urls
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(OpenedUrls(Mutex::new(vec![])))
        .invoke_handler(tauri::generate_handler![opened_urls])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app, event| {
            #[cfg(any(target_os = "macos", target_os = "ios", target_os = "android"))]
            if let tauri::RunEvent::Opened { urls } = event {
                use tauri::Emitter;
                app.state::<OpenedUrls>().0.lock().unwrap().extend(urls.clone());
                app.emit("opened", urls).unwrap();
            }
        });
}
