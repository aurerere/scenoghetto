import type { VideoManifest } from "@scenoghetto/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { type ChangeEvent, useCallback, useState } from "react";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { FlipHorizontalIcon, InfinityIcon } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { RoadMap } from "@/lib/roadMap.ts";

interface EditVideoDialogProps {
  video: VideoManifest;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const EditVideoDialog = ({
  setOpen,
  open,
  video,
}: EditVideoDialogProps) => {
  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <EditVideoDialogContent video={video} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

interface EditVideoDialogContentProps {
  video: VideoManifest;
  onClose: () => void;
}

const EditVideoDialogContent = ({
  video,
  onClose,
}: EditVideoDialogContentProps) => {
  const [name, setName] = useState(video.name);
  const [kind, setKind] = useState(video.kind);

  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const onSubmit = useCallback(() => {
    if (name === video.name && kind === video.kind) {
      onClose();
      return;
    }

    RoadMap.update({
      ...video,
      name,
      kind,
    });

    onClose();
  }, [kind, name, onClose, video]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit</DialogTitle>
        <DialogDescription>Edit "{video.name}"</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 flex-col">
          <Label>Name</Label>
          <Input name="name" value={name} onChange={onNameChange} />
        </div>
        <div className="flex gap-2 flex-col">
          <Label>Kind</Label>
          <Select
            value={kind}
            onValueChange={setKind as (value: string) => void}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
              <SelectContent>
                <SelectItem value="loop">
                  <InfinityIcon /> Loop
                </SelectItem>
                <SelectItem value="transition">
                  <FlipHorizontalIcon />
                  Transition
                </SelectItem>
              </SelectContent>
            </SelectTrigger>
          </Select>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save</Button>
        </div>
      </div>
    </>
  );
};
