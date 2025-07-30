'use client';

import { FileText } from 'lucide-react';
import { WorkSubmission } from '@/types/workSubmission';

interface WorkSubmissionsProps {
  submissions: WorkSubmission[];
  onViewSubmission: (submission: WorkSubmission | null) => void;
  onApproveSubmission: (submissionId: string) => void;
  onRejectSubmission: (submissionId: string, rejectionReason: string) => void;
}

export default function WorkSubmissions({ 
  submissions,
  onViewSubmission,
  onApproveSubmission,
  onRejectSubmission
}: WorkSubmissionsProps) {
  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No work submissions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div
          key={submission._id}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onViewSubmission(submission)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {submission.order?.service || 'Unknown Service'} - {submission.order?.orderID || 'No Order ID'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {submission.description}
              </p>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {new Date(submission.createdAt).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500">
                  {submission.files?.length || 0} file(s)
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {submission.approvalStatus === 'pending' && (
                <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  Pending
                </span>
              )}
              {submission.approvalStatus === 'approved' && (
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  Approved
                </span>
              )}
              {submission.approvalStatus === 'rejected' && (
                <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                  Rejected
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 