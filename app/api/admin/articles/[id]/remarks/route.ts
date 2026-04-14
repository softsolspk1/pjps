import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { remarks } = await req.json();

    const article = await prisma.article.update({
      where: { id },
      data: { editorialRemarks: remarks },
    });

    return NextResponse.json({ success: true, article });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
