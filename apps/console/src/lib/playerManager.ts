import type { VideoManifest } from "@scenoghetto/types";
import { EventBus } from "@scenoghetto/utils";

const PLAYER_URL =
  window.location.origin === "http://localhost:1337"
    ? "http://localhost:1338"
    : "http://localhost:1340";

export class PlayerManager {
  static player: WindowProxy | null = null;
  static eventBus?: EventBus;
  private static isOpen = false;

  static async open(roadmap: VideoManifest[], threshold: number) {
    if (this.isOpen) {
      return;
    }

    this.player = window.open(
      PLAYER_URL,
      "_blank",
      "top=0,left=0,width=300,height=300",
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
    this.player = null;
    this.isOpen = false;
  }
}
