import ffmpeg from "fluent-ffmpeg";
import { Environment } from "./environment";
import { ffprobePath, ffmpegPath } from "ffmpeg-ffprobe-static";
import { progressEmitter } from "./progressEmitter";

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

export type ConvertOpts = {
  format?: string; // e.g. 'mp4', 'mkv', 'webm', 'opus'
  videoCodec?: string; // e.g. 'libx264','libx265','libvpx-vp9','copy'
  audioCodec?: string; // e.g. 'aac','libopus','copy'
  videoBitrate?: string; // e.g. '2M'
  audioBitrate?: string; // e.g. '192k'
  crf?: number; // e.g. 18..28 (x264/x265/vp9)
  preset?: string; // e.g. 'ultrafast'..'veryslow' (x264/x265)
  extraOutputOptions?: string[]; // any raw ffmpeg flags
};

export async function convertToCodec(
  id: string,
  inputPath: string,
  outputPath: string,
  opts: ConvertOpts,
): Promise<void> {
  const meta = await ffprobe(inputPath);
  const hasVideo = meta.streams.some((s: any) => s.codec_type === "video");
  const hasAudio = meta.streams.some((s: any) => s.codec_type === "audio");

  return new Promise<void>((resolve, reject) => {
    const cmd = ffmpeg(inputPath);

    // format/container
    if (opts.format) cmd.format(opts.format);

    // map streams robustly (won’t fail if audio is missing)
    cmd.outputOptions(["-map", "0:v:0?", "-map", "0:a:0?"]);

    // video
    if (hasVideo) {
      if (opts.videoCodec) cmd.videoCodec(opts.videoCodec);
      if (opts.videoBitrate) cmd.videoBitrate(opts.videoBitrate);
      if (typeof opts.crf === "number")
        cmd.outputOptions(["-crf", String(opts.crf)]);
      if (opts.preset) cmd.outputOptions(["-preset", opts.preset]);
    } else {
      cmd.noVideo();
    }

    // audio
    if (hasAudio) {
      if (opts.audioCodec) cmd.audioCodec(opts.audioCodec);
      if (opts.audioBitrate) cmd.audioBitrate(opts.audioBitrate);
    } else {
      cmd.noAudio();
    }

    // helpful flags (safe to keep; tweak per container)
    const common = [
      "-movflags",
      "+faststart", // for MP4 (ignored by other muxers)
    ];
    cmd.outputOptions(common);

    if (opts.extraOutputOptions?.length) {
      cmd.outputOptions(opts.extraOutputOptions);
    }

    cmd
      .on("error", reject)
      .on("end", () => resolve())
      .on("progress", (progress) => {
        if (!progress.percent || isNaN(progress.percent)) {
          return;
        }

        progressEmitter.emit(id, progress.percent);
      })
      .save(outputPath);
  });
}

function ffprobe(input: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(input, (err, data) => (err ? reject(err) : resolve(data)));
  });
}
