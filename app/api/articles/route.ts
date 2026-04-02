import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.role || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const article = await prisma.article.create({
      data: {
        title: data.title,
        status: data.status,
        abstract: data.abstract,
        introduction: data.introduction,
        materialsMethods: data.materialsMethods,
        results: data.results,
        discussion: data.discussion,
        conclusion: data.conclusion,
        references: data.references,
        authors: {
          create: data.authors.map((a: any, idx: number) => ({
            name: a.name,
            address: a.address,
            sequence: idx
          }))
        }
      }
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Create Article Error", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
