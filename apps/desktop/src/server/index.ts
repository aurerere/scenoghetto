import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { unlink, writeFile } from "node:fs/promises";
import { convertToCodec, generateThumbnail } from "./lib/ffmpeg";
import type { AddedVideoOkResponse } from "@scenoghetto/types";
import { progressEmitter } from "./lib/progressEmitter";
import { streamSSE } from "hono/streaming";
import type { VideoProcessingProgressEvent } from "@scenoghetto/types";
import { consolePath, playerPath, videosPath } from "./lib/paths";

export const consoleApp = new Hono();
export const playerApp = new Hono();

consoleApp.post("/api/video", async (ctx) => {
  const data = await ctx.req.formData();

  const file = data.get("file");
  const id = data.get("id") as string;

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("File is empty");
  }

  const extension = file.name.split(".").at(-1) ?? ".mp4";
  const fileName = `${id}-temp.${extension}`;
  const tempVideoPath = `${videosPath}/${fileName}`;
  const persistedVideoPath = `${videosPath}/${id}.webm`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(tempVideoPath, buffer);

  // const writeStream = createWriteStream(persistedVideoPath);
  let thumbnail = "";
  try {
    await convertToCodec(id, tempVideoPath, persistedVideoPath, {
      format: "webm",
      videoCodec: "libvpx-vp9",
      crf: 30, // VP9 CRF ~28–34 common
      // VP9 benefits from 2-pass for size/quality:
      extraOutputOptions: ["-b:v", "0"],
    });
    thumbnail = await generateThumbnail(persistedVideoPath, id);
    await unlink(tempVideoPath);
  } catch (e) {
    console.error(e);
  }

  return ctx.json({
    id,
    src: `${id}.webm`,
    thumbnailSrc: thumbnail,
    videoExtension: extension,
  } satisfies AddedVideoOkResponse);
});

consoleApp.get("/api/video/processing-progress/:id", async (ctx) => {
  const id = ctx.req.param("id");

  return streamSSE(ctx, async (stream) => {
    function handler(progress: number | "done" | "unknown") {
      stream.writeSSE({
        data: JSON.stringify({
          progress,
        } satisfies VideoProcessingProgressEvent),
      });
    }

    progressEmitter.registerHandler(id, handler);

    progressEmitter.emit(id, "unknown");

    return new Promise<void>((resolve) => {
      stream.onAbort(() => {
        progressEmitter.unregisterHandler(id, handler);
        resolve();
      });
    });
  });
});

consoleApp.delete("/api/video/:id", async (ctx) => {
  const id = ctx.req.param("id");

  try {
    await Promise.allSettled([
      unlink(`${videosPath}/${id}.webm`),
      unlink(`${videosPath}/${id}.png`),
    ]);
  } catch (e) {
    console.error(e);
  }

  return ctx.json({
    message: "ok",
  });
});

consoleApp.get(
  "/api/videos/*",
  serveStatic({
    root: videosPath,
    rewriteRequestPath: (path) => path.replace(/^\/api\/videos/, ""),
  }),
);
consoleApp.get(
  "/api/thumbnails/*",
  serveStatic({
    root: videosPath,
    rewriteRequestPath: (path) => path.replace(/^\/api\/thumbnails/, ""),
  }),
);
consoleApp.get("/*", serveStatic({ root: consolePath }));
consoleApp.get(
  "*",
  serveStatic({
    path: `${consolePath}/index.html`,
  }),
);

playerApp.get("/*", serveStatic({ root: playerPath }));
playerApp.get(
  "*",
  serveStatic({
    path: `${playerPath}/index.html`,
  }),
);
