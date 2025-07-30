"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
  fullName?: string;
  email?: string;
  username?: string;
  avatar?: string;
}

interface OrderInfo {
  orderID?: string;
  service?: string;
  client?: UserInfo;
  creator?: UserInfo;
  amount?: number;
  status?: string;
  description?: string;
}

interface FileInfo {
  url?: string;
  name?: string;
}

interface WorkSubmission {
  _id: string;
  order: OrderInfo;
  approvalStatus?: string;
  approvalDate?: string;
  rejectionReason?: string;
  files?: FileInfo[];
  createdAt: string;
}

export default function WorkSubmissionsPage() {
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSubmissions() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch("http://localhost:5001/api/work-submissions/admin/all", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch work submissions");
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch work submissions");
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>Work Submissions</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #2563eb11', padding: 24, minHeight: 200 }}>
        {loading ? (
          <div>Loading work submissions...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : submissions.length === 0 ? (
          <div style={{ color: '#888', fontSize: 18 }}>No work submissions found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Service</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Client</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Creator</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Files</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Submitted At</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 16px' }}>{sub.order?.orderID || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{sub.order?.service || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{sub.order?.client?.fullName || sub.order?.client?.username || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{sub.order?.creator?.fullName || sub.order?.creator?.username || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{sub.approvalStatus || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {sub.files && sub.files.length > 0 ? (
                      <ul style={{ paddingLeft: 18 }}>
                        {sub.files.map((file, i) => (
                          <li key={i}><a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{file.name || file.url}</a></li>
                        ))}
                      </ul>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button
                      style={{
                        background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #2563eb22', transition: 'background 0.2s'
                      }}
                      onClick={() => router.push(`/work-submissions/${sub._id}`)}
                    >View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 