export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const articleCount = await prisma.article.count();
  const userCount = await prisma.user.count();
  // @ts-ignore
  const analytics = await prisma.analytics.findUnique({ where: { id: "global" } }) || { formattingCount: 0, totalExports: 0 };

  return (
    <div>
      <h2 className="text-3xl font-serif text-slate-800 mb-6 font-bold">Editorial Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Articles</h3>
          <p className="text-4xl font-black text-blue-600 mt-2">{articleCount}</p>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Manuscripts Formatted</h3>
          <p className="text-4xl font-black text-slate-900 mt-2">{analytics.formattingCount}</p>
          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Public tool usage</span>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Exports</h3>
          <p className="text-4xl font-black text-slate-900 mt-2">{analytics.totalExports}</p>
          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Word & PDF downloads</span>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">System Status</h3>
          <p className="text-xl font-bold text-green-600 mt-2">Active</p>
        </div>

      </div>
    </div>
  );
}
