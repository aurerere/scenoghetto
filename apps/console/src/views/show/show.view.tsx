import { useCallback, useEffect, useMemo, useState } from "react";
import { PlayerManager } from "@/lib/playerManager.ts";
import type { VideoManifest } from "@scenoghetto/types";
import { Button } from "@/components/ui/button.tsx";
import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Progress } from "@/components/ui/progress.tsx";
import { RoadMap } from "@/lib/roadMap.ts";
import { VideoMeta } from "@/views/show/videoMeta.tsx";

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
  const [isAwaitingEnd, setIsAwaitingEnd] = useState(false);
  const [roadmap, setRoadmap] = useState<VideoManifest[]>(RoadMap.get());

  RoadMap.listen(setRoadmap);

  const currentVideoIndex = useMemo(() => {
    if (!video) {
      return -1;
    }
    return roadmap.findIndex((item) => item.id === video.id);
  }, [roadmap, video]);

  const previousVideo = roadmap[currentVideoIndex - 1];
  const nextVideo =
    roadmap[(currentVideoIndex >= 0 ? currentVideoIndex : 0) + 1];

  useEffect(() => {
    const unsubscribe = PlayerManager.eventBus?.listen();

    PlayerManager.eventBus
      ?.on("event/paused", () => {
        setIsPlaying(false);
      })
      .on("event/video-changed", (event) => {
        setDuration(undefined);
        setProgress(0);
        setIsAwaitingEnd(false);
        setVideo(event.manifest);
      })
      .on("event/video-progress", (event) => {
        setProgress(event.progress);
        setDuration(event.duration);
        setIsAwaitingEnd(event.isAwaitingEnd);
      })
      .on("event/playing", (event) => {
        setIsPlaying(true);
        setVideo(event.manifest);
      })
      .on("event/player-closed", () => {
        showConfigView();
      });

    return unsubscribe;
  }, [showConfigView]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      PlayerManager.eventBus?.emit({
        type: "intent/pause",
      });
    } else {
      PlayerManager.eventBus?.emit({
        type: "intent/play",
      });
    }
  }, [isPlaying]);

  const handlePrevious = useCallback(() => {
    PlayerManager?.eventBus?.emit({
      type: "intent/previous",
    });
  }, []);

  const handleNext = useCallback(() => {
    if (isAwaitingEnd) {
      PlayerManager.eventBus?.emit({
        type: "intent/force-next",
      });
    } else {
      PlayerManager.eventBus?.emit({
        type: "intent/next",
      });
    }
  }, [isAwaitingEnd]);

  return (
    <div className="flex justify-center items-center h-dvh flex-col gap-6 overflow-hidden">
      <div className="flex items-center align-middle gap-3 overflow-hidden">
        <VideoMeta manifest={previousVideo} key={previousVideo?.id} />
        <VideoMeta manifest={video ?? roadmap[0]} current key={video?.id} />
        <VideoMeta manifest={nextVideo} key={nextVideo?.id} />
      </div>
      <div className="flex flex-col gap-3 items-center">
        <div className="flex gap-3">
          <Button
            size="icon"
            variant="destructive"
            disabled={currentVideoIndex === 0 || !video}
            onClick={handlePrevious}
          >
            <SkipBackIcon />
          </Button>
          <Button size="icon" onClick={handlePlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            size="icon"
            variant={isAwaitingEnd ? "destructive" : "outline"}
            onClick={handleNext}
            disabled={currentVideoIndex === roadmap.length - 1 || !video}
          >
            <SkipForwardIcon />
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
              {isAwaitingEnd && (
                <>
                  {video?.kind === "loop"
                    ? "Awaiting loop end..."
                    : "Awaiting transition..."}
                </>
              )}
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
