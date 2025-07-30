"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  description?: string;
}

export default function WorkSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [submission, setSubmission] = useState<WorkSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmission() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`http://localhost:5001/api/work-submissions/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch work submission");
        const data = await res.json();
        setSubmission(data.data || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch work submission");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSubmission();
  }, [id]);

  return (
    <div style={{ padding: 32 }}>
      <button onClick={() => router.push('/work-submissions')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: 16, marginBottom: 18, cursor: 'pointer' }}>&larr; Back to Work Submissions</button>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>Work Submission Details</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #2563eb11', padding: 36, minWidth: 420, maxWidth: 700, width: '100%', margin: '0 auto' }}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : !submission ? (
          <div style={{ color: '#888', fontSize: 18 }}>Work submission not found.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
              {/* Client Info */}
              <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Client</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {submission.order?.client?.avatar && <img src={submission.order.client.avatar} alt="client avatar" style={{ width: 38, height: 38, borderRadius: '50%' }} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{submission.order?.client?.fullName || '-'}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{submission.order?.client?.email || '-'}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{submission.order?.client?.username && `@${submission.order.client.username}`}</div>
                  </div>
                </div>
              </div>
              {/* Creator Info */}
              <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Creator</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {submission.order?.creator?.avatar && <img src={submission.order.creator.avatar} alt="creator avatar" style={{ width: 38, height: 38, borderRadius: '50%' }} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{submission.order?.creator?.fullName || '-'}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{submission.order?.creator?.email || '-'}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{submission.order?.creator?.username && `@${submission.order.creator.username}`}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Order</div>
              <div><b>ID:</b> {submission.order?.orderID || '-'}</div>
              <div><b>Service:</b> {submission.order?.service || '-'}</div>
              <div><b>Status:</b> {submission.order?.status || '-'}</div>
              <div><b>Amount:</b> {submission.order?.amount != null ? `$${submission.order.amount}` : '-'}</div>
              <div><b>Description:</b> {submission.order?.description || '-'}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Submission Status</div>
              <span style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: 8,
                background: submission.approvalStatus === 'approved' ? '#d1fae5' : submission.approvalStatus === 'rejected' ? '#fee2e2' : '#fef3c7',
                color: submission.approvalStatus === 'approved' ? '#059669' : submission.approvalStatus === 'rejected' ? '#b91c1c' : '#b45309',
                fontWeight: 700,
                fontSize: 15
              }}>{(submission.approvalStatus || 'pending').toUpperCase()}</span>
              {submission.rejectionReason && (
                <div style={{ color: '#b91c1c', marginTop: 6 }}><b>Rejection Reason:</b> {submission.rejectionReason}</div>
              )}
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Submitted Files</div>
              {submission.files && submission.files.length > 0 ? (
                <ul style={{ paddingLeft: 18 }}>
                  {submission.files.map((file, i) => (
                    <li key={i}><a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{file.name || file.url}</a></li>
                  ))}
                </ul>
              ) : '-'}
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Submission Description</div>
              <div>{submission.description || '-'}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Submitted At</div>
              <div>{new Date(submission.createdAt).toLocaleString()}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 