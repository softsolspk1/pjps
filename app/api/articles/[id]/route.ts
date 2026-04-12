import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        submitter: {
          select: { name: true, email: true }
        },
        authors: true,
        media: true,
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Fetch Article Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
