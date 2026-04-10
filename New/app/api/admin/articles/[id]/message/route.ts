import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: articleId } = await params;
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Scholarly message content is required" }, { status: 400 });
    }

    // 1. Fetch Article & Author Details
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        submitter: true,
        authors: {
          orderBy: { sequence: 'asc' },
          take: 1
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Manuscript registry entry not found" }, { status: 404 });
    }

    const leadAuthorEmail = article.submitter?.email || article.authors?.[0]?.email;
    const leadAuthorName = article.submitter?.name || article.authors?.[0]?.name || "Lead Author";

    if (!leadAuthorEmail) {
      return NextResponse.json({ error: "Lead author contact details not available" }, { status: 400 });
    }

    // 2. Log the Correspondence (Optionally in a 'Message' model if we want history)
    // For now, we mainly send the secure email
    
    // 3. Send Professional Communication
    const { success, error } = await sendEmail({
      to: leadAuthorEmail,
      subject: `Editorial Correspondence: Manuscript #${articleId.slice(-6).toUpperCase()}`,
      title: "Official Editorial Correspondence",
      html: `
        <p>Dear <strong>${leadAuthorName}</strong>,</p>
        <p>This is an official scholarly correspondence regarding your manuscript submission titled "<strong>${article.title}</strong>" as registered in the PJPS portal.</p>
        <div style="margin: 30px 0; padding: 25px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; border-left: 4px solid #002d5e;">
          <p style="margin: 0; font-weight: bold; color: #002d5e; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; margin-bottom: 15px;">Editorial Board Communication:</p>
          <div style="font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        </div>
        <p>You can respond to this correspondence or track your manuscript registry status via the live dashboard:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/author/dashboard" style="background-color: #002d5e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Access Author Dashboard</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Respectfully,<br/><strong>The PJPS Editorial Board</strong></p>
      `
    });

    if (!success) {
      throw new Error(`Email dispatch failed: ${error}`);
    }

    return NextResponse.json({ success: true, message: "Manuscript correspondence dispatched successfully" });
  } catch (err: any) {
    console.error("Correspondence API error:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch scholarly communication" }, { status: 500 });
  }
}
