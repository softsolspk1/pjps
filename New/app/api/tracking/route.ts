import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
