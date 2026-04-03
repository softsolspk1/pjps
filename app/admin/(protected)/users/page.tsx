import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminUsersList() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif text-slate-800 font-bold">User Management</h2>
        <Link href="/admin/users/create" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm">
          + Add New User
        </Link>
      </div>

      <div className="bg-white shadow-premium rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider">User details</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider">Role</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider">Joined Date</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-400 font-serif italic">
                  No users found in the academic registry.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-5">
                  <div className="font-semibold text-slate-900">{user.name || "Unnamed User"}</div>
                  <div className="text-sm text-slate-500 font-medium">{user.email}</div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                    user.role === "ADMIN" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                    user.role === "REVIEWER" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                    "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-5 text-sm text-slate-500 font-medium">
                  {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </td>
                <td className="p-5 text-right">
                  <button className="text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors mr-4">
                    Edit
                  </button>
                  <button className="text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
