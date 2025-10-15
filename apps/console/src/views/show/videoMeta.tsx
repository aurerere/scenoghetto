import type { VideoManifest } from "@scenoghetto/types";
import { FlipHorizontal, InfinityIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";

interface SomeVideoProps {
  manifest?: VideoManifest;
  current?: boolean;
}

export const VideoMeta = ({ manifest, current }: SomeVideoProps) => {
  return (
    <div
      className={cn(
        "flex flex-col",
        "items-center",
        "gap-2",
        "transition-all",
        "w-60",
        !current && "transform scale-90 opacity-50",
        !manifest && "opacity-0",
        "overflow-hidden",
      )}
    >
      <img
        src={`/api/thumbnails/${manifest?.thumbnailSrc ?? ""}`}
        alt={manifest?.name}
        className="rounded-lg w-36"
      />
      <h1 className="text-xl font-extrabold text-center overflow-hidden text-ellipsis whitespace-nowrap w-full">
        {manifest?.name}
      </h1>
      <div className="flex text-muted-foreground justify-center gap-1">
        {manifest?.kind === "loop" ? (
          <>
            <InfinityIcon /> Loop
          </>
        ) : (
          <>
            <FlipHorizontal /> Transition
          </>
        )}
      </div>
    </div>
  );
};
