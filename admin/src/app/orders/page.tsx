"use client";

import { useEffect, useState } from "react";
import InvoiceModal from "../../components/InvoiceModal";

interface Order {
  _id: string;
  user?: { name?: string; email?: string; _id?: string };
  brand?: { name?: string; _id?: string };
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch("http://localhost:5001/api/orders", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const orderList = Array.isArray(data) ? data : data.data || [];
        setOrders(orderList);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleInvoiceClick = (order: Order, e: any) => {
    e.stopPropagation();
    setSelectedInvoiceOrder(order);
    setInvoiceModalOpen(true);
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>All Orders</h1>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #2563eb11', padding: 18 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', fontSize: 16 }}>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Brand</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Created At</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Updated At</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>No orders found.</td></tr>
              ) : orders.map((order: Order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 15 }}>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: 13 }}>{order._id}</td>
                  <td style={{ padding: '12px 8px' }}>{order.user?.name || order.user?.email || '-'}</td>
                  <td style={{ padding: '12px 8px' }}>{order.brand?.name || '-'}</td>
                  <td style={{ padding: '12px 8px' }}>{order.amount != null ? `$${order.amount.toFixed(2)}` : '-'}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      background: order.status === 'completed' ? '#d1fae5' : order.status === 'cancelled' ? '#fee2e2' : '#fef9c3',
                      color: order.status === 'completed' ? '#059669' : order.status === 'cancelled' ? '#b91c1c' : '#b45309',
                      padding: '4px 14px',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 14
                    }}>{order.status || '-'}</span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                  <td style={{ padding: '12px 8px' }}>{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb11' }}
                        onClick={() => window.open(`/orders/${order._id}`, '_blank')}
                      >
                        View
                      </button>
                      {order.status === 'completed' && (
                        <button
                          style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #8b5cf611' }}
                          onClick={(e: any) => handleInvoiceClick(order, e)}
                        >
                          Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setSelectedInvoiceOrder(null);
        }}
        order={selectedInvoiceOrder}
      />
    </div>
  );
} 