import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_URL?.split('://')[1].split(':')[0],
  api_secret: process.env.CLOUDINARY_URL?.split(':')[2].split('@')[0],
});

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const abstract = formData.get("abstract") as string;
    const submissionType = formData.get("submissionType") as string || "REGULAR";
    const trackingType = formData.get("trackingType") as string || "REGULAR";
    const origin = formData.get("origin") as string || "PAKISTANI";
    const authorsJson = formData.get("authors") as string;
    const file = formData.get("file") as File;
    const paymentProof = formData.get("paymentProof") as File;

    if (!file || !title || !authorsJson || !paymentProof) {
      return NextResponse.json({ error: "Missing required scholarly fields" }, { status: 400 });
    }

    const authors = JSON.parse(authorsJson);

    // 1. Upload PDF to Cloudinary
    const manuscriptBuffer = Buffer.from(await file.arrayBuffer());
    const manuscriptUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "pjps_submissions" },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(manuscriptBuffer);
    }) as any;

    // 2. Upload Payment Proof to Cloudinary
    const paymentBuffer = Buffer.from(await paymentProof.arrayBuffer());
    const paymentUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "pjps_payments" },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(paymentBuffer);
    }) as any;

    // 3. Create Article and AuthorMapping
    const newArticle = await prisma.article.create({
      data: {
        title,
        abstract,
        submissionType,
        trackingType: trackingType as any,
        origin,
        paymentProofUrl: paymentUpload.secure_url,
        paymentStatus: "PENDING",
        status: "SUBMITTED",
        userId,
        authors: {
          create: authors.map((a: any, index: number) => ({
            name: a.name,
            email: a.email, // Contact details for individual author notification
            address: a.affiliation,
            sequence: index + 1,
          })),
        },
        media: {
          create: {
            publicId: manuscriptUpload.public_id,
            secureUrl: manuscriptUpload.secure_url,
            resourceType: "raw",
            section: "MANUSCRIPT",
          },
        },
      },
      include: {
        authors: true,
      },
    });

    // 4. Send Thank You Email
    try {
      const { sendEmail } = await import("@/lib/mail");
      await sendEmail({
        to: authors[0].email,
        subject: "PJPS Manuscript Submission Confirmation",
        html: `
          <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px;">
            <h1 style="border-bottom: 2px solid #002d5e; padding-bottom: 15px; margin-bottom: 25px;">Submission Received</h1>
            <p>Dear <strong>${authors[0].name}</strong>,</p>
            <p>Thank you for submitting your research titled "<strong>${title}</strong>" to the <strong>Pakistan Journal of Pharmaceutical Sciences (PJPS)</strong>.</p>
            <p>Your manuscript has been successfully cataloged and is now entering the editorial screening phase. Our editorial board will review the submission and the provided proof of payment.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 6px;">
              <p style="margin: 0; font-weight: bold;">Submission Details:</p>
              <p style="margin: 5px 0;">Reference ID: ${newArticle.id}</p>
              <p style="margin: 5px 0;">Track: ${trackingType}</p>
              <p style="margin: 5px 0;">Status: SUBMITTED (Review Pending)</p>
            </div>
            <p>You can track the live progress of your manuscript through the Online Submission Portal.</p>
            <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 0.9em; color: #64748b;">
              Best regards,<br/>
              <strong>The Editorial Office</strong><br/>
              Pakistan Journal of Pharmaceutical Sciences
            </p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send submission email:", emailErr);
    }

    return NextResponse.json({ success: true, articleId: newArticle.id });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit manuscript" }, { status: 500 });
  }
}
