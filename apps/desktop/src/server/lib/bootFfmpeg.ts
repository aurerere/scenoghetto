import ffmpeg from "fluent-ffmpeg";
import { ffmpegPath, ffprobePath } from "ffmpeg-ffprobe-static"; // has .path

function unpacked(p: string) {
  return p.replace("app.asar", "app.asar.unpacked");
}

export function bootFfmpeg() {
  if (!ffmpegPath || !ffprobePath) {
    throw new Error("ffmpeg/ffprobe binaries not found from static packages.");
  }
  ffmpeg.setFfmpegPath(unpacked(ffmpegPath));
  ffmpeg.setFfprobePath(unpacked(ffprobePath));
}
