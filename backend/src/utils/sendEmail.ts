import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  console.log('--- Nodemailer Config Debug ---');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
  console.log('EMAIL_PASSWORD (first 3 chars): ', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.substring(0, 3) + '...' : 'not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('-------------------------------');

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.NODE_ENV === 'production' ? true : false, // Use TLS for secure (port 587) or SSL (port 465)
    auth: (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) ? {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    } : undefined,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Successfully sent email to ${options.email}`);
  } catch (error) {
    console.error(`[Email] Failed to send email to ${options.email}:`, error);
    throw new Error('Email sending failed.');
  }
};

export default sendEmail; 