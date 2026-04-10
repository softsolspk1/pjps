import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public REST API for Articles (v1)
 * Used by third-party indexers and academic partners
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");

    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        abstract: true,
        doi: true,
        createdAt: true,
        authors: {
          select: { name: true, sequence: true }
        },
        issue: {
          select: {
            number: true,
            month: true,
            volume: { select: { number: true, year: true } }
          }
        }
      }
    });

    const nextCursor = articles.length > 0 ? articles[articles.length - 1].id : null;

    return NextResponse.json({
      data: articles,
      pagination: {
        nextCursor,
        pageSize: articles.length
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: "INTERNAL_API_ERROR" }, { status: 500 });
  }
}
