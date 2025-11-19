import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { users } from '../server/db/schema';
import { eq } from 'drizzle-orm';
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
    // Emergency admin credentials
    const EMERGENCY_EMAIL = 'ceo@ileala.ae';
    const EMERGENCY_PASSWORD = 'IleAla2025!Admin#Emergency';
    const EMERGENCY_NAME = 'Emergency Admin';

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, EMERGENCY_EMAIL))
      .limit(1);

    if (existingUser.length > 0) {
      // User exists, update to admin role
      await db
        .update(users)
        .set({ 
          role: 'admin',
          password: await bcrypt.hash(EMERGENCY_PASSWORD, 10)
        })
        .where(eq(users.email, EMERGENCY_EMAIL));

      return res.status(200).json({
        success: true,
        message: 'Emergency admin user updated successfully!',
        email: EMERGENCY_EMAIL,
      });
    }

    // Create new emergency admin user
    const hashedPassword = await bcrypt.hash(EMERGENCY_PASSWORD, 10);

    await db.insert(users).values({
      email: EMERGENCY_EMAIL,
      password: hashedPassword,
      name: EMERGENCY_NAME,
      role: 'admin',
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency admin user created successfully!',
      email: EMERGENCY_EMAIL,
      instructions: [
        'You can now login at: https://ileala.ae/admin-emergency-login',
        `Email: ${EMERGENCY_EMAIL}`,
        'Password: (the emergency password you set )',
        'IMPORTANT: Delete this API route after creating the user for security!',
      ],
    });
  } catch (error: any) {
    console.error('Error creating emergency admin:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create emergency admin user',
      details: error.message,
    });
  }
}
