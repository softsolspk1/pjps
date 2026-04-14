import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAction } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const userRole = (session?.user as any)?.role;
  const allowedRoles = ["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR"];
  if (!session || !allowedRoles.includes(userRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { articleId, editorId } = await req.json();

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { editorId },
      include: {
        assignedEditor: true,
      }
    });

    await logAction(
      "REVIEW_ASSIGNED",
      "ARTICLE",
      articleId,
      (session.user as any).id,
      { editorAssigned: editorId }
    );

    if (updatedArticle.assignedEditor?.email) {
      try {
        const { sendEmail } = await import("@/lib/mail");
        await sendEmail({
          to: updatedArticle.assignedEditor.email,
          subject: `Assigned: Internal Peer Review for Manuscript #[${articleId.slice(-6)}]`,
          html: `
            <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
              <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">Internal Peer Review</h1>
              <p>Dear <strong>${updatedArticle.assignedEditor.name}</strong>,</p>
              <p>You have been assigned to conduct the Internal Peer Review for the manuscript: "<strong>${updatedArticle.title}</strong>".</p>
              <p>Please log in to the Editorial Dashboard to review this submission.</p>
              <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 0.9em; color: #64748b;">
                Best regards,<br/>
                <strong>Editorial Office</strong><br/>
                Pakistan Journal of Pharmaceutical Sciences
              </p>
            </div>
          `
        });
      } catch (e) {
        console.error("Email failed:", e);
      }
    }

    return NextResponse.json({ success: true, article: updatedArticle });
  } catch (error: any) {
    console.error("Assign error:", error);
    return NextResponse.json({ error: error.message || "Failed to assign editor" }, { status: 500 });
  }
}
