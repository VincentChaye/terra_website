/**
 * Processus principal — fenêtre unique.
 * Sécurité : contextIsolation activé, pas de nodeIntegration ; le renderer
 * ne parle au monde extérieur que via le pont préload (window.cms).
 */

import { app, BrowserWindow } from "electron";
import { join } from "node:path";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Terra Numerica — CMS",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // electron-vite : URL du serveur de dev en `dev`, fichier construit sinon.
  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
