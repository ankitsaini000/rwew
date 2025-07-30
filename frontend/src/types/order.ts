export interface Order {
  _id: string;
  orderID?: string; // Make orderID optional as it's not always present in data
  brandId?: {
    _id: string;
    brandName: string;
    brandEmail: string;
    brandImage?: string;
    brandUsername?: string;
  };
  creatorId?: {
    _id: string;
    creatorName: string;
    creatorEmail: string;
    creatorImage?: string;
    creatorUsername?: string;
  };
  creatorName?: string;
  creatorUsername?: string;
  creatorImage?: string;
  service?: string;
  platform?: string;
  packageType?: string;
  packageName?: string;
  packagePrice?: number;
  totalAmount: number;
  platformFee?: number;
  currency?: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string; // Optional payment date
  createdAt: string;
  updatedAt?: string;
  deliveryDate?: string; // Optional delivery date
  description?: string; // Add description to Order interface if needed for Service Details
  deliverables?: string[]; // Add deliverables
  submittedWork?: {
    _id: string;
    status: 'pending' | 'approved' | 'rejected';
    files: Array<{ filename: string; path: string; url: string }>; // Correct type for files
    description?: string; // Add description to submittedWork
    rejectionReason?: string; // Change feedback to rejectionReason based on usage
    submittedAt: string;
  };
  clientFeedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
  promotionType?: string; // Optional promotionType
  statusHistory?: Array<{status: string, date: string}>; // Add statusHistory
} 