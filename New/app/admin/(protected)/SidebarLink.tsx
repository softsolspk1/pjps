"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard/DashboardModern.module.css";

export default function SidebarLink({ href, icon, label, external }: any) {
  const pathname = usePathname();
  const isActive = pathname === href;

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
      className={isActive ? styles.sidebarActive : ''}
    >
      <span style={{ color: isActive ? 'white' : '#a0aec0' }}>{icon}</span>
      <span>{label}</span>
      {isActive && <div style={{ position: 'absolute', left: '0', width: '4px', height: '20px', backgroundColor: 'white', borderRadius: '0 4px 4px 0' }}></div>}
    </Link>
  );
}
