import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, FileText, Layers, 
  Users, LogOut, ShieldCheck, Inbox, 
  BarChart3, ClipboardCheck, UserPlus, 
  Bell, Settings, Search, Globe, UserCircle 
} from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions) as any;

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* 1. Sidebar Component - Fixed on Left */}
      <aside className="w-72 bg-slate-900 flex flex-col shrink-0 h-full border-r border-slate-800 relative z-30">
        <div className="p-8 border-b border-slate-800 mb-6">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-serif font-black text-white text-xl shadow-lg shadow-blue-600/30">
                 P
              </div>
              <div>
                <h1 className="text-white font-serif font-bold text-lg tracking-tight">PJPS Editorial</h1>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Institutional Admin</div>
              </div>
           </div>

           <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-xs font-black uppercase text-slate-200">
                {session.user.name?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-100 truncate">{session.user.name}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{session.user.role}</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-9 custom-scrollbar">
           {/* Section 1: Operations */}
           <div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-4">Editorial Core</span>
              <div className="space-y-1">
                 <SidebarItem href="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Command Center" />
                 <SidebarItem href="/admin/articles" icon={<Inbox size={18} />} label="Manuscript Registry" />
                 <SidebarItem href="/admin/reviews" icon={<ClipboardCheck size={18} />} label="Review Lifecycle" />
              </div>
           </div>

           {/* Section 2: Management */}
           <div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-4">Registry Control</span>
              <div className="space-y-1">
                 <SidebarItem href="/admin/issues" icon={<Layers size={18} />} label="Issue Catalog" />
                 <SidebarItem href="/admin/users" icon={<Users size={18} />} label="Expert Directory" />
                 <SidebarItem href="/admin/users/create" icon={<UserPlus size={18} />} label="Account Provision" />
              </div>
           </div>

           {/* Section 3: Intelligence */}
           <div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-4">Deep Insight</span>
              <div className="space-y-1">
                 <SidebarItem href="/admin/analytics" icon={<BarChart3 size={18} />} label="Lifetime Analytics" />
              </div>
           </div>

           {/* Section 4: External */}
           <div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 block ml-4">Global Site</span>
              <div className="space-y-1">
                 <SidebarItem href="/" icon={<Globe size={18} />} label="View Live Journal" external />
              </div>
           </div>
        </nav>

        <div className="p-6 border-t border-slate-800 mt-auto">
           <Link href="/api/auth/signout" className="flex items-center gap-3 w-full px-5 py-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest group">
              <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
              Terminate Session
           </Link>
        </div>
      </aside>

      {/* 2. Main Content Host - Scrollable independently */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
         {/* Internal Dashboard Header - Separate from Site Header */}
         <header className="h-20 shrink-0 bg-white border-b border-slate-200 px-12 flex items-center justify-between z-20 sticky top-0 shadow-sm">
            <div className="flex items-center gap-4">
               <ShieldCheck size={20} className="text-blue-600" />
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Editorial Management System v2.1</h2>
            </div>
            
            <div className="flex items-center gap-8">
               <div className="relative group cursor-pointer text-slate-400 hover:text-slate-900 transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
               </div>
               <div className="w-px h-6 bg-slate-200" />
               <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="text-right">
                     <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{session.user.name}</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Administrator</p>
                  </div>
                  <UserCircle size={32} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
               </div>
            </div>
         </header>

         {/* 3. Sub-route Content Container */}
         <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
               {children}
            </div>
         </div>
      </main>
    </div>
  );
}

function SidebarItem({ href, icon, label, external }: any) {
  return (
    <Link 
      href={href} 
      target={external ? "_blank" : undefined}
      className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group font-medium"
    >
      <span className="text-slate-500 group-hover:text-blue-500 transition-colors">{icon}</span>
      <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
    </Link>
  );
}
