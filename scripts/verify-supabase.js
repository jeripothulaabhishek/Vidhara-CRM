const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Helper to load .env.local without external dependency
function loadEnvLocal() {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.substring(0, eqIdx).trim();
      const v = trimmed.substring(eqIdx + 1).trim();
      env[k] = v;
    }
  }
  return env;
}

const env = loadEnvLocal();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY;

console.log('====================================================');
console.log('VIDHARA CRM — SUPABASE CONNECTION & SCHEMA VERIFIER');
console.log('====================================================');

if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL is MISSING in .env.local');
} else {
  // Sanitize URL for output
  const u = new URL(supabaseUrl);
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL: Configured (' + u.origin + ')');
}

if (!publishableKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is MISSING in .env.local');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Configured (length: ' + publishableKey.length + ' chars)');
}

if (!secretKey) {
  console.log('⚠️  SUPABASE_SECRET_KEY: Not present in .env.local (Required for server-only administrative operations)');
} else {
  console.log('✅ SUPABASE_SECRET_KEY: Configured (length: ' + secretKey.length + ' chars, stored securely server-side)');
}

if (!supabaseUrl || !publishableKey) {
  console.log('\n❌ Cannot verify remote database without NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  console.log('Please create/update .env.local and rerun.');
  process.exit(0);
}

// Check Data API connection
async function verify() {
  console.log('\nTesting connection to Supabase Data API...');
  
  const tablesToCheck = [
    'profiles',
    'tasks',
    'task_attachments',
    'task_links',
    'task_comments',
    'task_activity',
    'notifications'
  ];

  const results = {};

  for (const table of tablesToCheck) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': publishableKey,
          'Authorization': `Bearer ${publishableKey}`
        }
      });

      if (res.status === 200) {
        results[table] = { exists: true, status: 200, message: 'Table exists and accessible via Data API' };
      } else if (res.status === 401 || res.status === 403) {
        // Likely RLS is active and table exists, or auth needed
        const data = await res.json().catch(() => ({}));
        results[table] = { exists: true, status: res.status, message: `Table exists (Protected by RLS: ${data.message || 'Auth required'})` };
      } else if (res.status === 404) {
        results[table] = { exists: false, status: 404, message: 'Table NOT found in public schema' };
      } else {
        const data = await res.json().catch(() => ({}));
        results[table] = { exists: false, status: res.status, message: data.message || res.statusText };
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }

  console.log('\nDatabase Table Status:');
  let missingCount = 0;
  for (const [table, info] of Object.entries(results)) {
    if (info.exists) {
      console.log(`  ✅ public.${table}: ${info.message}`);
    } else {
      missingCount++;
      console.log(`  ❌ public.${table}: ${info.message || info.error}`);
    }
  }

  // Check Storage bucket
  try {
    const bucketRes = await fetch(`${supabaseUrl}/storage/v1/bucket/task-files`, {
      headers: {
        'apikey': publishableKey,
        'Authorization': `Bearer ${publishableKey}`
      }
    });
    if (bucketRes.status === 200) {
      console.log('\n✅ Storage Bucket: "task-files" exists and is accessible');
    } else {
      console.log(`\n⚠️  Storage Bucket "task-files": HTTP ${bucketRes.status} (Needs creation or public/private policy setup)`);
    }
  } catch (err) {
    console.log(`\n⚠️  Storage Bucket check error: ${err.message}`);
  }

  console.log('\n====================================================');
  if (missingCount > 0) {
    console.log(`⚠️  ${missingCount} table(s) need to be created in your Supabase project.`);
    console.log('Run the generated Phase 2 migration SQL in your Supabase SQL Editor.');
  } else {
    console.log('🎉 All expected database tables are present and connected!');
  }
  console.log('====================================================\n');
}

verify().catch(e => console.error('Verification error:', e.message));

