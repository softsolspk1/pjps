import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, FileText, Layers, 
  Users, LogOut, ExternalLink, Settings,
  ShieldCheck, Inbox
} from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions) as any;

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-blue-500/20">
               P
             </div>
             <div>
               <h1 className="text-lg font-serif font-bold tracking-tight">PJPS Portal</h1>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Editorial Admin</div>
             </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3 border border-slate-700/30">
            <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center text-xs font-bold uppercase">
              {session.user.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{session.user.name}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{session.user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Group */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Editorial</h3>
            <div className="space-y-1">
              <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Command Center" />
              <NavItem href="/admin/articles" icon={<Inbox size={18} />} label="Manuscript Registry" />
            </div>
          </div>

          {/* Catalog Group */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Registry</h3>
            <div className="space-y-1">
              <NavItem href="/admin/issues" icon={<Layers size={18} />} label="Volumes & Issues" />
              <NavItem href="/admin/users" icon={<Users size={18} />} label="Expert Directory" />
            </div>
          </div>

          {/* External Group */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Public Tools</h3>
            <div className="space-y-1">
              <NavItem href="/" icon={<ExternalLink size={18} />} label="View Journal Site" external />
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <Link 
            href="/api/auth/signout" 
            className="flex items-center gap-3 w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest group"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
            Sign Out Session
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        {/* Top Header Bar (Optional, for secondary navigation/search) */}
        <div className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center px-10 justify-between">
           <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={16} className="text-blue-500" />
              Secure Editorial Environment
           </div>
           <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              v2.0.0 Stable
           </div>
        </div>

        <div className="p-10 max-w-7xl mx-auto w-full">
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
      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
    >
      <span className="text-slate-500 group-hover:text-blue-400 transition-colors">{icon}</span>
      <span className="text-xs font-bold tracking-wide">{label}</span>
      {external && <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-40" />}
    </Link>
  );
}

function ChevronRight({ size, className }: any) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
