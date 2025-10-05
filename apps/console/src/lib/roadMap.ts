import { useEffect } from "react";
import type { VideoManifest } from "@scenoghetto/types";

export class RoadMap {
  static get() {
    return JSON.parse(
      localStorage.getItem("roadmap") ?? "[]",
    ) as VideoManifest[];
  }

  static listen(setRoadmap: (roadmap: VideoManifest[]) => void) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      function handleStorageChange(event: StorageEvent) {
        if (event.key === "roadmap") {
          const newRoadmap = RoadMap.get();
          setRoadmap(newRoadmap);
        }
      }

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }, [setRoadmap]);
  }

  static set(roadmap: VideoManifest[]) {
    localStorage.setItem("roadmap", JSON.stringify(roadmap));
    const event = new StorageEvent("storage", {
      key: "roadmap",
    });
    window.dispatchEvent(event);
  }

  static push(video: VideoManifest) {
    const roadmap = RoadMap.get();
    RoadMap.set([...roadmap, video]);
  }

  static remove(video: VideoManifest) {
    const roadmap = RoadMap.get();
    const newRoadmap = roadmap.filter((v) => v.id !== video.id);
    RoadMap.set(newRoadmap);
  }

  static update(video: VideoManifest) {
    const roadmap = RoadMap.get();
    const newRoadmap = roadmap.map((v) => {
      if (v.id === video.id) {
        return video;
      }
      return v;
    });
    RoadMap.set(newRoadmap);
  }
}
