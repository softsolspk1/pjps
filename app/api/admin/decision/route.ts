import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId, status } = await req.json();

    if (!["ACCEPTED", "REJECTED", "REVISION", "IN_REVIEW"].includes(status)) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: { status },
      include: {
        submitter: true,
        authors: {
          orderBy: { sequence: 'asc' },
          take: 1
        }
      }
    });

    // Notify Author of Editorial Decision
    const targetEmail = article.submitter?.email || article.authors?.[0]?.email;
    const targetName = article.submitter?.name || article.authors?.[0]?.name;

    if (targetEmail) {
      try {
        const { sendEmail } = await import("@/lib/mail");
        const decisionLower = status.toLowerCase();
        
        await sendEmail({
          to: targetEmail,
          subject: `Editorial Decision: Manuscript #[${articleId.slice(-6)}]`,
          html: `
            <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
              <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">Editorial Decision</h1>
              <p>Dear <strong>${targetName}</strong>,</p>
              <p>Thank you for submitting your manuscript "<strong>${article.title}</strong>" to the <strong>Pakistan Journal of Pharmaceutical Sciences (PJPS)</strong>.</p>
              <p>Following a rigorous double-blind peer review and editorial evaluation, we are pleased to communicate the following decision:</p>
              <div style="margin: 30px 0; padding: 25px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #002d5e;">
                <p style="margin: 0; font-weight: bold; font-size: 1.2em; color: ${status === 'ACCEPTED' ? '#10b981' : status === 'REJECTED' ? '#ef4444' : '#f59e0b'};">
                  Status: ${status}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 0.9em; line-height: 1.6; color: #475569;">
                  ${status === 'ACCEPTED' ? 'Your manuscript has been accepted for publication. Our production team will contact you regarding the next steps.' : 
                    status === 'REVISION' ? 'The reviewers have requested revisions to your work. Please consult your dashboard for detailed feedback and resubmit your revised manuscript.' : 
                    'We regret to inform you that we are unable to accept your manuscript for publication at this time.'}
                </p>
              </div>
              <p>You can view full reviewer feedback and decision details through our Online Submission Portal.</p>
              <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 0.9em; color: #64748b;">
                Respectfully,<br/>
                <strong>The Editorial Board</strong><br/>
                Pakistan Journal of Pharmaceutical Sciences
              </p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Failed to send decision email:", emailErr);
      }
    }

    return NextResponse.json(article);
  } catch (err) {
    console.error("Decision API Error:", err);
    return NextResponse.json({ error: "Failed to record scholarly decision" }, { status: 500 });
  }
}
