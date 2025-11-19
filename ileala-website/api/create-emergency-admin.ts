import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get database connection string from environment
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      return res.status(500).json({ 
        success: false,
        error: 'Database connection not configured' 
      });
    }

    // Create database connection
    const sql = neon(DATABASE_URL);

    // Emergency admin credentials
    const EMERGENCY_EMAIL = 'ceo@ileala.ae';
    const EMERGENCY_PASSWORD = 'IleAla2025!Admin#Emergency';
    const EMERGENCY_NAME = 'Emergency Admin';

    // Hash the password
    const hashedPassword = await bcrypt.hash(EMERGENCY_PASSWORD, 10);

    // Check if user already exists
    const existingUser = await sql`
      SELECT id, email, role FROM users WHERE email = ${EMERGENCY_EMAIL} LIMIT 1
    `;

    if (existingUser.length > 0) {
      // User exists, update to admin role and password
      await sql`
        UPDATE users 
        SET role = 'admin', password = ${hashedPassword}
        WHERE email = ${EMERGENCY_EMAIL}
      `;

      return res.status(200).json({
        success: true,
        message: 'Emergency admin user updated successfully!',
        email: EMERGENCY_EMAIL,
        instructions: [
          'You can now login at: https://ileala.ae/admin-emergency-login',
          `Email: ${EMERGENCY_EMAIL}`,
          'Password: IleAla2025!Admin#Emergency',
          'After login, you will be redirected to the admin panel.',
        ],
      } );
    }

    // Create new emergency admin user
    await sql`
      INSERT INTO users (email, password, name, role, "createdAt")
      VALUES (
        ${EMERGENCY_EMAIL},
        ${hashedPassword},
        ${EMERGENCY_NAME},
        'admin',
        NOW()
      )
    `;

    return res.status(201).json({
      success: true,
      message: 'Emergency admin user created successfully!',
      email: EMERGENCY_EMAIL,
      instructions: [
        'You can now login at: https://ileala.ae/admin-emergency-login',
        `Email: ${EMERGENCY_EMAIL}`,
        'Password: IleAla2025!Admin#Emergency',
        'After login, you will be redirected to the admin panel.',
        'IMPORTANT: Consider deleting this API route after creating the user for security!',
      ],
    } );
  } catch (error: any) {
    console.error('Error creating emergency admin:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create emergency admin user',
      details: error.message,
    });
  }
}
