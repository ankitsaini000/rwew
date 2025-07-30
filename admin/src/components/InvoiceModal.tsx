"use client";

// Add JSX type declaration to fix the error
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

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

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const generateInvoiceNumber = (orderId: string) => {
    const timestamp = new Date().getTime();
    return `INV-${timestamp.toString().slice(-6)}-${orderId.slice(-4)}`;
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${order._id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-title { font-size: 24px; font-weight: bold; color: #1f2937; }
              .invoice-number { font-size: 16px; color: #6b7280; margin-top: 5px; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .info-item { margin-bottom: 10px; }
              .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
              .info-value { color: #1f2937; }
              .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .items-table th, .items-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
              .items-table th { background-color: #f9fafb; font-weight: bold; }
              .total-section { margin-top: 20px; text-align: right; }
              .total-row { margin-bottom: 10px; }
              .total-label { font-weight: bold; color: #374151; }
              .total-amount { font-size: 20px; font-weight: bold; color: #1f2937; }
              .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">${generateInvoiceNumber(order._id)}</div>
              </div>
              
              <div class="section">
                <div class="section-title">Order Information</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Order ID:</div>
                    <div class="info-value">${order._id}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Invoice Date:</div>
                    <div class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Order Date:</div>
                    <div class="info-value">${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Status:</div>
                    <div class="info-value">${order.status?.toUpperCase() || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Client Information</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">User Name:</div>
                    <div class="info-value">${order.user?.name || order.user?.email || 'N/A'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">User Email:</div>
                    <div class="info-value">${order.user?.email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Brand Information</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Brand Name:</div>
                    <div class="info-value">${order.brand?.name || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Service Details</div>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Order Service</td>
                      <td>${formatCurrency(order.amount || 0)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="total-section">
                  <div class="total-row">
                    <span class="total-label">Total Amount:</span>
                    <span class="total-amount">${formatCurrency(order.amount || 0)}</span>
                  </div>
                </div>
              </div>

              <div class="footer">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated invoice. No signature required.</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: 8, 
        padding: 24, 
        maxWidth: 800, 
        width: '90%', 
        maxHeight: '90vh', 
        overflow: 'auto' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Invoice - {order._id}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              Print
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              Download
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: 24, borderRadius: 8 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: '0 0 8px 0' }}>INVOICE</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Invoice #{generateInvoiceNumber(order._id)}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: '0 0 16px 0' }}>Order Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Order ID:</span>
                  <span style={{ marginLeft: 8, color: '#1f2937' }}>{order._id}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Invoice Date:</span>
                  <span style={{ marginLeft: 8, color: '#1f2937' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Order Date:</span>
                  <span style={{ marginLeft: 8, color: '#1f2937' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Status:</span>
                  <span style={{ 
                    marginLeft: 8, 
                    padding: '4px 8px', 
                    backgroundColor: '#d1fae5', 
                    color: '#059669', 
                    borderRadius: 4, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    {order.status?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: '0 0 16px 0' }}>Payment Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Total Amount:</span>
                  <span style={{ marginLeft: 8, fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>{formatCurrency(order.amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: '0 0 16px 0' }}>Client Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>User Name:</span>
                  <span style={{ marginLeft: 8, color: '#1f2937' }}>{order.user?.name || order.user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>User Email:</span>
                  <span style={{ marginLeft: 8, color: '#1f2937' }}>{order.user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: '0 0 16px 0' }}>Brand Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Brand Name:</span>
                  <span style={{ marginLeft: 8, color: '#1f2937' }}>{order.brand?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: '0 0 16px 0' }}>Service Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>Order Service</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontWeight: 600 }}>{formatCurrency(order.amount || 0)}</td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
                Total: {formatCurrency(order.amount || 0)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32, textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: 18, fontWeight: 500, margin: '0 0 8px 0' }}>Thank you for your business!</p>
            <p style={{ fontSize: 14, margin: 0 }}>This is a computer-generated invoice. No signature required.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 