import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
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
    const file = formData.get("file") as File | null;
    const paymentProof = formData.get("paymentProof") as File;
    const sectionsJson = formData.get("sections") as string;
    const sections = sectionsJson ? JSON.parse(sectionsJson) : [];
    const getSec = (id: string) => sections.find((s: any) => s.id === id)?.html || null;
    const parentId = formData.get("parentId") as string | null;

    const authors = JSON.parse(authorsJson);

    // 1. Generate Custom Tracking ID: ON-Month-unique number-year
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    
    // Find the current sequence for this month/year
    const prefix = `ON-${month}`;
    const yearSuffix = `-${year}`;
    
    const lastArticle = await prisma.article.findFirst({
      where: {
        trackingId: {
          startsWith: prefix,
          endsWith: yearSuffix
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let sequence = 1;
    if (lastArticle?.trackingId) {
      // Extract the sequence number from ON-MM-XXX-YYYY
      const parts = lastArticle.trackingId.split('-');
      if (parts.length === 4) {
        sequence = parseInt(parts[2]) + 1;
      }
    }
    
    const trackingId = `ON-${month}-${sequence.toString().padStart(3, '0')}-${year}`;

    // 2. Upload manuscript (PDF/DOCX/LaTeX) to Cloudinary
    let manuscriptUpload: any = { secure_url: null, public_id: null };
    if (file && file.size > 0) {
      const manuscriptBuffer = Buffer.from(await file.arrayBuffer());
      manuscriptUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "pjps_submissions" },
          (error, result) => error ? reject(error) : resolve(result)
        ).end(manuscriptBuffer);
      });
    }

    // 3. Upload Payment Proof to Cloudinary (Optional now)
    let paymentUpload = { secure_url: null };
    if (paymentProof && paymentProof.size > 10) { // Check if it's not a dummy
      const paymentBuffer = Buffer.from(await paymentProof.arrayBuffer());
      paymentUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "pjps_payments" },
          (error, result) => error ? reject(error) : resolve(result)
        ).end(paymentBuffer);
      }) as any;
    }

    // 4. Process Extra Files (Figures and Supplementary)
    const extraMedia: any[] = [];
    
    // Add primary manuscript if uploaded
    if (manuscriptUpload.secure_url) {
      extraMedia.push({
        publicId: manuscriptUpload.public_id,
        secureUrl: manuscriptUpload.secure_url,
        resourceType: "raw",
        section: "MANUSCRIPT",
        version: parentId ? parseInt(formData.get("version") as string || "2") : 1,
      });
    }

    // Handle Figures
    const figureKeys = Array.from(formData.keys()).filter(key => key.startsWith('figure_'));
    for (const key of figureKeys) {
       const f = formData.get(key) as File;
       const buf = Buffer.from(await f.arrayBuffer());
       const upload = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "pjps_figures" },
            (error, result) => error ? reject(error) : resolve(result)
          ).end(buf);
       }) as any;
       extraMedia.push({
          publicId: upload.public_id,
          secureUrl: upload.secure_url,
          resourceType: "image",
          section: "FIGURE",
          version: 1
       });
    }

    // Handle Supplementary
    const suppKeys = Array.from(formData.keys()).filter(key => key.startsWith('supplementary_'));
    for (const key of suppKeys) {
       const f = formData.get(key) as File;
       const buf = Buffer.from(await f.arrayBuffer());
       const upload = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "raw", folder: "pjps_supplementary" },
            (error, result) => error ? reject(error) : resolve(result)
          ).end(buf);
       }) as any;
       extraMedia.push({
          publicId: upload.public_id,
          secureUrl: upload.secure_url,
          resourceType: "raw",
          section: "SUPPLEMENTARY",
          version: 1
       });
    }

    // 5. Create Article with Versioning & Status
    const newArticle = await prisma.article.create({
      data: {
        title,
        abstract,
        introduction: getSec('introduction'),
        materialsMethods: getSec('methods'),
        results: getSec('results'),
        discussion: getSec('discussion'),
        conclusion: getSec('conclusion'),
        references: getSec('references'),
        submissionType,
        trackingId,
        submissionTrack: submissionType,
        trackingType: trackingType as any,
        origin,
        paymentProofUrl: paymentUpload.secure_url,
        paymentStatus: paymentUpload.secure_url ? "PENDING" : "WAIVED", // Assuming waived if not provided
        status: "SCREENING",
        userId,
        parentId: parentId || null,
        version: parentId ? parseInt(formData.get("version") as string || "2") : 1,
        authors: {
          create: authors.map((a: any, index: number) => ({
            name: a.name,
            email: a.email,
            address: a.affiliation,
            sequence: index + 1,
          })),
        },
        media: {
          create: extraMedia,
        },
      } as any,
      include: {
        authors: true,
      },
    });

    // 6. Audit Log the Submission
    await logAction(
      "ARTICLE_SUBMITTED",
      "ARTICLE",
      newArticle.id,
      userId
    );


    // 5. Send Professional Notifications
    try {
      const { sendEmail } = await import("@/lib/mail");
      
      // Notify Author
      await sendEmail({
        to: authors[0].email,
        subject: "PJPS Manuscript Submission Confirmation",
        title: "Manuscript Registry Confirmation",
        html: `
          <p>Dear <strong>${authors[0].name}</strong>,</p>
          <p>Thank you for submitting your research titled "<strong>${title}</strong>" to the <strong>Pakistan Journal of Pharmaceutical Sciences (PJPS)</strong>.</p>
          <p>Your manuscript has been successfully cataloged and is now entering the editorial screening phase.</p>
          <div style="margin: 30px 0; padding: 25px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <p style="margin: 0; font-weight: bold; color: #002d5e; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; margin-bottom: 15px;">Submission Details:</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Reference ID:</strong> ${newArticle.trackingId || newArticle.id}</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Tracking Type:</strong> ${trackingType}</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Current Status:</strong> SCREENING</p>
             <p style="margin: 5px 0; font-size: 13px;"><strong>Date Logged:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>You can track the live progress of your manuscript through the Online Submission Portal using your account credentials.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/author/dashboard" style="background-color: #002d5e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Track Submission Progress</a>
          </div>
        `
      });

      // Notify Editor (SMTP_USER)
      const isRevision = !!parentId;
      await sendEmail({
        to: process.env.SMTP_USER!,
        subject: isRevision ? `[REVISION] Manuscript Revision Received - ${newArticle.id.slice(-6).toUpperCase()} - PJPS` : "New Manuscript Submission Alert - PJPS",
        title: isRevision ? "Scientific Revision Logged" : "New Submission in Registry",
        html: `
          <p>${isRevision ? "A revised manuscript (v" + newArticle.version + ") has been submitted to the PJPS portal." : "A new manuscript has been submitted to the PJPS portal and requires editorial attention."}</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #fcfdfe; border-left: 4px solid ${isRevision ? '#d97706' : '#002d5e'};">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">${title}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #64748b;">Submitted by: ${authors[0].name} (${authors[0].email})</p>
            <p style="margin: 5px 0; font-size: 12px; color: #64748b;">ID: ${newArticle.id}</p>
            ${isRevision ? `<p style="margin: 5px 0; font-size: 12px; color: #d97706; font-weight: bold;">CYCLE: v${newArticle.version}</p>` : ''}
          </div>
          <p>Please log in to the Administrative Dashboard to begin the ${isRevision ? 'reevaluation' : 'screening'} process.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/articles/${newArticle.id}" style="background-color: #0f172a; color: #ffffff; padding: 10px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 12px; text-transform: uppercase;">Review Submission</a>
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
