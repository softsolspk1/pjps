import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const userRole = (session?.user as any)?.role;
  const allowedRoles = ["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR"];
  if (!session || !allowedRoles.includes(userRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { articleId, reviewerId } = await req.json();

    // Check if the assignment already exists
    const existingReview = await prisma.review.findFirst({
      where: { articleId, reviewerId }
    });

    if (existingReview) {
      return NextResponse.json({ error: "Reviewer already assigned to this article" }, { status: 400 });
    }

    // 3. Create the review assignment
    const review = await prisma.review.create({
      data: {
        articleId,
        reviewerId,
        status: "PENDING",
        recommendation: "PENDING"
      },
      include: {
        reviewer: true,
        article: {
          include: {
            authors: {
              orderBy: { sequence: 'asc' },
              take: 1
            }
          }
        }
      }
    });

    // 4. Update article status to IN_REVIEW
    await prisma.article.update({
      where: { id: articleId },
      data: { status: "IN_REVIEW" }
    });

    // 5. Dispatch Scholarly Notifications
    try {
      const { sendEmail } = await import("@/lib/mail");
      
      // A. Notify Reviewer
      await sendEmail({
        to: review.reviewer.email,
        subject: `Assigned: Peer Review for Manuscript #[${articleId.slice(-6)}]`,
        html: `
          <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
            <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">Expert Review Invitation</h1>
            <p>Dear <strong>${review.reviewer.name}</strong>,</p>
            <p>You have been officially assigned as a peer reviewer for the manuscript titled: "<strong>${review.article.title}</strong>".</p>
            <p>Please log in to your <strong>Reviewer Dashboard</strong> to accept the assignment and provide your scholarly evaluation.</p>
            <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 0.9em; color: #64748b;">
              Best regards,<br/>
              <strong>Editorial Management Team</strong><br/>
              Pakistan Journal of Pharmaceutical Sciences
            </p>
          </div>
        `
      });

      // B. Notify Author
      if (review.article.authors?.[0]?.email) {
        await sendEmail({
          to: review.article.authors[0].email,
          subject: `Status Update: Peer Review Commenced #[${articleId.slice(-6)}]`,
          html: `
            <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
              <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">Peer Review Status</h1>
              <p>Dear <strong>${review.article.authors[0].name}</strong>,</p>
              <p>Your manuscript "<strong>${review.article.title}</strong>" has successfully passed the initial editorial screening and is now entering the <strong>Expert Peer Review</strong> phase.</p>
              <p>Subject experts have been invited to evaluate your work. We will notify you once the peer evaluations are complete.</p>
              <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 0.9em; color: #64748b;">
                Best regards,<br/>
                <strong>The Editorial Office</strong><br/>
                Pakistan Journal of Pharmaceutical Sciences
              </p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error("Failed to send assignment emails:", emailErr);
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Assignment execution error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute assignment" }, { status: 500 });
  }
}
