import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { reviewerId } = await req.json();

    if (!reviewerId) {
      return NextResponse.json({ error: "Missing reviewerId" }, { status: 400 });
    }

    // 1. Create the Pending Review
    // We use a transaction to ensure both article and review are updated
    await prisma.$transaction([
      prisma.review.create({
        data: {
          articleId: id,
          reviewerId: reviewerId,
          status: "PENDING",
        }
      }),
      prisma.article.update({
        where: { id: id },
        data: { status: "IN_REVIEW" }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Assignment error:", error);
    return NextResponse.json({ error: error.message || "Failed to assign reviewer" }, { status: 500 });
  }
}
