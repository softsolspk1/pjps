import { prisma } from "@/lib/prisma";
import { 
  Users, UserPlus, Mail, Shield, 
  Trash2, Edit, Search, Filter,
  Building2, MoreVertical, ShieldCheck,
  FileText
} from "lucide-react";
import Link from "next/link";
import styles from "@/components/AdminTable.module.css";

export default async function UserRegistryPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { 
          reviewsGiven: true,
          articles: true
        }
      }
    }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
           <p>Human Resources & Faculty</p>
           <h1>Expert Directory</h1>
        </div>
        <div className={styles.actions}>
           <Link href="/admin/users/create" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0061ff', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', transition: 'all 0.2s ease' }}>
             <UserPlus size={16} /> Provision New Expert
           </Link>
        </div>
      </header>

      {/* Global Search & Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
         <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid #edf2f7', borderRadius: '12px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '12px', height: '54px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Search size={18} color="#a0aec0" />
            <input type="text" placeholder="Search experts by name, email or institutional affiliation..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 500, color: '#1a202c' }} />
         </div>
         <button style={{ backgroundColor: 'white', border: '1px solid #edf2f7', borderRadius: '12px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', color: '#718096', cursor: 'pointer' }}>
            <Filter size={16} /> Faculty Filters
         </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Expert Faculty Identity</th>
              <th>Institution & Mail</th>
              <th style={{ textAlign: 'center' }}>Lifetime Reviews</th>
              <th style={{ textAlign: 'center' }}>Cataloged Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', backgroundColor: '#f7fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0061ff', fontWeight: 900, fontSize: '16px', border: '1px solid #edf2f7', flexShrink: 0 }}>
                       {user.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#1a202c', fontSize: '14px' }}>{user.name}</div>
                      <div style={{ marginTop: '4px' }}>
                        <span className={`${styles.badge} ${
                          (user.role === 'ADMIN' || user.role === 'EDITOR_IN_CHIEF') ? styles.badgeError :
                          (user.role === 'ASSOCIATE_EDITOR' || user.role === 'EDITOR') ? styles.badgePending :
                          (user.role === 'FINANCE_ADMIN' || user.role === 'REVIEWER') ? styles.badgeInfo :
                          styles.badgeSuccess
                        }`}>
                          {user.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#4a5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <Building2 size={14} color="#a0aec0" />
                         {user.affiliation || "Independent Scholar"}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#a0aec0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <Mail size={14} />
                         {user.email}
                      </div>
                   </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                   <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', color: '#1a202c', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 900 }}>
                     {(user as any).role === 'REVIEWER' || (user as any).role === 'ASSOCIATE_EDITOR' ? (
                       <>
                         <ShieldCheck size={12} color="#0061ff" /> {(user as any)._count.reviewsGiven} Reviews
                       </>
                     ) : (
                       <>
                         <FileText size={12} color="#0061ff" /> {(user as any)._count.articles} Submissions
                       </>
                     )}
                   </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </td>
                 <td>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <Link href={`/admin/users/${user.id}/edit`} className={styles.actionBtn} title="Modify Expert Profile">
                         <Edit size={16} />
                      </Link>
                      <button className={styles.actionBtn} style={{ color: '#ef4444', borderColor: '#fee2e2' }} title="Revoke Registry Access">
                         <Trash2 size={16} />
                      </button>
                    </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>Showing {users.length} cataloged experts</div>
            <div className={styles.paginationBtns}>
               <button disabled className={styles.actionBtn} style={{ opacity: 0.5 }}>Previous</button>
               <button className={styles.actionBtn}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
