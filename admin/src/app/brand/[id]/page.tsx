"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Brand {
  _id: string;
  name: string;
  username?: string;
  email?: string;
  contactInfo?: { email?: string };
  profileImage?: string;
  status?: string;
  createdAt?: string;
  userId?: string;
  [key: string]: any;
}

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [reactivateError, setReactivateError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrand() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5001/api/brand-profiles/all`);
        if (!res.ok) throw new Error("Failed to fetch brands");
        const data = await res.json();
        const found = (data.data || []).find((b: Brand) => b._id === id);
        setBrand(found || null);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    async function fetchUser() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5001/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
      } catch {}
    }
    if (id) fetchBrand();
    fetchUser();
  }, [id]);

  async function handleDeactivate() {
    if (!brand) return;
    setDeactivateLoading(true);
    setDeactivateError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/brand-profiles/${brand._id}/deactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to deactivate brand');
      router.push('/brand');
    } catch (err: any) {
      setDeactivateError(err.message || 'Failed to deactivate brand');
    } finally {
      setDeactivateLoading(false);
    }
  }

  async function handleReactivate() {
    if (!brand) return;
    setReactivateLoading(true);
    setReactivateError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/brand-profiles/${brand._id}/reactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to reactivate brand');
      router.push('/brand');
    } catch (err: any) {
      setReactivateError(err.message || 'Failed to reactivate brand');
    } finally {
      setReactivateLoading(false);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading brand...</div>;
  if (error) return <div style={{ padding: 40, color: "#e00" }}>Error: {error}</div>;
  if (!brand) return <div style={{ padding: 40 }}>Brand not found.</div>;

  function renderValue(value: any) {
    if (value === null || value === undefined) return <span style={{ color: '#888' }}>-</span>;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span style={{ color: '#888' }}>[]</span>;
      return (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {value.map((item, idx) => (
            <li key={idx}>{renderValue(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object') {
      return (
        <table style={{ width: '100%', fontSize: 15, background: '#f8fafc', borderRadius: 6, margin: '8px 0' }}>
          <tbody>
            {Object.entries(value).map(([k, v]) => (
              <tr key={k}>
                <td style={{ fontWeight: 600, color: '#2563eb', padding: '6px 12px', width: 120 }}>{k}</td>
                <td style={{ padding: '6px 12px' }}>{renderValue(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return <span>{String(value)}</span>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto", width: '100%' }}>
      <style>{`
        @media (max-width: 700px) {
          .brand-detail-grid {
            display: block !important;
          }
          .brand-detail-grid > div {
            margin-bottom: 16px !important;
          }
        }
        @media (max-width: 500px) {
          .brand-detail-avatar {
            width: 60px !important;
            height: 60px !important;
          }
          .brand-detail-title {
            font-size: 22px !important;
          }
        }
        .brand-detail-table-wrap { overflow-x: auto; width: 100%; }
        .brand-detail-table { min-width: 340px; }
      `}</style>
      <button onClick={() => router.back()} style={{ marginBottom: 24, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer', color: '#2563eb' }}>← Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
        <img className="brand-detail-avatar" src={brand.profileImage || "/avatars/placeholder-1.svg"} alt={brand.name} style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", background: "#f3f4f6" }} />
        <div>
          <div className="brand-detail-title" style={{ fontWeight: 700, fontSize: 32 }}>{brand.name}</div>
          <div style={{ color: "#666", fontSize: 20 }}>{brand.username}</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e5e7eb', padding: 32, marginBottom: 32 }}>
        <div className="brand-detail-grid" style={{ display: 'grid', gridTemplateColumns: '180px 1fr 180px 1fr', rowGap: 18, columnGap: 24, fontSize: 18 }}>
          <div style={{ fontWeight: 600, color: '#2563eb' }}>Email</div>
          <div>{brand.contactInfo?.email || brand.email || '-'}</div>
          <div style={{ fontWeight: 600, color: '#2563eb' }}>Status</div>
          <div>
            <span style={{
              background: brand.status === 'inactive' ? '#fee2e2' : '#d1fae5',
              color: brand.status === 'inactive' ? '#b91c1c' : '#059669',
              padding: '4px 14px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15
            }}>
              {brand.status || 'published'}
            </span>
          </div>
          <div style={{ fontWeight: 600, color: '#2563eb' }}>Date Joined</div>
          <div>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}</div>
          <div style={{ fontWeight: 600, color: '#2563eb' }}>User ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: 15 }}>{brand.userId || '-'}</div>
          <div style={{ fontWeight: 600, color: '#2563eb' }}>Brand ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: 15 }}>{brand._id}</div>
        </div>
        {user?.role === 'admin' && (
          <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
            <button
              onClick={handleDeactivate}
              disabled={deactivateLoading || brand.status === 'inactive'}
              style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: deactivateLoading || brand.status === 'inactive' ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #b91c1c22' }}
            >
              {deactivateLoading ? 'Deactivating...' : 'Deactivate Brand'}
            </button>
            {brand.status === 'inactive' && (
              <button
                onClick={handleReactivate}
                disabled={reactivateLoading}
                style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: reactivateLoading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #05966922' }}
              >
                {reactivateLoading ? 'Reactivating...' : 'Reactivate Brand'}
              </button>
            )}
            {deactivateError && <div style={{ color: '#e00', marginTop: 10 }}>{deactivateError}</div>}
            {reactivateError && <div style={{ color: '#e00', marginTop: 10 }}>{reactivateError}</div>}
          </div>
        )}
      </div>
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, fontSize: 17 }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 16, color: '#2563eb' }}>All Brand Data</div>
        <div className="brand-detail-table-wrap">
          <table className="brand-detail-table" style={{ width: '100%', fontSize: 16, borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #e5e7eb' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', color: '#222', fontWeight: 600 }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Field</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(brand).map(([key, value], idx) => (
                <tr key={key} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ fontWeight: 600, color: '#2563eb', padding: '8px 12px', width: 180, borderBottom: '1px solid #f1f5f9' }}>{key}</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>{renderValue(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 