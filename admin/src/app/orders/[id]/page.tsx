"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaUser, FaUserTie, FaUserShield, FaMoneyBill, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaBoxOpen } from "react-icons/fa";

interface Order {
  _id: string;
  user?: { name?: string; email?: string; _id?: string; avatar?: string; fullName?: string };
  brand?: { name?: string; _id?: string };
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  deliveryDate?: string;
  completedAt?: string;
  platform?: string;
  promotionType?: string;
  service?: string;
  specialInstructions?: string;
  message?: string;
  deliverables?: string[];
  paymentStatus?: string;
  paymentDate?: string;
  totalAmount?: number;
  statusHistory?: { status: string; date: string }[];
  description?: string;
  clientFeedback?: string;
  orderID?: string;
  [key: string]: any;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<any | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`http://localhost:5001/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data.data || data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    }
    async function fetchPayment() {
      setPaymentLoading(true);
      setPaymentError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`http://localhost:5001/api/payments/by-order/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch payment info");
        const data = await res.json();
        setPayment(data.data || data);
      } catch (err: any) {
        setPaymentError(err.message || "Failed to fetch payment info");
      } finally {
        setPaymentLoading(false);
      }
    }
    if (id) {
      fetchOrder();
      fetchPayment();
    }
  }, [id]);

  function statusColor(status?: string) {
    if (!status) return '#f3f4f6';
    if (status === 'completed' || status === 'delivered') return '#d1fae5';
    if (status === 'cancelled') return '#fee2e2';
    if (status === 'in_progress') return '#fef9c3';
    return '#f3f4f6';
  }
  function statusTextColor(status?: string) {
    if (!status) return '#222';
    if (status === 'completed' || status === 'delivered') return '#059669';
    if (status === 'cancelled') return '#b91c1c';
    if (status === 'in_progress') return '#b45309';
    return '#222';
  }

  function InfoCard({ title, icon, children, style }: any) {
    return (
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 18, marginBottom: 18, boxShadow: '0 2px 8px #2563eb11', ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {icon}
          <span style={{ fontWeight: 700, fontSize: 18 }}>{title}</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ marginBottom: 24, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', color: '#2563eb' }}>&larr; Back</button>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>Order Details</h1>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>{error}</div>
      ) : order ? (
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #2563eb11', padding: 28 }}>
          {/* Order summary */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Order #{order.orderID || order._id}</div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>Status: </span>
                <span style={{ background: statusColor(order.status), color: statusTextColor(order.status), padding: '4px 14px', borderRadius: 8, fontWeight: 700, fontSize: 15 }}>{order.status || '-'}</span>
              </div>
              <div style={{ marginBottom: 10 }}><FaMoneyBill style={{ marginRight: 6, color: '#059669' }} /> <b>Amount:</b> {order.amount != null ? `$${order.amount.toFixed(2)}` : '-'}</div>
              <div style={{ marginBottom: 10 }}><FaCalendarAlt style={{ marginRight: 6, color: '#2563eb' }} /> <b>Created:</b> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</div>
              <div style={{ marginBottom: 10 }}><FaCalendarAlt style={{ marginRight: 6, color: '#2563eb' }} /> <b>Updated:</b> {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}</div>
              {order.deliveryDate && <div style={{ marginBottom: 10 }}><FaClock style={{ marginRight: 6, color: '#eab308' }} /> <b>Delivery Date:</b> {new Date(order.deliveryDate).toLocaleString()}</div>}
              {order.completedAt && <div style={{ marginBottom: 10 }}><FaCheckCircle style={{ marginRight: 6, color: '#059669' }} /> <b>Completed At:</b> {new Date(order.completedAt).toLocaleString()}</div>}
              {order.platform && <div style={{ marginBottom: 10 }}><FaBoxOpen style={{ marginRight: 6, color: '#2563eb' }} /> <b>Platform:</b> {order.platform}</div>}
              {order.promotionType && <div style={{ marginBottom: 10 }}><b>Promotion Type:</b> {order.promotionType}</div>}
              {order.service && <div style={{ marginBottom: 10 }}><b>Service:</b> {order.service}</div>}
              {order.specialInstructions && <div style={{ marginBottom: 10 }}><b>Special Instructions:</b> {order.specialInstructions}</div>}
              {order.message && <div style={{ marginBottom: 10 }}><b>Message:</b> {order.message}</div>}
            </div>
            {/* User/Client Info */}
            {order.user && (
              <InfoCard title="User" icon={<FaUser style={{ color: '#2563eb' }} />}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#2563eb' }}>{order.user.avatar ? <img src={order.user.avatar} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%' }} /> : order.user.name?.[0] || order.user.email?.[0] || '?'}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{order.user.name || order.user.fullName || order.user.email}</div>
                    <div style={{ fontSize: 14, color: '#888' }}>{order.user.email}</div>
                    <div style={{ fontSize: 13, color: '#aaa' }}>{order.user._id}</div>
                  </div>
                </div>
              </InfoCard>
            )}
            {/* Creator Info */}
            {order.creator && (
              <InfoCard title="Creator" icon={<FaUserTie style={{ color: '#eab308' }} />}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#eab308' }}>{order.creator.avatar ? <img src={order.creator.avatar} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%' }} /> : order.creator.name?.[0] || order.creator.email?.[0] || '?'}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{order.creator.name || order.creator.fullName || order.creator.email}</div>
                    <div style={{ fontSize: 14, color: '#888' }}>{order.creator.email}</div>
                    <div style={{ fontSize: 13, color: '#aaa' }}>{order.creator._id}</div>
                    <div style={{ fontSize: 13, color: '#eab308', fontWeight: 600 }}>{order.creator.role}</div>
                  </div>
                </div>
              </InfoCard>
            )}
            {/* Brand/Client Info */}
            {order.client && (
              <InfoCard title="Brand/Client" icon={<FaUserShield style={{ color: '#10b981' }} />}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#10b981' }}>{order.client.avatar ? <img src={order.client.avatar} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%' }} /> : order.client.name?.[0] || order.client.email?.[0] || '?'}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{order.client.name || order.client.fullName || order.client.email}</div>
                    <div style={{ fontSize: 14, color: '#888' }}>{order.client.email}</div>
                    <div style={{ fontSize: 13, color: '#aaa' }}>{order.client._id}</div>
                    <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>{order.client.role}</div>
                  </div>
                </div>
              </InfoCard>
            )}
          </div>
          {/* Payment/Transaction Info */}
          <div style={{ marginBottom: 32 }}>
            <InfoCard title="Transaction Information" icon={<FaMoneyBill style={{ color: '#059669' }} />}>
              {paymentLoading ? (
                <div style={{ color: '#888', fontSize: 15 }}>Loading transaction info...</div>
              ) : paymentError ? (
                <div style={{ color: 'red', fontSize: 15 }}>{paymentError}</div>
              ) : payment ? (
                <div style={{ fontSize: 15 }}>
                  <div><b>Transaction ID:</b> {payment.transactionId}</div>
                  <div><b>Amount:</b> ${payment.amount?.toFixed(2)}</div>
                  <div><b>Method:</b> {payment.paymentMethod}</div>
                  <div><b>Status:</b> {payment.status}</div>
                  <div><b>Date:</b> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : '-'}</div>
                  {payment.paymentDetails && (
                    <div style={{ marginTop: 8 }}>
                      <b>Payment Details:</b>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {payment.paymentDetails.cardBrand && <li>Card Brand: {payment.paymentDetails.cardBrand}</li>}
                        {payment.paymentDetails.cardLast4 && <li>Card Last 4: {payment.paymentDetails.cardLast4}</li>}
                        {payment.paymentDetails.paypalEmail && <li>PayPal Email: {payment.paymentDetails.paypalEmail}</li>}
                        {payment.paymentDetails.upiId && <li>UPI ID: {payment.paymentDetails.upiId}</li>}
                      </ul>
                    </div>
                  )}
                  {payment.refundAmount && <div><b>Refunded:</b> ${payment.refundAmount.toFixed(2)}</div>}
                  {payment.refundReason && <div><b>Refund Reason:</b> {payment.refundReason}</div>}
                </div>
              ) : (
                <div style={{ color: '#888', fontSize: 15 }}>No transaction found for this order.</div>
              )}
            </InfoCard>
          </div>
          {/* Deliverables & Payment */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
            {order.deliverables && order.deliverables.length > 0 && (
              <InfoCard title="Deliverables" icon={<FaBoxOpen style={{ color: '#2563eb' }} />} style={{ minWidth: 220 }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {order.deliverables.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </InfoCard>
            )}
            {order.paymentStatus && (
              <InfoCard title="Payment" icon={<FaMoneyBill style={{ color: '#059669' }} />} style={{ minWidth: 220 }}>
                <div><b>Status:</b> {order.paymentStatus}</div>
                {order.paymentDate && <div><b>Date:</b> {new Date(order.paymentDate).toLocaleString()}</div>}
                {order.totalAmount && <div><b>Total:</b> ${order.totalAmount.toFixed(2)}</div>}
              </InfoCard>
            )}
          </div>
          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <InfoCard title="Status History" icon={<FaClock style={{ color: '#2563eb' }} />}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {order.statusHistory.map((h: any, i: number) => (
                  <li key={i}><b>{h.status}</b> &mdash; {h.date ? new Date(h.date).toLocaleString() : '-'}</li>
                ))}
              </ul>
            </InfoCard>
          )}
          {/* Description, Feedback, etc. */}
          {order.description && <InfoCard title="Description" icon={<FaBoxOpen style={{ color: '#2563eb' }} />}>{order.description}</InfoCard>}
          {order.clientFeedback && <InfoCard title="Client Feedback" icon={<FaCheckCircle style={{ color: '#059669' }} />}>{order.clientFeedback}</InfoCard>}
        </div>
      ) : null}
    </div>
  );
} 