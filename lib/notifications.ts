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
        authors: { orderBy: { sequence: 'asc' }, take: 1 },
        reviews: {
          where: { status: { in: ["ACCEPTED", "COMPLETED", "INVITED"] } },
          include: { reviewer: true }
        }
      }
    });

    if (!article) return;

    const targetEmail = article.submitter?.email || article.authors?.[0]?.email;
    const targetName = article.submitter?.name || article.authors?.[0]?.name || "Researcher";

    let subject = "";
    let message = "";
    let isFinalDecision = ["ACCEPTED", "REJECTED"].includes(newStatus);

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

    // 1. Notify Author
    if (targetEmail && subject) {
      await sendEmail({
        to: targetEmail,
        subject: `PJPS Notification: ${subject}`,
        title: "Scholarly Status Update",
        html: `
          <p>Dear <strong>${targetName}</strong>,</p>
          <p>${message}</p>
          <div style="margin: 30px 0; padding: 25px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <p style="margin: 0; font-weight: bold; color: #002d5e; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; margin-bottom: 15px;">Tracking Details:</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Article ID:</strong> ${articleId}</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Updated Status:</strong> ${newStatus.replace('_', ' ')}</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Update Logged:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>For detailed feedback or to manage your submission, please access the professional portal:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/author/dashboard" style="background-color: #002d5e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Access Author Dashboard</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">This is an automated formal notification from the PJPS Editorial Registry.</p>
        `
      });
    }

    // 2. Notify Editorial Office (Admin/Editor)
    await sendEmail({
      to: process.env.SMTP_USER!,
      subject: `[Log] Manuscript Status Change: ${newStatus} - PJPS`,
      title: "Editorial Registry Log Update",
      html: `
        <p>A manuscript status transition has been logged in the editorial registry.</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f1f5f9; border-left: 4px solid #0f172a;">
           <p style="margin: 0; font-weight: bold;">${article.title}</p>
           <p style="margin: 10px 0 0 0; font-size: 12px; color: #475569;">
             <strong>Transition:</strong> ${oldStatus} -> ${newStatus}<br/>
             <strong>Article ID:</strong> ${articleId}<br/>
             <strong>Primary Author:</strong> ${targetName}
           </p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
           <a href="${process.env.NEXTAUTH_URL}/admin/articles/${articleId}" style="background-color: #0f172a; color: #ffffff; padding: 10px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 12px; text-transform: uppercase;">View Registry Entry</a>
        </div>
      `
    });

    // 3. Courtesy Notifications to Reviewers (on Final Decisions)
    if (isFinalDecision && article.reviews.length > 0) {
      for (const review of article.reviews) {
        if (review.reviewer?.email) {
          await sendEmail({
            to: review.reviewer.email,
            subject: `Scholarly Update: Final Decision for Manuscript #${articleId.slice(-6).toUpperCase()}`,
            title: "Peer Review Courtesy Update",
            html: `
              <p>Dear <strong>${review.reviewer.name}</strong>,</p>
              <p>On behalf of the PJPS Editorial Board, we would like to inform you that a final editorial decision has been reached for the manuscript you recently evaluated:</p>
              <div style="margin: 25px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                 <p style="margin: 0; font-weight: bold; color: #002d5e;">${article.title}</p>
                 <p style="margin: 10px 0 0 0; font-size: 13px; font-weight: bold; color: ${newStatus === 'ACCEPTED' ? '#059669' : '#dc2626'}; text-transform: uppercase;">Final Decision: ${newStatus}</p>
              </div>
              <p>We thank you once again for your valuable scholarly contribution to the peer-review integrity of PJPS.</p>
            `
          });
        }
      }
    }

  } catch (error) {
    console.error("Notification Error:", error);
  }
}
