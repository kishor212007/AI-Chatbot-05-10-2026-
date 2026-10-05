import pg from 'pg';
const { Pool } = pg;

let pool = null;
let isConnected = false;

// Check if PostgreSQL environment variables are configured
const dbUrl = process.env.DATABASE_URL;
const hasPgEnv = dbUrl || (process.env.PGUSER && process.env.PGDATABASE);

if (hasPgEnv) {
  try {
    pool = new Pool({
      connectionString: dbUrl || undefined,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      database: process.env.PGDATABASE,
      connectionTimeoutMillis: 3000,
    });

    pool.connect()
      .then(async (client) => {
        isConnected = true;
        console.log('[PostgreSQL] Successfully connected to database.');
        // Create table for optional chat logging if required
        await client.query(`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            role VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        client.release();
        console.log('[PostgreSQL] Verified chat_messages table exists.');
      })
      .catch((err) => {
        console.warn('[PostgreSQL] Connection failed or database unavailable:', err.message);
        console.warn('[PostgreSQL] Running safely in memory-only mode.');
        isConnected = false;
      });
  } catch (err) {
    console.warn('[PostgreSQL] Initialization notice:', err.message);
    isConnected = false;
  }
} else {
  console.log('[PostgreSQL] No DATABASE_URL or PG* variables detected. Running without persistent database logging.');
}

/**
 * Optionally log chat messages to PostgreSQL if connected
 * @param {string} role - 'user' or 'assistant'/'model'
 * @param {string} message - Content of the message
 */
export async function logMessageIfAvailable(role, message) {
  if (!isConnected || !pool) return;
  try {
    await pool.query(
      'INSERT INTO chat_messages (role, message) VALUES ($1, $2)',
      [role, message]
    );
  } catch (err) {
    console.error('[PostgreSQL] Failed to log message:', err.message);
  }
}

export function isDbConnected() {
  return isConnected;
}
