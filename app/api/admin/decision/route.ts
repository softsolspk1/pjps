import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId, status } = await req.json();

    const VALID_STATUSES = ["SCREENING", "UNDER_REVIEW", "REVISION", "ACCEPTED", "REJECTED"];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid scholarly status transition" }, { status: 400 });
    }

    const oldArticle = await prisma.article.findUnique({ where: { id: articleId } });
    const oldStatus = oldArticle?.status || "UNKNOWN";

    const article = await prisma.article.update({
      where: { id: articleId },
      data: { status },
      include: {
        submitter: true,
        authors: {
          orderBy: { sequence: 'asc' },
          take: 1
        }
      }
    });

    // Audit Log the Decision
    await logAction(
      "ARTICLE_STATUS_CHANGE",
      "ARTICLE",
      articleId,
      (session.user as any).id,
      { oldStatus, newStatus: status }
    );

    // Notify Author using Centralized Utility
    const { notifyStatusChange } = await import("@/lib/notifications");
    await notifyStatusChange(articleId, oldStatus, status);

    return NextResponse.json(article);
  } catch (err) {
    console.error("Decision API Error:", err);
    return NextResponse.json({ error: "Failed to record scholarly decision" }, { status: 500 });
  }
}
