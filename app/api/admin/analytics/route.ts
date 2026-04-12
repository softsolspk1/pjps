import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  getAcceptanceRate, 
  getReviewVelocity, 
  getMonthlySubmissionTrend 
} from "@/lib/analytics";

export async function GET() {
  try {
    const [
      articleCount,
      userCount,
      publishedIssues,
      totalReviews,
      acceptanceRate,
      reviewVelocity,
      submissionTrend,
      statusDistribution,
      topViews
    ] = await Promise.all([
       prisma.article.count(),
       prisma.user.count(),
       prisma.issue.count({ where: { isPublished: true } }),
       prisma.review.count({ where: { status: "COMPLETED" } }),
       getAcceptanceRate(),
       getReviewVelocity(),
       getMonthlySubmissionTrend(),
       prisma.article.groupBy({
         by: ['status'],
         _count: { id: true }
       }),
       prisma.pageView.groupBy({
         by: ['path'],
         _count: { id: true },
         orderBy: { _count: { id: 'desc' } },
         take: 5
       })
    ]);

    return NextResponse.json({
      articleCount,
      userCount,
      publishedIssues,
      totalReviews,
      acceptanceRate: acceptanceRate.toFixed(1) + "%",
      reviewVelocity: reviewVelocity.toFixed(1) + " days",
      submissionTrend,
      topViews: topViews.map(v => ({ path: v.path, count: v._count.id }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
