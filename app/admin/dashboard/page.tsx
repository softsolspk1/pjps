import { prisma } from "../../../lib/prisma";

export default async function DashboardPage() {
  const articleCount = await prisma.article.count();
  const userCount = await prisma.user.count();

  return (
    <div>
      <h2 className="text-3xl font-serif text-slate-800 mb-6 font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Total Articles</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{articleCount}</p>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Registered Users</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{userCount}</p>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">System Status</h3>
          <p className="text-xl font-bold text-green-600 mt-2">Active</p>
        </div>

      </div>
    </div>
  );
}
