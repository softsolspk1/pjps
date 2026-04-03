import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, affiliation, country } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required scholarly details" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Scholarly identity already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        affiliation,
        country: country || "Pakistan",
        role: "AUTHOR",
      },
    });

    // Send Welcome Email
    try {
      const { sendEmail } = await import("@/lib/mail");
      await sendEmail({
        to: email,
        subject: "Welcome to PJPS Academic Portal",
        html: `
          <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
            <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">Welcome to PJPS</h1>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Congratulations! Your scholarly account has been successfully registered with the <strong>Pakistan Journal of Pharmaceutical Sciences (PJPS)</strong> Academic Portal.</p>
            <p>You can now log in to your dashboard to submit your research manuscripts, track their progress, and participate in our academic community.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 6px;">
              <p style="margin: 0; font-weight: bold;">User Details:</p>
              <p style="margin: 5px 0;">Email: ${email}</p>
              <p style="margin: 5px 0;">Affiliation: ${affiliation}</p>
            </div>
            <p>If you have any questions or require technical assistance, please do not hesitate to contact our editorial support team.</p>
            <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 0.9em; color: #64748b;">
              Best regards,<br/>
              <strong>Editorial IT Support Team</strong><br/>
              Pakistan Journal of Pharmaceutical Sciences
            </p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    return NextResponse.json({ 
      message: "Scholarly account registered successfully",
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Failed to register scholarly identity" }, { status: 500 });
  }
}
