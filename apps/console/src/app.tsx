import { useCallback, useEffect, useState } from "react";
import type { VideoManifest } from "@scenoghetto/types";
import { EventBus } from "@scenoghetto/utils";

const a: VideoManifest[] = [
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
];

const THRESHOLD = 0.07;

function App() {
  const [eventBus, setEventBus] = useState<EventBus>();

  useEffect(() => {
    if (eventBus) {
      function onKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowRight") {
          eventBus?.emit({
            type: "next",
          });
        }
      }

      function onBeforeUnload() {
        eventBus?.windowProxy.close();
      }

      window.addEventListener("beforeunload", onBeforeUnload);

      window.addEventListener("keydown", onKeyDown);

      return () => {
        eventBus.clearListeners();
        eventBus.unlisten();
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("beforeunload", onBeforeUnload);
      };
    }
  }, [eventBus]);

  const openPlayer = useCallback(() => {
    const player = window.open(import.meta.env.VITE_PLAYER_URL);

    if (!player) {
      return;
    }

    const _eventBus = new EventBus(
      player,
      /*import.meta.env.VITE_CONSOLE_URL*/ "*",
    );

    setEventBus(_eventBus);

    setTimeout(() => {
      _eventBus.emit({
        type: "handshake",
        threshold: THRESHOLD,
        roadmap: a,
      });
      _eventBus.emit({
        type: "play",
      });
    }, 1000);
  }, []);

  return (
    <>
      <button onClick={openPlayer}>Open player</button>
    </>
  );
}

export default App;
