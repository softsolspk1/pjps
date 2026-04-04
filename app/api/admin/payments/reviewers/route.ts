import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/lib/mail";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "FINANCE_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        reviewer: {
          select: { name: true, email: true }
        },
        article: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reviews);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch expert disbursements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "FINANCE_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, amount, reference, chequeUrl } = await req.json();

    const review = await prisma.review.update({
      where: { id: reviewId },
      include: {
        reviewer: { select: { name: true, email: true } },
        article: { select: { title: true } }
      },
      data: {
        paymentStatus: "PAID",
        paymentAmount: amount,
        paymentRef: reference,
        paymentDocUrl: chequeUrl
      }
    });

    // Send Disbursement Notification Email to Reviewer
    await sendEmail({
      to: review.reviewer.email,
      subject: `PJPS Scholarly Reward Disbursed: MS ID ${review.articleId.slice(0, 8)}`,
      html: `
        <div style="font-family: 'Times New Roman', serif; padding: 40px; color: #1a202c; line-height: 1.6;">
          <h1 style="color: #0061ff; font-style: italic;">Expert Reward Disbursement</h1>
          <p>Dear <strong>${review.reviewer.name}</strong>,</p>
          <p>We are pleased to inform you that the Pakistan Journal of Pharmaceutical Sciences (PJPS) has officially disbursed your scholarly reward for the peer-review evaluation of the following manuscript:</p>
          <p><strong>Manuscript:</strong> ${review.article.title}</p>
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #edf2f7;">
            <p style="margin: 0;"><strong>Disbursement Amount:</strong> ${amount}</p>
            <p style="margin: 5px 0 0;"><strong>Reference/Transaction ID:</strong> ${reference}</p>
            ${chequeUrl ? `<p style="margin: 5px 0 0;"><a href="${chequeUrl}" style="color: #0061ff;">View Disbursement Artifact (Cheque)</a></p>` : ''}
          </div>
          <p>Your contribution to the scholarly integrity of our journal is deeply appreciated. The status has been updated in your expert dashboard.</p>
          <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;" />
          <p style="font-size: 12px; color: #a0aec0;">
            This is an automated institutional notification from the PJPS Fiscal Registry.<br />
            © 2026 Pakistan Journal of Pharmaceutical Sciences
          </p>
        </div>
      `
    });

    return NextResponse.json(review);
  } catch (err) {
    console.error("Disbursement API Error:", err);
    return NextResponse.json({ error: "Failed to record expert disbursement" }, { status: 500 });
  }
}
