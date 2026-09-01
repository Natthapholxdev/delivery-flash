import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log('--- auth.users ---');
  const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('Error fetching users:', userError);
  } else {
    usersData.users.forEach(u => console.log(u.id, u.email));
  }

  console.log('\n--- public.profiles ---');
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else {
    profiles.forEach(p => console.log(p.id, p.username, p.role, p.status));
  }
}

checkDb();
