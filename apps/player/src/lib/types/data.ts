export type VideoKind = "transition" | "loop";

export interface VideoManifest {
  kind: VideoKind;
  src: string;
}
