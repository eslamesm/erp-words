import { notFound, redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/adminAuth.server";
import { getAdminContentData } from "@/lib/adminContent.server";
import { ContentAdminClient } from "./ContentAdminClient";

// The page reads the request session and must render per request.
export const instant = false;

export default async function ContentAdminPage() {
  const access = await getAdminAccess();

  if (access.status === "anonymous") {
    redirect(`/settings?next=${encodeURIComponent("/admin/content")}`);
  }

  // Defense in depth: proxy.ts only checks for a session cookie, so this
  // server-side getUser() check is the authoritative authorization boundary.
  // The admin payload is never built for a non-admin or anonymous request.
  if (access.status !== "admin") {
    notFound();
  }

  return <ContentAdminClient data={getAdminContentData()} />;
}
