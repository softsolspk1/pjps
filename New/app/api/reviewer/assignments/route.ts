import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the current reviewer user in database by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user || user.role !== "REVIEWER") {
      return NextResponse.json({ error: "Reviewer profile not found" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      where: { reviewerId: user.id },
      include: {
        article: {
          include: { media: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("Assignments fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch assignments" }, { status: 500 });
  }
}
