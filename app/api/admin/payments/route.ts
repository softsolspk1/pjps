import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { status: "SUBMITTED" },
          { paymentStatus: { not: "UNPAID" } }
        ]
      },
      include: {
        authors: {
          orderBy: { sequence: 'asc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(articles);
  } catch (err) {
    console.error("Fetch payments error:", err);
    return NextResponse.json({ error: "Failed to fetch scholarly payments" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    const updated = await prisma.article.update({
      where: { id },
      data: { paymentStatus: status }
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update payment error:", err);
    return NextResponse.json({ error: "Failed to verify scholarly payment" }, { status: 500 });
  }
}
