import path from "path";
import { app } from "electron";

const isDev = !app.isPackaged;
const basePath = isDev
  ? path.join(process.cwd(), "public")
  : path.join(app.getAppPath(), "public");

export const consolePath = `${basePath}/console`;
export const playerPath = `${basePath}/player`;
export const trayPath = `${basePath}/tray`;
export const videosPath = path.join(app.getPath("userData"), "/public/videos");
