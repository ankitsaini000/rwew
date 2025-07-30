export interface WorkSubmission {
  _id: string;
  order: {
    service: string;
    amount: number;
    status: string;
    orderID: string;
  };
  description: string;
  files: Array<{
    _id: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  paymentReleased: boolean;
} 