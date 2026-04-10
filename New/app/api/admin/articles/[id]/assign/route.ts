import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { reviewerId } = await req.json();

    if (!reviewerId) {
      return NextResponse.json({ error: "Missing reviewerId" }, { status: 400 });
    }

    // 1. Fetch Details for Email
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId }
    });
    const article = await prisma.article.findUnique({
      where: { id: id }
    });

    if (!reviewer || !article) {
       return NextResponse.json({ error: "Scholarly record not found" }, { status: 404 });
    }

    // 2. Create the Pending Review
    // We use a transaction to ensure both article and review are updated
    await prisma.$transaction([
      prisma.review.create({
        data: {
          articleId: id,
          reviewerId: reviewerId,
          status: "INVITED",
        }
      }),
      prisma.article.update({
        where: { id: id },
        data: { status: "IN_REVIEW" }
      })
    ]);

    // 3. Send Expert Invitation Email
    try {
      const { sendEmail } = await import("@/lib/mail");
      await sendEmail({
        to: reviewer.email!,
        subject: "Formal Invitation: Expert Peer Review for PJPS",
        title: "Expert Peer Review Invitation",
        html: `
          <p>Dear <strong>${reviewer.name}</strong>,</p>
          <p>The Editorial Board of the <strong>Pakistan Journal of Pharmaceutical Sciences (PJPS)</strong> formally invites you to serve as an expert reviewer for the following manuscript:</p>
          <div style="margin: 25px 0; padding: 25px; background-color: #f8fafc; border-left: 4px solid #002d5e; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; font-size: 16px; color: #0f172a;">${article.title}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Research Abstract:</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">${article.abstract?.substring(0, 400)}...</p>
          </div>
          <p>Your expertise is highly valued. We kindly request that you log in to the Reviewer Portal to access the full manuscript details and provide your decision to **Accept** or **Decline** this scholarly invitation.</p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL}/reviewer/dashboard" style="background-color: #002d5e; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Manage Invitation</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">If you are unable to review this research at this time, please notify us through the portal so that we may invite an alternative expert referee.</p>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send reviewer invitation:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Assignment error:", error);
    return NextResponse.json({ error: error.message || "Failed to assign reviewer" }, { status: 500 });
  }
}
