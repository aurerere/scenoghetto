import ffmpeg from "fluent-ffmpeg";
import { Environment } from "./environment";
import { ffmpegPath, ffprobePath } from "ffmpeg-ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath!);
ffmpeg.setFfprobePath(ffprobePath!);

export function generateThumbnail(path: string, id: string) {
  return new Promise<string>((resolve, reject) => {
    ffmpeg(path)
      .thumbnail({
        folder: Environment.get("THUMBNAILS_RELATIVE_PATH"),
        count: 1,
        timemarks: ["50%"],
        filename: `${id}.png`,
      })
      .on("end", () => {
        resolve(`${id}.png`);
      })
      .on("error", reject);
  });
}
