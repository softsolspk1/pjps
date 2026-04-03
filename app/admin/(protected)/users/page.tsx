import { prisma } from "@/lib/prisma";
import { 
  Users, UserPlus, Mail, Shield, 
  Trash2, Edit, Search, Filter,
  CheckCircle, Clock, Zap, Building2,
  MoreVertical
} from "lucide-react";
import Link from "next/link";

export default async function UserRegistryPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { reviews: true }
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-200 shadow-premium-sm">
        <div>
          <h2 className="text-3xl font-serif text-slate-900 font-bold tracking-tight">Expert & User Registry</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Directory of all scholarly accounts across the lifecycle ecosystem</p>
        </div>
        <Link href="/admin/users/create" className="btn btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
          <UserPlus size={18} /> Provision New Expert
        </Link>
      </header>

      {/* Global Search & Filters */}
      <div className="flex gap-4 mb-2">
        <div className="flex-1 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Search by name, email or institution..." 
             className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-medium text-sm"
           />
        </div>
        <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest font-sans">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-premium-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name & Role</th>
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution & Email</th>
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reviews</th>
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cataloged On</th>
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-400 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                           user.role === 'ADMIN' ? 'bg-red-50 text-red-600' :
                           user.role === 'EDITOR' ? 'bg-amber-50 text-amber-600' :
                           user.role === 'REVIEWER' ? 'bg-blue-50 text-blue-600' :
                           'bg-slate-100 text-slate-500'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                         <Building2 size={14} className="text-slate-400" />
                         {user.affiliation || "Unspecified Institution"}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                         <Mail size={14} />
                         {user.email}
                      </div>
                   </div>
                </td>
                <td className="p-8 text-center font-black text-slate-900 tabular-nums">
                   <div className="bg-slate-100 inline-block px-3 py-1 rounded-full text-xs">
                     {user._count.reviews}
                   </div>
                </td>
                <td className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest tabular-nums">
                  {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-8 text-right pr-12">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <Edit size={16} />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-red-500 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <Trash2 size={16} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
