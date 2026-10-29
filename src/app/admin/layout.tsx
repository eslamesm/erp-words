import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdminAccess } from "@/lib/adminAuth.server";

// The gate reads the request session, so this segment is allowed to block
// under Cache Components.
export const instant = false;

/**
 * Authoritative admin boundary. Every page under /admin renders through this
 * layout, so adding a new admin route cannot accidentally skip the check.
 * The proxy only performs an optimistic redirect; this layout and each admin
 * page verify the user and role server-side before rendering any data.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await getAdminAccess();

  if (access.status === "anonymous") {
    redirect("/settings");
  }

  if (access.status !== "admin") {
    notFound();
  }

  return children;
}
