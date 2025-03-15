// Resend email integration
// Documentation: https://resend.com/docs/introduction

// In a real application, you would store this in an environment variable
// For development purposes, we're hardcoding it here
const RESEND_API_KEY = 're_UkWuzEDx_4jhgqu42TnfGeLmMdKXxBynU';

// During development/testing, use the Resend onboarding address
// After domain verification, switch to your custom domain
const FROM_EMAIL = 'Foundation <no-reply@mail.dyplay.at>';

/**
 * Send a verification email using Resend
 * @param to Recipient email address
 * @param name Recipient name
 * @param code Verification code
 * @returns Promise<boolean>
 */
export const sendVerificationEmail = async (to: string, name: string, code: string): Promise<boolean> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.error('Not in a browser environment');
      return false;
    }
    
    // In a real application, you would make this call from a server-side API
    // For this demo, we'll make the call directly from the browser
    // Note: This is not recommended for production as it exposes your API key
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: to, // Send to actual recipient since domain is verified
        subject: 'Verify Your Email - Foundation',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #1a1a1a; font-family: Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <img src="https://mail.dyplay.at/logo.png" alt="Foundation Logo" style="height: 60px; margin-bottom: 30px;">
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #2a2a2a; border-radius: 12px; padding: 40px; color: #ffffff;">
                    <h1 style="margin: 0 0 20px; color: #8b5cf6; font-size: 24px; font-weight: 600;">Verify Your Email</h1>
                    
                    <p style="margin: 0 0 25px; color: #e0e0e0; font-size: 16px; line-height: 1.5;">
                      Hello ${name},
                    </p>
                    
                    <p style="margin: 0 0 25px; color: #e0e0e0; font-size: 16px; line-height: 1.5;">
                      Thank you for signing up! Please use the verification code below to complete your registration:
                    </p>
                    
                    <div style="background-color: #1a1a1a; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6; font-family: monospace;">${code}</span>
                    </div>
                    
                    <p style="margin: 0 0 25px; color: #e0e0e0; font-size: 16px; line-height: 1.5;">
                      This code will expire in 30 minutes for security purposes.
                    </p>
                    
                    <p style="margin: 0 0 25px; color: #e0e0e0; font-size: 16px; line-height: 1.5;">
                      If you didn't request this verification, please ignore this email.
                    </p>
                    
                    <div style="border-top: 1px solid #404040; margin-top: 30px; padding-top: 30px;">
                      <p style="margin: 0; color: #888888; font-size: 14px; line-height: 1.5; text-align: center;">
                        This is an automated message from Foundation. Please do not reply to this email.
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <div style="margin-bottom: 20px;">
                      <a href="https://github.com" style="display: inline-block; margin: 0 10px; color: #888888; text-decoration: none;">
                        <img src="https://mail.dyplay.at/github-mark-white.png" alt="GitHub" style="height: 24px;">
                      </a>
                      <a href="https://twitter.com" style="display: inline-block; margin: 0 10px; color: #888888; text-decoration: none;">
                        <img src="https://mail.dyplay.at/twitter.png" alt="Twitter" style="height: 24px;">
                      </a>
                      <a href="https://linkedin.com" style="display: inline-block; margin: 0 10px; color: #888888; text-decoration: none;">
                        <img src="https://mail.dyplay.at/linkedin.png" alt="LinkedIn" style="height: 24px;">
                      </a>
                    </div>
                    <p style="margin: 0; color: #888888; font-size: 12px;">
                      © Foundation 2024. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error sending email:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

/**
 * For development: Simulate sending an email with a notification
 * @param email Recipient email address
 * @param code Verification code
 * @param name Recipient name
 */
export const simulateSendingEmail = (email: string, code: string, name: string) => {
  // In development, show a notification
  if (typeof window !== 'undefined') {
    // Create a notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#1e1e1e';
    notification.style.color = '#e0e0e0';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';
    notification.style.border = '1px solid #333';
    notification.style.animation = 'slideInRight 0.3s ease-out forwards';
    
    // Email content
    notification.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; color: #6366f1;">Email Sent Simulation</div>
        <div style="margin-bottom: 5px;">To: ${email}</div>
        <div style="margin-bottom: 10px;">Subject: Your Verification Code</div>
        <div style="border-top: 1px solid #444; padding-top: 10px; margin-top: 5px;">
            <p>Hello ${name},</p>
            <p>Your verification code is: <strong style="color: #6366f1; letter-spacing: 1px;">${code}</strong></p>
            <p>This code will expire in 30 minutes.</p>
        </div>
        <button id="close-notification" style="background: #2a2a2a; border: none; color: #e0e0e0; padding: 5px 10px; margin-top: 10px; border-radius: 3px; cursor: pointer; transition: background-color 0.2s;">Close</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close button functionality
    document.getElementById('close-notification')?.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    });
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 10000);
  }
}; 