import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewReminder } from "@/lib/notifications";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));

    // Find reviews that are pending and due soon
    const reviews = await prisma.review.findMany({
      where: {
        status: { in: ["PENDING", "INVITED"] },
        dueDate: { not: null }
      }
    });

    const sent = [];

    for (const review of reviews) {
      if (!review.dueDate) continue;

      const due = new Date(review.dueDate);
      const diffMs = due.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // 48h Reminder logic
      if (diffHours > 0 && diffHours <= 48) {
         await sendReviewReminder(review.id, "48H");
         sent.push({ id: review.id, type: "48H" });
      } 
      // Deadline Reached logic
      else if (diffHours <= 0) {
         await sendReviewReminder(review.id, "DEADLINE");
         sent.push({ id: review.id, type: "DEADLINE" });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: reviews.length,
      sentCount: sent.length,
      details: sent 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
