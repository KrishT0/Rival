"use client";

import type { Task } from "@/actions/tasks";
import { TaskCard } from "@/app/tasks/components/task-card";

type TaskListProps = {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onTaskDeleted: () => void;
};

export function TaskList({ tasks, isLoading, onEdit, onTaskDeleted }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">No tasks yet — create your first one</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} onDeleted={onTaskDeleted} />
      ))}
    </div>
  );
}