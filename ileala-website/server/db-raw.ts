import postgres from "postgres";

let _client: ReturnType<typeof postgres> | null = null;

// Get PostgreSQL client
export async function getClient() {
  if (!_client && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, {
        ssl: 'require'
      });
      console.log("[Database] Connected to PostgreSQL with SSL");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _client = null;
    }
  }
  return _client;
}

// Get user by email (raw SQL)
export async function getUserByEmailRaw(email: string) {
  console.log('[getUserByEmailRaw] Called with email:', email);
  const client = await getClient();
  if (!client) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    console.log('[getUserByEmailRaw] Executing query...');
    const result = await client`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    console.log('[getUserByEmailRaw] Query successful, result count:', result.length);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('[getUserByEmailRaw] Query failed!');
    console.error('[getUserByEmailRaw] Error:', error);
    console.error('[getUserByEmailRaw] Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('[getUserByEmailRaw] Error stack:', error instanceof Error ? error.stack : 'No stack');
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
  console.log('[createUserRaw] Called with email:', user.email);
  const client = await getClient();
  if (!client) {
    console.warn("[Database] Cannot create user: database not available");
    throw new Error("Database not available");
  }

  try {
    console.log('[createUserRaw] Executing INSERT query...');
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
    console.log('[createUserRaw] User created successfully!');
    return result[0];
  } catch (error) {
    console.error('[createUserRaw] Query failed!');
    console.error('[createUserRaw] Error:', error);
    console.error('[createUserRaw] Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('[createUserRaw] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}

// Generate email verification token (raw SQL)
export async function generateEmailVerificationTokenRaw(userId: number): Promise<string> {
  console.log('[generateEmailVerificationTokenRaw] Called for user:', userId);
  const client = await getClient();
  if (!client) {
    console.warn("[Database] Cannot generate token: database not available");
    throw new Error("Database not available");
  }

  try {
    // Generate random token using crypto for security
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    console.log('[generateEmailVerificationTokenRaw] Updating user with token...');
    await client`
      UPDATE users 
      SET "emailVerificationToken" = ${token}, 
          "emailVerificationExpires" = ${expiresAt}
      WHERE id = ${userId}
    `;
    
    console.log('[generateEmailVerificationTokenRaw] Token generated successfully');
    return token;
  } catch (error) {
    console.error('[generateEmailVerificationTokenRaw] Failed!');
    console.error('[generateEmailVerificationTokenRaw] Error:', error);
    throw error;
  }
}

// Verify email token (raw SQL)
export async function verifyEmailTokenRaw(token: string) {
  console.log('[verifyEmailTokenRaw] Called with token:', token);
  const client = await getClient();
  if (!client) {
    console.warn("[Database] Cannot verify token: database not available");
    return null;
  }

  try {
    // Find user with this token
    console.log('[verifyEmailTokenRaw] Searching for user with token...');
    const result = await client`
      SELECT * FROM users 
      WHERE "emailVerificationToken" = ${token}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      console.log('[verifyEmailTokenRaw] No user found with this token');
      return null;
    }

    const user = result[0];
    console.log('[verifyEmailTokenRaw] User found:', user.id, user.email);

    // Check if token is expired
    if (!user.emailVerificationExpires || new Date() > new Date(user.emailVerificationExpires)) {
      console.log('[verifyEmailTokenRaw] Token is expired');
      return null;
    }

    // Mark email as verified and clear token
    console.log('[verifyEmailTokenRaw] Marking email as verified...');
    await client`
      UPDATE users 
      SET "emailVerified" = 1,
          "emailVerificationToken" = NULL,
          "emailVerificationExpires" = NULL
      WHERE id = ${user.id}
    `;
    
    console.log('[verifyEmailTokenRaw] Email verified successfully!');
    return user;
  } catch (error) {
    console.error('[verifyEmailTokenRaw] Failed!');
    console.error('[verifyEmailTokenRaw] Error:', error);
    console.error('[verifyEmailTokenRaw] Error message:', error instanceof Error ? error.message : 'Unknown');
    throw error;
  }
}

/**
 * Get all users (for admin panel)
 */
export async function getAllUsersRaw() {
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
    console.error('[getAllUsersRaw] Error:', error);
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
    await client`
      UPDATE users 
      SET "lastSignedIn" = NOW()
      WHERE id = ${user.id}
    `;

    return user;
  } catch (error) {
    console.error('[verifyUserCredentialsRaw] Error:', error);
    return null;
  }
}
