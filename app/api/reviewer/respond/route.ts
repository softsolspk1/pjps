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

    const { reviewId, response } = await req.json(); // response = 'ACCEPTED' | 'DECLINED'

    if (!reviewId || !['ACCEPTED', 'DECLINED'].includes(response)) {
      return NextResponse.json({ error: "Invalid response parameters" }, { status: 400 });
    }

    // 1. Verify this review belongs to the current user
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { reviewer: true, article: true }
    });

    if (!review || review.reviewer.email !== session.user.email) {
      return NextResponse.json({ error: "Assignment not found in your registry" }, { status: 404 });
    }

    // 2. Update Status and Notify Editor
    const notifyEditor = async (status: string) => {
      try {
        const { sendEmail } = await import("@/lib/mail");
        await sendEmail({
          to: process.env.SMTP_USER!,
          subject: `Reviewer ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'} Invitation - PJPS`,
          title: "Referee Selection Update",
          html: `
            <p>An expert reviewer has responded to a scholarly invitation for the following article:</p>
            <div style="margin: 20px 0; padding: 20px; background-color: #fcfdfe; border-left: 4px solid #002d5e;">
              <p style="margin: 0; font-weight: bold; color: #1e293b;">${review.article?.title || 'Manuscript'}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #64748b;">Reviewer: ${review.reviewer.name} (${review.reviewer.email})</p>
              <p style="margin: 5px 0; font-size: 13px; font-weight: bold; color: ${status === 'ACCEPTED' ? '#059669' : '#dc2626'};">DECISION: ${status}</p>
            </div>
            <p>Please log in to the Administrative Dashboard to manage the peer review sequence.</p>
          `
        });
      } catch (err) {
        console.error("Editorial notification error:", err);
      }
    };

    if (response === 'DECLINED') {
      await prisma.review.delete({
        where: { id: reviewId }
      });
      await notifyEditor('DECLINED');
    } else {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: "ACCEPTED" }
      });
      await notifyEditor('ACCEPTED');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Review response error:", error);
    return NextResponse.json({ error: error.message || "Failed to finalize decision" }, { status: 500 });
  }
}
