"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Filters } from "./task-dashboard";

type TaskFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const statusLabels: Record<string, string> = {
  all: "All Status",
  todo: "TODO",
  in_progress: "In Progress",
  done: "Done",
};

const sortLabels: Record<string, string> = {
  "created_at-desc": "Newest first",
  "created_at-asc": "Oldest first",
  "due_date-asc": "Due date (earliest)",
  "due_date-desc": "Due date (latest)",
  "priority-desc": "Priority (high first)",
  "priority-asc": "Priority (low first)",
};

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks"
          className="pl-8"
          value={filters.search}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value, page: 1 })
          }
        />
      </div>

      <Select
        value={filters.status || "all"}
        onValueChange={(value: string | null) => {
          if (value === null) return;
          onChange({
            ...filters,
            status: value === "all" ? "" : value,
            page: 1,
          });
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status">
            {(value: string | null) =>
              value ? (statusLabels[value] ?? value) : "Status"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="todo">TODO</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${filters.sort_by}-${filters.order}`}
        onValueChange={(value: string | null) => {
          if (value === null) return;
          const [sort_by, order] = value.split("-");
          onChange({ ...filters, sort_by, order, page: 1 });
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Sort by">
            {(value: string) => sortLabels[value] ?? value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="created_at-desc">Newest first</SelectItem>
          <SelectItem value="created_at-asc">Oldest first</SelectItem>
          <SelectItem value="due_date-asc">Due date (earliest)</SelectItem>
          <SelectItem value="due_date-desc">Due date (latest)</SelectItem>
          <SelectItem value="priority-desc">Priority (high first)</SelectItem>
          <SelectItem value="priority-asc">Priority (low first)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
