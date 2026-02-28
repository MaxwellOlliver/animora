import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import path from 'path';

export interface TestDatabase {
  databaseUrl: string;
  container: StartedPostgreSqlContainer;
}

export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer(
    'ghcr.io/fboulnois/pg_uuidv7:1.7.0',
  )
    .withDatabase('animora_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const databaseUrl = container.getConnectionUri();

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query('CREATE EXTENSION IF NOT EXISTS pg_uuidv7');
  await client.end();

  const apiRoot = path.resolve(__dirname, '../..');
  execSync(`npx drizzle-kit push --force`, {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });

  return { databaseUrl, container };
}

export async function stopTestDatabase(
  container?: StartedPostgreSqlContainer,
): Promise<void> {
  if (container) {
    await container.stop();
  }
}
