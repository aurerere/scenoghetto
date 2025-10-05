import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { v7 } from "uuid";
import { writeFile } from "node:fs/promises";
import { generateThumbnail } from "./generateThumbnail";
import { Environment } from "./environment";

config();

const app = new Hono();

const videosRelativePath = Environment.get("VIDEOS_RELATIVE_PATH");
const thumbnailsRelativePath = Environment.get("THUMBNAILS_RELATIVE_PATH");
const frontendRelativePath = Environment.get("FRONTEND_RELATIVE_PATH");

app.post("/api/video", async (ctx) => {
  const data = await ctx.req.formData();

  const file = data.get("file");

  if (!(file instanceof File)) {
    return;
  }

  const id = v7();
  const fileName = `${id}.${file.name.split(".").at(-1)}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const videoPath = `${videosRelativePath}/${fileName}`;

  await writeFile(videoPath, buffer);

  const thumbnail = await generateThumbnail(videoPath, id);

  return ctx.json({
    id,
    src: fileName,
    thumbnailSrc: thumbnail,
  });
});

app.delete("/api/video", async (ctx) => {
  // const { id } = await ctx.req.json();
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
app.get("/*", serveStatic({ root: frontendRelativePath }));
app.get(
  "*",
  serveStatic({
    path: `${frontendRelativePath}/index.html`,
  }),
);

serve(
  {
    fetch: app.fetch,
    port: 1339,
  },
  console.log,
);
