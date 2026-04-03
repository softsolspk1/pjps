import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_URL?.split('://')[1].split(':')[0],
  api_secret: process.env.CLOUDINARY_URL?.split(':')[2].split('@')[0],
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const abstract = formData.get("abstract") as string;
    const submissionType = formData.get("submissionType") as string || "REGULAR";
    const authorsJson = formData.get("authors") as string;
    const file = formData.get("file") as File;

    if (!file || !title || !authorsJson) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authors = JSON.parse(authorsJson);

    // 1. Upload PDF to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "pjps_submissions",
          public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`,
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    }) as any;

    // 2. Create Article and AuthorMapping in a transaction
    const newArticle = await prisma.article.create({
      data: {
        title,
        abstract,
        submissionType,
        status: "SUBMITTED",
        authors: {
          create: authors.map((a: any, index: number) => ({
            name: a.name,
            address: a.affiliation,
            sequence: index + 1,
          })),
        },
        media: {
          create: {
            publicId: uploadResponse.public_id,
            secureUrl: uploadResponse.secure_url,
            resourceType: "raw",
            section: "MANUSCRIPT",
          },
        },
      },
      include: {
        authors: true,
        media: true,
      },
    });

    return NextResponse.json({ success: true, articleId: newArticle.id });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit manuscript" }, { status: 500 });
  }
}
