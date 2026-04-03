import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, FileText, Layers, 
  Users, LogOut, ExternalLink, Settings,
  ShieldCheck, Inbox, BarChart3, ClipboardCheck,
  UserPlus, Mail, ChevronRight
} from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions) as any;

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* PROFESSIONAL SIDEBAR */}
      <aside className="w-80 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl relative z-30">
        <div className="p-10 border-b border-slate-800/60">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-serif font-black text-2xl text-white shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10">
               P
             </div>
             <div>
               <h1 className="text-xl font-serif font-black tracking-tight text-white">PJPS Admin</h1>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Management Portal</div>
             </div>
          </div>
          
          <div className="bg-slate-800/30 rounded-2xl p-5 flex items-center gap-4 border border-slate-700/30 ring-1 ring-white/5">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center font-black text-slate-200 shadow-inner">
              {session.user.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-100 truncate tracking-tight">{session.user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{session.user.role}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {/* EDITORIAL MODULES */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4">Editorial Command</h3>
            <div className="space-y-1">
              <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Command Center" />
              <NavItem href="/admin/articles" icon={<Inbox size={18} />} label="Manuscript Registry" />
              <NavItem href="/admin/reviews" icon={<ClipboardCheck size={18} />} label="Peer Review Hub" />
            </div>
          </div>

          {/* MASTER REGISTRY */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4">Scholarly Registry</h3>
            <div className="space-y-1">
              <NavItem href="/admin/issues" icon={<Layers size={18} />} label="Volumes & Issues" />
              <NavItem href="/admin/users" icon={<Users size={18} />} label="Expert Directory" />
              <NavItem href="/admin/users/create" icon={<UserPlus size={18} />} label="Account Provisioning" />
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4">Decision Insights</h3>
            <div className="space-y-1">
              <NavItem href="/admin/analytics" icon={<BarChart3 size={18} />} label="Lifetime Analytics" />
            </div>
          </div>

          {/* UTILITIES */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4">System Utilities</h3>
            <div className="space-y-1">
              <NavItem href="/" icon={<ExternalLink size={18} />} label="Public Journal" external />
            </div>
          </div>
        </nav>

        <div className="p-8 border-t border-slate-800/80 bg-slate-950/20">
          <Link 
            href="/api/auth/signout" 
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest ring-1 ring-red-500/20 group"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
            De-authorize Session
          </Link>
        </div>
      </aside>

      {/* VIEWPORT CONTENT AREA */}
      <main className="flex-1 overflow-y-auto flex flex-col relative bg-[#f1f5f9]">
        {/* EDITORIAL TOP BAR */}
        <div className="h-20 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center px-12 justify-between backdrop-blur-md bg-white/80">
           <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={18} className="text-blue-600" />
              <span className="text-slate-900">Institutional</span> 
              <span className="opacity-40">|</span> 
              Editorial Production System
           </div>
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all">
                <Mail size={16} /> Notifications
              </div>
              <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                v2.1.0 Stable
              </div>
           </div>
        </div>

        {/* PAGE CONTENT CONTAINER */}
        <div className="p-12 max-w-[1600px] w-full mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, external }: any) {
  return (
    <Link 
      href={href} 
      target={external ? "_blank" : undefined}
      className={`flex items-center justify-between px-5 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group`}
    >
      <div className="flex items-center gap-4">
        <span className="text-slate-500 group-hover:text-blue-400 transition-colors">{icon}</span>
        <span className="text-[13px] font-bold tracking-tight">{label}</span>
      </div>
      <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity -translate-x-2 group-hover:translate-x-0 group-hover:block hidden" />
    </Link>
  );
}
