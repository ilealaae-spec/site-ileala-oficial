import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'ILE ALA <noreply@send.ileala.ae>';
const SITE_URL = process.env.SITE_URL || 'https://site-ileala-oficial.onrender.com';

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${SITE_URL}/verify-email?token=${token}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - ILE ALA',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8B9D83 0%, #6B7D63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ILE ALA</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #8B9D83; margin-top: 0;">Welcome, ${name}!</h2>
              
              <p>Thank you for creating an account with ILE ALA. To complete your registration and start shopping, please verify your email address.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #8B9D83; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #8B9D83; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; margin-bottom: 0;">
                If you didn't create an account with ILE ALA, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ILE ALA. All rights reserved.</p>
              <p>
                <a href="${SITE_URL}" style="color: #8B9D83; text-decoration: none;">Visit our website</a> | 
                <a href="${SITE_URL}/contact" style="color: #8B9D83; text-decoration: none;">Contact us</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`[Email] Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send verification email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to ILE ALA!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ILE ALA</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8B9D83 0%, #6B7D63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ILE ALA</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #8B9D83; margin-top: 0;">Welcome to ILE ALA, ${name}!</h2>
              
              <p>Your email has been verified successfully. You're now ready to explore our exclusive collection of handcrafted tableware and home décor.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/shop" style="background: #8B9D83; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Start Shopping
                </a>
              </div>
              
              <p>Everything you need to create your unique style and elevate your everyday life.</p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px;">Need help? Contact us anytime at <a href="mailto:ileala.ae@gmail.com" style="color: #8B9D83;">ileala.ae@gmail.com</a></p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ILE ALA. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`[Email] Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: number,
  totalAmount: number,
  items: Array<{ name: string; quantity: number; price: number }>
) {
  const formatPrice = (priceInFils: number) => {
    const aed = priceInFils / 100;
    return `AED ${aed.toFixed(2)}`;
  };

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Order Confirmation #${orderId} - ILE ALA`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8B9D83 0%, #6B7D63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ILE ALA</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #8B9D83; margin-top: 0;">Thank you for your order, ${name}!</h2>
              
              <p>We've received your order and will process it shortly.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Order Number</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #8B9D83;">#${orderId}</p>
              </div>
              
              <h3 style="color: #8B9D83; margin-top: 30px;">Order Details</h3>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8B9D83;">Item</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #8B9D83;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #8B9D83;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #8B9D83;">${formatPrice(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/orders" style="background: #8B9D83; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  View Order Status
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px;">Questions? Contact us at <a href="mailto:ileala.ae@gmail.com" style="color: #8B9D83;">ileala.ae@gmail.com</a></p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ILE ALA. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`[Email] Order confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send order confirmation:', error);
    return false;
  }
}


export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password - ILE ALA',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8B9D83 0%, #6B7D63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ILE ALA</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #8B9D83; margin-top: 0;">Reset Your Password</h2>
              
              <p>Hello ${name},</p>
              
              <p>We received a request to reset your password for your ILE ALA account. Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #8B9D83; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #8B9D83; font-size: 14px; word-break: break-all;">${resetUrl}</p>
              
              <p style="color: #e74c3c; font-size: 14px; background: #fef5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #e74c3c;">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; margin-bottom: 0;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ILE ALA. All rights reserved.</p>
              <p>Dubai, United Arab Emirates</p>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}
