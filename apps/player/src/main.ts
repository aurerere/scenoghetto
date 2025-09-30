import "./style.css";
import { Orchestrator } from "./lib/orchestrator.ts";
import { VideoController } from "./lib/videoController.ts";
import { EventBus, Logger } from "@scenoghetto/utils";

const container = document.querySelector(".container")! as HTMLDivElement;

if (window.opener) {
  container.innerText = "Awaiting handshake event...";
  const eventBus = new EventBus(window.opener, "*");

  eventBus.listen();

  eventBus.on("intent/handshake", (handshake) => {
    eventBus.clearListeners();

    container.innerText = "";

    const layerAlphaVideoElement = document.createElement("video");
    layerAlphaVideoElement.loop = true;
    layerAlphaVideoElement.muted = true;
    layerAlphaVideoElement.preload = "auto";
    const layerAlphaSourceElement = document.createElement("source");
    layerAlphaVideoElement.appendChild(layerAlphaSourceElement);

    const layerBetaVideoElement = document.createElement("video");
    layerBetaVideoElement.loop = true;
    layerBetaVideoElement.muted = true;
    layerBetaVideoElement.preload = "auto";
    const layerBetaSourceElement = document.createElement("source");
    layerBetaVideoElement.appendChild(layerBetaSourceElement);

    container.appendChild(layerAlphaVideoElement);
    container.appendChild(layerBetaVideoElement);

    const orchestrator = new Orchestrator(
      new VideoController(
        layerAlphaVideoElement,
        layerAlphaSourceElement,
        eventBus,
        handshake.threshold,
        new Logger("LayerAlpha"),
      ),
      new VideoController(
        layerBetaVideoElement,
        layerBetaSourceElement,
        eventBus,
        handshake.threshold,
        new Logger("LayerBeta"),
      ),
      handshake.roadmap,
      eventBus,
    );

    eventBus
      .on("intent/play", () => {
        orchestrator.play();
      })
      .on("intent/next", () => {
        orchestrator.next();
      })
      .on("intent/pause", () => {
        orchestrator.pause();
      });

    window.addEventListener("beforeunload", () => {
      eventBus.emit({
        type: "event/player-closed",
      });
    });
  });
}
