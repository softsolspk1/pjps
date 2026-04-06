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
        title: "Welcome to the Scholarly Registry",
        html: `
          <p>Dear <strong>${name}</strong>,</p>
          <p>Congratulations! Your scholarly account has been successfully registered with the <strong>Pakistan Journal of Pharmaceutical Sciences (PJPS)</strong> Academic Portal.</p>
          <p>You can now log in to your dashboard to submit your research manuscripts, track their progress, and participate in our academic community.</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #002d5e;">Registration Credentials:</p>
            <p style="margin: 5px 0; font-size: 13px;">Registered Email: ${email}</p>
            <p style="margin: 5px 0; font-size: 13px;">Affiliation: ${affiliation}</p>
            <p style="margin: 5px 0; font-size: 13px;">Authored Region: ${country || "Pakistan"}</p>
          </div>
          <p>To begin your submission journey, please access the professional portal via the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #002d5e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Access Author Portal</a>
          </div>
          <p>If you require technical assistance, please do not hesitate to contact our editorial support team.</p>
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
