import { test as teardown } from '@playwright/test';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

teardown('cleanup auth state', async () => {
  const authFile = join(__dirname, '../playwright/.auth/user.json');

  if (fs.existsSync(authFile)) {
    fs.unlinkSync(authFile);
  }
});
