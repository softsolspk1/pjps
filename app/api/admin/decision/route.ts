import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId, status } = await req.json();

    if (!["ACCEPTED", "REJECTED", "REVISION", "IN_REVIEW"].includes(status)) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: { status }
    });

    return NextResponse.json(article);
  } catch (err) {
    console.error("Decision API Error:", err);
    return NextResponse.json({ error: "Failed to record scholarly decision" }, { status: 500 });
  }
}
