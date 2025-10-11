import type { VideoManifest } from "@scenoghetto/types";
import { Card, CardDescription, CardTitle } from "@/components/ui/card.tsx";
import {
  EllipsisIcon,
  FlipHorizontalIcon,
  GripIcon,
  InfinityIcon,
  PenIcon,
  Trash2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { EditVideoDialog } from "@/views/config/editVideo.dialog.tsx";
import { useCallback, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button.tsx";
import { RoadMap } from "@/lib/roadMap.ts";

interface VideoCardProps {
  video: VideoManifest;
  inDragOverlay?: boolean;
}

export const VideoCard = ({ video, inDragOverlay }: VideoCardProps) => {
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false);

  const openEditVideoDialog = useCallback(() => {
    setIsEditVideoDialogOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    RoadMap.remove(video);
    fetch(`/api/video/${video.videoExtension}/${video.id}`, {
      method: "DELETE",
    }).catch(console.error);
  }, [video]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card
          backgroundImage={`/api/thumbnails/${video.thumbnailSrc}`}
          className="w-44 h-44 aspect-square p-3"
        >
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between">
              <Button
                variant="ghost"
                size="icon"
                className={inDragOverlay ? "cursor-grabbing" : "cursor-grab"}
                {...attributes}
                {...listeners}
              >
                <GripIcon />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisIcon />
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={openEditVideoDialog}>
                      <PenIcon /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      <Trash2Icon /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuTrigger>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-ellipsis overflow-hidden px-0">
                {video.name}
              </CardTitle>
              <CardDescription>
                <div className="flex gap-1 items-center">
                  {video.kind === "loop" ? (
                    <>
                      <InfinityIcon size={18} /> Loop
                    </>
                  ) : (
                    <>
                      <FlipHorizontalIcon size={18} /> Transition
                    </>
                  )}
                </div>
              </CardDescription>
            </div>
          </div>
        </Card>
      </div>
      <EditVideoDialog
        video={video}
        open={isEditVideoDialogOpen}
        setOpen={setIsEditVideoDialogOpen}
      />
    </>
  );
};
