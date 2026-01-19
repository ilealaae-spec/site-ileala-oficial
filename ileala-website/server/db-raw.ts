import postgres from "postgres";

let _client: ReturnType<typeof postgres> | null = null;

// Get PostgreSQL client
export async function getClient() {
  if (!_client && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, {
        ssl: 'require'
      });
    } catch {
      _client = null;
    }
  }
  return _client;
}

// Get user by email (raw SQL)
export async function getUserByEmailRaw(email: string) {
  const client = await getClient();
  if (!client) {
    return undefined;
  }

  try {
    const result = await client`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    throw error;
  }
}

// Create user (raw SQL)
export async function createUserRaw(user: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  poBox?: string;
  country: string;
}) {
  const client = await getClient();
  if (!client) {
    throw new Error("Database not available");
  }

  try {
    const result = await client`
      INSERT INTO users (
        name, email, password, phone, address, city, state, "poBox", country,
        "emailVerified", "loginMethod", role, "createdAt", "updatedAt", "lastSignedIn"
      ) VALUES (
        ${user.name}, ${user.email}, ${user.password}, ${user.phone},
        ${user.address}, ${user.city}, ${user.state}, ${user.poBox || null}, ${user.country},
        0, 'local', 'user', NOW(), NOW(), NOW()
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    throw error;
  }
}

// Generate email verification token (raw SQL)
export async function generateEmailVerificationTokenRaw(userId: number): Promise<string> {
  const client = await getClient();
  if (!client) {
    throw new Error("Database not available");
  }

  try {
    // Generate random token using crypto for security
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await client`
      UPDATE users
      SET "emailVerificationToken" = ${token},
          "emailVerificationExpires" = ${expiresAt}
      WHERE id = ${userId}
    `;

    return token;
  } catch (error) {
    throw error;
  }
}

// Verify email token (raw SQL)
export async function verifyEmailTokenRaw(token: string) {
  const client = await getClient();
  if (!client) {
    return null;
  }

  try {
    // Find user with this token
    const result = await client`
      SELECT * FROM users
      WHERE "emailVerificationToken" = ${token}
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const user = result[0];

    // Check if token is expired
    if (!user.emailVerificationExpires || new Date() > new Date(user.emailVerificationExpires)) {
      return null;
    }

    // Mark email as verified and clear token
    await client`
      UPDATE users
      SET "emailVerified" = 1,
          "emailVerificationToken" = NULL,
          "emailVerificationExpires" = NULL
      WHERE id = ${user.id}
    `;

    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all users (for admin panel)
 */
export async function getAllUsersRaw() {
  const client = await getClient();
  if (!client) {
    throw new Error("Database not available");
  }
  try {
    const result = await client`
      SELECT
        id,
        name,
        email,
        phone,
        address,
        city,
        state,
        "poBox",
        country,
        "emailVerified",
        "loginMethod",
        role,
        "createdAt",
        "lastSignedIn"
      FROM users
      ORDER BY "createdAt" DESC
    `;

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Verify user credentials (for login)
 */
export async function verifyUserCredentialsRaw(email: string, password: string) {
  try {
    const user = await getUserByEmailRaw(email);
    if (!user || !user.password) {
      return null;
    }

    // Verify password with bcrypt
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return null;
    }

    // Update last signed in
    const client = await getClient();
    if (client) {
      await client`
        UPDATE users
        SET "lastSignedIn" = NOW()
        WHERE id = ${user.id}
      `;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetTokenRaw(userId: number): Promise<string> {
  // Generate random token
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  // Token expires in 1 hour
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Update user with token
  const client = await getClient();
  if (!client) {
    throw new Error('Database not available');
  }

  await client`
    UPDATE users
    SET "passwordResetToken" = ${token},
        "passwordResetExpires" = ${expiresAt}
    WHERE id = ${userId}
  `;

  return token;
}

/**
 * Verify password reset token and reset password
 */
export async function resetPasswordWithTokenRaw(token: string, newPassword: string): Promise<boolean> {
  try {
    const client = await getClient();
    if (!client) {
      return false;
    }

    // Find user by token
    const users = await client`
      SELECT *, "passwordResetExpires", NOW() as current_time FROM users
      WHERE "passwordResetToken" = ${token}
      LIMIT 1
    `;

    if (users.length === 0) {
      return false;
    }

    const user = users[0];

    // Check if token is expired
    if (new Date() > new Date(user.passwordResetExpires)) {
      return false;
    }

    // Hash new password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await client`
      UPDATE users
      SET password = ${hashedPassword},
          "passwordResetToken" = NULL,
          "passwordResetExpires" = NULL
      WHERE id = ${user.id}
    `;

    return true;
  } catch {
    return false;
  }
}
