import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { articleId, reviewerId } = await req.json();

    // Check if the assignment already exists
    const existingReview = await prisma.review.findFirst({
      where: { articleId, reviewerId }
    });

    if (existingReview) {
      return NextResponse.json({ error: "Reviewer already assigned to this article" }, { status: 400 });
    }

    // Create the review assignment
    const review = await prisma.review.create({
      data: {
        articleId,
        reviewerId,
        status: "PENDING",
        recommendation: "PENDING"
      }
    });

    // Update article status to IN_REVIEW if it was SUBMITTED
    await prisma.article.update({
      where: { id: articleId },
      data: { status: "IN_REVIEW" }
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Assignment execution error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute assignment" }, { status: 500 });
  }
}
