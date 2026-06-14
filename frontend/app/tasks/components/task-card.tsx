"use client";

import type { Task } from "@/actions/tasks";
import { deleteTask } from "@/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const priorityStyles: Record<Task["priority"], string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

const statusLabels: Record<Task["status"], string> = {
  todo: "To-Do",
  in_progress: "In Progress",
  done: "Done",
};

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDeleted: () => void;
};

export function TaskCard({ task, onEdit, onDeleted }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleComplete() {
    setIsDeleting(true);
    const result = await deleteTask(task.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Task completed");
    onDeleted();
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <Badge className={priorityStyles[task.priority]} variant="secondary">
          {task.priority}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleComplete} disabled={isDeleting}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="mb-1 font-semibold">{task.title}</h3>
      {task.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {task.due_date && (
            <>
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </>
          )}
        </div>
        <Badge variant="outline">{statusLabels[task.status]}</Badge>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={handleComplete}
        disabled={isDeleting}
      >
        {isDeleting ? "Completing..." : "Mark Complete"}
      </Button>
    </div>
  );
}
