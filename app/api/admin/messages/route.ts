import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const recipientFilter = formData.get("recipientFilter") as string;
    const specificEmail = formData.get("specificEmail") as string;
    const files = formData.getAll("files") as File[];

    if (!subject || !message) {
      return NextResponse.json({ error: "Missing scholarly subject or message content" }, { status: 400 });
    }

    // Prepare attachments
    const attachments = await Promise.all(files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        filename: file.name,
        content: buffer
      };
    }));

    let users: any[] = [];

    if (recipientFilter === "ALL") {
      users = await prisma.user.findMany({ select: { email: true, name: true } });
    } else if (recipientFilter === "AUTHORS") {
      users = await prisma.user.findMany({ where: { role: "AUTHOR" }, select: { email: true, name: true } });
    } else if (recipientFilter === "REVIEWERS") {
      users = await prisma.user.findMany({ where: { role: "REVIEWER" }, select: { email: true, name: true } });
    } else if (recipientFilter === "SPECIFIC") {
      users = [{ email: specificEmail, name: "Scholarly Participant" }];
    }

    // Send emails (In a real app, this should be a background task)
    const results = await Promise.all(
      users.map((u) => 
        sendEmail({
          to: u.email,
          subject,
          html: `
            <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
              <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">PJPS Official Communication</h1>
              <p>Dear <strong>${u.name || "Scholarly Participant"}</strong>,</p>
              <div style="padding: 20px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #002d5e; margin: 25px 0;">
                ${message.replace(/\n/g, '<br/>')}
              </div>
              <p style="font-size: 0.9em; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px;">
                Respectfully,<br/>
                <strong>The PJPS Editorial Board</strong><br/>
                Pakistan Journal of Pharmaceutical Sciences
              </p>
            </div>
          `,
          attachments: attachments
        })
      )
    );

    return NextResponse.json({ 
      message: `Successfully dispatched ${results.filter(r => r.success).length} scholarly messages out of ${users.length}.`
    });
  } catch (err) {
    console.error("Messaging error:", err);
    return NextResponse.json({ error: "Failed to dispatch scholarly communications" }, { status: 500 });
  }
}
