import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Reference ID is required" }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
