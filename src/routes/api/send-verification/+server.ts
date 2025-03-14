import { json } from '@sveltejs/kit';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function POST({ request }) {
    try {
        const { to, name, verificationCode } = await request.json();

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [to],
            subject: 'Verify Your Email - EonfluxTech',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #333; text-align: center;">Welcome to EonfluxTech!</h1>
                    
                    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <p style="font-size: 16px; color: #444;">Hi ${name},</p>
                        <p style="font-size: 16px; color: #444;">Thank you for signing up! To complete your registration, please use the following verification code:</p>
                        
                        <div style="background-color: #ffffff; border: 2px solid #e1e1e1; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${verificationCode}</span>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">This code will expire in 1 hour. If you didn't request this verification, please ignore this email.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} EonfluxTech. All rights reserved.</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Server error sending email:', error);
            return json({ error: error.message }, { status: 500 });
        }

        return json({ success: true, data });
    } catch (error) {
        console.error('Server error:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }
} 