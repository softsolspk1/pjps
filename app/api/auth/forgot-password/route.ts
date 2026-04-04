import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, do not reveal if the user doesn't exist
      return NextResponse.json({ message: "Institutional recovery link dispatched." });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "https://pjps.pk"}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "PJPS Scholarly Identity Recovery",
      html: `
        <div style="font-family: 'Times New Roman', serif; padding: 40px; color: #1a202c; line-height: 1.6; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0061ff; font-style: italic; font-size: 28px; margin: 0;">Institutional Recovery Protocol</h1>
            </div>
            <p>Dear <strong>${user.name || "Scholar"}</strong>,</p>
            <p>We received a formal request to recover the scholarly identity associated with this institutional email address.</p>
            <p>To finalize the identity restoration and set a new secure credential, please utilize the institutional link below:</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" style="background-color: #0061ff; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                Finalize Identity Restoration
              </a>
            </div>
            <p style="font-size: 12px; color: #718096; text-align: center;">This recovery link is valid for **60 minutes**. If you did not initiate this request, please disregard this communication.</p>
            <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;" />
            <p style="font-size: 11px; color: #a0aec0; text-align: center;">
              © 2026 Pakistan Journal of Pharmaceutical Sciences<br />
              Scholarly Automation Division
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: "Institutional recovery link dispatched." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return NextResponse.json({ error: "Failed to process recovery request" }, { status: 500 });
  }
}
