import postgres from "postgres";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log("[Migration] DATABASE_URL not set, skipping migrations");
    return;
  }

  console.log("[Migration] Starting database migrations...");
  
  try {
    const sql = postgres(databaseUrl);
    
    // Get all migration files in order
    const migrationsDir = join(__dirname, "../drizzle/migrations");
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order
    
    console.log(`[Migration] Found ${migrationFiles.length} migration files`);
    
    for (const file of migrationFiles) {
      console.log(`[Migration] Running ${file}...`);
      const migrationPath = join(migrationsDir, file);
      const migrationSQL = readFileSync(migrationPath, "utf-8");
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        await sql.unsafe(statement);
      }
      
      console.log(`[Migration] ✓ ${file} completed`);
    }
    
    console.log("[Migration] All database migrations completed successfully!");
    await sql.end();
  } catch (error) {
    console.error("[Migration] Failed to run migrations:", error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log("[Migration] Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Migration] Error:", error);
      process.exit(1);
    });
}

export { runMigrations };
