import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [urls, setUrls] = createSignal<string[]>([]);

  listen<string[]>("opened", (event) => {
    console.log(event.payload);
    setUrls(event.payload);
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

      <p>{urls().join(", ")}</p>
    </main>
  );
}

export default App;
