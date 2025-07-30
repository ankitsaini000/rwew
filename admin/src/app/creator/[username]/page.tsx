"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Clock, CreditCard, Smartphone, Mail, IdCard, FileText, User } from 'lucide-react';

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
  status?: string;
  createdAt?: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    profileImage?: string;
    email?: string;
  };
  isActive?: boolean;
}

interface CreatorVerification {
  overallStatus: 'pending' | 'verified' | 'rejected';
  email?: { status: string; email?: string };
  phone?: { status: string; phoneNumber?: string };
  pan?: { status: string; panNumber?: string };
  identity?: { status: string; idType?: string; idNumber?: string };
  payment?: {
    upi?: { status: string; upiId?: string };
    card?: { status: string; lastFourDigits?: string };
  };
}

export default function CreatorDetailPage() {
  const params = useParams();
  const username = params?.username as string; // 'id' param is actually username now
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [localCreator, setLocalCreator] = useState(creator);
  const [verification, setVerification] = useState<CreatorVerification | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  useEffect(() => {
    async function fetchCreator() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5001/api/creators/creators/${username}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setCreator(data.data || null);
        // Fetch verification status if userId is available
        const userId = data.data?.userId?._id;
        if (userId) {
          setVerificationLoading(true);
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          const vRes = await fetch(`http://localhost:5001/api/creator-verification/admin/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (vRes.ok) {
            const vData = await vRes.json();
            setVerification(vData.verification || null);
          } else {
            setVerification(null);
          }
          setVerificationLoading(false);
        }
        console.log('Fetched creator:', data.data); // Debug: see all fields
      } catch (err) {
        setError("Failed to fetch creator");
      } finally {
        setLoading(false);
      }
    }
    if (username) fetchCreator();
  }, [username]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: "#e00", textAlign: "center" }}>{error}</div>;
  if (!creator) return <div style={{ padding: 40, textAlign: "center" }}>Creator not found.</div>;

  // Extract main fields
  const avatar = creator.userId?.avatar || creator.personalInfo?.profileImage || "/avatars/placeholder-1.svg";
  const name = creator.userId?.fullName || `${creator.personalInfo?.firstName || "-"} ${creator.personalInfo?.lastName || ""}`.trim();
  const displayUsername = creator.userId?.username || creator.personalInfo?.username || creator.username || "-";
  const email = creator.userId?.email || creator.personalInfo?.email || "-";
  const status = creator.status || "-";
  const dateJoined = new Date(creator.userId?.createdAt || creator.createdAt || Date.now()).toLocaleDateString();
  const userId = creator.userId?._id || "-";

  function renderValue(value: any): React.ReactNode {
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
        <table style={{ width: '100%', background: '#f3f4f6', borderRadius: 6, margin: '8px 0' }}>
          <tbody>
            {Object.entries(value).map(([k, v]) => (
              <tr key={k}>
                <td style={{ fontWeight: 600, padding: '6px 12px', color: '#2563eb', width: 140 }}>{k}</td>
                <td style={{ padding: '6px 12px' }}>{renderValue(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return <span>{String(value)}</span>;
  }

  async function handleActivation(action: 'deactivate' | 'reactivate') {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`http://localhost:5001/api/creators/admin/${displayUsername}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setLocalCreator(data.data.creator || data.data); // support both {creator, user} and just creator
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px #2563eb11", padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Creator Details</h1>
      {/* Creator Verification Status */}
      <div style={{ marginBottom: 32, padding: 24, background: '#f9fafb', borderRadius: 12, boxShadow: '0 1px 8px #2563eb11', maxWidth: 600 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle style={{ color: '#6366f1', width: 22, height: 22 }} /> Verification Status
        </h3>
        {verificationLoading ? (
          <span>Loading verification...</span>
        ) : verification ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 16px',
                borderRadius: 8,
                background: verification.overallStatus === 'verified' ? '#d1fae5' : verification.overallStatus === 'rejected' ? '#fee2e2' : '#fef3c7',
                color: verification.overallStatus === 'verified' ? '#059669' : verification.overallStatus === 'rejected' ? '#b91c1c' : '#b45309',
                fontWeight: 700,
                fontSize: 16,
                marginRight: 12
              }}>{verification.overallStatus.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {/* Email */}
              <div style={{ minWidth: 160 }}>
                <Mail style={{ width: 18, height: 18, marginRight: 6, verticalAlign: 'middle', color: '#6366f1' }} />
                <b>Email:</b> {verification.email?.email || '-'}
                <span style={{
                  marginLeft: 8,
                  padding: '2px 10px',
                  borderRadius: 6,
                  background: badgeBg(verification.email?.status),
                  color: badgeColor(verification.email?.status),
                  fontWeight: 600,
                  fontSize: 13
                }}>{(verification.email?.status || '').toUpperCase()}</span>
              </div>
              {/* Phone */}
              <div style={{ minWidth: 160 }}>
                <Smartphone style={{ width: 18, height: 18, marginRight: 6, verticalAlign: 'middle', color: '#6366f1' }} />
                <b>Phone:</b> {verification.phone?.phoneNumber || '-'}
                <span style={{
                  marginLeft: 8,
                  padding: '2px 10px',
                  borderRadius: 6,
                  background: badgeBg(verification.phone?.status),
                  color: badgeColor(verification.phone?.status),
                  fontWeight: 600,
                  fontSize: 13
                }}>{(verification.phone?.status || '').toUpperCase()}</span>
              </div>
              {/* PAN */}
              <div style={{ minWidth: 160 }}>
                <FileText style={{ width: 18, height: 18, marginRight: 6, verticalAlign: 'middle', color: '#6366f1' }} />
                <b>PAN:</b> {verification.pan?.panNumber || '-'}
                <span style={{
                  marginLeft: 8,
                  padding: '2px 10px',
                  borderRadius: 6,
                  background: badgeBg(verification.pan?.status),
                  color: badgeColor(verification.pan?.status),
                  fontWeight: 600,
                  fontSize: 13
                }}>{(verification.pan?.status || '').toUpperCase()}</span>
              </div>
              {/* ID */}
              <div style={{ minWidth: 160 }}>
                <IdCard style={{ width: 18, height: 18, marginRight: 6, verticalAlign: 'middle', color: '#6366f1' }} />
                <b>ID:</b> {verification.identity?.idType ? `${verification.identity.idType}: ` : ''}{verification.identity?.idNumber || '-'}
                <span style={{
                  marginLeft: 8,
                  padding: '2px 10px',
                  borderRadius: 6,
                  background: badgeBg(verification.identity?.status),
                  color: badgeColor(verification.identity?.status),
                  fontWeight: 600,
                  fontSize: 13
                }}>{(verification.identity?.status || '').toUpperCase()}</span>
              </div>
              {/* Payment UPI */}
              {verification.payment?.upi && (
                <div style={{ minWidth: 160 }}>
                  <CreditCard style={{ width: 18, height: 18, marginRight: 6, verticalAlign: 'middle', color: '#6366f1' }} />
                  <b>UPI:</b> {verification.payment.upi.upiId || '-'}
                  <span style={{
                    marginLeft: 8,
                    padding: '2px 10px',
                    borderRadius: 6,
                    background: badgeBg(verification.payment.upi.status),
                    color: badgeColor(verification.payment.upi.status),
                    fontWeight: 600,
                    fontSize: 13
                  }}>{(verification.payment.upi.status || '').toUpperCase()}</span>
                </div>
              )}
              {/* Payment Card */}
              {verification.payment?.card && (
                <div style={{ minWidth: 160 }}>
                  <CreditCard style={{ width: 18, height: 18, marginRight: 6, verticalAlign: 'middle', color: '#6366f1' }} />
                  <b>Card:</b> {verification.payment.card.lastFourDigits ? `**** ${verification.payment.card.lastFourDigits}` : '-'}
                  <span style={{
                    marginLeft: 8,
                    padding: '2px 10px',
                    borderRadius: 6,
                    background: badgeBg(verification.payment.card.status),
                    color: badgeColor(verification.payment.card.status),
                    fontWeight: 600,
                    fontSize: 13
                  }}>{(verification.payment.card.status || '').toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <span style={{ color: '#888' }}>No verification record found.</span>
        )}
      </div>
      {/* End Creator Verification Status */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: localCreator?.isActive === false ? '#b91c1c' : '#059669' }}>
          {localCreator?.isActive === false ? 'Deactivated' : 'Activated'}
        </span>
        <button
          disabled={actionLoading || localCreator?.isActive === false}
          style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 14, cursor: actionLoading || localCreator?.isActive === false ? 'not-allowed' : 'pointer' }}
          onClick={() => handleActivation('deactivate')}
        >Deactivate</button>
        <button
          disabled={actionLoading || localCreator?.isActive !== false}
          style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 14, cursor: actionLoading || localCreator?.isActive !== false ? 'not-allowed' : 'pointer' }}
          onClick={() => handleActivation('reactivate')}
        >Activate</button>
        {actionError && <span style={{ color: '#b91c1c', marginLeft: 16 }}>{actionError}</span>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginBottom: 32, background: '#f9fafb', borderRadius: 12, boxShadow: '0 1px 8px #2563eb11' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ padding: 16, width: 80 }}>
              <img src={avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", boxShadow: "0 2px 8px #2563eb22" }} />
            </td>
            <td style={{ fontWeight: 700, padding: '12px 16px', color: '#18181b' }}>Name</td>
            <td style={{ padding: '12px 16px' }}>{name}</td>
            <td style={{ fontWeight: 700, padding: '12px 16px', color: '#18181b' }}>Username</td>
            <td style={{ padding: '12px 16px' }}>{displayUsername}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700, padding: '12px 16px', color: '#18181b' }}>Email</td>
            <td style={{ padding: '12px 16px' }}>{email}</td>
            <td style={{ fontWeight: 700, padding: '12px 16px', color: '#18181b' }}>Status</td>
            <td style={{ padding: '12px 16px' }}>
              <span style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: 8,
                background: status === "published" ? "#d1fae5" : "#fef3c7",
                color: status === "published" ? "#059669" : "#b45309",
                fontWeight: 600,
                fontSize: 14
              }}>{status}</span>
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700, padding: '12px 16px', color: '#18181b' }}>Date Joined</td>
            <td style={{ padding: '12px 16px' }}>{dateJoined}</td>
            <td style={{ fontWeight: 700, padding: '12px 16px', color: '#18181b' }}>User ID</td>
            <td style={{ padding: '12px 16px' }}>{userId}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      {/* Additional info sections: show all top-level fields in a readable, separated format */}
      <h2 style={{ fontSize: 22, fontWeight: 600, margin: '32px 0 16px' }}>All Creator Data</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9fafb', borderRadius: 8 }}>
        <tbody>
          {Object.entries(creator).map(([key, value]) => (
            <tr key={key}>
              <td style={{ fontWeight: 700, padding: '10px 16px', color: '#2563eb', width: 200, borderBottom: '1px solid #e5e7eb' }}>{key}</td>
              <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', wordBreak: 'break-word' }}>
                {renderValue(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function badgeBg(status?: string) {
  if (status === 'verified') return '#d1fae5';
  if (status === 'rejected') return '#fee2e2';
  if (status === 'processing') return '#e0e7ff';
  return '#fef3c7'; // pending or default
}
function badgeColor(status?: string) {
  if (status === 'verified') return '#059669';
  if (status === 'rejected') return '#b91c1c';
  if (status === 'processing') return '#6366f1';
  return '#b45309'; // pending or default
} 