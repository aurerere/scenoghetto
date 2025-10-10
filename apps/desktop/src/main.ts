import { Tray } from "electron";
import { app, Menu, shell } from "electron";
import * as path from "path";
import { stat, mkdir } from "node:fs/promises";
import { nativeImage } from "electron/common";
import { serve } from "@hono/node-server";
import { consoleApp, playerApp } from "./server";
import { bootFfmpeg } from "./server/lib/bootFfmpeg";

app.on("ready", async () => {
  bootFfmpeg();
  await createDirectories();

  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTSURBVHgBpZKBCYAgEEV/TeAIjuIIbdQIuUGt0CS1gW1iZ2jIVaTnhw+Cvs8/OYDJA4Y8kR3ZR2/kmazxJbpUEfQ/Dm/UG7wVwHkjlQdMFfDdJMFaACebnjJGyDWgcnZu1/lrCrl6NCoEHJBrDwEr5NrT6ko/UV8xdLAC2N49mlc5CylpYh8wCwqrvbBGLoKGvz8Bfq0QPWEUo/EAAAAASUVORK5CYII=",
  );

  const tray = new Tray(icon);

  tray.setToolTip("Scenoghetto");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        shell.openExternal("http://localhost:1339");
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  serve(
    {
      fetch: consoleApp.fetch,
      port: 1339,
    },
    console.log,
  );

  serve(
    {
      fetch: playerApp.fetch,
      port: 1340,
    },
    console.log,
  );
});

async function createDirectories() {
  const publicDir = path.join(app.getPath("userData"), "public");

  const videosPath = path.join(publicDir, "videos");

  if (!(await exists(videosPath))) {
    await mkdir(videosPath, { recursive: true });
  }
}

async function exists(path: string) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
