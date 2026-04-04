import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SidebarLink from "./SidebarLink";
import { 
  LayoutDashboard, FileText, Layers, 
  Users, LogOut, ShieldCheck, Inbox, 
  BarChart3, ClipboardCheck, UserPlus, 
  Bell, Search, Globe, UserCircle,
  DollarSign, CreditCard, Mail
} from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions) as any;

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#f7fafc', overflow: 'hidden', fontFamily: 'Inter, Outfit, sans-serif' }}>
      {/* Sidebar Component - Professional Institutional Isolation */}
      <aside style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', position: 'relative', zIndex: 100 }}>
        
        <div style={{ padding: '32px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#0061ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px', fontFamily: 'var(--font-serif)' }}>
                 P
              </div>
              <div>
                <h1 style={{ fontSize: '15px', fontWeight: 900, color: '#1a202c', letterSpacing: '0.02em', textTransform: 'uppercase' }}>PJPS</h1>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pakistan Journal of Pharmaceutical Sciences</div>
              </div>
           </div>

           <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {session.user.role !== "FINANCE_ADMIN" && (
                <>
                  <div style={{ padding: '20px 20px 10px', fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Journal Management</div>
                  <SidebarLink href="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="System Overview" />
                  <SidebarLink href="/admin/articles" icon={<Inbox size={18} />} label="Manuscripts" />
                  <SidebarLink href="/admin/reviews" icon={<ClipboardCheck size={18} />} label="Review Pool" />
                  <SidebarLink href="/admin/users" icon={<Users size={18} />} label="User Directory" />
                  <SidebarLink href="/admin/issues" icon={<Layers size={18} />} label="Issue Catalog" />
                </>
              )}
              
              <div style={{ padding: '20px 20px 10px', fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scholarly Finance</div>
              <SidebarLink href="/admin/payments" icon={<DollarSign size={18} />} label="Fee Verification" />
              <SidebarLink href="/admin/payments/reviewers" icon={<CreditCard size={18} />} label="Reviewer Rewards" />
              <SidebarLink href="/admin/pricing" icon={<CreditCard size={18} />} label="Global Pricing" />
              
              {session.user.role !== "FINANCE_ADMIN" && (
                <>
                  <div style={{ padding: '20px 20px 10px', fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Communication</div>
                  <SidebarLink href="/admin/messages" icon={<Mail size={18} />} label="Editorial Dispatch" />
                  
                  <div style={{ padding: '20px 20px 10px', fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System</div>
                  <SidebarLink href="/admin/analytics" icon={<BarChart3 size={18} />} label="Lifetime Reports" />
                </>
              )}
              <SidebarLink href="/" icon={<Globe size={18} />} label="Visit Portal" external />
           </nav>
        </div>

        <div style={{ marginTop: 'auto', padding: '32px', borderTop: '1px solid #edf2f7' }}>
           <Link href="/api/auth/signout" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a0aec0', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <LogOut size={18} /> System Logout
           </Link>
        </div>
      </aside>

      {/* Main Content Host */}
      <main style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
         {/* Top Navbar - Attachment 3 Fidelity */}
         <header style={{ height: '80px', backgroundColor: 'white', borderBottom: '1px solid #edf2f7', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f7fafc', padding: '10px 20px', borderRadius: '10px', width: '400px' }}>
               <Search size={18} color="#a0aec0" />
               <input type="text" placeholder="Search for manuscripts..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', fontWeight: 500, color: '#4a5568', width: '100%' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
               <div style={{ color: '#a0aec0', cursor: 'pointer', position: 'relative' }}>
                  <Bell size={20} />
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#e53e3e', borderRadius: '50%', border: '2px solid white' }}></div>
               </div>
               
               <div style={{ height: '30px', width: '1px', backgroundColor: '#edf2f7' }}></div>

               <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                  <div style={{ textAlign: 'right' }}>
                     <p style={{ fontSize: '13px', fontWeight: 800, color: '#1a202c', marginBottom: '2px' }}>{session.user.name}</p>
                     <p style={{ fontSize: '10px', fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{session.user.role?.replace('_', ' ') || 'Expert Admin'}</p>
                  </div>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#ebf4ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0061ff', fontWeight: 900 }}>
                     {session.user.name?.charAt(0)}
                  </div>
               </div>
            </div>
         </header>

         {/* Sub-route Content Container */}
         <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fcfdfe' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
               {children}
            </div>
         </div>
      </main>
    </div>
  );
}
