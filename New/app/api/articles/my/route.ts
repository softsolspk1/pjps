import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { userId: userId },
          { authors: { some: { email: session.user.email! } } }
        ]
      },
      include: {
        issue: true,
        authors: true,
        media: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error("My Submissions fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch your manuscripts" }, { status: 500 });
  }
}
