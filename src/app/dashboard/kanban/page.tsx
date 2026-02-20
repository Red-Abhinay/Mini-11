"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ApiTask, Task, TaskStatus, columns } from "./kanbanTypes";

type TasksByStatus = Record<TaskStatus, Task[]>;

const normalizeStatus = (status: string): TaskStatus => {
  const normalized = status
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  const match = columns.find((column) => column.id === normalized);
  return match ? match.id : "assigned";
};

const mapApiTask = (task: ApiTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: normalizeStatus(task.status),
  projectId: task.project_id,
});

const groupTasks = (tasks: Task[]): TasksByStatus =>
  columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter((task) => task.status === column.id);
    return acc;
  }, {} as TasksByStatus);

const rebuildTaskList = (
  tasks: Task[],
  updatedStatus: TaskStatus,
  orderedIds: string[],
) => {
  const grouped = groupTasks(tasks);
  grouped[updatedStatus] = orderedIds
    .map((id) => grouped[updatedStatus].find((task) => task.id === id))
    .filter(Boolean) as Task[];
  return columns.flatMap((column) => grouped[column.id]);
};

const moveTaskToStatus = (
  tasks: Task[],
  taskId: string,
  nextStatus: TaskStatus,
  overId: string | null,
) => {
  const movingTask = tasks.find((task) => task.id === taskId);
  if (!movingTask) {
    return tasks;
  }

  const updatedTask = { ...movingTask, status: nextStatus };
  const remaining = tasks.filter((task) => task.id !== taskId);
  const grouped = groupTasks(remaining);

  const targetTasks = [...grouped[nextStatus]];
  if (overId && !columns.some((column) => column.id === overId)) {
    const overIndex = targetTasks.findIndex((task) => task.id === overId);
    if (overIndex >= 0) {
      targetTasks.splice(overIndex, 0, updatedTask);
    } else {
      targetTasks.push(updatedTask);
    }
  } else {
    targetTasks.push(updatedTask);
  }

  grouped[nextStatus] = targetTasks;
  return columns.flatMap((column) => grouped[column.id]);
};

const KanbanPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const loadTasks = async () => {
      setLoading(true);
      setError(null);
      const url =
        projectFilter === "all"
          ? "/api/tasks"
          : `/api/tasks?projectId=${projectFilter}`;

      try {
        const response = await fetch(url, { signal: controller.signal });
        const raw = await response.text();
        const payload = raw ? (JSON.parse(raw) as { error?: string; detail?: string }) : null;
        if (!response.ok) {
          const detail = payload?.detail ? ` (${payload.detail})` : "";
          throw new Error(`${payload?.error || "Failed to load tasks"}${detail}`);
        }

        const data = Array.isArray(payload) ? (payload as ApiTask[]) : [];
        if (!ignore) {
          setTasks(data.map(mapApiTask));
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : "Unable to load tasks.";
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [projectFilter]);

  const tasksByStatus = useMemo(() => groupTasks(tasks), [tasks]);
  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) || null,
    [activeTaskId, tasks],
  );
  const projectOptions = useMemo(() => {
    const ids = new Set(
      tasks
        .map((task) => task.projectId)
        .filter((id): id is string => Boolean(id))
    );
    return Array.from(ids).sort();
  }, [tasks]);

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const response = await fetch("/api/update-task-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update task");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) {
      return;
    }

    const activeTaskCurrent = tasks.find((task) => task.id === activeId);
    if (!activeTaskCurrent) {
      return;
    }

    const overColumn = columns.find((column) => column.id === overId);
    const overTask = tasks.find((task) => task.id === overId);
    const nextStatus =
      overColumn?.id || overTask?.status || activeTaskCurrent.status;

    if (nextStatus === activeTaskCurrent.status) {
      const columnTasks = tasksByStatus[nextStatus];
      const oldIndex = columnTasks.findIndex((task) => task.id === activeId);
      const newIndex = columnTasks.findIndex((task) => task.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(
          columnTasks.map((task) => task.id),
          oldIndex,
          newIndex,
        );
        setTasks((prev) => rebuildTaskList(prev, nextStatus, newOrder));
      }
      return;
    }

    const snapshot = tasks;
    setTasks((prev) => moveTaskToStatus(prev, activeId, nextStatus, overId));
    updateTaskStatus(activeId, nextStatus).catch(() => {
      setError("Sync failed. Your change was reverted.");
      setTasks(snapshot);
    });
  };

  return (
    <div className="kanban-page">
      <div className="kanban-shell">
        <header className="kanban-header">
          <div>
            <p className="kanban-eyebrow">Sprint view</p>
            <h1>Kanban Board</h1>
            <p className="kanban-subtitle">
              Drag cards between stages to keep delivery moving.
            </p>
          </div>
          <div className="kanban-controls">
            <label className="kanban-filter">
              <span>Project</span>
              <select
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
              >
                <option value="all">All projects</option>
                {projectOptions.map((projectId) => (
                  <option key={projectId} value={projectId}>
                    {projectId}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {error && <div className="kanban-alert">{error}</div>}

        {loading ? (
          <div className="kanban-loading">Loading tasks...</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-columns">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  columnId={column.id}
                  title={column.title}
                  tasks={tasksByStatus[column.id]}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? <KanbanTaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  columnId: TaskStatus;
  title: string;
  tasks: Task[];
}

const KanbanColumn = ({ columnId, title, tasks }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <section
      ref={setNodeRef}
      className={`kanban-column${isOver ? " is-over" : ""}`}
    >
      <div className="kanban-column-header">
        <h2>{title}</h2>
        <span className="kanban-count">{tasks.length}</span>
      </div>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="kanban-column-body">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
};

const SortableTaskCard = ({ task }: { task: Task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-task${isDragging ? " is-dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <div className="kanban-task-footer">
        <span>Project</span>
        <strong>{task.projectId}</strong>
      </div>
    </div>
  );
};

const KanbanTaskCard = ({ task }: { task: Task }) => (
  <div className="kanban-task is-overlay">
    <h3>{task.title}</h3>
    {task.description && <p>{task.description}</p>}
    <div className="kanban-task-footer">
      <span>Project</span>
      <strong>{task.projectId}</strong>
    </div>
  </div>
);

export default KanbanPage;
