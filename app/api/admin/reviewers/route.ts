import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions) as any;

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reviewers = await prisma.user.findMany({
      where: { role: "REVIEWER" },
      select: {
        id: true,
        name: true,
        email: true,
        interests: true,
        affiliation: true,
      },
    });

    return NextResponse.json(reviewers);
  } catch (error) {
    console.error("Fetch reviewers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
