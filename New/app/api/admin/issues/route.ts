import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as any;

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { volumeId, number, month } = await req.json();
    const issue = await prisma.issue.create({
      data: { volumeId, number: parseInt(number), month }
    });
    return NextResponse.json(issue);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create issue" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions) as any;

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, isPublished, isContinuous } = await req.json();
    const issue = await prisma.issue.update({
      where: { id },
      data: { isPublished, isContinuous }
    });
    return NextResponse.json(issue);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update issue" }, { status: 500 });
  }
}
