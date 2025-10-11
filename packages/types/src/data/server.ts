export interface AddedVideoOkResponse {
  id: string;
  src: string;
  thumbnailSrc: string;
  videoExtension: string;
}

export type VideoProcessingProgress = number | "done" | "unknown";

export interface VideoProcessingProgressEvent {
  progress: VideoProcessingProgress;
}
