"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  // Add other fields as needed
}

export default function BrandListPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch("http://localhost:5001/api/brand-profiles/all");
        if (!res.ok) throw new Error("Failed to fetch brands");
        const data = await res.json();
        setBrands(data.data || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  if (loading) return <div>Loading brands...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>All Brands</h1>
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e5e7eb', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left', fontWeight: 700, fontSize: 16 }}>
              <th style={{ padding: '16px 12px' }}>Avatar</th>
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
                <td style={{ padding: '12px' }}>
                  <img src={brand.profileImage || '/avatars/placeholder-1.svg'} alt={brand.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: '#f3f4f6' }} />
                </td>
                <td style={{ padding: '12px', fontWeight: 600 }}>{brand.name}</td>
                <td style={{ padding: '12px' }}>{brand.username}</td>
                <td style={{ padding: '12px' }}>{brand.contactInfo?.email || brand.email || '-'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: brand.status === 'inactive' ? '#fee2e2' : '#d1fae5',
                    color: brand.status === 'inactive' ? '#b91c1c' : '#059669',
                    padding: '4px 14px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    {brand.status || 'published'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: 13 }}>{brand.userId || '-'}</td>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: 13 }}>{brand._id}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb11' }}
                    onClick={() => router.push(`/brand/${brand._id}`)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 