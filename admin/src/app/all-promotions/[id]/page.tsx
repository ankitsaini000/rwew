import React from "react";
import ApplicantsSection from "./ApplicantsSection";

async function getPromotion(id: string) {
  const res = await fetch(`http://localhost:5001/api/promotions/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch promotion");
  const data = await res.json();
  return data.data || {};
}

export default async function PromotionDetailPage({ params }: { params: { id: string } }) {
  let promo: any = {};
  try {
    promo = await getPromotion(params.id);
  } catch (e) {
    return <div style={{ color: 'red' }}>Error fetching promotion: {(e as any).message}</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>Promotion Details</h1>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #2563eb11', padding: 24, marginBottom: 32 }}>
        <table style={{ width: '100%', fontSize: 16, borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Title</td><td style={{ padding: 8 }}>{promo.title || '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Description</td><td style={{ padding: 8 }}>{promo.description || '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Type</td><td style={{ padding: 8 }}>{promo.promotionType || '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Status</td><td style={{ padding: 8 }}>{promo.status || '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Deadline</td><td style={{ padding: 8 }}>{promo.deadline ? new Date(promo.deadline).toLocaleDateString() : '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Budget</td><td style={{ padding: 8 }}>{promo.budget || '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Category</td><td style={{ padding: 8 }}>{promo.category || '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Platform</td><td style={{ padding: 8 }}>{promo.platform || '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Deliverables</td><td style={{ padding: 8 }}>{promo.deliverables && promo.deliverables.length > 0 ? promo.deliverables.join(', ') : '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Tags</td><td style={{ padding: 8 }}>{promo.tags && promo.tags.length > 0 ? promo.tags.join(', ') : '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Requirements</td><td style={{ padding: 8 }}>{promo.requirements || '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Brand</td><td style={{ padding: 8 }}>
              {promo.brandId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {promo.brandId.avatar && (
                    <img src={promo.brandId.avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{promo.brandId.fullName || '-'}</div>
                    <div style={{ fontSize: 13, color: '#888' }}>@{promo.brandId.username || '-'}</div>
                  </div>
                </div>
              ) : '-'}
            </td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Created At</td><td style={{ padding: 8 }}>{promo.createdAt ? new Date(promo.createdAt).toLocaleString() : '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>Updated At</td><td style={{ padding: 8 }}>{promo.updatedAt ? new Date(promo.updatedAt).toLocaleString() : '-'}</td></tr>
            <tr><td style={{ fontWeight: 600, padding: 8 }}>ID</td><td style={{ padding: 8 }}>{promo._id || '-'}</td></tr>
          </tbody>
        </table>
      </div>
      {/* Applicants section (client-side) */}
      <ApplicantsSection promotionId={params.id} />
    </div>
  );
} 