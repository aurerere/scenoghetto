import type { VideoManifest } from "./misc";

export interface NextIntent {
  type: "intent/next";
}

export interface PlayIntent {
  type: "intent/play";
}

export interface HandshakeIntent {
  type: "intent/handshake";
  threshold: number;
  roadmap: VideoManifest[];
}

export interface PlayingEvent {
  type: "event/playing";
  manifest: VideoManifest;
}

export interface PausedEvent {
  type: "event/paused";
}

export interface VideoProgressEvent {
  type: "event/video-progress";
  progress: number;
  duration: number;
}

export interface VideoChangedEvent {
  type: "event/video-changed";
  manifest: VideoManifest;
}

export interface PlayerClosedEvent {
  type: "event/player-closed";
}

export interface EventMap {
  "intent/next": NextIntent;
  "intent/play": PlayIntent;
  "intent/handshake": HandshakeIntent;

  "event/paused": PausedEvent;
  "event/playing": PlayingEvent;
  "event/video-progress": VideoProgressEvent;
  "event/video-changed": VideoChangedEvent;
  "event/player-closed": PlayerClosedEvent;
}

export type ScenoEvent = EventMap[keyof EventMap];

export type EventHandler<T extends keyof EventMap> = (
  event: EventMap[T],
) => void;
