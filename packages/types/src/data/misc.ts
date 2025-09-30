export type VideoKind = "transition" | "loop";

export interface VideoManifest {
  name: string;
  kind: VideoKind;
  type: `video/${string}`;
  src: string;
}
