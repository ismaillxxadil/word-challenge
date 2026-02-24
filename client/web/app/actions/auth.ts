"use server";

import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  // Store auth state securely in cookie
  (await cookies()).set("admin_auth", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  return { success: true };
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
  (await cookies()).delete("admin_auth");
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  return authCookie?.value === "true";
}
