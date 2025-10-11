import ffmpeg from "fluent-ffmpeg";
import { ffmpegPath, ffprobePath } from "ffmpeg-ffprobe-static";
import { progressEmitter } from "./progressEmitter";
import { videosPath } from "./paths";

ffmpeg.setFfmpegPath(ffmpegPath!);
ffmpeg.setFfprobePath(ffprobePath!);

export function generateThumbnail(path: string, id: string) {
  return new Promise<string>((resolve, reject) => {
    ffmpeg(path)
      .thumbnail({
        folder: videosPath,
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
  format?: string;
  videoCodec?: string;
  audioCodec?: string;
  videoBitrate?: string;
  audioBitrate?: string;
  crf?: number;
  preset?: string;
  extraOutputOptions?: string[];
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
