import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const email = 'admin@deliveryapp.com';
  const pin = '243044';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pin
  });

  if (error) {
    console.error('Login Failed:', error);
  } else {
    console.log('Login Success! User ID:', data.user.id);
  }
}

testLogin();
