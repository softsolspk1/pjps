export const dynamic = 'force-dynamic';
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminArticlesList() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { authors: true }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-serif text-slate-800 font-bold">Articles CMS</h2>
        <Link href="/admin/articles/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          + New Article
        </Link>
      </div>

      <div className="bg-white shadow rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-700">Title</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700">Date Added</th>
              <th className="p-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No articles found. Click "+ New Article" to create one.
                </td>
              </tr>
            )}
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-gray-100 hover:bg-slate-50 transition">
                <td className="p-4">
                  <div className="font-medium text-slate-800">{article.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-sm mt-1">
                    {article.authors.map(a => a.name).join(", ") || "No Authors"}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    article.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                    article.status === "SUBMITTED" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                    article.status === "IN_REVIEW" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {format(new Date(article.createdAt), "MMM dd, yyyy")}
                </td>
                <td className="p-4 space-x-3">
                  <Link href={`/admin/articles/${article.id}/edit`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                  {article.status === "SUBMITTED" && (
                    <Link href={`/admin/articles/${article.id}/assign`} className="text-amber-600 font-bold hover:underline">
                      Assign Reviewer
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
