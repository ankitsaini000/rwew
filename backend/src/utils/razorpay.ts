import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Jlvb5wZpEue8k0',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mWcXw7wleDOr2FOu5wWSctcK',
});

// Create a new Razorpay order (for payments/transactions)
export const createRazorpayOrder = async (amount: number, currency = 'INR', receipt = '', notes = {}) => {
  const options = {
    amount: Math.round(amount * 100), // Amount in paise
    currency,
    receipt,
    payment_capture: 1,
    notes,
  };
  return await razorpay.orders.create(options);
};

// Verify Razorpay payment signature (for verification)
export const verifyRazorpaySignature = (orderId: string, paymentId: string, signature: string) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'oZNOReqThIGP6wGSILuoaD7m');
  hmac.update(orderId + '|' + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

export default razorpay; 