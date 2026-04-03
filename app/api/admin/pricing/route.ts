import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const pricing = await prisma.pricing.findMany();
    return NextResponse.json(pricing);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { origin, regular, fast, ultraFast } = await req.json();

    const pricing = await prisma.pricing.upsert({
      where: { origin },
      update: { regular, fast, ultraFast },
      create: { origin, regular, fast, ultraFast },
    });

    return NextResponse.json(pricing);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 });
  }
}
