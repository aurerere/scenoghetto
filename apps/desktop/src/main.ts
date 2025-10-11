import { Tray } from "electron";
import { app, Menu, shell } from "electron";
import * as path from "path";
import { stat, mkdir } from "node:fs/promises";
import { serve } from "@hono/node-server";
import { consoleApp, playerApp } from "./server";
import { bootFfmpeg } from "./server/lib/bootFfmpeg";
import { trayPath } from "./server/lib/paths";
import { nativeImage } from "electron/common";

const trayIcon = nativeImage
  .createFromPath(`${trayPath}/icon.template.png`)
  .resize({ width: 20, height: 20 });
trayIcon.setTemplateImage(true);

const appElements: {
  tray?: Tray;
} = {
  tray: undefined,
};

app.on("ready", async () => {
  bootFfmpeg();
  await createDirectories();
  const tray = new Tray(trayIcon);
  appElements.tray = tray;
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
