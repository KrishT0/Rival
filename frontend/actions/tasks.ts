"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ListTasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

interface ListTasksParams {
  status?: string;
  search?: string;
  sort_by?: string;
  order?: string;
  page?: number;
  limit?: number;
}

async function authHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function listTasks(
  params: ListTasksParams = {},
): Promise<
  { success: true; data: ListTasksResponse } | { success: false; error: string }
> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.order) query.set("order", params.order);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  try {
    const res = await fetch(`${API_URL}/tasks?${query.toString()}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error ?? "Failed to fetch tasks" };
    }

    return { success: true, data };
  } catch {
    return { success: false, error: "Unable to reach server" };
  }
}

export async function createTask(input: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
}): Promise<{ success: true; data: Task } | { success: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error ?? "Failed to create task" };
    }

    return { success: true, data };
  } catch {
    return { success: false, error: "Unable to reach server" };
  }
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
  }>,
): Promise<{ success: true; data: Task } | { success: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error ?? "Failed to update task" };
    }

    return { success: true, data };
  } catch {
    return { success: false, error: "Unable to reach server" };
  }
}

export async function deleteTask(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error ?? "Failed to delete task" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unable to reach server" };
  }
}
