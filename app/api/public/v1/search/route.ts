import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const author = searchParams.get("author") || "";
    const doi = searchParams.get("doi") || "";
    const year = searchParams.get("year");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: any = {
      status: "PUBLISHED"
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { abstract: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (author) {
      where.authors = {
        some: { name: { contains: author, mode: 'insensitive' } }
      };
    }

    if (doi) {
      where.doi = { contains: doi, mode: 'insensitive' };
    }

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      where.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          authors: { orderBy: { sequence: 'asc' } },
          issue: { include: { volume: true } }
        }
      }),
      prisma.article.count({ where })
    ]);

    return NextResponse.json({
      data: articles,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
