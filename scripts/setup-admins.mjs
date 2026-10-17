/**
 * Live Love Light — Admin Role Setup Tool
 *
 * Configures the two designated administrative accounts:
 * - ADMIN 1: SUPER_ADMIN
 * - ADMIN 2: ADMIN
 *
 * Usage:
 *   node scripts/setup-admins.mjs --super-admin <VERIFIED_CLERK_USER_ID> --admin <CLERK_USER_ID_OR_EMAIL>
 *   or:
 *   node scripts/setup-admins.mjs --super-admin <VERIFIED_CLERK_USER_ID> [--admin <CLERK_USER_ID_OR_EMAIL>]
 *   or run without arguments to inspect registered Clerk accounts and view instructions:
 *   node scripts/setup-admins.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// 1. Safely load .env.local
const envLocalPath = resolve(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  try {
    process.loadEnvFile(envLocalPath);
  } catch {
    const envLines = readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of envLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  console.error('\x1b[31m[Error] CLERK_SECRET_KEY is missing from environment or .env.local.\x1b[0m');
  process.exit(1);
}

async function clerkFetch(endpoint, options = {}) {
  const url = `https://api.clerk.com/v1${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg = data?.errors?.[0]?.message || `Clerk API status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

async function findUser(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim();

  // Try direct ID lookup
  if (clean.startsWith('user_')) {
    try {
      const user = await clerkFetch(`/users/${clean}`);
      if (user?.id) return user;
    } catch {}
  }

  // Try email lookup
  try {
    const users = await clerkFetch(`/users?email_address=${encodeURIComponent(clean)}`);
    if (users && users.length > 0) return users[0];
  } catch {}

  return null;
}

function updateEnvLocalVar(key, value) {
  if (!existsSync(envLocalPath)) return;
  let content = readFileSync(envLocalPath, 'utf-8');
  const regex = new RegExp(`^${key}=.*$`, 'm');

  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}\n`;
  }

  writeFileSync(envLocalPath, content, 'utf-8');
}

async function run() {
  console.log('\n===============================================================');
  console.log('   Live Love Light — Two-Level Admin Role Configuration');
  console.log('===============================================================\n');

  // Parse arguments
  let superAdminInput = null;
  let adminInput = null;

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--super-admin' && args[i + 1]) {
      superAdminInput = args[++i];
    } else if ((args[i] === '--admin' || args[i] === '--product-manager') && args[i + 1]) {
      adminInput = args[++i];
    } else if (!superAdminInput) {
      superAdminInput = args[i];
    } else if (!adminInput) {
      adminInput = args[i];
    }
  }

  // If no args provided, display existing users and instructions
  if (!superAdminInput && !adminInput) {
    console.log('Fetching registered Clerk accounts in your application...\n');
    let users = [];
    try {
      users = await clerkFetch('/users?limit=50');
    } catch (e) {
      console.warn('Could not list Clerk users:', e.message);
    }

    if (!users || users.length === 0) {
      console.log('\x1b[33mNo accounts found in your Clerk application yet.\x1b[0m');
      console.log('To set up the Super Admin and Admin roles:');
      console.log('1. Open your website at http://localhost:3000/login');
      console.log('2. Sign up or sign in with Account 1 (Super Admin)');
      console.log('3. Sign up or sign in with Account 2 (Admin)');
      console.log('4. Then rerun:');
      console.log('   node scripts/setup-admins.mjs --super-admin <Verified_Clerk_User_ID> --admin <Account2_Email_or_ID>');
      console.log('\nAlternatively, you can manually add the two Clerk user IDs to .env.local:');
      console.log('   SUPER_ADMIN_CLERK_ID=user_...');
      console.log('   ADMIN_CLERK_ID=user_...\n');
      return;
    }

    console.log('Registered Clerk accounts found:');
    console.log('---------------------------------------------------------------');
    for (const u of users) {
      const email = u.email_addresses?.[0]?.email_address || 'No email';
      const role = u.public_metadata?.role || 'user (default)';
      console.log(`- ID: ${u.id}`);
      console.log(`  Email: ${email}`);
      console.log(`  Role:  ${role}\n`);
    }
    console.log('---------------------------------------------------------------');
    console.log('To assign the two admin accounts, run:');
    console.log('  node scripts/setup-admins.mjs --super-admin <Verified_Clerk_User_ID> --admin <USER_ID_2>\n');
    return;
  }

  // Process Super Admin
  if (superAdminInput) {
    if (!/^user_[A-Za-z0-9]+$/.test(superAdminInput)) {
      console.error('\x1b[31m[Error] First Super Admin setup requires the exact Clerk user ID (user_...).\x1b[0m');
      process.exit(1);
    }
    console.log(`Configuring Super Admin: "${superAdminInput}"...`);
    const saUser = await findUser(superAdminInput);
    if (!saUser) {
      console.error(`\x1b[31m[Error] User not found in Clerk: "${superAdminInput}"\x1b[0m`);
      process.exit(1);
    }

    const saEmail = saUser.email_addresses?.[0]?.email_address || saUser.id;
    await clerkFetch(`/users/${saUser.id}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify({
        public_metadata: {
          ...(saUser.public_metadata || {}),
          role: 'super_admin',
          displayName: 'Live Love Light Owner',
        },
      }),
    });

    await clerkFetch(`/users/${saUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        first_name: 'Live Love Light',
        last_name: 'Owner',
      }),
    }).catch(() => {});

    updateEnvLocalVar('SUPER_ADMIN_CLERK_ID', saUser.id);
    console.log(`\x1b[32m✔ Super Admin configured: ${saEmail} (ID: ${saUser.id}) — Display Name: Live Love Light Owner\x1b[0m`);
  }

  // Process restricted Admin
  if (adminInput) {
    console.log(`Configuring Admin: "${adminInput}"...`);
    const adminUser = await findUser(adminInput);
    if (!adminUser) {
      console.error(`\x1b[31m[Error] User not found in Clerk: "${adminInput}"\x1b[0m`);
      process.exit(1);
    }

    const adminEmail = adminUser.email_addresses?.[0]?.email_address || adminUser.id;
    await clerkFetch(`/users/${adminUser.id}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify({
        public_metadata: {
          ...(adminUser.public_metadata || {}),
          role: 'admin',
          displayName: 'Live Love Light Admin',
        },
      }),
    });

    await clerkFetch(`/users/${adminUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        first_name: 'Live Love Light',
        last_name: 'Admin',
      }),
    }).catch(() => {});

    updateEnvLocalVar('ADMIN_CLERK_ID', adminUser.id);
    console.log(`\x1b[32m✔ Admin configured: ${adminEmail} (ID: ${adminUser.id}) — Display Name: Live Love Light Admin\x1b[0m`);
  }

  console.log('\n===============================================================');
  console.log('\x1b[32mADMIN ROLES CONFIGURED SUCCESSFULLY\x1b[0m');
  console.log('===============================================================\n');
}

run().catch((e) => {
  console.error('\x1b[31mSetup failed:\x1b[0m', e.message);
  process.exit(1);
});
