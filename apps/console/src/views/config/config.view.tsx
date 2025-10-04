import { Button } from "@/components/ui/button.tsx";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { useCallback, useState } from "react";
import type { VideoManifest } from "@scenoghetto/types";
import { PlayerManager } from "@/lib/playerManager.ts";
import { VideoDropZone } from "@/views/config/videoDropZone.tsx";

const ROADMAP: VideoManifest[] = [
  { name: "AVA", kind: "loop", src: "010_ava.mp4", type: "video/mp4" },
  {
    name: "AVA → CAT",
    kind: "transition",
    src: "015_ava_cat_transition.mp4",
    type: "video/mp4",
  },
  { name: "CAT", kind: "loop", src: "020_cat_loop.mp4", type: "video/mp4" },
  {
    name: "CAT → ALMA",
    kind: "transition",
    src: "025_cat_alma_transition.mp4",
    type: "video/mp4",
  },
  { name: "ALMA", kind: "loop", src: "030_alma_loop.mp4", type: "video/mp4" },
  {
    name: "ALMA → RAYONNANTE",
    kind: "transition",
    src: "035_alma_rayonnante_transition.mp4",
    type: "video/mp4",
  },
  {
    name: "RAYONNANTE",
    kind: "loop",
    src: "040_rayonnante_loop.mp4",
    type: "video/mp4",
  },
  {
    name: "RAYONNANTE → ONCLE",
    kind: "transition",
    src: "045_rayonnante_oncle_transition.mp4",
    type: "video/mp4",
  },
  { name: "ONCLE", kind: "loop", src: "050_oncle_loop.mp4", type: "video/mp4" },
  {
    name: "ONCLE → HANNA",
    kind: "transition",
    src: "055_oncle_hanna_transition.mp4",
    type: "video/mp4",
  },
  { name: "HANNA", kind: "loop", src: "060_hanna_loop.mp4", type: "video/mp4" },
  {
    name: "HANNA → YUDAI",
    kind: "transition",
    src: "065_hanna_yudai_transition.mp4",
    type: "video/mp4",
  },
  { name: "YUDAI", kind: "loop", src: "070_yudai_loop.mp4", type: "video/mp4" },
  {
    name: "YUDAI → COURONNE",
    kind: "transition",
    src: "075_yudai_couronne_transition.mp4",
    type: "video/mp4",
  },
  {
    name: "COURONNE",
    kind: "loop",
    src: "080_couronne_loop.mp4",
    type: "video/mp4",
  },
  {
    name: "COURONNE → PELOTE",
    kind: "transition",
    src: "085_couronne_pelote_transition.mp4",
    type: "video/mp4",
  },
  {
    name: "PELOTE",
    kind: "loop",
    src: "090_pelote_loop.mp4",
    type: "video/mp4",
  },
  {
    name: "PELOTE → SEA",
    kind: "transition",
    src: "095_pelote_sea_transition.mp4",
    type: "video/mp4",
  },
  { name: "SEA", kind: "loop", src: "100_sea_loop.mp4", type: "video/mp4" },
  {
    name: "SEA → VOYAGEUR",
    kind: "transition",
    src: "105_sea_voyageur_transition.mp4",
    type: "video/mp4",
  },
  {
    name: "VOYAGEUR",
    kind: "loop",
    src: "110_voyageur_loop.mp4",
    type: "video/mp4",
  },
  {
    name: "VOYAGEUR → JEAN",
    kind: "transition",
    src: "115_voyageur_jean_transition.mp4",
    type: "video/mp4",
  },
  { name: "JEAN", kind: "loop", src: "120_jean_loop.mp4", type: "video/mp4" },
];

const THRESHOLD = 0.07;

interface ConfigViewProps {
  showShowView: () => void;
}

export const ConfigView = ({ showShowView }: ConfigViewProps) => {
  const [isRunShowLoading, setIsRunShowLoading] = useState(false);

  const handleOpenPlayer = useCallback(async () => {
    setIsRunShowLoading(true);
    await PlayerManager.open(ROADMAP, THRESHOLD);
    showShowView();
  }, []);

  return (
    <div className="flex justify-center items-center h-dvh max-w-svw">
      <div className="flex flex-col items-center gap-6 w-svw">
        <div className="flex gap-3 overflow-auto w-svw justify-center">
          <VideoDropZone />
        </div>

        <Button disabled={isRunShowLoading} onClick={handleOpenPlayer}>
          {isRunShowLoading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <PlayIcon />
          )}
          Start show
        </Button>
      </div>
    </div>
  );
};
