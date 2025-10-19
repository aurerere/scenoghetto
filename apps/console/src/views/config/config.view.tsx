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
import { Slider } from "@/components/ui/slider.tsx";

const DEFAULT_TRANSITION_THRESHOLD = 0.07;
const MIN_TRANSITION_THRESHOLD = 0.01;
const MAX_TRANSITION_THRESHOLD = 0.2;

interface ConfigViewProps {
  showShowView: () => void;
}

function getTransitionThresholdFromLocalStorage() {
  const threshold = localStorage.getItem("transitionThreshold");
  if (threshold) {
    const parsedThreshold = parseFloat(threshold);

    if (isNaN(parsedThreshold)) {
      return DEFAULT_TRANSITION_THRESHOLD;
    }

    if (parsedThreshold < MIN_TRANSITION_THRESHOLD) {
      return MIN_TRANSITION_THRESHOLD;
    }

    if (parsedThreshold > MAX_TRANSITION_THRESHOLD) {
      return MAX_TRANSITION_THRESHOLD;
    }

    return parsedThreshold;
  }
  return DEFAULT_TRANSITION_THRESHOLD;
}

export const ConfigView = ({ showShowView }: ConfigViewProps) => {
  const [isRunShowLoading, setIsRunShowLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(RoadMap.get());
  const [transitionThreshold, setTransitionThreshold] = useState(
    getTransitionThresholdFromLocalStorage(),
  );
  RoadMap.listen(setRoadmap);

  const [draggingVideo, setDraggingVideo] = useState<VideoManifest>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleOpenPlayer = useCallback(async () => {
    setIsRunShowLoading(true);
    await PlayerManager.open(roadmap, transitionThreshold);
    showShowView();
  }, [roadmap, showShowView, transitionThreshold]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;

      if (active.id) {
        const video = roadmap.find((item) => item.id === active.id);
        if (video) {
          setDraggingVideo(video);
        }
      }
    },
    [roadmap],
  );

  const handleDrop = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setDraggingVideo(undefined);
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

  const handleTransitionThresholdChange = useCallback((value: number[]) => {
    setTransitionThreshold(value[0] ?? DEFAULT_TRANSITION_THRESHOLD);
    localStorage.setItem(
      "transitionThreshold",
      value[0]?.toString() ?? DEFAULT_TRANSITION_THRESHOLD.toString(),
    );
  }, []);

  return (
    <div className="flex justify-center items-center h-dvh max-w-svw">
      <div className="flex flex-col items-center gap-6 w-svw">
        <div className="flex gap-3 overflow-x-auto w-fit max-w-full px-4 pb-1 pt-1">
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
              {draggingVideo && (
                <VideoCard video={draggingVideo} inDragOverlay />
              )}
            </DragOverlay>

            <AddVideoDialog />
          </DndContext>
        </div>

        <div className={"flex flex-col gap-1"}>
          Transition threshold
          <Slider
            className="w-50"
            step={0.01}
            min={MIN_TRANSITION_THRESHOLD}
            max={MAX_TRANSITION_THRESHOLD}
            defaultValue={[transitionThreshold]}
            onValueChange={handleTransitionThresholdChange}
          />
          {transitionThreshold.toFixed(2)}s
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
