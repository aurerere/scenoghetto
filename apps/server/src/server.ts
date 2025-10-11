import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { unlink, writeFile } from "node:fs/promises";
import { convertToCodec, generateThumbnail } from "./ffmpeg";
import { Environment } from "./environment";
import type { AddedVideoOkResponse } from "@scenoghetto/types";
import { progressEmitter } from "./progressEmitter";
import { streamSSE } from "hono/streaming";
import type { VideoProcessingProgressEvent } from "@scenoghetto/types";

config();

const app = new Hono();

const videosRelativePath = Environment.get("VIDEOS_RELATIVE_PATH");
const thumbnailsRelativePath = Environment.get("THUMBNAILS_RELATIVE_PATH");
const consoleRelativePath = Environment.get("CONSOLE_RELATIVE_PATH");

app.post("/api/video", async (ctx) => {
  const data = await ctx.req.formData();

  const file = data.get("file");
  const id = data.get("id") as string;

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("File is empty");
  }

  const extension = file.name.split(".").at(-1) ?? ".mp4";
  const fileName = `${id}-temp.${extension}`;
  const tempVideoPath = `${videosRelativePath}/${fileName}`;
  const persistedVideoPath = `${videosRelativePath}/${id}.webm`;
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

app.get("/api/video/processing-progress/:id", async (ctx) => {
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

app.delete("/api/video/:id", async (ctx) => {
  const id = ctx.req.param("id");

  try {
    await Promise.allSettled([
      unlink(`${videosRelativePath}/${id}.webm`),
      unlink(`${thumbnailsRelativePath}/${id}.png`),
    ]);
  } catch (e) {
    console.error(e);
  }

  return ctx.json({
    message: "ok",
  });
});

app.get(
  "/api/videos/*",
  serveStatic({
    root: videosRelativePath,
    rewriteRequestPath: (path) => path.replace(/^\/api\/videos/, ""),
  }),
);
app.get(
  "/api/thumbnails/*",
  serveStatic({
    root: thumbnailsRelativePath,
    rewriteRequestPath: (path) => path.replace(/^\/api\/thumbnails/, ""),
  }),
);
app.get("/*", serveStatic({ root: consoleRelativePath }));
app.get(
  "*",
  serveStatic({
    path: `${consoleRelativePath}/index.html`,
  }),
);

//
// const player = new Hono();
//
// player.get("/*", serveStatic({ root: playerRelativePath }));
// player.get(
//   "*",
//   serveStatic({
//     path: `${playerRelativePath}/index.html`,
//   }),
// );

serve(
  {
    fetch: app.fetch,
    port: 1339,
  },
  console.log,
);
//
// serve(
//   {
//     fetch: player.fetch,
//     port: 1340,
//   },
//   console.log,
// );
