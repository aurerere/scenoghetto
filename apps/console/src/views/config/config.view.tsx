import { Button } from "@/components/ui/button.tsx";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { PlayerManager } from "@/lib/playerManager.ts";
import { AddVideoDialog } from "@/views/config/addVideo.dialog.tsx";
import { RoadMap } from "@/lib/roadMap.ts";
import { VideoCard } from "@/views/config/videoCard.tsx";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { VideoManifest } from "@scenoghetto/types";

const THRESHOLD = 0.07;

interface ConfigViewProps {
  showShowView: () => void;
}

export const ConfigView = ({ showShowView }: ConfigViewProps) => {
  const [isRunShowLoading, setIsRunShowLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(RoadMap.get());
  RoadMap.listen(setRoadmap);

  const [activeVideo, setActiveVideo] = useState<VideoManifest>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleOpenPlayer = useCallback(async () => {
    setIsRunShowLoading(true);
    await PlayerManager.open(roadmap, THRESHOLD);
    showShowView();
  }, [roadmap, showShowView]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;

      if (active.id) {
        const video = roadmap.find((item) => item.id === active.id);
        if (video) {
          setActiveVideo(video);
        }
      }
    },
    [roadmap],
  );

  const handleDrop = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setActiveVideo(undefined);
      setRoadmap((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newArray = arrayMove(items, oldIndex, newIndex);

        setTimeout(() => {
          RoadMap.set(newArray);
        });

        return newArray;
      });
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-dvh max-w-svw">
      <div className="flex flex-col items-center gap-6 w-svw">
        <div className="flex gap-3 overflow-x-auto w-fit max-w-full px-4 pb-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDrop}
            onDragStart={handleDragStart}
          >
            <SortableContext
              items={roadmap}
              strategy={horizontalListSortingStrategy}
            >
              {roadmap.map((video) => (
                <VideoCard video={video} key={video.id} />
              ))}
            </SortableContext>

            <DragOverlay>
              {activeVideo && <VideoCard video={activeVideo} />}
            </DragOverlay>

            <AddVideoDialog />
          </DndContext>
        </div>

        <Button
          disabled={isRunShowLoading || roadmap.length < 1}
          onClick={handleOpenPlayer}
        >
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
