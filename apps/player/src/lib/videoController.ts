import type { EventBus } from "@scenoghetto/utils";
import { type Logger } from "@scenoghetto/utils";
import type { VideoManifest } from "@scenoghetto/types";

export class VideoController {
  private handleVideoEnd?: () => void;
  private playing = false;
  private currentVideoManifest?: VideoManifest;
  private videoFrameCallbackId?: number;

  constructor(
    private readonly videoElement: HTMLVideoElement,
    private readonly sourceElement: HTMLSourceElement,
    private readonly eventBus: EventBus,
    private readonly endThreshold: number,
    private readonly logger: Logger,
  ) {}

  private watch() {
    if (!this.playing) {
      return;
    }
    this.videoFrameCallbackId = this.videoElement.requestVideoFrameCallback(
      () => {
        const remaining =
          this.videoElement.duration - this.videoElement.currentTime;

        this.eventBus.emit({
          type: "event/video-progress",
          duration: this.videoElement.duration,
          progress: this.videoElement.currentTime,
          isAwaitingEnd: !!this.handleVideoEnd,
        });

        if (this.handleVideoEnd && remaining <= this.endThreshold) {
          this.handleVideoEnd();
        }

        this.watch();
      },
    );
  }

  play(callback?: (video: VideoManifest) => void) {
    this.logger.info("Trying to play");
    this.videoElement
      .play()
      .then(() => {
        this.playing = true;
        this.watch();
        this.logger.info("Playing...", this.currentVideoManifest);
        callback?.(this.currentVideoManifest!);
      })
      .catch(this.logger.error);
  }

  pause() {
    this.videoElement.pause();
    if (this.videoFrameCallbackId) {
      this.videoElement.cancelVideoFrameCallback(this.videoFrameCallbackId);
      this.videoFrameCallbackId = undefined;
    }
    this.logger.info("Paused", this.currentVideoManifest);
    this.playing = false;
  }

  hide() {
    this.videoElement.style.display = "none";
    this.logger.info("Hidden", this.currentVideoManifest);
  }

  pauseHideAndReset() {
    this.pause();
    this.handleVideoEnd = undefined;
    this.videoFrameCallbackId = undefined;
    this.hide();
  }

  show() {
    this.videoElement.style.display = "block";
    this.logger.info("Shown", this.currentVideoManifest);
  }

  onEnded(callback: () => void) {
    this.handleVideoEnd = callback;
    this.logger.info("End callback set, watching", this.currentVideoManifest);
  }

  updateVideo(video: VideoManifest) {
    if (`/api/videos/${this.videoElement.src}` === `/api/videos/${video.src}`) {
      return;
    }
    this.currentVideoManifest = video;
    this.sourceElement.src = `/api/videos/${video.src}`;
    this.sourceElement.type = video.type;
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
