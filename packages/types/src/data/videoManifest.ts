export type VideoKind = "transition" | "loop";

export interface VideoManifest {
  id: string;
  name: string;
  kind: VideoKind;
  type: string;
  src: string;
  thumbnailSrc: string;
  videoExtension: string;
}
