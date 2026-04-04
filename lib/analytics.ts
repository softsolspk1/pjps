import { prisma } from "./prisma";
import crypto from 'crypto';

export async function getAcceptanceRate() {
  const total = await prisma.article.count({
    where: {
      status: { not: "DRAFT" }
    }
  });

  if (total === 0) return 0;

  const accepted = await prisma.article.count({
    where: {
      status: { in: ["ACCEPTED", "PUBLISHED"] }
    }
  });

  return (accepted / total) * 100;
}

export async function getReviewVelocity() {
  const reviews = await prisma.review.findMany({
    where: {
      status: "COMPLETED"
    },
    select: {
      createdAt: true,
      updatedAt: true
    }
  });

  if (reviews.length === 0) return 0;

  const totalDiff = reviews.reduce((acc, rev) => {
    return acc + (rev.updatedAt.getTime() - rev.createdAt.getTime());
  }, 0);

  // Return average days
  return (totalDiff / reviews.length) / (1000 * 60 * 60 * 24);
}

export async function getMonthlySubmissionTrend() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const submissions = await prisma.article.groupBy({
    by: ['createdAt'],
    _count: {
      id: true
    },
    where: {
      createdAt: {
        gte: sixMonthsAgo
      }
    }
  });

  // Simple formatting for charts (grouping by month name)
  const monthMap: Record<string, number> = {};
  submissions.forEach(s => {
    const month = new Date(s.createdAt).toLocaleString('default', { month: 'short' });
    monthMap[month] = (monthMap[month] || 0) + s._count.id;
  });

  return Object.entries(monthMap).map(([name, count]) => ({ name, count }));
}

export async function recordPageView(path: string, ip?: string, userAgent?: string, userId?: string) {
  try {
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : null;

    await prisma.pageView.create({
      data: {
        path,
        ipHash,
        userAgent,
        userId
      }
    });

    // Simple count update in Analytics model
    await prisma.analytics.updateMany({
      where: { id: "global" },
      data: {
         totalPageViews: { increment: 1 }
      }
    });

    // Cleanup: Remove old page views (30-day retention)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await prisma.pageView.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } }
    });
  } catch (err) {
    console.error("Traffic logging error:", err);
  }
}
