import { NextResponse } from "next/server";
import { notifyStatusChange } from "@/lib/notifications";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Diagnostic endpoint for verifying multi-stakeholder notifications.
 * Restricted to ADMIN role.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId, oldStatus, newStatus } = await req.json();

    if (!articleId || !newStatus) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    console.log(`[Diagnostic] Triggering notification broadcast for ${articleId}: ${oldStatus} -> ${newStatus}`);
    
    await notifyStatusChange(articleId, oldStatus || "UNKNOWN", newStatus);

    return NextResponse.json({ success: true, message: "Diagnostic broadcast triggered" });
  } catch (err: any) {
    console.error("Diagnostic Notify Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
