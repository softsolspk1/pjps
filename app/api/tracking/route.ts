import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Reference ID is required" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        submissionType: true,
        abstract: true,
        // We can add more fields if needed by the UI
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Invalid Reference ID or manuscript not found in registry" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (err: any) {
    console.error("Tracking API Error:", err);
    return NextResponse.json({ error: "Internal server error during registry query" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    // Get IP and User Agent from headers
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await recordPageView(path, ip, userAgent, userId);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

