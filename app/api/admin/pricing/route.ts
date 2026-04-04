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

    const data = await req.json();
    const { origin } = data;

    // Remove ID and Update timestamp to prevent Prisma errors
    delete data.id;
    delete data.updatedAt;

    const pricing = await prisma.pricing.upsert({
      where: { origin },
      update: data,
      create: data,
    });

    return NextResponse.json(pricing);
  } catch (err) {
    console.error("Update pricing error:", err);
    return NextResponse.json({ error: "Failed to update scholarly pricing" }, { status: 500 });
  }
}
