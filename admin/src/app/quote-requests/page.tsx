"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface QuoteRequest {
  _id: string;
  requesterId: { fullName?: string; email?: string; username?: string; avatar?: string };
  creatorId: { fullName?: string; email?: string; username?: string; avatar?: string };
  promotionType: string;
  status: string;
  createdAt: string;
  campaignObjective?: string;
  platformPreference?: string[];
  contentFormat?: string[];
  contentGuidelines?: string;
  attachments?: string[];
  audienceTargeting?: { demographics?: string; interests?: string; geography?: string };
  timeline?: { startDate?: string; endDate?: string; deliveryDeadlines?: string };
  budget?: { min?: number; max?: number; currency?: string; compensationDetails?: string };
  additionalNotes?: string;
  isPrivateEvent?: boolean;
  eventDetails?: any;
  response?: string;
}

export default function QuoteRequestsPage() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch("http://localhost:5001/api/custom-quotes/admin/all", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch quote requests");
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch quote requests");
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>Quote Requests</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #2563eb11', padding: 24, minHeight: 200 }}>
        {loading ? (
          <div>Loading quote requests...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : requests.length === 0 ? (
          <div style={{ color: '#888', fontSize: 18 }}>No quote requests found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Requester</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Creator</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Promotion Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Created At</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 16px' }}>{req.requesterId?.fullName || req.requesterId?.username || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{req.creatorId?.fullName || req.creatorId?.username || '-'}</td>
                  <td style={{ padding: '10px 16px' }}>{req.promotionType}</td>
                  <td style={{ padding: '10px 16px' }}>{req.status}</td>
                  <td style={{ padding: '10px 16px' }}>{new Date(req.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button
                      style={{
                        background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #2563eb22', transition: 'background 0.2s'
                      }}
                      onClick={() => router.push(`/quote-requests/${req._id}`)}
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