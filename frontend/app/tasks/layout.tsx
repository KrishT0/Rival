import { jwtDecode } from "jwt-decode";
import { redirect } from "next/dist/client/components/navigation";
import { cookies } from "next/headers";
import React from "react";
import { TaskHeader } from "./components/task-header";

type JWTClaims = {
  sub: string;
  email: string;
  role: string;
  exp: number;
};

export default async function TaskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) redirect("/login");

  const claims = jwtDecode<JWTClaims>(token.value);

  return (
    <div className="min-h-screen w-full">
      <TaskHeader email={claims.email} />
      <div className="max-w-290 mx-auto">{children}</div>
    </div>
  );
}
