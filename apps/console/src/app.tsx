import { useCallback, useState } from "react";
import { ConfigView } from "@/views/config/config.view.tsx";
import { ShowView } from "@/views/show/show.view.tsx";

export const App = () => {
  const [view, setView] = useState<"config" | "show">("config");

  const showShowView = useCallback(() => {
    setView("show");
  }, []);

  const showConfigView = useCallback(() => {
    setView("config");
  }, []);

  if (view === "show") {
    return <ShowView showConfigView={showConfigView} />;
  }

  return <ConfigView showShowView={showShowView} />;
};
