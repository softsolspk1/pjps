import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment download count
    const article = await prisma.article.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 }
      },
      include: {
        media: true
      }
    });

    // Audit Log the download
    // User context is optional for public downloads
    await logAction(
      "ARTICLE_UPDATE", // Using ARTICLE_UPDATE for download tally
      "ARTICLE",
      id,
      null, 
      { type: "PDF_DOWNLOAD" }
    );

    const pdfMedia = article.media.find(m => m.section === "MANUSCRIPT" || m.resourceType === "raw");
    
    if (!pdfMedia) {
      return NextResponse.json({ error: "Scholarly PDF not found" }, { status: 404 });
    }

    return NextResponse.redirect(pdfMedia.secureUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
