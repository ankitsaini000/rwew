import { useState } from 'react';
import { X, CreditCard, Loader2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UPIVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
}

export default function UPIVerificationModal({
  isOpen,
  onClose,
  onVerificationComplete
}: UPIVerificationModalProps) {
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationAmount, setVerificationAmount] = useState('1.00');
  const [transactionId, setTransactionId] = useState('');
  const [step, setStep] = useState<'upi' | 'verify'>('upi');

  const handleUPISubmit = async () => {
    if (!upiId || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/verify-upi/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ upiId }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate UPI verification');
      }

      const data = await response.json();
      setVerificationAmount(data.amount);
      setTransactionId(data.transactionId);
      setStep('verify');
      toast.success('UPI verification initiated!');
    } catch (error) {
      toast.error('Failed to initiate UPI verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTransaction = async () => {
    if (!transactionId) {
      toast.error('Transaction ID is required');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/verify-upi/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify transaction');
      }

      toast.success('UPI verification successful!');
      onVerificationComplete();
      onClose();
    } catch (error) {
      toast.error('Failed to verify transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">UPI Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'upi' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="upi" className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter your UPI ID (e.g., name@upi)"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleUPISubmit}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Verify UPI'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Send Verification Amount</h3>
              <p className="text-sm text-purple-700 mb-4">
                Please send exactly ₹{verificationAmount} to complete the verification process.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <div className="flex items-center">
                    <span className="font-medium">₹{verificationAmount}</span>
                    <button
                      onClick={() => copyToClipboard(verificationAmount)}
                      className="ml-2 text-purple-600 hover:text-purple-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <span className="text-sm text-gray-600">UPI ID:</span>
                  <div className="flex items-center">
                    <span className="font-medium">{upiId}</span>
                    <button
                      onClick={() => copyToClipboard(upiId)}
                      className="ml-2 text-purple-600 hover:text-purple-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('upi')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                onClick={handleVerifyTransaction}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 