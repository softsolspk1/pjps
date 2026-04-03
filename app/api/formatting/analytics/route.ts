import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { type } = await req.json();

    const updateData: any = {};
    if (type === "FORMAT") updateData.formattingCount = { increment: 1 };
    if (type === "EXPORT") updateData.totalExports = { increment: 1 };

    // @ts-ignore
    const analytics = await prisma.analytics.upsert({
      where: { id: "global" },
      update: updateData,
      create: {
        id: "global",
        formattingCount: type === "FORMAT" ? 1 : 0,
        totalExports: type === "EXPORT" ? 1 : 0,
      },
    });

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to log analytics" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // @ts-ignore
    const analytics = await prisma.analytics.findUnique({
      where: { id: "global" }
    });
    return NextResponse.json(analytics || { formattingCount: 0, totalExports: 0 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
