import { Resend } from 'resend';
import { logger } from './_core/logger';

// Lazy initialization to avoid crash on startup
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      logger.error('[Email] RESEND_API_KEY is not set in environment variables!');
      throw new Error('RESEND_API_KEY is not configured');
    }
    
    logger.info('[Email] Initializing Resend with API key:', apiKey.substring(0, 8) + '...');
    resendInstance = new Resend(apiKey);
  }
  
  return resendInstance;
}

const FROM_EMAIL = 'ILE ALA <noreply@ileala.ae>';

// ALWAYS use www.ileala.ae for email links - never admin.ileala.ae
const getSiteUrl = () => {
  // Force www.ileala.ae regardless of SITE_URL environment variable
  // This ensures email links always go to the main site, not admin subdomain
  return 'https://www.ileala.ae';
};

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const siteUrl = getSiteUrl();
  // Codificar o token para URL
  const encodedToken = encodeURIComponent(token);
  const verificationUrl = `${siteUrl}/verify-email?token=${encodedToken}`;
  
  logger.info(`[Email] Attempting to send verification email to ${email}`);
  logger.debug(`[Email] FROM: ${FROM_EMAIL}`);
  logger.debug(`[Email] Resend API Key configured: ${!!process.env.RESEND_API_KEY}`);
  logger.debug(`[Email] Verification URL: ${verificationUrl}`);
  
  try {
    const result = await getResend().emails.send({
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
                <!-- Button usando tabela para melhor compatibilidade com clientes de email -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: #8B9D83; border-radius: 5px; text-align: center;">
                      <a href="${verificationUrl}" style="display: block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px; cursor: pointer;">
                        Verify Email Address
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Fallback: Link de texto que sempre funciona -->
              <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">If the button doesn't work, click this link:</p>
                <a href="${verificationUrl}" style="color: #8B9D83; text-decoration: underline; font-size: 14px; word-break: break-all; display: block;">
                  ${verificationUrl}
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
              <p style="color: #8B9D83; font-size: 12px; word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 3px; font-family: monospace;">${verificationUrl}</p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; margin-bottom: 0;">
                If you didn't create an account with ILE ALA, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ILE ALA. All rights reserved.</p>
              <p>
                <a href="${siteUrl}" style="color: #8B9D83; text-decoration: none;">Visit our website</a> | 
                <a href="${siteUrl}/contact" style="color: #8B9D83; text-decoration: none;">Contact us</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });
    
    logger.debug(`[Email] Resend API response:`, JSON.stringify(result));
    logger.info(`[Email] Verification email sent successfully to ${email}`);
    return true;
  } catch (error) {
    logger.error('[Email] ERROR sending verification email:', error);
    if (error instanceof Error) {
      logger.error('[Email] Error details:', { message: error.message, stack: error.stack });
    }
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const siteUrl = getSiteUrl();
  try {
    await getResend().emails.send({
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
                <!-- Button usando tabela para melhor compatibilidade com clientes de email -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: #8B9D83; border-radius: 5px; text-align: center;">
                      <a href="${siteUrl}/shop" style="display: block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px; cursor: pointer;">
                        Start Shopping
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <p>Everything you need to create your unique style and elevate your everyday life.</p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px;">Need help? Contact us anytime at <a href="mailto:contact@ileala.ae" style="color: #8B9D83;">contact@ileala.ae</a></p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ILE ALA. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });
    
    logger.info(`[Email] Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error('[Email] Failed to send welcome email:', error);
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
  logger.info(`[Email] Attempting to send order confirmation email to ${email}`);
  logger.debug(`[Email] Order ID: ${orderId}`);
  logger.debug(`[Email] Total amount: ${totalAmount} fils`);
  logger.debug(`[Email] Items count: ${items.length}`);
  logger.debug(`[Email] Resend API Key configured: ${!!process.env.RESEND_API_KEY}`);
  
  const formatPrice = (priceInFils: number) => {
    const aed = priceInFils / 100;
    return `AED ${aed.toFixed(2)}`;
  };

  // Se não houver itens, criar um item genérico
  const emailItems = items.length > 0 ? items : [{
    name: 'Product',
    quantity: 1,
    price: totalAmount,
  }];

  const itemsHtml = emailItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const siteUrl = getSiteUrl();

  try {
    const result = await getResend().emails.send({
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
                <!-- Button usando tabela para melhor compatibilidade com clientes de email -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: #8B9D83; border-radius: 5px; text-align: center;">
                      <a href="${siteUrl}/orders" style="display: block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px; cursor: pointer;">
                        View Order Status
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px;">Questions? Contact us at <a href="mailto:contact@ileala.ae" style="color: #8B9D83;">contact@ileala.ae</a></p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ILE ALA. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });
    
    logger.info(`[Email] Order confirmation email sent successfully to ${email}`);
    logger.debug(`[Email] Resend API response:`, JSON.stringify(result));
    return true;
  } catch (error) {
    logger.error('[Email] ERROR sending order confirmation email:', error);
    if (error instanceof Error) {
      logger.error('[Email] Error details:', { message: error.message, stack: error.stack });
    }
    return false;
  }
}


export async function sendNewsletterConfirmationEmail(email: string, name?: string) {
  const siteUrl = getSiteUrl();
  const displayName = name || 'there';
  
  logger.info(`[Email] Attempting to send newsletter confirmation email to ${email}`);
  logger.debug(`[Email] FROM: ${FROM_EMAIL}`);
  logger.debug(`[Email] Resend API Key configured: ${!!process.env.RESEND_API_KEY}`);
  
  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to ILE ALA Newsletter!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Newsletter Subscription Confirmed</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8B9D83 0%, #6B7D63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ILE ALA</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #8B9D83; margin-top: 0;">Thank you for subscribing, ${displayName}!</h2>
              
              <p>We're thrilled to have you join our community. You're now part of an exclusive circle that receives:</p>
              
              <ul style="color: #666; font-size: 14px; line-height: 2;">
                <li>✨ Early access to new collections</li>
                <li>🎁 Exclusive offers and promotions</li>
                <li>📰 The latest news from the world of luxury table setting</li>
                <li>💡 Design inspiration and styling tips</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <!-- Button usando tabela para melhor compatibilidade com clientes de email -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: #8B9D83; border-radius: 5px; text-align: center;">
                      <a href="${siteUrl}/shop" style="display: block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px; cursor: pointer;">
                        Explore Our Collection
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                If you didn't subscribe to our newsletter, you can safely ignore this email or 
                <a href="${siteUrl}/contact" style="color: #8B9D83; text-decoration: underline;">contact us</a> to unsubscribe.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ILE ALA. All rights reserved.</p>
              <p>
                <a href="${siteUrl}" style="color: #8B9D83; text-decoration: none;">Visit our website</a> | 
                <a href="${siteUrl}/contact" style="color: #8B9D83; text-decoration: none;">Contact us</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });
    
    logger.info(`[Email] Newsletter confirmation email sent successfully to ${email}`);
    logger.debug(`[Email] Resend API response:`, JSON.stringify(result));
    return true;
  } catch (error) {
    logger.error('[Email] ERROR sending newsletter confirmation email:', error);
    if (error instanceof Error) {
      logger.error('[Email] Error details:', { message: error.message, stack: error.stack });
    }
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  logger.debug('[sendPasswordResetEmail] Called with token:', token.substring(0, 8) + '...');
  logger.debug('[sendPasswordResetEmail] Token length:', token.length);
  const siteUrl = getSiteUrl();
  // Use encodeURIComponent to protect token from being corrupted by email clients
  const encodedToken = encodeURIComponent(token);
  const resetUrl = `${siteUrl}/reset-password?token=${encodedToken}`;
  logger.debug('[sendPasswordResetEmail] Encoded token:', encodedToken.substring(0, 8) + '...');
  logger.debug('[sendPasswordResetEmail] Reset URL:', resetUrl);
  
  try {
    await getResend().emails.send({
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
                <!-- Button usando tabela para melhor compatibilidade com clientes de email -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: #8B9D83; border-radius: 5px; text-align: center;">
                      <a href="${resetUrl}" style="display: block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px; cursor: pointer;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Fallback: Link de texto que sempre funciona -->
              <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">If the button doesn't work, click this link:</p>
                <a href="${resetUrl}" style="color: #8B9D83; text-decoration: underline; font-size: 14px; word-break: break-all; display: block;">
                  ${resetUrl}
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
              <p style="color: #8B9D83; font-size: 12px; word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 3px; font-family: monospace;">${resetUrl}</p>
              
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
    
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw error;
  }
}

/**
 * Generic function to send any email
 * Used by security features like login notifications
 */
export async function sendEmail(to: string, subject: string, html: string) {
  logger.info(`[Email] Attempting to send email to ${to}`);
  logger.debug(`[Email] Subject: ${subject}`);
  logger.debug(`[Email] FROM: ${FROM_EMAIL}`);
  logger.debug(`[Email] Resend API Key configured: ${!!process.env.RESEND_API_KEY}`);

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    logger.info(`[Email] Email sent successfully to ${to}`);
    logger.debug(`[Email] Resend API response:`, JSON.stringify(result));
    return true;
  } catch (error) {
    logger.error('[Email] ERROR sending email:', error);
    if (error instanceof Error) {
      logger.error('[Email] Error details:', { message: error.message, stack: error.stack });
    }
    return false;
  }
}

/**
 * Send a marketing campaign email
 * Returns success/failure for tracking
 */
export async function sendCampaignEmail(
  to: string,
  recipientName: string | null,
  subject: string,
  content: string
): Promise<boolean> {
  const siteUrl = getSiteUrl();
  const displayName = recipientName || 'Valued Customer';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #8B9D83 0%, #6B7D63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ILE ALA</h1>
        </div>

        <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Hello ${displayName},</p>

          <div style="color: #333; font-size: 15px; line-height: 1.8;">
            ${content}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="background: #8B9D83; border-radius: 5px; text-align: center;">
                  <a href="${siteUrl}/shop" style="display: block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px;">
                    Shop Now
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
            You're receiving this email because you subscribed to ILE ALA updates.
          </p>
          <p style="color: #999; font-size: 12px; margin: 10px 0 0; text-align: center;">
            © ${new Date().getFullYear()} ILE ALA. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    logger.info(`[Campaign] Email sent to ${to}`);
    return true;
  } catch (error) {
    logger.error(`[Campaign] Failed to send email to ${to}:`, error);
    return false;
  }
}

/**
 * Send a gift card email to the recipient
 * Beautiful template with gift card code, value, message and validity
 */
export async function sendGiftCardEmail(
  recipientEmail: string,
  recipientName: string | null,
  senderName: string | null,
  code: string,
  amount: number, // Em fils (100 = 1 AED)
  message: string | null,
  validUntil: Date
): Promise<boolean> {
  const siteUrl = getSiteUrl();
  const displayRecipient = recipientName || 'Friend';
  const displaySender = senderName || 'Someone special';
  const amountAED = (amount / 100).toFixed(2);
  const validUntilFormatted = validUntil.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  logger.info(`[Email] Sending gift card email to ${recipientEmail}`);
  logger.debug(`[Email] Gift card code: ${code}, amount: ${amountAED} AED`);

  const messageSection = message ? `
    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #8B9D83;">
      <p style="color: #666; font-size: 13px; margin: 0 0 8px 0; font-style: italic;">Personal message:</p>
      <p style="color: #333; font-size: 15px; margin: 0; line-height: 1.6;">"${message}"</p>
      <p style="color: #8B9D83; font-size: 14px; margin: 15px 0 0 0; text-align: right;">— ${displaySender}</p>
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You received a Gift Card from ILE ALA!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #8B9D83 0%, #6B7D63 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ILE ALA</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Gift Card</p>
        </div>

        <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none;">
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #666; font-size: 18px; margin: 0;">🎁 Hello ${displayRecipient}!</p>
            <h2 style="color: #8B9D83; margin: 15px 0 0 0; font-size: 24px;">You've received a gift!</h2>
            <p style="color: #666; font-size: 15px; margin: 10px 0 0 0;">
              ${displaySender} sent you an ILE ALA Gift Card
            </p>
          </div>

          ${messageSection}

          <!-- Gift Card Visual -->
          <div style="background: linear-gradient(135deg, #172d20 0%, #255238 100%); padding: 30px; border-radius: 15px; text-align: center; margin: 25px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Gift Card Value</p>
            <p style="color: #ffffff; font-size: 42px; font-weight: bold; margin: 10px 0;">AED ${amountAED}</p>

            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="color: rgba(255,255,255,0.8); font-size: 11px; margin: 0; letter-spacing: 1px; text-transform: uppercase;">Your Code</p>
              <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 8px 0 0 0; letter-spacing: 3px; font-family: monospace;">${code}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="background: #8B9D83; border-radius: 5px; text-align: center;">
                  <a href="${siteUrl}/shop" style="display: block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px;">
                    Shop Now
                  </a>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <h3 style="color: #8B9D83; margin: 0 0 15px 0; font-size: 16px;">How to use your Gift Card:</h3>
            <ol style="color: #666; font-size: 14px; margin: 0; padding-left: 20px; line-height: 2;">
              <li>Browse our exclusive collection at <a href="${siteUrl}/shop" style="color: #8B9D83;">ileala.ae</a></li>
              <li>Add your favorite items to the cart</li>
              <li>At checkout, enter your gift card code: <strong style="color: #172d20;">${code}</strong></li>
              <li>The value will be applied to your order</li>
            </ol>
          </div>

          <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 13px; margin: 0;">
              <strong>Valid until:</strong> ${validUntilFormatted}
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              This gift card can be used on any purchase. Any remaining balance will be saved for future use.
            </p>
          </div>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} ILE ALA. All rights reserved.
          </p>
          <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
            <a href="${siteUrl}" style="color: #8B9D83; text-decoration: none;">Visit our website</a> |
            <a href="${siteUrl}/contact" style="color: #8B9D83; text-decoration: none;">Contact us</a>
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `🎁 You received an ILE ALA Gift Card from ${displaySender}!`,
      html,
    });

    logger.info(`[Email] Gift card email sent successfully to ${recipientEmail}`);
    logger.debug(`[Email] Resend API response:`, JSON.stringify(result));
    return true;
  } catch (error) {
    logger.error('[Email] ERROR sending gift card email:', error);
    if (error instanceof Error) {
      logger.error('[Email] Error details:', { message: error.message, stack: error.stack });
    }
    return false;
  }
}
