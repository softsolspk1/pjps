export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  FileText, Users, Download, Activity, 
  UserPlus, Layers, CheckCircle, ArrowRight,
  ClipboardList, BookOpen
} from "lucide-react";

export default async function DashboardPage() {
  const [
    articleCount,
    userCount,
    pendingReviews,
    unassignedManuscripts,
    publishedIssues,
    totalVolumes
  ] = await Promise.all([
     prisma.article.count(),
     prisma.user.count(),
     prisma.review.count({ where: { status: "PENDING" } }),
     prisma.article.count({ where: { status: "SUBMITTED" } }),
     prisma.issue.count({ where: { isPublished: true } }),
     prisma.volume.count()
  ]);

  // @ts-ignore
  const analytics = await prisma.analytics.findUnique({ where: { id: "global" } }) || { formattingCount: 0, totalExports: 0 };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif text-slate-900 font-bold tracking-tight">Editorial Hub</h2>
          <p className="text-slate-500 font-medium mt-1">Management overview for Pakistan Journal of Pharmaceutical Sciences</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <Activity size={14} className="animate-pulse" /> System Online
        </div>
      </header>
      
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Articles" 
          value={articleCount.toString()} 
          icon={<FileText className="text-blue-500" />} 
          trend="Lifetime submissions" 
        />
        <StatCard 
          title="Active Reviews" 
          value={pendingReviews.toString()} 
          icon={<ClipboardList className="text-amber-500" />} 
          trend="Awaiting expert feedback" 
          highlight={pendingReviews > 0}
        />
        <StatCard 
          title="Registry" 
          value={userCount.toString()} 
          icon={<Users className="text-indigo-500" />} 
          trend="Authors & Experts" 
        />
        <StatCard 
          title="Published Issues" 
          value={publishedIssues.toString()} 
          icon={<BookOpen className="text-emerald-500" />} 
          trend={`Across ${totalVolumes} volumes`} 
        />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity size={16} className="text-blue-600" /> Platform Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-6 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Manuscripts Formatted</span>
                <div className="text-3xl font-black text-slate-900">{analytics.formattingCount}</div>
                <p className="text-xs text-slate-500 mt-2">Successful usage of public tools</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Knowledge Exported</span>
                <div className="text-3xl font-black text-slate-900">{analytics.totalExports}</div>
                <p className="text-xs text-slate-500 mt-2">Word & PDF version downloads</p>
             </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
           <h3 className="font-bold text-blue-400 text-xs uppercase tracking-widest mb-6">Editorial Actions</h3>
           <div className="space-y-3">
             <QuickActionLink 
               href="/admin/articles" 
               label="Assign Reviewers" 
               icon={<UserPlus size={16} />} 
               count={unassignedManuscripts} 
             />
             <QuickActionLink 
               href="/admin/issues" 
               label="Manage Catalog" 
               icon={<Layers size={16} />} 
             />
             <QuickActionLink 
               href="/admin/articles" 
               label="Review Decisions" 
               icon={<CheckCircle size={16} />} 
             />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, highlight }: any) {
  return (
    <div className={`bg-white p-6 rounded-3xl border transition-all hover:shadow-md ${highlight ? 'border-amber-200' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        {highlight && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Action Required</span>}
      </div>
      <div className="text-3xl font-black text-slate-900 leading-tight mb-1">{value}</div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
      <p className="text-[10px] text-slate-500 mt-3 border-t border-slate-50 pt-2">{trend}</p>
    </div>
  );
}

function QuickActionLink({ href, label, icon, count }: any) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all group">
      <div className="flex items-center gap-3">
        <span className="text-slate-400 group-hover:text-blue-400 transition-colors">{icon}</span>
        <span className="text-sm font-bold tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {count > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{count}</span>}
        <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-opacity" />
      </div>
    </Link>
  );
}
