export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  FileText, Users, Download, Activity, 
  UserPlus, Layers, CheckCircle, ArrowRight,
  ClipboardList, BookOpen, BarChart3, TrendingUp,
  History, Globe, ShieldCheck, Mail
} from "lucide-react";

export default async function DashboardPage() {
  const [
    articleCount,
    userCount,
    pendingReviews,
    unassignedManuscripts,
    publishedIssues,
    totalVolumes,
    totalReviews
  ] = await Promise.all([
     prisma.article.count(),
     prisma.user.count(),
     prisma.review.count({ where: { status: "PENDING" } }),
     prisma.article.count({ where: { status: "SUBMITTED" } }),
     prisma.issue.count({ where: { isPublished: true } }),
     prisma.volume.count(),
     prisma.review.count({ where: { status: "COMPLETED" } })
  ]);

  // @ts-ignore
  const analytics = await prisma.analytics.findUnique({ where: { id: "global" } }) || { formattingCount: 0, totalExports: 0 };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
            <ShieldCheck size={14} /> Global Editorial Command Center
          </div>
          <h2 className="text-4xl font-serif text-slate-900 font-bold tracking-tight">Editorial Hub</h2>
          <p className="text-slate-500 font-medium mt-1">Institutional management overview for PJPS</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
             <Activity size={14} className="animate-pulse" /> Production Line Online
           </div>
        </div>
      </header>
      
      {/* Primary Analytics Grid: Lifetime Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Lifetime Submissions" 
          value={articleCount.toString()} 
          icon={<FileText className="text-blue-500" />} 
          subtitle="Cumulative scientific intake"
          trend="+12% vs last cycle"
        />
        <StatCard 
          title="Peer Reviews Completed" 
          value={totalReviews.toString()} 
          icon={<CheckCircle className="text-emerald-500" />} 
          subtitle="Validated expert feedback" 
          trend="High quality standard"
        />
        <StatCard 
          title="Global Registry" 
          value={userCount.toString()} 
          icon={<Users className="text-indigo-500" />} 
          subtitle="Authors, Editors & Reviewers" 
          trend="Expanding expert base"
        />
        <StatCard 
          title="Digital Circulation" 
          value={analytics.totalExports.toString()} 
          icon={<Download className="text-amber-500" />} 
          subtitle="Lifetime document exports" 
          trend="High scholarly impact"
        />
      </div>

      {/* Lifetime Deep Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-premium-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-blue-50 transition-colors">
            <BarChart3 size={120} strokeWidth={1} />
          </div>
          
          <div className="relative z-10">
            <h3 className="font-bold text-slate-900 text-lg mb-8 flex items-center gap-3">
              <TrendingUp size={24} className="text-blue-600" /> Lifetime System Analytics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                      <History size={18} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formatting Engine</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900 tracking-tight mb-2">{analytics.formattingCount}</div>
                  <p className="text-sm text-slate-500 leading-relaxed">Total manuscripts successfully processed through our public formatting infrastructure since inception.</p>
               </div>
               
               <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                      <Globe size={18} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Published Impact</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900 tracking-tight mb-2">{publishedIssues}</div>
                  <p className="text-sm text-slate-500 leading-relaxed">High-fidelity scholarly issues archived and distributed globally across {totalVolumes} volumes.</p>
               </div>
            </div>
            
            <div className="mt-10 p-6 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-500 italic">Connected to global scholarly databases</span>
               </div>
               <Link href="/admin/analytics" className="text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                 Full Analytics Report <ArrowRight size={14} />
               </Link>
            </div>
          </div>
        </div>

        {/* Action Priority Queue */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
             
             <h3 className="font-bold text-blue-400 text-[10px] uppercase tracking-[0.2em] mb-8 relative z-10">Editorial Priority Queue</h3>
             <div className="space-y-4 relative z-10">
               <PriorityAction 
                 href="/admin/articles" 
                 label="Assign Reviewers" 
                 count={unassignedManuscripts} 
                 icon={<UserPlus size={18} />}
               />
               <PriorityAction 
                 href="/admin/articles" 
                 label="Pending Decisions" 
                 count={pendingReviews} 
                 icon={<ClipboardList size={18} />}
               />
               <PriorityAction 
                 href="/admin/issues" 
                 label="Catalog Management" 
                 icon={<Layers size={18} />}
               />
             </div>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-blue-400 transition-all cursor-pointer">
             <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 mb-4 transition-all">
                <UserPlus size={24} />
             </div>
             <p className="font-bold text-slate-900 text-sm">Provision New Expert</p>
             <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Editor / Reviewer Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, trend }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-premium-sm hover:shadow-premium-md transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl shadow-sm border border-slate-100">{icon}</div>
        <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">{trend}</div>
      </div>
      <div className="text-4xl font-black text-slate-900 leading-tight tracking-tight mb-2">{value}</div>
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-xs text-slate-500 font-medium opacity-70">{subtitle}</p>
    </div>
  );
}

function PriorityAction({ href, label, count, icon }: any) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl transition-all border border-slate-700/30 group">
      <div className="flex items-center gap-4">
        <span className="text-slate-500 group-hover:text-blue-400 transition-colors">{icon}</span>
        <span className="text-sm font-bold tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {count !== undefined && count > 0 && (
          <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-blue-600/20">{count}</span>
        )}
        <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-opacity" />
      </div>
    </Link>
  );
}
