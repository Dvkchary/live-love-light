/**
 * Script: assign-super-admin.mjs
 * Purpose: Assigns the initial SUPER_ADMIN role to a Clerk user account securely.
 *
 * Usage:
 *   node scripts/assign-super-admin.mjs <user-email-or-userId>
 *
 * Example:
 *   node scripts/assign-super-admin.mjs admin@livelovelight.website
 *   node scripts/assign-super-admin.mjs user_2tX...
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// 1. Safely load .env.local without exposing contents
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
  console.error('Please configure your Clerk secret key in .env.local before running this script.');
  process.exit(1);
}

const identifier = process.argv[2];

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
  console.log('\n======================================================');
  console.log('   Live Love Light — Super Admin Assignment Setup');
  console.log('======================================================\n');

  try {
    // If no identifier provided, list available users
    if (!identifier) {
      console.log('No user email or ID provided. Fetching existing Clerk accounts...\n');
      const users = await clerkFetch('/users?limit=20');

      if (!users || users.length === 0) {
        console.log('\x1b[33mNo user accounts found in this Clerk application yet.\x1b[0m');
        console.log('Please register or sign in to the website first, then rerun:');
        console.log('  node scripts/assign-super-admin.mjs <your-email>\n');
        return;
      }

      console.log('Existing Clerk accounts:');
      console.log('------------------------------------------------------');
      for (const u of users) {
        const email = u.email_addresses?.[0]?.email_address || 'No email';
        const role = u.public_metadata?.role || 'customer (default)';
        console.log(`- ID: ${u.id} | Email: ${email} | Current Role: ${role}`);
      }
      console.log('------------------------------------------------------');
      console.log('\nTo assign SUPER_ADMIN to one of these users, run:');
      console.log('  node scripts/assign-super-admin.mjs <email-or-userId>\n');
      return;
    }

    // Lookup user by ID or by email
    let targetUser = null;

    if (identifier.startsWith('user_')) {
      try {
        targetUser = await clerkFetch(`/users/${identifier}`);
      } catch (e) {
        console.warn(`User ID lookup failed: ${e.message}`);
      }
    }

    if (!targetUser) {
      const usersByEmail = await clerkFetch(`/users?email_address=${encodeURIComponent(identifier)}`);
      if (usersByEmail && usersByEmail.length > 0) {
        targetUser = usersByEmail[0];
      }
    }

    if (!targetUser) {
      console.error(`\x1b[31m[Error] Could not find any Clerk user matching: "${identifier}"\x1b[0m`);
      console.error('Verify the email address or user ID exists in your Clerk dashboard.');
      process.exit(1);
    }

    const userEmail = targetUser.email_addresses?.[0]?.email_address || identifier;
    console.log(`Found Clerk user:`);
    console.log(`  User ID:   ${targetUser.id}`);
    console.log(`  Email:     ${userEmail}`);
    console.log(`  Prior Role: ${targetUser.public_metadata?.role || 'customer'}`);

    // Update public metadata role to super_admin
    console.log('\nAssigning SUPER_ADMIN role in Clerk public metadata...');
    const currentMetadata = targetUser.public_metadata || {};
    await clerkFetch(`/users/${targetUser.id}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify({
        public_metadata: {
          ...currentMetadata,
          role: 'super_admin'
        }
      })
    });

    console.log('\x1b[32m✔ Successfully updated Clerk role to: super_admin\x1b[0m');

    // Also sync to Supabase profiles table if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        console.log('Syncing role to Supabase profiles table...');
        const sbRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${targetUser.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            role: 'super_admin',
            email: userEmail,
            updated_at: new Date().toISOString()
          })
        });

        if (sbRes.ok) {
          console.log('\x1b[32m✔ Successfully synchronized to Supabase profiles table\x1b[0m');
        } else {
          console.log('Supabase sync note: status', sbRes.status);
        }
      } catch (sbErr) {
        console.warn('Supabase sync skipped:', sbErr.message);
      }
    }

    console.log('\n======================================================');
    console.log('\x1b[32mSUPER_ADMIN ASSIGNMENT COMPLETE\x1b[0m');
    console.log(`User ${userEmail} is now verified as SUPER_ADMIN.`);
    console.log('You can now log in and access the full admin dashboard.');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\x1b[31m[Error] Setup failed:\x1b[0m', err.message);
    process.exit(1);
  }
}

run();
