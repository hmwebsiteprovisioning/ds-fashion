const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join('c:\\Users\\mdros\\source\\repos\\ds-fashion', '.env.local');
let env = {};
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) return;
    const key = trimmed.slice(0, firstEq).trim();
    const val = trimmed.slice(firstEq + 1).trim();
    env[key] = val;
  });
} catch (err) {
  console.error('Failed to read .env.local:', err.message);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
  try {
    console.log('Attempting to execute SQL migration using exec_sql RPC...');
    const sql = 'ALTER TABLE public.product_types ADD COLUMN IF NOT EXISTS imageurl text;';
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ RPC exec_sql failed:', error.message);
      console.log('Checking if column already exists despite error...');
      
      // Test if column exists by querying it
      const { data: testData, error: testError } = await supabase
        .from('product_types')
        .select('imageurl')
        .limit(1);
      
      if (testError) {
        console.error('❌ Column "imageurl" does not exist and migration failed:', testError.message);
      } else {
        console.log('✅ Column "imageurl" actually exists in product_types table!');
      }
    } else {
      console.log('✅ Migration succeeded: added imageurl column to product_types');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

runMigration();
