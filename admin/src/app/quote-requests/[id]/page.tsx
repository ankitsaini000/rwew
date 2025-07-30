"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function QuoteRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [request, setRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequest() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`http://localhost:5001/api/custom-quotes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch quote request");
        const data = await res.json();
        setRequest(data.data || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch quote request");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRequest();
  }, [id]);

  return (
    <div style={{ padding: 32 }}>
      <button onClick={() => router.push('/quote-requests')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: 16, marginBottom: 18, cursor: 'pointer' }}>&larr; Back to Quote Requests</button>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>Quote Request Details</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #2563eb11', padding: 36, minWidth: 420, maxWidth: 700, width: '100%', margin: '0 auto' }}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : !request ? (
          <div style={{ color: '#888', fontSize: 18 }}>Quote request not found.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
              {/* Brand Info */}
              <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Brand</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {request.requesterId?.avatar && <img src={request.requesterId.avatar} alt="brand avatar" style={{ width: 38, height: 38, borderRadius: '50%' }} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{request.requesterId?.fullName || '-'}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{request.requesterId?.email || '-'}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{request.requesterId?.username && `@${request.requesterId.username}`}</div>
                  </div>
                </div>
              </div>
              {/* Creator Info */}
              <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Creator</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {request.creatorId?.avatar && <img src={request.creatorId.avatar} alt="creator avatar" style={{ width: 38, height: 38, borderRadius: '50%' }} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{request.creatorId?.fullName || '-'}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{request.creatorId?.email || '-'}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{request.creatorId?.username && `@${request.creatorId.username}`}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Promotion Type</div>
              <div style={{ color: '#2563eb', fontWeight: 600 }}>{request.promotionType}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Status</div>
              <span style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: 8,
                background: request.status === 'accepted' ? '#d1fae5' : request.status === 'rejected' ? '#fee2e2' : request.status === 'completed' ? '#e0e7ff' : '#fef3c7',
                color: request.status === 'accepted' ? '#059669' : request.status === 'rejected' ? '#b91c1c' : request.status === 'completed' ? '#6366f1' : '#b45309',
                fontWeight: 700,
                fontSize: 15
              }}>{request.status.toUpperCase()}</span>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Campaign Objective</div>
              <div>{request.campaignObjective || '-'}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Platform Preference</div>
              <div>{request.platformPreference?.join(', ') || '-'}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Content Format</div>
              <div>{request.contentFormat?.join(', ') || '-'}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Content Guidelines</div>
              <div>{request.contentGuidelines || '-'}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Budget</div>
              <div>{request.budget ? `${request.budget.min} - ${request.budget.max} ${request.budget.currency || ''} (${request.budget.compensationDetails || ''})` : '-'}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Timeline</div>
              <div>{request.timeline ? `${request.timeline.startDate ? new Date(request.timeline.startDate).toLocaleDateString() : ''} to ${request.timeline.endDate ? new Date(request.timeline.endDate).toLocaleDateString() : ''}` : '-'}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{request.timeline?.deliveryDeadlines}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Audience Targeting</div>
              <div>{request.audienceTargeting ? `Demographics: ${request.audienceTargeting.demographics || '-'}, Interests: ${request.audienceTargeting.interests || '-'}, Geography: ${request.audienceTargeting.geography || '-'}` : '-'}</div>
            </div>
            {request.attachments && request.attachments.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Attachments</div>
                <ul style={{ paddingLeft: 18 }}>
                  {request.attachments.map((url, i) => (
                    <li key={i}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{url}</a></li>
                  ))}
                </ul>
              </div>
            )}
            {request.additionalNotes && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Additional Notes</div>
                <div>{request.additionalNotes}</div>
              </div>
            )}
            {request.isPrivateEvent && request.eventDetails && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Event Details</div>
                <div><b>Name:</b> {request.eventDetails.eventName || '-'}</div>
                <div><b>Type:</b> {request.eventDetails.eventType || '-'}</div>
                <div><b>Date:</b> {request.eventDetails.eventDate ? new Date(request.eventDetails.eventDate).toLocaleDateString() : '-'}</div>
                <div><b>Location:</b> {request.eventDetails.eventLocation || '-'}</div>
                <div><b>Expected Attendance:</b> {request.eventDetails.expectedAttendance || '-'}</div>
                <div><b>Description:</b> {request.eventDetails.eventDescription || '-'}</div>
                <div><b>Special Requirements:</b> {request.eventDetails.specialRequirements || '-'}</div>
              </div>
            )}
            {request.response && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Creator Response</div>
                <div>{request.response}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 