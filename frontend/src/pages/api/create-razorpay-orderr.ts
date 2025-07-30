import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { upiId, name } = req.body;

  try {
    const order: any = await razorpay.orders.create({
      amount: 100, // amount in paise (₹1.00)
      currency: 'INR',
      notes: { upiId, name },
    });

    res.status(200).json({ order_id: order.id, amount: order.amount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
} 