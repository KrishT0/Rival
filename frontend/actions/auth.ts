"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AuthResponse = {
  token?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  };
};

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function login(formData: { email: string; password: string }) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error ?? "Login failed" };
    }

    if (!data.token) {
      return { success: false, error: "No token received" };
    }

    await setAuthCookie(data.token);
    return { success: true };
  } catch {
    return { success: false, error: "Unable to reach server" };
  }
}

export async function signup(formData: { email: string; password: string }) {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error ?? "Signup failed" };
    }

    if (!data.token) {
      return { success: false, error: "No token received" };
    }

    await setAuthCookie(data.token);
    return { success: true };
  } catch {
    return { success: false, error: "Unable to reach server" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/");
}
