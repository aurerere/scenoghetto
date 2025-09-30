import { useCallback, useEffect, useState } from "react";
import { PlayerManager } from "@/lib/playerManager.ts";
import type { VideoManifest } from "@scenoghetto/types";
import { Button } from "@/components/ui/button.tsx";
import {
  FlipHorizontal,
  InfinityIcon,
  Loader2Icon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Progress } from "@/components/ui/progress.tsx";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  } else {
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
}

interface ShowViewProps {
  showConfigView: () => void;
}

export const ShowView = ({ showConfigView }: ShowViewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [video, setVideo] = useState<VideoManifest>();

  useEffect(() => {
    const unsubscribe = PlayerManager.eventBus?.listen();

    PlayerManager.eventBus
      ?.on("event/paused", () => {
        setIsPlaying(false);
      })
      .on("event/video-changed", (event) => {
        setDuration(undefined);
        if (event.manifest.kind === "transition") {
          setProgress(0);
        }
        setProgress(undefined);
        setVideo(event.manifest);
      })
      .on("event/video-progress", (event) => {
        console.log(event.progress);
        setProgress(event.progress);
        setDuration(event.duration);
      })
      .on("event/playing", (event) => {
        setIsPlaying(true);
        setVideo(event.manifest);
      })
      .on("event/player-closed", () => {
        showConfigView();
      });

    return unsubscribe;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!isPlaying) {
      PlayerManager.eventBus?.emit({
        type: "intent/play",
      });
    }
  }, []);

  const handleNext = useCallback(() => {
    PlayerManager.eventBus?.emit({
      type: "intent/next",
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-dvh flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-center">
            {video?.name ?? "N/A"}
          </h1>
          <div className="flex text-muted-foreground justify-center gap-1">
            {video ? (
              video.kind === "loop" ? (
                <>
                  <InfinityIcon /> Loop
                </>
              ) : (
                <>
                  <FlipHorizontal /> Transition
                </>
              )
            ) : (
              <>N/A</>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 items-center">
        <div className="flex gap-3">
          <Button size="icon" variant="outline">
            <SkipBackIcon />
          </Button>
          <Button size="icon" onClick={handlePlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleNext}
            disabled={progress !== undefined}
          >
            {progress === undefined ? (
              <SkipForwardIcon />
            ) : (
              <Loader2Icon className="animate-spin" />
            )}
          </Button>
        </div>
        <div
          className={cn(
            progress === undefined && "opacity-0",
            "flex-col",
            "transition-opacity",
            "animation-duration-initial",
          )}
        >
          <Progress
            className="w-80"
            value={((progress ?? 0) * 100) / (duration ?? 0)}
          />
          <div className="flex justify-between">
            <div className="text-muted-foreground">
              {video?.kind === "loop"
                ? "Awaiting loop end..."
                : "Awaiting transition..."}
            </div>
            <div className="text-muted-foreground">
              {formatTime(progress ?? 0)} / {formatTime(duration ?? 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
