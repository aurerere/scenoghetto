import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";

const accept = {
  "video/*": [],
} as const;

export const VideoDropZone = () => {
  const [files, setFiles] = useState<File[] | undefined>();

  return (
    <Dropzone
      className="w-44 aspect-square"
      accept={accept}
      src={files}
      onDrop={setFiles}
      noClick={files !== undefined}
    >
      <DropzoneContent>
        <Loader2Icon className="animate-spin" />
      </DropzoneContent>
      <DropzoneEmptyState />
    </Dropzone>
  );
};
