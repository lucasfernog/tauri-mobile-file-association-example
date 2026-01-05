import { createSignal, onMount } from "solid-js";
import logo from "./assets/logo.svg";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";

async function startAccessingSecurityScopedResource(
  path: string | URL
): Promise<void> {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }

  await invoke("plugin:fs|start_accessing_security_scoped_resource", {
    path: path instanceof URL ? path.toString() : path,
  });
}

async function stopAccessingSecurityScopedResource(
  path: string | URL
): Promise<void> {
  if (path instanceof URL && path.protocol !== "file:") {
    throw new TypeError("Must be a file URL.");
  }

  await invoke("plugin:fs|stop_accessing_security_scoped_resource", {
    path: path instanceof URL ? path.toString() : path,
  });
}

const manualTracking = false;

function App() {
  const [urls, setUrls] = createSignal<string[]>([]);
  const [files, setFiles] = createSignal<string[]>([]);

  async function handleOpenFile(urls: string[]) {
    setUrls(urls);
    setFiles([]);

    const files = [];
    for (const url of urls) {
      if (manualTracking) {
        await startAccessingSecurityScopedResource(url);
      }
      const file = await readFile(url);
      if (manualTracking) {
        await stopAccessingSecurityScopedResource(url);
      }
      files.push(`${file.length} bytes`);
    }
    setFiles(files);
  }

  listen<string[]>("opened", (event) => {
    console.log(event.payload);
    handleOpenFile(event.payload);
  });

  onMount(() => {
    invoke<string[]>("opened_urls").then((urls) => {
      handleOpenFile(urls);
    });
  });

  return (
    <main class="container">
      <h1>Welcome to Tauri + Solid</h1>

      <div class="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={logo} class="logo solid" alt="Solid logo" />
        </a>
      </div>

      {urls().map((url, index) => (
        <>
          <p>{url}</p>
          <b>{files()[index]}</b>
        </>
      ))}
    </main>
  );
}

export default App;
