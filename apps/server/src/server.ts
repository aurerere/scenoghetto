import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";

config();

const app = new Hono();

app.post("/api/video", async (ctx) => {

});

app.delete("/api/video", async (ctx) => {
  const { id } = await ctx.req.json();


});

app.get("/videos", serveStatic({ root: process.env. }));

app.get("/*", serveStatic({ root: process.env.FRONTEND_RELATIVE_PATH }));
app.get("*", serveStatic({ path: `${process.env.FRONTEND_RELATIVE_PATH}/index.html` }));

serve(
  {
    fetch: app.fetch,
    port: 1339,
  },
  console.log,
);
