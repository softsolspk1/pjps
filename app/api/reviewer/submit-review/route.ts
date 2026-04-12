import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      articleId, 
      originality, 
      quality, 
      importance, 
      rating, 
      commentsToEditor, 
      commentsToAuthor, 
      recommendation 
    } = await req.json();

    const userId = (session.user as any).id;
    const userEmail = session.user.email;

    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail! }
    });

    if (!user || user.role !== "REVIEWER") {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    // Find the accepted review
    const review = await prisma.review.findFirst({
      where: {
        articleId,
        reviewerId: user.id,
        status: "ACCEPTED"
      },
      include: { article: true }
    });

    if (!review) {
      return NextResponse.json({ error: "No active review assignment found to finalize" }, { status: 404 });
    }

    // 2. Update the Review Record
    await prisma.review.update({
      where: { id: review.id },
      data: {
        originality,
        quality,
        importance,
        rating: rating || 0,
        commentsToEditor: commentsToEditor || "",
        commentsToAuthor: commentsToAuthor || "",
        comments: commentsToAuthor,
        recommendation,
        status: "COMPLETED"
      } as any
    });

    // 3. Notify Editorial Office (SMTP_USER)
    try {
      const { sendEmail } = await import("@/lib/mail");
      await sendEmail({
        to: process.env.SMTP_USER!,
        subject: `New Expert Review Submitted - [${recommendation}] - PJPS`,
        title: "Peer Review Scorecard Submitted",
        html: `
          <p>An expert referee has finalized a scholarly review for the following manuscript:</p>
          <div style="margin: 20px 0; padding: 25px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <p style="margin: 0; font-weight: bold; color: #002d5e; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; margin-bottom: 15px;">Manuscript & Review Summary:</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Title:</strong> ${review.article?.title || 'Unknown Manuscript'}</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Expert Referee:</strong> ${user.name}</p>
             <p style="margin: 15px 0 5px 0; font-size: 13px; font-weight: bold; color: #1e293b;">Final Recommendation: <span style="color: #0061ff;">${recommendation}</span></p>
          </div>
          <p>Please log in to the Administrative Dashboard to review the feedback and move the manuscript to the next decision phase.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/articles/${articleId}" style="background-color: #002d5e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase;">View Review Scorecard</a>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Failed to notify editor of review completion:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
