import { Resend, CreateEmailOptions } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailByResend({
  from = 'no-reply@shipeasy.com',
  ...options
}: CreateEmailOptions) {
  try {
    const data = {
      from,
      ...options
    };

    const response = await resend.emails.send(data);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
} 