import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { LiveApp } from "./LiveApp.tsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).get('mode') === 'live' ? <LiveApp /> : <App />}
  </React.StrictMode>,
);
