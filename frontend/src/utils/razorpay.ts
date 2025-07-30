export interface RazorpayOptions {
  key?: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  [key: string]: any;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export function openRazorpay(options: RazorpayOptions) {
  const key = options.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_4NmoG4TVzCWe4Q';
  const razorpayOptions = {
    ...options,
    key,
  };
  // @ts-ignore
  const rzp = new window.Razorpay(razorpayOptions);
  rzp.open();
}

interface UpiVerificationData {
  name: string;
  upiId: string;
  email?: string;
  contact?: string;
  [key: string]: any;
}

export async function verifyUpiWithRazorpay(
  upiData: UpiVerificationData,
  onSuccess?: (response: any) => void,
  onError?: (error: any) => void
) {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    if (onError) onError('Failed to load Razorpay SDK. Please try again.');
    return;
  }
  try {
    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upiId: upiData.upiId,
        name: upiData.name,
      }),
    });
    const data = await response.json();
    const prefill: any = { name: upiData.name };
    if (upiData.email) prefill.email = upiData.email;
    if (upiData.contact) prefill.contact = upiData.contact;
    openRazorpay({
      amount: data.amount, // in paise
      currency: 'INR',
      name: 'UPI Verification',
      description: 'Verify your UPI ID',
      order_id: data.order_id,
      handler: function (response: any) {
        if (onSuccess) onSuccess(response);
      },
      prefill,
      theme: { color: '#3399cc' },
    });
  } catch (error) {
    if (onError) onError(error);
  }
} 