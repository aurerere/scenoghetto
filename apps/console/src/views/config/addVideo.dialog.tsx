import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  FlipHorizontalIcon,
  InfinityIcon,
  Loader2Icon,
  PlusIcon,
} from "lucide-react";
import { type ChangeEvent, useCallback, useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { RoadMap } from "@/lib/roadMap.ts";
import type { AddedVideoOkResponse } from "@scenoghetto/types";

const accept = {
  "video/*": [],
} as const;

export const AddVideoDialog = () => {
  const [open, setOpen] = useState(false);

  const [file, setFile] = useState<File | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>("");
  const [kind, setKind] = useState<"loop" | "transition">("loop");

  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    setFiles(files);

    if (!f) {
      return;
    }

    setFile(f);
    setName(f.name.replace(/\.[^/.]+$/, ""));
    setKind("loop");
  }, []);

  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback(
    (newValue: boolean) => {
      if (!newValue) {
        if (isLoading) {
          return;
        }

        setFile(undefined);
        setFiles([]);
        setName("");
        setKind("loop");
      }
      setOpen(newValue);
    },
    [isLoading],
  );

  const onSubmit = useCallback(async () => {
    if (!file || !name) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/video", {
      method: "POST",
      body: formData,
    });

    const isOk = response.status === 200;

    if (isOk) {
      const { id, thumbnailSrc, src } =
        (await response.json()) as AddedVideoOkResponse;
      RoadMap.push({
        name,
        kind,
        src,
        thumbnailSrc,
        id,
        type: file.type,
      });
      setIsLoading(false);
      handleOpenChange(false);
    }
  }, [file, handleOpenChange, kind, name]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={isLoading}
          variant="outline"
          className="w-44 h-auto aspect-square flex-col outline-none"
          onClick={handleOpen}
        >
          {isLoading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <>
              <PlusIcon />
              <div className="text-muted-foreground font-thin">Add a video</div>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a video</DialogTitle>
          <DialogDescription>Add a video to the roadmap.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {file && (
            <>
              <div className="flex gap-2 flex-col">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={name}
                  onChange={onNameChange}
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-2 flex-col">
                <Label>Kind</Label>
                <Select
                  value={kind}
                  onValueChange={setKind as (value: string) => void}
                  disabled={isLoading}
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
            </>
          )}
          <div className="flex flex-col gap-2">
            <Label>File</Label>
            <Dropzone
              accept={accept}
              src={files}
              onDrop={onDrop}
              disabled={isLoading}
            >
              <DropzoneContent />
              <DropzoneEmptyState />
            </Dropzone>
          </div>
          {file && (
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <PlusIcon />
              )}{" "}
              Add a video
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
