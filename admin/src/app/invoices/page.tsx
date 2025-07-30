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

interface Invoice {
  _id: string;
  orderId: string;
  invoiceNumber: string;
  order: Order;
  createdAt: string;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        
        // Generate invoices from completed orders
        const completedOrders = orderList.filter((order: Order) => order.status === 'completed');
        const generatedInvoices: Invoice[] = completedOrders.map((order: Order) => ({
          _id: `inv_${order._id}`,
          orderId: order._id,
          invoiceNumber: generateInvoiceNumber(order._id),
          order: order,
          createdAt: order.createdAt || new Date().toISOString(),
          totalAmount: order.amount || 0,
          status: 'paid' // Assuming completed orders are paid
        }));
        
        setInvoices(generatedInvoices);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const generateInvoiceNumber = (orderId: string) => {
    const timestamp = new Date().getTime();
    return `INV-${timestamp.toString().slice(-6)}-${orderId.slice(-4)}`;
  };

  const handleInvoiceClick = (order: Order, e: any) => {
    e.stopPropagation();
    setSelectedInvoiceOrder(order);
    setInvoiceModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { background: '#d1fae5', color: '#059669' };
      case 'pending':
        return { background: '#fef9c3', color: '#b45309' };
      case 'overdue':
        return { background: '#fee2e2', color: '#b91c1c' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.order.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>All Invoices</h1>
      
      {/* Filters and Search */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24, 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
              width: 250,
              outline: 'none'
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none'
          }}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 14, color: '#6b7280' }}>
          Total: {filteredInvoices.length} invoices
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading invoices...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #2563eb11', padding: 18 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', fontSize: 16 }}>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Invoice #</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Client</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Brand</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Created Date</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>No invoices found.</td></tr>
              ) : filteredInvoices.map(invoice => (
                <tr key={invoice._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 15 }}>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>
                    {invoice.invoiceNumber}
                  </td>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: 13 }}>
                    {invoice.orderId}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {invoice.order.user?.name || invoice.order.user?.email || '-'}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {invoice.order.brand?.name || '-'}
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      background: getStatusColor(invoice.status).background,
                      color: getStatusColor(invoice.status).color,
                      padding: '4px 14px',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 14
                    }}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{ 
                          background: '#8b5cf6', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 8, 
                          padding: '7px 18px', 
                          fontWeight: 600, 
                          fontSize: 15, 
                          cursor: 'pointer', 
                          boxShadow: '0 2px 8px #8b5cf611' 
                        }}
                        onClick={(e) => handleInvoiceClick(invoice.order, e)}
                      >
                        View Invoice
                      </button>
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