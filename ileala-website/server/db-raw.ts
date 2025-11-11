import postgres from "postgres";

let _client: ReturnType<typeof postgres> | null = null;

// Get PostgreSQL client
export async function getClient() {
  if (!_client && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL);
      console.log("[Database] Connected to PostgreSQL");
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
