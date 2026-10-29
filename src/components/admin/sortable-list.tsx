"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

/**
 * Drag-and-drop reorder (mouse, touch with a short press, and keyboard:
 * focus the handle, Space to lift, arrows to move, Space to drop).
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  render,
  layout = "list",
  className,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  render: (item: T, handle: React.ReactNode, dragging: boolean) => React.ReactNode;
  layout?: "list" | "grid";
  className?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle, dragging) => render(item, handle, dragging)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: (handle: React.ReactNode, dragging: boolean) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className="grid h-11 w-9 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg active:cursor-grabbing"
    >
      <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true">
        {[3, 10, 17].map((y) => (
          <g key={y}>
            <circle cx="4" cy={y} r="1.6" />
            <circle cx="10" cy={y} r="1.6" />
          </g>
        ))}
      </svg>
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10 opacity-90 shadow-2xl ring-2 ring-accent rounded-xl")}
    >
      {children(handle, isDragging)}
    </li>
  );
}
