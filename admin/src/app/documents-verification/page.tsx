"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VerificationDocument {
  _id: string;
  ownerType: string;
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
  createdAt?: string;
}

export default function DocumentsVerificationPage() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper to get viewed document IDs from localStorage
  function getViewedDocs(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('viewedVerificationDocs') || '[]');
    } catch {
      return [];
    }
  }
  // Helper to mark a document as viewed
  function markDocViewed(id: string) {
    if (typeof window === 'undefined') return;
    const viewed = getViewedDocs();
    if (!viewed.includes(id)) {
      localStorage.setItem('viewedVerificationDocs', JSON.stringify([...viewed, id]));
    }
  }

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch("http://localhost:5001/api/admin/verification-documents", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch verification documents");
        const data = await res.json();
        let docs = Array.isArray(data) ? data : data.data || [];
        // Sort: new (last 24h) first
        const now = Date.now();
        docs = docs.sort((a: VerificationDocument, b: VerificationDocument) => {
          const aTime = new Date(a.createdAt || getTimestampFromId(a._id)).getTime();
          const bTime = new Date(b.createdAt || getTimestampFromId(b._id)).getTime();
          const aIsNew = now - aTime < 24 * 60 * 60 * 1000;
          const bIsNew = now - bTime < 24 * 60 * 60 * 1000;
          if (aIsNew && !bIsNew) return -1;
          if (!aIsNew && bIsNew) return 1;
          return bTime - aTime;
        });
        setDocuments(docs);
      } catch (err: any) {
        setError(err.message || "Failed to fetch verification documents");
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>Documents / Verification</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #2563eb11', padding: 24, minHeight: 200 }}>
        {loading ? (
          <div>Loading verification documents...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : documents.length === 0 ? (
          <div style={{ color: '#888', fontSize: 18 }}>No verification documents found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Owner</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Document</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => {
                const createdAt = doc.createdAt || getTimestampFromId(doc._id);
                const isNew = Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
                const viewed = typeof window !== 'undefined' && getViewedDocs().includes(doc._id);
                return (
                  <tr key={doc._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 16px' }}>{doc.owner?.fullName || doc.owner?.username || doc.owner?.email || doc.ownerType}</td>
                    <td style={{ padding: '10px 16px', textTransform: 'capitalize' }}>{doc.ownerType}</td>
                    <td style={{ padding: '10px 16px' }}>
                      {doc.documentName}
                      {isNew && !viewed && <span style={{ marginLeft: 8, background: '#facc15', color: '#fff', borderRadius: 6, padding: '2px 10px', fontWeight: 700, fontSize: 12 }}>NEW</span>}
                    </td>
                    <td style={{ padding: '10px 16px' }}>{doc.status || 'Pending'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <a
                        href={`/documents-verification/${doc._id}`}
                        style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}
                        onClick={() => markDocViewed(doc._id)}
                        >View</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Helper to get timestamp from MongoDB ObjectId
function getTimestampFromId(id: string) {
  // MongoDB ObjectId: first 8 chars are timestamp in hex
  return new Date(parseInt(id.substring(0, 8), 16) * 1000).toISOString();
} 