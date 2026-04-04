import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Scholarly email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists, but here we can be helpful for small portal or just return success
      return NextResponse.json({ message: "If this email is registered, recovery instructions have been dispatched." });
    }

    // Generate Token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Send Recovery Email
    // In a real app, this would be a link to /reset-password?token=XYZ
    // For this context, we'll provide a professional recovery notification
    await sendEmail({
      to: email,
      subject: "PJPS | Scholarly Account Recovery Instruction",
      html: `
        <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; background-color: #fff;">
          <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px; color: #002d5e;">Account Recovery Initiation</h1>
          <p>Dear <strong>${user.name || "Scholarly Participant"}</strong>,</p>
          <p>A request has been received to recover the password associated with your account in the <strong>Pakistan Journal of Pharmaceutical Sciences (PJPS)</strong> Academic Portal.</p>
          <p>To proceed with your institutional access recovery, please use the following temporary authorization token within the next hour:</p>
          <div style="margin: 35px 0; padding: 20px; background-color: #f8fafc; border-left: 5px solid #0061ff; font-family: monospace; font-size: 1.1em; letter-spacing: 1.5px; text-align: center; color: #1e293b;">
            ${token}
          </div>
          <p style="font-size: 0.9em; color: #64748b;">(Standard Reset Link: https://pjps.app/reset-password?token=${token})</p>
          <p>If you did not initiate this request, please ignore this communication. Your account security remains intact unless the authorization link is utilized.</p>
          <div style="margin-top: 45px; border-top: 1px solid #e2e8f0; padding-top: 25px; font-size: 0.9em; color: #64748b;">
            Respectfully,<br/>
            <strong>Scholarly Support & Security Team</strong><br/>
            Pakistan Journal of Pharmaceutical Sciences
          </div>
        </div>
      `
    });

    return NextResponse.json({ message: "Recovery email dispatched successfully." });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Failed to dispatch recovery instructions." }, { status: 500 });
  }
}
