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
          subject: `Payment Verified: Manuscript #[${updated.id.slice(-6)}]`,
          html: `
            <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
              <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">Payment Verification Successful</h1>
              <p>Dear <strong>${updated.authors[0].name}</strong>,</p>
              <p>We are pleased to inform you that your payment proof for the manuscript "<strong>${updated.title}</strong>" has been verified by our finance department.</p>
              <p>Your submission is now formally entering the <strong>Editorial Screening & Peer Review</strong> phase. You can continue to track the live progress via your dashboard.</p>
              <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; font-weight: bold; color: #064e3b;">Fiscal Status: Verified (PAID)</p>
                <p style="margin: 5px 0; font-size: 0.9em;">Reference ID: ${updated.id}</p>
              </div>
              <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 0.9em; color: #64748b;">
                Respectfully,<br/>
                <strong>The Finance Department</strong><br/>
                Pakistan Journal of Pharmaceutical Sciences
              </p>
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
