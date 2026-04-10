import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateJatsXml, generateSimpleJson } from "@/lib/jats";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        submitter: true,
        authors: { orderBy: { sequence: 'asc' } },
        issue: {
          include: { volume: true }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (format === "xml" || format === "jats") {
      const xml = generateJatsXml(article as any);
      return new Response(xml, {
        headers: {
          "Content-Type": "application/xml",
          "Content-Disposition": `attachment; filename="PJPS_${id}.xml"`
        }
      });
    }

    const json = generateSimpleJson(article as any);
    return new Response(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="PJPS_${id}.json"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
