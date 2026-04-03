import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId, originality, quality, importance, comments, recommendation } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user || user.role !== "REVIEWER") {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    // Find the pending review
    const review = await prisma.review.findFirst({
      where: {
        articleId,
        reviewerId: user.id,
        status: "PENDING"
      }
    });

    if (!review) {
      return NextResponse.json({ error: "No pending review assignment found" }, { status: 404 });
    }

    // Update the review
    await prisma.review.update({
      where: { id: review.id },
      data: {
        originality,
        quality,
        importance,
        comments,
        recommendation,
        status: "COMPLETED"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
