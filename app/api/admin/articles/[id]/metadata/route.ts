import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAction } from "@/lib/audit";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { doi, submissionTrack } = await req.json();

    const data: any = {};
    if (doi !== undefined) data.doi = doi;
    if (submissionTrack !== undefined) data.submissionTrack = submissionTrack;

    const article = await prisma.article.update({
      where: { id },
      data
    });

    // Audit the action
    if (doi) {
      await logAction("DOI_ASSIGNED", "ARTICLE", id, (session.user as any).id, { doi });
    }
    if (submissionTrack) {
      await logAction("TRACK_CHANGED", "ARTICLE", id, (session.user as any).id, { submissionTrack });
    }


    return NextResponse.json(article);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
