import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfile() {
  const email = 'admin@deliveryapp.com';
  
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const user = usersData.users.find(u => u.email === email);
  
  if (user) {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: 'admin',
      role: 'admin',
      status: 'approved'
    });
    if (error) {
       console.error('Error inserting profile:', error);
       // Try updating instead
       await supabase.from('profiles').update({ role: 'admin', status: 'approved' }).eq('id', user.id);
    } else {
       console.log('Successfully inserted missing profile for admin!');
    }
  }
}

fixProfile();
