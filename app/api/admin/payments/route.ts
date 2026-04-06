import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { status: "SUBMITTED" },
          { paymentStatus: { not: "UNPAID" } }
        ]
      },
      include: {
        authors: {
          orderBy: { sequence: 'asc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(articles);
  } catch (err) {
    console.error("Fetch payments error:", err);
    return NextResponse.json({ error: "Failed to fetch scholarly payments" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "FINANCE_ADMIN" && userRole !== "EDITOR_IN_CHIEF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    const updated = await prisma.article.update({
      where: { id },
      data: { paymentStatus: status },
      include: {
        authors: {
          orderBy: { sequence: 'asc' },
          take: 1
        }
      }
    });

    // Notify Author if Payment is Verified
    if (status === "PAID" && updated.authors?.[0]?.email) {
      try {
        const { sendEmail } = await import("@/lib/mail");
        await sendEmail({
          to: updated.authors[0].email,
          subject: `Payment Verified: Manuscript #[${updated.id.slice(-6).toUpperCase()}]`,
          title: "Fiscal Verification Successful",
          html: `
            <p>Dear <strong>${updated.authors[0].name}</strong>,</p>
            <p>We are pleased to inform you that your Article Processing Charge (APC) payment for the manuscript "<strong>${updated.title}</strong>" has been formally verified by the PJPS Finance Department.</p>
            <div style="margin: 30px 0; padding: 25px; background-color: #f0fdf4; border: 1px solid #d1fae5; border-radius: 12px; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-weight: bold; color: #064e3b; border-bottom: 1px solid #d1fae5; padding-bottom: 10px; margin-bottom: 15px;">Fiscal Registry Details:</p>
               <p style="margin: 5px 0; font-size: 13px;"><strong>Article ID:</strong> ${updated.id}</p>
               <p style="margin: 5px 0; font-size: 13px;"><strong>Verification Status:</strong> PAID (Verified)</p>
               <p style="margin: 5px 0; font-size: 13px;"><strong>Date Verified:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Your submission is now transitioning to the formal <strong>Editorial Screening & Expert Review</strong> phase. You can track the progress in real-time via your professional dashboard.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/author/dashboard" style="background-color: #002d5e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Access Author Registry</a>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Failed to send payment verification email:", emailErr);
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update payment error:", err);
    return NextResponse.json({ error: "Failed to verify scholarly payment" }, { status: 500 });
  }
}
