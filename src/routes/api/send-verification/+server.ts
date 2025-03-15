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
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%; background-color: #f8f9fa;">
                        <tr>
                            <td style="padding: 20px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Enhanced Header with Logo -->
                                    <tr>
                                        <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%); border-radius: 10px 10px 0 0;">
                                            <img src="https://cloud.appwrite.io/v1/storage/buckets/67d484c20015a1cb1f06/files/67d484df0026169d24b4/view?project=67d3f589000488385c35&mode=user" alt="EonfluxTech Logo" style="width: 200px; height: auto; margin-bottom: 30px;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 42px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1); letter-spacing: -1px;">Welcome to EonfluxTech</h1>
                                            <p style="color: #ffffff; font-size: 18px; margin: 15px 0 0; opacity: 0.9;">Building the future of open source software</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Enhanced Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 24px; background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Verify Your Email</h2>
                                            <p style="color: #374151; font-size: 18px; margin-bottom: 24px;">Hi ${name},</p>
                                            <p style="color: #374151; font-size: 18px; margin-bottom: 32px;">Thank you for joining us! To complete your registration and start exploring our products, please use the verification code below:</p>
                                            
                                            <!-- Enhanced Verification Code Box -->
                                            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%); padding: 4px; border-radius: 16px; margin: 32px 0; box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.25);">
                                                <div style="background-color: #ffffff; padding: 30px; border-radius: 14px; text-align: center;">
                                                    <span style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #374151; font-family: 'Courier New', monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${verificationCode}</span>
                                                </div>
                                            </div>
                                            
                                            <p style="color: #6b7280; font-size: 16px; margin-top: 32px; line-height: 1.6;">This code will expire in 1 hour. If you didn't request this verification, please ignore this email.</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Enhanced Footer -->
                                    <tr>
                                        <td style="padding: 40px 30px; background: linear-gradient(to right, #f8f9fa, #ffffff, #f8f9fa); border-radius: 0 0 10px 10px; text-align: center;">
                                            <div style="margin-bottom: 20px;">
                                                <a href="https://eonfluxtech.com" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 16px;">Explore Our Products</a>
                                            </div>
                                            <p style="color: #6b7280; font-size: 14px; margin: 0;">© ${new Date().getFullYear()} EonfluxTech. All rights reserved.</p>
                                            <div style="margin-top: 16px;">
                                                <a href="https://eonfluxtech.com" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500;">Visit our website →</a>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
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