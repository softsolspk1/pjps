import { prisma } from "./prisma";
import { sendEmail } from "./mail";

export type NotificationType = 
  | "ARTICLE_SUBMITTED"
  | "SCREENING_APPROVED"
  | "REVISION_REQUESTED"
  | "MANUSCRIPT_REJECTED"
  | "MANUSCRIPT_ACCEPTED"
  | "REVIEW_ASSIGNED";

export async function notifyStatusChange(articleId: string, oldStatus: string, newStatus: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { 
        submitter: true,
        authors: { orderBy: { sequence: 'asc' }, take: 1 }
      }
    });

    if (!article) return;

    const targetEmail = article.submitter?.email || article.authors?.[0]?.email;
    const targetName = article.submitter?.name || article.authors?.[0]?.name || "Researcher";

    if (!targetEmail) return;

    let subject = "";
    let message = "";

    switch (newStatus) {
      case "SCREENING":
        subject = "Manuscript Received & Screening Started";
        message = `Your manuscript "${article.title}" has entered the formal screening phase.`;
        break;
      case "UNDER_REVIEW":
        subject = "Peer Review Commenced";
        message = `Your manuscript "${article.title}" has passed technical screening and is now under formal double-blind peer review.`;
        break;
      case "REVISION":
        subject = "Editorial Decision: Revision Required";
        message = `The editorial board has requested scientific revisions for your manuscript "${article.title}". Please log in to view feedback.`;
        break;
      case "ACCEPTED":
        subject = "Congratulations: Manuscript Accepted";
        message = `We are pleased to inform you that your manuscript "${article.title}" has been accepted for publication in PJPS.`;
        break;
      case "REJECTED":
        subject = "Editorial Decision: Reject";
        message = `We regret to inform you that we are unable to accept your manuscript "${article.title}" for publication at this time.`;
        break;
    }

    if (subject) {
      await sendEmail({
        to: targetEmail,
        subject: `PJPS Notification: ${subject}`,
        html: `
          <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
            <h2 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">Institutional Notification</h2>
            <p>Dear <strong>${targetName}</strong>,</p>
            <p>${message}</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 6px;">
              <p style="margin: 0;"><strong>Article ID:</strong> ${articleId}</p>
              <p style="margin: 5px 0;"><strong>New Status:</strong> ${newStatus}</p>
            </div>
            <p>You can track further progress via the Submission Portal.</p>
            <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 0.85em; color: #64748b;">
              Best regards,<br/>The Editorial Office<br/><strong>Pakistan Journal of Pharmaceutical Sciences</strong>
            </p>
          </div>
        `
      });
    }
  } catch (error) {
    console.error("Notification Error:", error);
  }
}
