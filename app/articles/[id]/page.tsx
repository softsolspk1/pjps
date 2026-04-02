import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArticleReaderPage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { authors: { orderBy: { sequence: 'asc' } }, media: true }
  });

  if (!article || article.status !== "PUBLISHED") {
    return notFound();
  }

  const sections = [
    { title: "Abstract", id: "abstract", content: article.abstract },
    { title: "Introduction", id: "introduction", content: article.introduction },
    { title: "Materials and Methods", id: "materials", content: article.materialsMethods },
    { title: "Results", id: "results", content: article.results },
    { title: "Discussion", id: "discussion", content: article.discussion },
    { title: "Conclusion", id: "conclusion", content: article.conclusion },
    { title: "References", id: "references", content: article.references },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
      </div>
      
      <header className="mb-8 border-b pb-6">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-snug">
          {article.title}
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          {article.authors.map(a => <span key={a.id} className="mr-3 inline-block"><strong>{a.name}</strong> <span className="text-sm">({a.address || 'Independent'})</span></span>)}
        </p>
        <div className="text-sm text-gray-500">
          Published: {new Date(article.createdAt).toLocaleDateString()}
        </div>
      </header>

      <article className="prose prose-lg max-w-none text-slate-800 space-y-12">
        {sections.filter(s => s.content).map(sec => (
          <section key={sec.id} id={sec.id} className="scroll-mt-24">
            <h2 className="text-2xl font-serif font-bold border-b border-gray-200 pb-2 mb-4 text-slate-900">
              {sec.title}
            </h2>
            <div dangerouslySetInnerHTML={{ __html: sec.content || '' }} />
          </section>
        ))}
      </article>

    </div>
  );
}
