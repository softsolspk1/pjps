"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
}

export default function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Success
        setShowConfirm(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Deletion failed.");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
        <div style={{ backgroundColor: 'white', maxWidth: '450px', width: '100%', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#ef4444' }}>
             <AlertTriangle size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '12px' }}>Purge Expert Identity?</h3>
          <p style={{ color: '#64748b', textAlign: 'center', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
            Warning: This will permanently delete <strong>{userName}</strong> and ALL associated manuscripts, reviews, and faculty records. This action is irreversible.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button 
               onClick={() => setShowConfirm(false)}
               disabled={isDeleting}
               style={{ flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer' }}
             >
               Abort
             </button>
             <button 
               onClick={handleDelete}
               disabled={isDeleting}
               style={{ flex: 1, padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
             >
               {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={16} /> Confirm Purge</>}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button 
      className="action-btn-delete"
      style={{ 
        width: '36px', 
        height: '36px', 
        borderRadius: '10px', 
        border: '1px solid #fee2e2', 
        backgroundColor: 'white', 
        color: '#ef4444', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      title="Purge Expert Profile"
      onClick={() => setShowConfirm(true)}
    >
       <Trash2 size={16} />
    </button>
  );
}
