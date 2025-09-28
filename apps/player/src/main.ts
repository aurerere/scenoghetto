import "./style.css";
import { Orchestrator } from "./lib/orchestrator.ts";
import { VideoController } from "./lib/videoController.ts";
import { Logger } from "@scenoghetto/utils";

const loopVideoElement = document.getElementById(
  "loop-video",
)! as HTMLVideoElement;
const loopSourceElement = document.getElementById(
  "loop-source",
)! as HTMLSourceElement;

const transitionVideoElement = document.getElementById(
  "transition-video",
)! as HTMLVideoElement;
const transitionSourceElement = document.getElementById(
  "transition-source",
)! as HTMLSourceElement;

const THRESHOLD = 0.07;

const orchestrator = new Orchestrator(
  new VideoController(
    loopVideoElement,
    loopSourceElement,
    THRESHOLD,
    new Logger("Alpha"),
  ),
  new VideoController(
    transitionVideoElement,
    transitionSourceElement,
    THRESHOLD,
    new Logger("Beta"),
  ),
  [
    { kind: "loop", src: "010_ava.mp4" },
    { kind: "transition", src: "015_ava_cat_transition.mp4" },
    { kind: "loop", src: "020_cat_loop.mp4" },
    { kind: "transition", src: "025_cat_alma_transition.mp4" },
    { kind: "loop", src: "030_alma_loop.mp4" },
    { kind: "transition", src: "035_alma_rayonnante_transition.mp4" },
    { kind: "loop", src: "040_rayonnante_loop.mp4" },
    { kind: "transition", src: "045_rayonnante_oncle_transition.mp4" },
    { kind: "loop", src: "050_oncle_loop.mp4" },
    { kind: "transition", src: "055_oncle_hanna_transition.mp4" },
    { kind: "loop", src: "060_hanna_loop.mp4" },
    { kind: "transition", src: "065_hanna_yudai_transition.mp4" },
    { kind: "loop", src: "070_yudai_loop.mp4" },
    { kind: "transition", src: "075_yudai_couronne_transition.mp4" },
    { kind: "loop", src: "080_couronne_loop.mp4" },
    { kind: "transition", src: "085_couronne_pelote_transition.mp4" },
    { kind: "loop", src: "090_pelote_loop.mp4" },
    { kind: "transition", src: "095_pelote_sea_transition.mp4" },
    { kind: "loop", src: "100_sea_loop.mp4" },
    { kind: "transition", src: "105_sea_voyageur_transition.mp4" },
    { kind: "loop", src: "110_voyageur_loop.mp4" },
    { kind: "transition", src: "115_voyageur_jean_transition.mp4" },
    { kind: "loop", src: "120_jean_loop.mp4" },
  ],
);

orchestrator.play();

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    orchestrator.next();
  }
});
