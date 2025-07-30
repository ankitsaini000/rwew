"use client";
import React, { useEffect, useState } from "react";

export default function ApplicantsSection({ promotionId }: { promotionId: string }) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplicants() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`http://localhost:5001/api/promotion-applications/promotion/${promotionId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch applicants');
        const data = await res.json();
        setApplicants(data.data || []);
      } catch (e: any) {
        setError(e.message || 'Error fetching applicants');
      } finally {
        setLoading(false);
      }
    }
    fetchApplicants();
  }, [promotionId]);

  if (loading) return <div>Loading applicants...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!applicants.length) return <div>No applicants for this promotion.</div>;

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Applicants</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {applicants.map((app: any) => (
          <div key={app._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fafbfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              {app.creatorId?.avatar && (
                <img src={app.creatorId.avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{app.creatorId?.fullName || '-'}</div>
                <div style={{ color: '#6b7280' }}>@{app.creatorId?.username || '-'}</div>
              </div>
            </div>
            <div><b>Message:</b> {app.message || '-'}</div>
            <div><b>Proposed Rate:</b> {app.proposedRate || '-'}</div>
            <div><b>Availability:</b> {app.availability || '-'}</div>
            <div><b>Deliverables:</b> {Array.isArray(app.deliverables) ? app.deliverables.join(', ') : '-'}</div>
            <div><b>Portfolio:</b> {app.portfolio || '-'}</div>
            <div><b>Status:</b> {app.status || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 