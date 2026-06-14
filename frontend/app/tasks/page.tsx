import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TaskDashboard } from "@/app/tasks/components/task-dashboard";

export default async function TasksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/");
  }

  return <TaskDashboard />;
}