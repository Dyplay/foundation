// Resend email integration
// Documentation: https://resend.com/docs/introduction

// In a real application, you would store this in an environment variable
// For development purposes, we're hardcoding it here
const RESEND_API_KEY = 're_RBxP1fnY_KBcCsiF4ifvAg8We2ueAMtAz'; // Replace with your actual Resend API key
const FROM_EMAIL = 'no-reply-eonfluxtech@dyplay.at'; // Replace with your verified domain

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
        to: to,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
            <h2 style="color: #4f46e5;">Verify Your Email</h2>
            <p>Hello ${name},</p>
            <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${code}</span>
            </div>
            <p>This code will expire in 30 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #64748b;">This is an automated message, please do not reply.</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending email:', errorData);
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