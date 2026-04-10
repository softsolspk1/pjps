"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileText, 
  ClipboardCheck, Globe, 
  LogOut, UserCircle, 
  PlusCircle, Search, 
  Bell, CheckCircle, 
  MessageSquare, BookOpen,
  ShieldCheck, Loader2
} from "lucide-react";
import { signOut } from "next-auth/react";

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
};

function SidebarLink({ href, icon, label, external }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link 
      href={href} 
      target={external ? "_blank" : undefined}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '14px 20px', 
        borderRadius: '12px', 
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: isActive ? '#0061ff' : 'transparent',
        color: isActive ? 'white' : '#718096',
        fontWeight: isActive ? 800 : 600,
        fontSize: '13px',
        position: 'relative'
      }}
    >
      <span style={{ color: isActive ? 'white' : '#a0aec0' }}>{icon}</span>
      <span>{label}</span>
      {isActive && (
        <div style={{ 
          position: 'absolute', 
          left: '0', 
          width: '4px', 
          height: '20px', 
          backgroundColor: 'white', 
          borderRadius: '0 4px 4px 0' 
        }} />
      )}
    </Link>
  );
}

export default function RoleSidebar({ role, userName }: { role: string, userName: string }) {
  return (
    <aside style={{ 
        width: '280px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #edf2f7', 
        display: 'flex', 
        flexDirection: 'column', 
        flexShrink: 0, 
        height: '100%', 
        position: 'relative', 
        zIndex: 100 
      }}>
        
        {/* Branding */}
        <div style={{ padding: '32px 32px 10px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: role === 'REVIEWER' ? '#10b981' : '#0061ff', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: 900, 
                fontSize: '20px' 
              }}>
                 {role === 'REVIEWER' ? 'R' : 'A'}
              </div>
              <div>
                <h1 style={{ fontSize: '15px', fontWeight: 900, color: '#1a202c', letterSpacing: '0.02em', textTransform: 'uppercase' }}>PJPS</h1>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {role === 'REVIEWER' ? 'Reviewer Portal' : 'Author Portal'}
                </div>
              </div>
           </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px' }}>
           <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ padding: '10px 20px 10px', fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Main Menu
              </div>
              
              {role === 'REVIEWER' ? (
                <>
                  <SidebarLink href="/reviewer/dashboard" icon={<LayoutDashboard size={18} />} label="Expert Dashboard" />
                  <SidebarLink href="/reviewer/articles" icon={<BookOpen size={18} />} label="Assigned Manuscripts" />
                  <SidebarLink href="/reviewer/invitations" icon={<Bell size={18} />} label="Pending Invitations" />
                </>
              ) : (
                <>
                <>
                  <SidebarLink href="/author/dashboard" icon={<LayoutDashboard size={18} />} label="Author Dashboard" />
                  <SidebarLink href="/author/submissions" icon={<FileText size={18} />} label="My Submissions" />
                  <SidebarLink href="/tracking" icon={<Search size={18} />} label="Track Manuscript" />
                  <SidebarLink href="/submission" icon={<PlusCircle size={18} />} label="New Submission" />
                </>
                </>
              )}

              <div style={{ padding: '20px 20px 10px', fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Account
              </div>
              <SidebarLink href="/profile" icon={<UserCircle size={18} />} label="Public Profile" />
              <SidebarLink href="/" icon={<Globe size={18} />} label="Back to PJPS" />
           </nav>
        </div>

        {/* Footer */}
        <div style={{ padding: '32px', borderTop: '1px solid #edf2f7' }}>
           <button 
             onClick={() => signOut({ callbackUrl: '/' })}
             style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '12px', 
               color: '#a0aec0', 
               fontWeight: 700, 
               fontSize: '11px', 
               textTransform: 'uppercase', 
               letterSpacing: '0.1em',
               background: 'none',
               border: 'none',
               cursor: 'pointer',
               width: '100%'
             }}
           >
              <LogOut size={18} /> Secure Logout
           </button>
        </div>
    </aside>
  );
}
