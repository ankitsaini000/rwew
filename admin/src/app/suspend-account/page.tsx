"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Creator {
  _id: string;
  userId: {
    _id?: string;
    fullName?: string;
    email?: string;
    avatar?: string;
    username?: string;
    createdAt?: string;
  };
  username?: string;
  personalInfo?: {
    username?: string;
    profileImage?: string;
  };
  status?: string;
  isActive?: boolean;
  deactivatedAt?: string;
  deactivationReason?: string;
  createdAt?: string;
}

export default function SuspendAccountPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [reactivateLoading, setReactivateLoading] = useState<string | null>(null);
  const [reactivateError, setReactivateError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSuspendedCreators() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5001/api/creators/admin/suspended", {
          credentials: "include"
        });
        const data = await res.json();
        setCreators(data.data || []);
      } catch (err) {
        setError("Failed to fetch suspended/deactivated accounts");
      } finally {
        setLoading(false);
      }
    }
    async function fetchBrands() {
      setBrandLoading(true);
      setBrandError(null);
      try {
        const res = await fetch("http://localhost:5001/api/brand-profiles/all");
        if (!res.ok) throw new Error("Failed to fetch brands");
        const data = await res.json();
        setBrands((data.data || []).filter((b: any) => b.status === 'inactive'));
      } catch (err: any) {
        setBrandError(err.message || "Unknown error");
      } finally {
        setBrandLoading(false);
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
    fetchSuspendedCreators();
    fetchBrands();
    fetchUser();
  }, []);

  // Add this function to handle activation
  const handleActivate = async (creator: Creator) => {
    if (!creator.userId?.username) return;
    try {
      const res = await fetch(`http://localhost:5001/api/creators/admin/${creator.userId.username}/reactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setCreators(prev => prev.filter(c => c._id !== creator._id));
      } else {
        alert('Failed to activate account');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  async function handleReactivateBrand(brand: any) {
    setReactivateLoading(brand._id);
    setReactivateError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/brand-profiles/${brand._id}/reactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to reactivate brand');
      setBrands(prev => prev.filter(b => b._id !== brand._id));
    } catch (err: any) {
      setReactivateError(err.message || 'Failed to reactivate brand');
    } finally {
      setReactivateLoading(null);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Suspended/Deactivated Accounts</h1>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, fontSize: 20 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "#e00", textAlign: "center", padding: 40, fontSize: 20 }}>{error}</div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 16, boxShadow: "0 2px 16px #2563eb11", background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={thStyle}>Avatar</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Active</th>
                <th style={thStyle}>Date Joined</th>
                <th style={thStyle}>Deactivated At</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>User ID</th>
                <th style={thStyle}>Creator ID</th>
                <th style={thStyle}>Activate</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((creator) => {
                const username = creator.userId?.username || creator.personalInfo?.username || creator.username;
                return (
                  <tr key={creator._id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background 0.2s", cursor: "pointer" }}
                    onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseOut={e => (e.currentTarget.style.background = '#fff')}
                  >
                    <td style={tdStyle}>
                      <img
                        src={
                          creator.userId?.avatar ||
                          creator.personalInfo?.profileImage ||
                          "/avatars/placeholder-1.svg"
                        }
                        alt="avatar"
                        style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", boxShadow: "0 2px 8px #2563eb22" }}
                      />
                    </td>
                    <td style={tdStyle}>{creator.userId?.fullName || "-"}</td>
                    <td style={tdStyle}>{username || "-"}</td>
                    <td style={tdStyle}>{creator.userId?.email || "-"}</td>
                    <td style={tdStyle}><span style={{
                      display: "inline-block",
                      padding: "4px 14px",
                      borderRadius: 8,
                      background: creator.status === "suspended" ? "#fee2e2" : "#fef3c7",
                      color: creator.status === "suspended" ? "#b91c1c" : "#b45309",
                      fontWeight: 600,
                      fontSize: 14
                    }}>{creator.status || "-"}</span></td>
                    <td style={tdStyle}>{creator.isActive ? "Yes" : "No"}</td>
                    <td style={tdStyle}>{new Date(creator.userId?.createdAt || creator.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td style={tdStyle}>{creator.deactivatedAt ? new Date(creator.deactivatedAt).toLocaleDateString() : "-"}</td>
                    <td style={tdStyle}>{creator.deactivationReason || "-"}</td>
                    <td style={tdStyle}>{creator.userId?._id || '-'}</td>
                    <td style={tdStyle}>{creator._id}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <button
                        style={{
                          background: '#22c55e',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 15,
                        }}
                        onClick={() => handleActivate(creator)}
                      >
                        Activate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '32px 0 18px 0', color: '#18181b' }}>Inactive Brand Accounts</h2>
      {brandLoading ? (
        <div>Loading inactive brands...</div>
      ) : brandError ? (
        <div style={{ color: 'red' }}>{brandError}</div>
      ) : brands.length === 0 ? (
        <div>No inactive brands found.</div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e5e7eb', padding: 0, marginBottom: 32 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left', fontWeight: 700, fontSize: 16 }}>
                <th style={{ padding: '16px 12px' }}>Name</th>
                <th style={{ padding: '16px 12px' }}>Username</th>
                <th style={{ padding: '16px 12px' }}>Email</th>
                <th style={{ padding: '16px 12px' }}>Status</th>
                <th style={{ padding: '16px 12px' }}>Date Joined</th>
                <th style={{ padding: '16px 12px' }}>User ID</th>
                <th style={{ padding: '16px 12px' }}>Brand ID</th>
                <th style={{ padding: '16px 12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 15 }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{brand.name}</td>
                  <td style={{ padding: '12px' }}>{brand.username}</td>
                  <td style={{ padding: '12px' }}>{brand.contactInfo?.email || brand.email || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 14px', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>inactive</span>
                  </td>
                  <td style={{ padding: '12px' }}>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: 13 }}>{brand.userId || '-'}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: 13 }}>{brand._id}</td>
                  <td style={{ padding: '12px' }}>
                    {user?.role === 'admin' && (
                      <button
                        style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 600, fontSize: 15, cursor: reactivateLoading === brand._id ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #05966922' }}
                        onClick={() => handleReactivateBrand(brand)}
                        disabled={reactivateLoading === brand._id}
                      >
                        {reactivateLoading === brand._id ? 'Reactivating...' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reactivateError && <div style={{ color: '#e00', marginTop: 10 }}>{reactivateError}</div>}
        </div>
      )}
      <style>{`
        @media (max-width: 900px) {
          table { min-width: 600px; }
          th, td { font-size: 14px !important; padding: 10px 6px !important; }
        }
        @media (max-width: 600px) {
          table { min-width: 400px; }
          th, td { font-size: 12px !important; padding: 8px 4px !important; }
        }
        table {
          border-radius: 16px;
          overflow: hidden;
        }
        thead tr {
          border-radius: 16px 16px 0 0;
        }
        tbody tr:hover {
          background: #f1f5f9 !important;
        }
        th, td {
          border-right: 1px solid #f3f4f6;
        }
        th:last-child, td:last-child {
          border-right: none;
        }
      `}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "16px 12px",
  fontWeight: 700,
  fontSize: 16,
  color: "#18181b",
  background: "#f3f4f6",
  textAlign: "left",
  borderBottom: "2px solid #e5e7eb"
};

const tdStyle: React.CSSProperties = {
  padding: "14px 12px",
  fontWeight: 500,
  fontSize: 15,
  color: "#222",
  background: "#fff",
  textAlign: "left"
}; 