import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as any;

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { articleId, decision, comments, issueId } = await req.json();

    // Decisions: ACCEPTED, REJECTED, REVISION_REQUIRED
    // We map these to article status
    let status = "SUBMITTED";
    if (decision === "ACCEPT") status = "ACCEPTED";
    if (decision === "REJECT") status = "REJECTED";
    if (decision === "REVISE") status = "SUBMITTED"; // Back to submitted but with comments

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { 
        status,
        issueId: decision === "ACCEPT" ? issueId : undefined,
      }
    });

    // In a real system, we would also trigger an email here.
    
    return NextResponse.json({ success: true, article: updatedArticle });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record decision" }, { status: 500 });
  }
}
