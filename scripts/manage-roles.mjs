/**
 * Script: manage-roles.mjs
 * Purpose: Manage admin roles (product_manager, super_admin, customer) via CLI.
 *
 * Usage:
 *   node scripts/manage-roles.mjs <user-email-or-userId> <product_manager|super_admin|customer>
 *
 * Example:
 *   node scripts/manage-roles.mjs manager@example.com product_manager
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

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

const identifier = process.argv[2];
const targetRole = process.argv[3]?.toLowerCase();

const VALID_ROLES = ['product_manager', 'super_admin', 'customer'];

async function clerkFetch(endpoint, options = {}) {
  const url = `https://api.clerk.com/v1${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg = data?.errors?.[0]?.message || `Clerk API returned status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

async function run() {
  if (!identifier || !targetRole || !VALID_ROLES.includes(targetRole)) {
    console.log('\nUsage: node scripts/manage-roles.mjs <email-or-userId> <role>');
    console.log(`Allowed roles: ${VALID_ROLES.join(', ')}\n`);
    return;
  }

  try {
    // 1. Fetch user
    let targetUser = null;
    if (identifier.startsWith('user_')) {
      try {
        targetUser = await clerkFetch(`/users/${identifier}`);
      } catch {}
    }

    if (!targetUser) {
      const usersByEmail = await clerkFetch(`/users?email_address=${encodeURIComponent(identifier)}`);
      if (usersByEmail && usersByEmail.length > 0) {
        targetUser = usersByEmail[0];
      }
    }

    if (!targetUser) {
      console.error(`\x1b[31m[Error] No Clerk user found for: ${identifier}\x1b[0m`);
      process.exit(1);
    }

    const currentRole = targetUser.public_metadata?.role || 'customer';

    // 2. Safeguard: Prevent removing the last Super Admin
    if (currentRole === 'super_admin' && targetRole !== 'super_admin') {
      const allUsers = await clerkFetch('/users?limit=100');
      const superAdmins = (allUsers || []).filter(u => u.public_metadata?.role === 'super_admin');
      if (superAdmins.length <= 1) {
        console.error('\x1b[31m[Error] Cannot demote or remove the last remaining Super Admin.\x1b[0m');
        process.exit(1);
      }
    }

    // 3. Update Clerk metadata
    await clerkFetch(`/users/${targetUser.id}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify({
        public_metadata: {
          ...(targetUser.public_metadata || {}),
          role: targetRole
        }
      })
    });

    console.log(`\x1b[32m✔ User ${identifier} role updated to: ${targetRole}\x1b[0m`);

    // 4. Update Supabase profiles table if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${targetUser.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            role: targetRole,
            updated_at: new Date().toISOString()
          })
        });
        console.log('\x1b[32m✔ Synchronized role to Supabase profiles\x1b[0m');
      } catch (err) {
        console.warn('Supabase sync skipped:', err.message);
      }
    }
  } catch (err) {
    console.error('\x1b[31m[Error]:\x1b[0m', err.message);
    process.exit(1);
  }
}

run();
