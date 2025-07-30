import React, { useState } from 'react';
import { X, Download, Printer, FileText, Calendar, DollarSign, User, Building } from 'lucide-react';
import { format } from 'date-fns';
import { Order } from '@/types/order';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

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
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${order.orderID || order._id}</title>
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
                    <div class="info-value">${order.orderID || order._id}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Invoice Date:</div>
                    <div class="info-value">${format(new Date(), 'MMM dd, yyyy')}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Order Date:</div>
                    <div class="info-value">${format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Status:</div>
                    <div class="info-value">${order.status.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Client Information</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Brand Name:</div>
                    <div class="info-value">${order.brandId?.brandName || 'N/A'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Brand Email:</div>
                    <div class="info-value">${order.brandId?.brandEmail || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Creator Information</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Creator Name:</div>
                    <div class="info-value">${order.creatorName || order.creatorId?.creatorName || 'N/A'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Creator Email:</div>
                    <div class="info-value">${order.creatorId?.creatorEmail || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Service Details</div>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Platform</th>
                      <th>Package</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${order.service || 'Content Creation'}</td>
                      <td>${order.platform || 'N/A'}</td>
                      <td>${order.packageName || 'N/A'} (${order.packageType || 'N/A'})</td>
                      <td>${formatCurrency(order.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="total-section">
                  <div class="total-row">
                    <span class="total-label">Total Amount:</span>
                    <span class="total-amount">${formatCurrency(order.totalAmount)}</span>
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Invoice - {order.orderID || order._id}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isPrinting ? 'Printing...' : 'Print'}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p className="text-gray-600">Invoice #{generateInvoiceNumber(order._id)}</p>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                    Order Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Order ID:</span>
                      <span className="ml-2 text-gray-900">{order.orderID || order._id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Invoice Date:</span>
                      <span className="ml-2 text-gray-900">{format(new Date(), 'MMM dd, yyyy')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Order Date:</span>
                      <span className="ml-2 text-gray-900">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
                    Payment Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Payment Status:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Amount:</span>
                      <span className="ml-2 text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    {order.paymentDate && (
                      <div>
                        <span className="font-medium text-gray-700">Payment Date:</span>
                        <span className="ml-2 text-gray-900">{format(new Date(order.paymentDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Client and Creator Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-purple-600" />
                    Client Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Brand Name:</span>
                      <span className="ml-2 text-gray-900">{order.brandId?.brandName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Brand Email:</span>
                      <span className="ml-2 text-gray-900">{order.brandId?.brandEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-600" />
                    Creator Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Creator Name:</span>
                      <span className="ml-2 text-gray-900">{order.creatorName || order.creatorId?.creatorName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Creator Email:</span>
                      <span className="ml-2 text-gray-900">{order.creatorId?.creatorEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Platform
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Package
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.service || 'Content Creation'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.platform || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.packageName || 'N/A'} ({order.packageType || 'N/A'})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    Total: {formatCurrency(order.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-gray-600">
                <p className="text-lg font-medium">Thank you for your business!</p>
                <p className="text-sm mt-2">This is a computer-generated invoice. No signature required.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 