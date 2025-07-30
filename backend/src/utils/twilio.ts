import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const from = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export const sendSMS = async (to: string, body: string) => {
  if (process.env.MOCK_SMS === 'true') {
    console.log(`[MOCK SMS] To: ${to} | Body: ${body}`);
    return;
  }
  return client.messages.create({
    body,
    from,
    to,
  });
}; 