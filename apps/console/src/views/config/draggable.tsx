import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";

interface DraggableProps {
  id: string;
  children: ReactNode;
}

export const Draggable = ({ id, children }: DraggableProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {children}
    </div>
  );
};
