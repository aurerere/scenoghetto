import type { Logger } from "@scenoghetto/utils";
import type { VideoManifest } from "./types/data.ts";

export class VideoController {
  private handleVideoEnd?: () => void;
  private playing = false;
  private currentVideoManifest?: VideoManifest;

  constructor(
    private readonly videoElement: HTMLVideoElement,
    private readonly sourceElement: HTMLSourceElement,
    private readonly endThreshold: number,
    private readonly logger: Logger,
  ) {}

  private watch() {
    if (!this.playing) {
      return;
    }
    this.videoElement.requestVideoFrameCallback(() => {
      if (!this.handleVideoEnd) {
        return;
      }

      const remaining =
        this.videoElement.duration - this.videoElement.currentTime;

      if (remaining <= this.endThreshold) {
        this.handleVideoEnd();
      }

      this.watch();
    });
  }

  play(callback?: () => void) {
    this.logger.info("Trying to play");
    this.videoElement
      .play()
      .then(() => {
        this.playing = true;
        this.watch();
        this.logger.info("Playing...", this.currentVideoManifest);
        callback?.();
      })
      .catch(this.logger.error);
  }

  pause() {
    this.videoElement.pause();
    this.logger.info("Paused", this.currentVideoManifest);
    this.playing = false;
  }

  hide() {
    this.videoElement.style.display = "none";
    this.logger.info("Hidden", this.currentVideoManifest);
  }

  pauseHideAndReset() {
    this.handleVideoEnd = undefined;
    this.pause();
    this.hide();
  }

  show() {
    this.videoElement.style.display = "block";
    this.logger.info("Shown", this.currentVideoManifest);
  }

  onEnded(callback: () => void) {
    this.handleVideoEnd = callback;
    this.watch();
    this.logger.info("End callback set, watching", this.currentVideoManifest);
  }

  updateVideo(video: VideoManifest) {
    if (this.sourceElement.src === video.src) {
      return;
    }
    this.currentVideoManifest = video;
    this.sourceElement.src = video.src;
    this.videoElement.load();
    this.logger.info("Source updated", this.currentVideoManifest);
  }

  isPlaying() {
    return this.playing;
  }

  get videoManifest() {
    return this.currentVideoManifest;
  }

  get videoKind() {
    return this.currentVideoManifest?.kind;
  }
}
