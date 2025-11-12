// Script para reenviar email de verificação
import postgres from 'postgres';
import { Resend } from 'resend';

const DATABASE_URL = process.env.DATABASE_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://ileala.ae';

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

if (!RESEND_API_KEY) {
  console.error('ERROR: RESEND_API_KEY not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });
const resend = new Resend(RESEND_API_KEY);

async function resendVerificationEmail(email) {
  try {
    console.log(`[Resend] Looking for user: ${email}`);
    
    // Get user from database
    const users = await sql`
      SELECT id, email, name, "emailVerificationToken"
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
    
    if (users.length === 0) {
      console.error(`[Resend] User not found: ${email}`);
      process.exit(1);
    }
    
    const user = users[0];
    console.log(`[Resend] User found: ${user.name} (ID: ${user.id})`);
    
    // Generate new token if needed
    let token = user.emailVerificationToken;
    if (!token) {
      console.log('[Resend] Generating new verification token...');
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await sql`
        UPDATE users 
        SET "emailVerificationToken" = ${token}, 
            "emailVerificationExpires" = ${expiresAt}
        WHERE id = ${user.id}
      `;
      console.log('[Resend] Token generated and saved');
    } else {
      console.log('[Resend] Using existing token');
    }
    
    // Send email
    const verificationUrl = `${SITE_URL}/verify-email?token=${token}`;
    console.log(`[Resend] Sending email to ${user.email}...`);
    
    await resend.emails.send({
      from: 'ILE ALA <noreply@ileala.ae>',
      to: user.email,
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
              <h2 style="color: #8B9D83; margin-top: 0;">Welcome, ${user.name}!</h2>
              
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
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`[Resend] ✅ Email sent successfully to ${user.email}!`);
    console.log(`[Resend] Verification URL: ${verificationUrl}`);
    
  } catch (error) {
    console.error('[Resend] ERROR:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Usage: node resend-verification-email.js <email>');
  process.exit(1);
}

resendVerificationEmail(email);
