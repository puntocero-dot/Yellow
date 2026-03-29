
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log('Testing connection to:', supabaseUrl);
  
  // Test 1: Fetch users
  const { data: users, error: userError } = await supabase.from('users').select('*').limit(1);
  if (userError) {
    console.error('Error fetching users:', userError);
  } else {
    console.log('Success: Fetched', users.length, 'users');
  }

  // Test 2: Try to insert an order
  const { data: order, error: orderError } = await supabase.from('orders').insert({
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '+503 1234 5678',
    destination_address: 'Test Address',
    destination_city: 'San Salvador',
    package_description: 'Test Package',
    package_weight: 1.0,
    status: 'pending'
  }).select().single();

  if (orderError) {
    console.error('Error inserting order:', orderError);
  } else {
    console.log('Success: Inserted order with ID:', order.id, 'and Tracking:', order.tracking_number);
    // Cleanup
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('Cleanup: Deleted test order');
  }
}

test();
