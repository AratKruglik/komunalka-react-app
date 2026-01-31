import { test as setup } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { MOCK_JWT_TOKEN } from './helpers/constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authDir = join(__dirname, '../playwright/.auth');
const authFile = join(authDir, 'user.json');

setup('authenticate', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await page.context().addCookies([
    {
      name: 'jwt_token',
      value: MOCK_JWT_TOKEN,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'refresh_token',
      value: 'mock-refresh-token-for-e2e-tests',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'expires_at',
      value: expiresAt.toISOString(),
      domain: 'localhost',
      path: '/',
    },
  ]);

  await page.context().storageState({ path: authFile });
});
