"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface VerificationDocument {
  _id: string;
  ownerType: string;
  ownerName: string;
  documentName: string;
  documentUrl: string;
  status?: string;
  owner?: {
    _id: string;
    avatar?: string;
    fullName?: string;
    username?: string;
    email?: string;
    role?: string;
    phone?: string;
  };
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [document, setDocument] = useState<VerificationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocument() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch("http://localhost:5001/api/admin/verification-documents", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch document");
        const data = await res.json();
        const found = (Array.isArray(data) ? data : []).find((d: VerificationDocument) => d._id === id);
        setDocument(found || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch document");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDocument();
  }, [id]);

  async function handleStatusUpdate(newStatus: 'verified' | 'rejected') {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`http://localhost:5001/api/admin/verification-documents/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setActionSuccess(`Document ${newStatus === 'verified' ? 'verified' : 'rejected'} successfully.`);
      // Optionally update status in UI
      setDocument(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ marginBottom: 24, color: '#2563eb', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>&larr; Back</button>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>Document Details</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #2563eb11', padding: 32, minHeight: 200 }}>
        {loading ? (
          <div>Loading document...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : !document ? (
          <div style={{ color: '#888', fontSize: 18 }}>Document not found.</div>
        ) : (
          <>
            {document.owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
                {document.owner.avatar && (
                  <img src={document.owner.avatar} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', background: '#e0e7ef', border: '2px solid #2563eb' }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>{document.owner.fullName || document.owner.username || document.owner.email || 'Unknown'}</div>
                  {document.owner.username && <div style={{ color: '#2563eb', fontSize: 16 }}>@{document.owner.username}</div>}
                  {document.owner.email && <div style={{ color: '#444', fontSize: 16 }}>{document.owner.email}</div>}
                  {document.owner.role && <div style={{ color: '#888', fontSize: 15, marginTop: 2 }}>Role: {document.owner.role}</div>}
                  {document.owner.phone && <div style={{ color: '#888', fontSize: 15 }}>Phone: {document.owner.phone}</div>}
                </div>
              </div>
            )}
            <table style={{ width: '100%', fontSize: 17, borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ fontWeight: 700, padding: '10px 16px', width: 160 }}>Owner</td><td style={{ padding: '10px 16px' }}>{document.owner?.fullName || document.owner?.username || document.owner?.email || 'Unknown'}</td></tr>
                <tr><td style={{ fontWeight: 700, padding: '10px 16px' }}>Type</td><td style={{ padding: '10px 16px', textTransform: 'capitalize' }}>{document.ownerType}</td></tr>
                <tr><td style={{ fontWeight: 700, padding: '10px 16px' }}>Document</td><td style={{ padding: '10px 16px' }}>{document.documentName}</td></tr>
                <tr><td style={{ fontWeight: 700, padding: '10px 16px' }}>Status</td><td style={{ padding: '10px 16px' }}>{document.status || 'Pending'}</td></tr>
                <tr><td style={{ fontWeight: 700, padding: '10px 16px' }}>File</td><td style={{ padding: '10px 16px' }}><a href={document.documentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}>View Document</a></td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: 28, display: 'flex', gap: 18 }}>
              <button onClick={() => handleStatusUpdate('verified')} disabled={actionLoading} style={{ background: '#10b981', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 17, cursor: 'pointer', opacity: actionLoading ? 0.7 : 1 }}>Verify</button>
              <button onClick={() => handleStatusUpdate('rejected')} disabled={actionLoading} style={{ background: '#e00', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 17, cursor: 'pointer', opacity: actionLoading ? 0.7 : 1 }}>Reject</button>
            </div>
            {actionError && <div style={{ color: '#e00', marginTop: 16 }}>{actionError}</div>}
            {actionSuccess && <div style={{ color: '#10b981', marginTop: 16 }}>{actionSuccess}</div>}
          </>
        )}
      </div>
    </div>
  );
} 