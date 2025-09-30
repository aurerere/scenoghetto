import type { VideoManifest } from "@scenoghetto/types";
import { EventBus } from "@scenoghetto/utils";

export class PlayerManager {
  static player: WindowProxy | null = null;
  static eventBus?: EventBus;
  private static isOpen = false;

  static async open(roadmap: VideoManifest[], threshold: number) {
    if (this.isOpen) {
      return;
    }

    this.player = window.open(
      import.meta.env.VITE_PLAYER_URL,
      "_blank",
      "left=0,top=0,width=300,height=300",
    );

    if (this.player) {
      this.eventBus = new EventBus(this.player, "*");
    }

    window.addEventListener("beforeunload", this.close.bind(this));

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.eventBus?.emit({
          type: "intent/handshake",
          roadmap,
          threshold,
        });
        resolve();
      }, 1000);
    });
  }

  static close() {
    this.player?.close();
    this.isOpen = false;
  }
}
