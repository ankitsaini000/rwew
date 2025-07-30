"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Promotion {
  _id: string;
  title: string;
  description: string;
  budget: string;
  category: string;
  platform: string;
  deadline: string;
  promotionType: string;
  deliverables: string[];
  tags: string[];
  requirements: string;
  status: string;
  brandId?: {
    fullName?: string;
    username?: string;
    avatar?: string;
    _id?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function AllPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPromotions() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        // Adjust the endpoint below to match your backend
        const res = await fetch("http://localhost:5001/api/promotions", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch promotions");
        const data = await res.json();
        setPromotions(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch promotions");
      } finally {
        setLoading(false);
      }
    }
    fetchPromotions();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>All Promotions</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #2563eb11', padding: 24, minHeight: 200 }}>
        {loading ? (
          <div>Loading promotions...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : promotions.length === 0 ? (
          <div style={{ color: '#888', fontSize: 18 }}>No promotions found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Deadline</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Budget</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 16px' }}>{promo.title || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{promo.promotionType || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{promo.status || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{promo.deadline ? new Date(promo.deadline).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{promo.budget || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{promo.category || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/all-promotions/${promo._id}`}>
                      <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>View</span>
                    </Link>
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