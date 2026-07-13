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

async function inspectProperties() {
  try {
    const { data: properties, error } = await supabase.from('properties').select('*');
    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }
    console.log('Properties:', properties);

    for (const prop of properties) {
      const { data: values, error: valError } = await supabase
        .from('property_values')
        .select('*')
        .eq('propertyid', prop.propertyid);
      if (valError) {
        console.error(`Error fetching values for ${prop.name}:`, valError);
      } else {
        console.log(`Values for ${prop.name}:`, values.map(v => v.value));
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

inspectProperties();
