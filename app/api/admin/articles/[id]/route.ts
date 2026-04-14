import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const allowedRoles = ["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR"];

    if (!session || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const article = await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Manuscript purged from registry." });
  } catch (err: any) {
    console.error("Article Delete API Error:", err);
    return NextResponse.json({ error: "Failed to purge manuscript entry" }, { status: 500 });
  }
}
