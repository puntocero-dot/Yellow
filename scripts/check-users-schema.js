const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking users table schema...');
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.error('❌ Error fetching users:', error.message);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log('✅ Columns found:', Object.keys(data[0]));
  } else {
    console.log('ℹ️ Table is empty, but query succeeded.');
  }
}

checkSchema();
