"use client";

import { ReactNode } from "react";
import RoleSidebar from "./RoleSidebar";
import { Bell, Search, UserCircle, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function RoleLayout({ children, role }: { children: ReactNode, role: 'AUTHOR' | 'REVIEWER' }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7fafc' }}>
        <p style={{ fontStyle: 'italic', fontWeight: 600, color: '#a0aec0' }}>Authenticating Scholarly Session...</p>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/login");
  }

  // Ensure user has the correct role (or admin)
  const userRole = (session.user as any).role;
  if (userRole !== role && userRole !== "ADMIN") {
    redirect("/");
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#f7fafc', overflow: 'hidden', fontFamily: 'Inter, Outfit, sans-serif' }}>
      
      {/* Sidebar */}
      <RoleSidebar role={role} userName={session.user.name || "Scholar"} />

      {/* Main Content */}
      <main style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header */}
        <header style={{ height: '80px', backgroundColor: 'white', borderBottom: '1px solid #edf2f7', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f7fafc', padding: '10px 20px', borderRadius: '10px', width: '400px' }}>
                <Search size={18} color="#a0aec0" />
                <input 
                  type="text" 
                  placeholder={role === 'REVIEWER' ? "Search manuscripts to review..." : "Search my submissions..."}
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', fontWeight: 500, color: '#4a5568', width: '100%' }} 
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div style={{ color: '#a0aec0', cursor: 'pointer', position: 'relative' }}>
                    <Bell size={20} />
                    {/* Notification dot */}
                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: role === 'REVIEWER' ? '#10b981' : '#0061ff', borderRadius: '50%', border: '2px solid white' }}></div>
                </div>
                
                <div style={{ height: '30px', width: '1px', backgroundColor: '#edf2f7' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: '#1a202c', marginBottom: '2px' }}>{session.user.name}</p>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Verified {role.toLowerCase()}
                        </p>
                    </div>
                    <div style={{ 
                        width: '40px', height: '40px', 
                        backgroundColor: role === 'REVIEWER' ? '#ecfdf5' : '#ebf4ff', 
                        borderRadius: '12px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: role === 'REVIEWER' ? '#10b981' : '#0061ff', 
                        fontWeight: 900 
                    }}>
                        {session.user.name?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>

        {/* Dynamic Route Content */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fcfdfe' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 180px)', padding: '40px' }}>
                {children}
            </div>

            {/* Footer */}
            <footer style={{ padding: '40px', borderTop: '1px solid #edf2f7', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#a0aec0', letterSpacing: '0.05em' }}>
                    © 2026 Pakistan Journal of Pharmaceutical Sciences. Developed by <a href="https://softsols.pk/" target="_blank" rel="noopener noreferrer" style={{ color: '#0061ff', textDecoration: 'none' }}>Softsols Pakistan</a>
                </p>
            </footer>
        </div>
      </main>
    </div>
  );
}
