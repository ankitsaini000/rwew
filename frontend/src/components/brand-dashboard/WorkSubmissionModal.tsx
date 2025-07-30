'use client';

import { useState } from 'react';
import { X, Download, CheckCircle, XCircle, FileText, Loader2, DollarSign } from 'lucide-react';
import { WorkSubmission } from '@/types/workSubmission';
import { toast } from 'react-hot-toast';

interface WorkSubmissionModalProps {
  submission: WorkSubmission;
  onClose: () => void;
  onApprove: (submissionId: string) => void;
  onReject: (submissionId: string, rejectionReason: string) => void;
  onReleasePayment?: (submissionId: string) => void;
}

export default function WorkSubmissionModal({
  submission,
  onClose,
  onApprove,
  onReject,
  onReleasePayment
}: WorkSubmissionModalProps) {
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isReleasingPayment, setIsReleasingPayment] = useState(false);

  const handleApprove = () => {
    onApprove(submission._id);
  };

  const handleReject = () => {
    if (showRejectionInput) {
      onReject(submission._id, rejectionReason);
    } else {
      setShowRejectionInput(true);
    }
  };

  const handleReleasePayment = async () => {
    if (onReleasePayment) {
      setIsReleasingPayment(true);
      try {
        console.log('Attempting to release payment for submission:', submission._id);
        await onReleasePayment(submission._id);
        console.log('Payment release successful.');
        toast.success('Payment Released successfully', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }
        });
      } catch (error) {
        console.error('Payment release failed:', error);
        toast.error('Failed to release payment. Please try again.', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }
        });
      } finally {
        setIsReleasingPayment(false);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Work Submission Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {submission.order?.service || 'Unknown Service'} - {submission.order?.orderID || 'No Order ID'}
              </h3>
              <p className="mt-2 text-gray-600">{submission.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Files</h4>
              <div className="space-y-2">
                {submission.files.map((file) => (
                  <a
                    key={file._id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Download className="w-5 h-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>

            {showRejectionInput && (
              <div className="mt-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectionReason"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this submission..."
                />
              </div>
            )}

            {submission.approvalStatus === 'pending' && (
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={handleReject}
                  className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  {showRejectionInput ? 'Confirm Rejection' : 'Reject'}
                </button>
                <button
                  onClick={handleApprove}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approve
                </button>
              </div>
            )}

            {submission.approvalStatus === 'approved' && onReleasePayment && (
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={handleReleasePayment}
                  disabled={isReleasingPayment || submission.paymentReleased}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    isReleasingPayment || submission.paymentReleased
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors duration-200`}
                >
                  {isReleasingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Releasing Payment...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5 mr-2" />
                      {submission.paymentReleased ? 'Payment Released Complete' : 'Release Payment'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 