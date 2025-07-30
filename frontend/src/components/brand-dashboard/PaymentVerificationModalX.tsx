import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

interface UPIDetails {
  upiId: string;
}

export default function PaymentVerificationModal({
  isOpen,
  onClose,
  onVerificationComplete
}: PaymentVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [upiDetails, setUpiDetails] = useState<UPIDetails>({
    upiId: ''
  });

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUPIInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiDetails({
      upiId: e.target.value
    });
  };

  const validateCardDetails = () => {
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.name) {
      toast.error('Please fill in all card details');
      return false;
    }
    if (cardDetails.cardNumber.length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (cardDetails.cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV');
      return false;
    }
    return true;
  };

  const validateUPIDetails = () => {
    if (!upiDetails.upiId) {
      toast.error('Please enter your UPI ID');
      return false;
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upiDetails.upiId)) {
      toast.error('Please enter a valid UPI ID (e.g., name@bank)');
      return false;
    }
    return true;
  };

  const handleVerification = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (selectedMethod === 'card' && !validateCardDetails()) {
      return;
    }

    if (selectedMethod === 'upi' && !validateUPIDetails()) {
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically integrate with your payment gateway
      // For now, we'll simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payment method verified successfully');
      onVerificationComplete();
      onClose();
    } catch (error) {
      toast.error('Failed to verify payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCardForm = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          maxLength={16}
          value={cardDetails.cardNumber}
          onChange={handleCardInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="1234 5678 9012 3456"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiryDate"
            name="expiryDate"
            maxLength={5}
            value={cardDetails.expiryDate}
            onChange={handleCardInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="MM/YY"
          />
        </div>
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
            CVV
          </label>
          <input
            type="password"
            id="cvv"
            name="cvv"
            maxLength={3}
            value={cardDetails.cvv}
            onChange={handleCardInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="123"
          />
        </div>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Cardholder Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={cardDetails.name}
          onChange={handleCardInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="John Doe"
        />
      </div>
    </div>
  );

  const renderUPIForm = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
          UPI ID
        </label>
        <input
          type="text"
          id="upiId"
          value={upiDetails.upiId}
          onChange={handleUPIInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="name@bank"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter your UPI ID (e.g., name@bank)
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-medium">
              Verify Payment Method
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {!selectedMethod ? (
              <>
                <p className="text-base text-gray-500">
                  Select a payment method to verify your account
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedMethod('card')}
                    className="w-full p-6 border rounded-lg flex items-center space-x-4 hover:border-gray-300"
                  >
                    <div className="p-3 bg-white rounded-md shadow-sm">
                      <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-medium">Credit/Debit Card</p>
                      <p className="text-base text-gray-500">Verify with card payment</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('upi')}
                    className="w-full p-6 border rounded-lg flex items-center space-x-4 hover:border-gray-300"
                  >
                    <div className="p-3 bg-white rounded-md shadow-sm">
                      <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-medium">UPI</p>
                      <p className="text-base text-gray-500">Verify with UPI payment</p>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xl font-medium">
                    {selectedMethod === 'card' ? 'Credit/Debit Card Details' : 'UPI Details'}
                  </span>
                </div>

                {selectedMethod === 'card' ? renderCardForm() : renderUPIForm()}

                <div className="mt-8">
                  <button
                    onClick={handleVerification}
                    disabled={isLoading}
                    className="w-full py-3 px-6 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Payment Method'}
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 