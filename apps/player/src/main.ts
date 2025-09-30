import "./style.css";
import { Orchestrator } from "./lib/orchestrator.ts";
import { VideoController } from "./lib/videoController.ts";
import { EventBus, Logger } from "@scenoghetto/utils";

const layerAlphaVideoElement = document.getElementById(
  "video-alpha",
)! as HTMLVideoElement;
const layerAlphaSourceElement = document.getElementById(
  "source-alpha",
)! as HTMLSourceElement;

const layerBetaVideoElement = document.getElementById(
  "video-beta",
)! as HTMLVideoElement;
const layerBetaSourceElement = document.getElementById(
  "source-beta",
)! as HTMLSourceElement;

if (window.opener) {
  const eventBus = new EventBus(
    window.opener,
    /*import.meta.env.VITE_CONSOLE_URL*/ "*",
  );

  eventBus.listen();

  eventBus.on("handshake", (handshake) => {
    eventBus.clearListeners();

    const orchestrator = new Orchestrator(
      new VideoController(
        layerAlphaVideoElement,
        layerAlphaSourceElement,
        handshake.threshold,
        new Logger("Alpha"),
      ),
      new VideoController(
        layerBetaVideoElement,
        layerBetaSourceElement,
        handshake.threshold,
        new Logger("Beta"),
      ),
      handshake.roadmap,
      eventBus,
    );

    orchestrator.stop();

    eventBus
      .on("play", () => {
        orchestrator.play();
      })
      .on("next", () => {
        orchestrator.next();
      });
  });
}
