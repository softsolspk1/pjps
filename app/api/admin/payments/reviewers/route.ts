import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "FINANCE_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        reviewer: {
          select: { name: true, email: true }
        },
        article: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reviews);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch expert disbursements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EDITOR_IN_CHIEF", "FINANCE_ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, amount, reference } = await req.json();

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        paymentStatus: "PAID",
        paymentAmount: amount,
        paymentRef: reference
      }
    });

    return NextResponse.json(review);
  } catch (err) {
    return NextResponse.json({ error: "Failed to record expert disbursement" }, { status: 500 });
  }
}
