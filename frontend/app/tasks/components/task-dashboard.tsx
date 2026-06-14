"use client";

import { listTasks, type Task } from "@/actions/tasks";
import { TaskFilters } from "@/app/tasks/components/task-filters";
import { TaskFormSheet } from "@/app/tasks/components/task-form-sheet";
import { TaskList } from "@/app/tasks/components/task-list";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type Filters = {
  status: string;
  search: string;
  sort_by: string;
  order: string;
  page: number;
};

const DEFAULT_FILTERS: Filters = {
  status: "",
  search: "",
  sort_by: "created_at",
  order: "desc",
  page: 1,
};

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const totalPages = Math.ceil(total / 10);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    const result = await listTasks({
      status: filters.status || undefined,
      search: filters.search || undefined,
      sort_by: filters.sort_by,
      order: filters.order,
      page: filters.page,
      limit: 10,
    });

    if (result.success) {
      setTasks(result.data.data ?? []);
      setTotal(result.data.total);
    }
    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const todayCount = tasks.filter((t) => t.status !== "done").length;

  function openCreate() {
    setEditingTask(null);
    setIsFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Inbox</h1>
          <p className="text-sm text-muted-foreground">
            You have {todayCount} active tasks remaining
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="mb-6">
        <TaskFilters filters={filters} onChange={setFilters} />
      </div>

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onEdit={openEdit}
        onTaskDeleted={fetchTasks}
      />
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (filters.page > 1) {
                    setFilters({ ...filters, page: filters.page - 1 });
                  }
                }}
                className={
                  filters.page <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={pageNum === filters.page}
                    onClick={(e) => {
                      e.preventDefault();
                      setFilters({ ...filters, page: pageNum });
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (filters.page < totalPages) {
                    setFilters({ ...filters, page: filters.page + 1 });
                  }
                }}
                className={
                  filters.page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <TaskFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask}
        onSaved={fetchTasks}
      />
    </main>
  );
}
