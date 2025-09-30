import type { EventBus } from "@scenoghetto/utils";
import { Logger } from "@scenoghetto/utils";
import type { VideoController } from "./videoController.ts";
import type { VideoManifest } from "@scenoghetto/types";

export class Orchestrator {
  private currentVideoIndex = 0;
  private playing = false;
  private logger = new Logger("Orchestrator");

  constructor(
    private currentVideoController: VideoController,
    private nextVideoController: VideoController,
    private readonly roadMap: VideoManifest[],
    private readonly eventBus: EventBus,
  ) {
    const currentVideo = roadMap[0];

    if (!currentVideo) {
      throw new Error("No video found");
    }

    this.currentVideoController.updateVideo(currentVideo);
  }

  stop() {
    this.currentVideoIndex = 0;
    this.nextVideoController.pauseHideAndReset();
    this.currentVideoController.pauseHideAndReset();
    this.logger.info("Stopped");
    return;
  }

  preloadNext() {
    const nextVideo = this.roadMap[this.currentVideoIndex + 1];

    if (!nextVideo) {
      this.logger.info("No next video, nothing to preload");
      return;
    }

    if (this.nextVideoController.isPlaying()) {
      return;
    }

    this.nextVideoController.updateVideo(nextVideo);
    this.logger.info(
      "Next video preloaded",
      this.nextVideoController.videoManifest,
    );
  }

  play() {
    if (this.currentVideoController.videoKind === "transition") {
      this.currentVideoController.onEnded(() => {
        this.moveToNextVideo();
      });
    }

    this.currentVideoController.show();
    this.logger.info(
      "Asking to play",
      this.currentVideoController.videoManifest,
    );
    this.currentVideoController.play((manifest) => {
      this.eventBus.emit({
        type: "event/playing",
        manifest,
      });
    });

    this.playing = true;
    this.preloadNext();
  }

  private moveToNextVideo() {
    const nextVideo = this.roadMap[++this.currentVideoIndex];

    if (!nextVideo) {
      this.logger.info("No more videos, stopping");
      this.stop();
      return;
    }

    const previousController = this.currentVideoController;
    const newController = this.nextVideoController;

    this.currentVideoController = newController;
    this.nextVideoController = previousController;

    this.logger.info("Moving to next video", nextVideo);

    newController.updateVideo(nextVideo);

    newController.play(() => {
      newController.show();
      previousController.pauseHideAndReset();
      this.preloadNext();
      this.eventBus.emit({
        type: "event/video-changed",
        manifest: nextVideo,
      });
    });

    if (newController.videoKind === "transition") {
      newController.onEnded(() => {
        this.moveToNextVideo();
      });
    }
  }

  pause() {
    this.logger.info("Asking to pause");
    this.currentVideoController.pause();
    this.nextVideoController.pause();
  }

  next() {
    this.logger.info("Asking to next");
    if (this.currentVideoController.videoKind === "transition") {
      this.logger.warn("Cannot next a transition video");
      return;
    }

    this.logger.info("setting end callback for loop controller");
    this.currentVideoController.onEnded(() => {
      this.moveToNextVideo();
    });
  }

  forceNext() {
    this.logger.info("Asking to force next");
    this.moveToNextVideo();
  }

  isPlaying() {
    return this.playing;
  }
}
