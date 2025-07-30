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
  professionalInfo?: {
    title?: string;
    categories?: string[];
  };
  socialMedia?: {
    totalReach?: number;
  };
  status?: string;
  createdAt?: string;
}

export default function CreatorPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5001/api/creators/creators');
        const data = await res.json();
        setCreators(data.data || []);
      } catch (err) {
        setError("Failed to fetch creators");
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>All Creators</h1>
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
                <th style={thStyle}>Date Joined</th>
                <th style={thStyle}>User ID</th>
                <th style={thStyle}>Creator ID</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((creator) => {
                const username = creator.userId?.username || creator.personalInfo?.username || creator.username;
                console.log('Creator row:', creator); // Debug log
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
                      background: creator.status === "published" ? "#d1fae5" : "#fef3c7",
                      color: creator.status === "published" ? "#059669" : "#b45309",
                      fontWeight: 600,
                      fontSize: 14
                    }}>{creator.status || "-"}</span></td>
                    <td style={tdStyle}>{new Date(creator.userId?.createdAt || creator.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td style={tdStyle}>{creator.userId?._id || '-'}</td>
                    <td style={tdStyle}>{creator._id}</td>
                    <td style={tdStyle}>
                      {username ? (
                        <button
                          style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 18px',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px #2563eb22',
                            transition: 'background 0.2s'
                          }}
                          onClick={() => router.push(`/creator/${username}`)}
                        >
                          View
                        </button>
                      ) : (
                        <span style={{ color: '#aaa', fontStyle: 'italic' }}>No username</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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