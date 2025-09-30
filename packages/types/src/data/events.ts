import type { VideoManifest } from "./misc";

export interface NextEvent {
  type: "next";
}

export interface PlayEvent {
  type: "play";
}

export interface HandshakeEvent {
  type: "handshake";
  threshold: number;
  roadmap: VideoManifest[];
}

export interface ProgressEvent {
  type: "progress";
  progress: number;
  duration: number;
}

export interface EventMap {
  next: NextEvent;
  play: PlayEvent;
  handshake: HandshakeEvent;
  progress: ProgressEvent;
}

export type ScenoEvent = EventMap[keyof EventMap];

export type EventHandler<T extends keyof EventMap> = (
  event: EventMap[T],
) => void;
