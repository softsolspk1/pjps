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
    const volumes = await prisma.volume.findMany({
      include: { issues: true },
      orderBy: { number: 'desc' }
    });
    return NextResponse.json(volumes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch volumes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as any;

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { number, year } = await req.json();
    const volume = await prisma.volume.create({
      data: { number: parseInt(number), year: parseInt(year) }
    });
    return NextResponse.json(volume);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create volume" }, { status: 500 });
  }
}
