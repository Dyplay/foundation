import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const sendVerificationEmail = async (
  to: string,
  name: string,
  verificationCode: string
) => {
  try {
    const response = await fetch('/api/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        name,
        verificationCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification email');
    }

    return data;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}; 