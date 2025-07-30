"use client";

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Eye,
  FileText,
  Building,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  getAllBrandVerifications, 
  getBrandVerificationById, 
  approveBrandVerification, 
  rejectBrandVerification 
} from '@/services/api';
import { toast } from 'react-hot-toast';

export default function BrandVerificationRequests() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [filter, page]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? undefined : filter;
      const response = await getAllBrandVerifications(page, 10, statusFilter);
      
      if (response.success && 'data' in response) {
        setVerifications(response.data.verificationRequests || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setVerifications([]);
        setTotalPages(1);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verification requests');
      setLoading(false);
    }
  };

  const viewDetails = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await getBrandVerificationById(id);
      
      if (response.success && 'data' in response) {
        setSelectedVerification(response.data.verificationRequest);
        setShowDetailModal(true);
      } else {
        toast.error('Failed to load verification details');
      }
      setActionLoading(false);
    } catch (error) {
      console.error('Error fetching verification details:', error);
      toast.error('Failed to load verification details');
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    try {
      setActionLoading(true);
      const response = await approveBrandVerification(selectedVerification._id, notes);
      
      if (response.success) {
        toast.success('Verification request approved');
        setShowApproveModal(false);
        setShowDetailModal(false);
        fetchVerifications();
      } else if ('error' in response) {
        toast.error(response.error);
      } else {
        toast.error('Failed to approve verification');
      }
      setActionLoading(false);
    } catch (error) {
      console.error('Error approving verification:', error);
      toast.error('Failed to approve verification');
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectionReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await rejectBrandVerification(selectedVerification._id, rejectionReason, notes);
      
      if (response.success) {
        toast.success('Verification request rejected');
        setShowRejectModal(false);
        setShowDetailModal(false);
        fetchVerifications();
      } else if ('error' in response) {
        toast.error(response.error);
      } else {
        toast.error('Failed to reject verification');
      }
      setActionLoading(false);
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject verification');
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Building className="w-5 h-5 mr-2 text-gray-500" />
            Brand Verification Requests
          </h2>
          
          <div className="mt-3 md:mt-0 flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="pl-9 block w-full rounded-md border border-gray-300 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as any);
                  setPage(1);
                }}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
      ) : verifications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No verification requests found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'There are no verification requests yet.'
              : `No ${filter} verification requests available.`}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verifications.map((verification) => (
                  <tr key={verification._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{verification.businessName}</div>
                          <div className="text-sm text-gray-500">{verification.businessType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{verification.businessEmail}</div>
                      <div className="text-sm text-gray-500">{verification.businessPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(verification.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(verification.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewDetails(verification._id)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        disabled={actionLoading}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Detail Modal */}
      {showDetailModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-gray-500" />
                  {selectedVerification.businessName}
                </h3>
                {getStatusBadge(selectedVerification.verificationStatus)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Business Information</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 block">Business Name</span>
                      <span className="font-medium">{selectedVerification.businessName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Business Type</span>
                      <span className="font-medium">{selectedVerification.businessType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Business Website</span>
                      <a href={selectedVerification.businessWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedVerification.businessWebsite}</a>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Registration Number</span>
                      <span className="font-medium">{selectedVerification.registrationNumber || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Tax ID / VAT Number</span>
                      <span className="font-medium">{selectedVerification.taxId || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 block">Email</span>
                      <a href={`mailto:${selectedVerification.businessEmail}`} className="text-blue-600 hover:underline">{selectedVerification.businessEmail}</a>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Phone</span>
                      <span className="font-medium">{selectedVerification.businessPhone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Address</span>
                      <address className="not-italic">
                        {selectedVerification.businessAddress?.street}<br />
                        {selectedVerification.businessAddress?.city}, {selectedVerification.businessAddress?.state} {selectedVerification.businessAddress?.postalCode}<br />
                        {selectedVerification.businessAddress?.country}
                      </address>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedVerification.documents?.businessRegistration && (
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-medium mb-2">Business Registration</div>
                        <a 
                          href={selectedVerification.documents.businessRegistration} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Document
                        </a>
                      </div>
                    )}
                    
                    {selectedVerification.documents?.taxDocument && (
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-medium mb-2">Tax Document</div>
                        <a 
                          href={selectedVerification.documents.taxDocument} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Document
                        </a>
                      </div>
                    )}
                    
                    {selectedVerification.documents?.identityProof && (
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-medium mb-2">Identity Proof</div>
                        <a 
                          href={selectedVerification.documents.identityProof} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Document
                        </a>
                      </div>
                    )}
                    
                    {(!selectedVerification.documents?.businessRegistration && 
                      !selectedVerification.documents?.taxDocument && 
                      !selectedVerification.documents?.identityProof) && (
                      <div className="col-span-3 text-center py-6 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">No documents uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedVerification.verificationStatus === 'rejected' && (
                  <div className="md:col-span-2 bg-red-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-red-800 mb-2">Rejection Reason</h4>
                    <p className="text-red-700">{selectedVerification.rejectionReason}</p>
                    
                    {selectedVerification.notes && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-red-800">Additional Notes</h5>
                        <p className="text-sm text-red-700">{selectedVerification.notes}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedVerification.verificationStatus === 'approved' && selectedVerification.notes && (
                  <div className="md:col-span-2 bg-green-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-green-800 mb-2">Approval Notes</h4>
                    <p className="text-green-700">{selectedVerification.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                
                {selectedVerification.verificationStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedVerification(selectedVerification);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVerification(selectedVerification);
                        setShowApproveModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Approve Modal */}
      {showApproveModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Approve Verification</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve the verification request for <span className="font-medium">{selectedVerification.businessName}</span>?
            </p>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes for internal reference"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Modal */}
      {showRejectModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Verification</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting the verification request for <span className="font-medium">{selectedVerification.businessName}</span>.
            </p>
            
            <div className="mb-4">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                id="rejectionReason"
                rows={3}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain why this verification request is being rejected"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={2}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes for internal reference"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 