/**
 * Store the chatbot's OpenAI API key in the target Neon database.
 *
 * The value is encrypted with the same AES-256-GCM format used by
 * src/lib/secrets.ts. The target application must use the same ENCRYPTION_KEY
 * when it resolves the key at runtime.
 *
 * Usage:
 *   POSTGRES_URL=... ENCRYPTION_KEY=... CHATBOT_OPENAI_API_KEY=... \
 *     bun run scripts/seed-chatbot-openai-key.ts
 *
 * CHATBOT_OPENAI_API_KEY is intentionally read from the environment rather
 * than a command-line argument so the key is not exposed in shell history or
 * process listings. OPENAI_API_KEY is accepted as a fallback for convenience.
 */
import { Client } from 'pg';
import { encrypt } from '../src/lib/crypto';

const SECRET_KEY_NAME = 'OPENAI_API_KEY';

const SECRETS_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS secrets (
  key_name TEXT PRIMARY KEY,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

function resolveRequiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function resolveOpenAiKey(): { value: string; source: 'CHATBOT_OPENAI_API_KEY' | 'OPENAI_API_KEY' } {
  const chatbotKey = process.env.CHATBOT_OPENAI_API_KEY?.trim();
  if (chatbotKey) return { value: chatbotKey, source: 'CHATBOT_OPENAI_API_KEY' };

  const fallbackKey = process.env.OPENAI_API_KEY?.trim();
  if (fallbackKey) return { value: fallbackKey, source: 'OPENAI_API_KEY' };

  throw new Error('CHATBOT_OPENAI_API_KEY (or OPENAI_API_KEY) is not set');
}

async function main(): Promise<void> {
  const connectionString = process.env.POSTGRES_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error('POSTGRES_URL (or DATABASE_URL) is not set');

  const encryptionKey = resolveRequiredEnvironment('ENCRYPTION_KEY');
  if (!/^[0-9a-f]{64}$/i.test(encryptionKey)) {
    throw new Error('ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes)');
  }

  const { value: openAiKey, source } = resolveOpenAiKey();
  if (openAiKey.length < 20) {
    throw new Error('The OpenAI API key looks too short');
  }

  // encrypt() reads ENCRYPTION_KEY from process.env and produces the same
  // encrypted/iv/auth_tag columns consumed by getSecretPlaintext().
  const encrypted = encrypt(openAiKey);
  const client = new Client({ connectionString });
  let inTransaction = false;

  try {
    await client.connect();
    await client.query('BEGIN');
    inTransaction = true;

    await client.query(SECRETS_TABLE_DDL);
    await client.query(
      `INSERT INTO secrets (key_name, encrypted_value, iv, auth_tag)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key_name) DO UPDATE SET
         encrypted_value = EXCLUDED.encrypted_value,
         iv = EXCLUDED.iv,
         auth_tag = EXCLUDED.auth_tag,
         updated_at = CURRENT_TIMESTAMP;`,
      [SECRET_KEY_NAME, encrypted.encrypted, encrypted.iv, encrypted.authTag],
    );

    await client.query('COMMIT');
    inTransaction = false;

    const result = await client.query<{ key_name: string; updated_at: Date }>(
      'SELECT key_name, updated_at FROM secrets WHERE key_name = $1',
      [SECRET_KEY_NAME],
    );
    const row = result.rows[0];
    if (!row) throw new Error('The database write could not be verified');

    console.log(`[chatbot-key] Stored ${row.key_name} in Neon (source: ${source}).`);
    console.log(`[chatbot-key] Updated at ${new Date(row.updated_at).toISOString()}.`);
    console.log('[chatbot-key] The plaintext key was not printed.');
  } catch (error) {
    if (inTransaction) {
      await client.query('ROLLBACK').catch(() => undefined);
    }
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error: unknown) => {
  console.error('[chatbot-key] Failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
