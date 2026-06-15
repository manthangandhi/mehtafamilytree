require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupTestUser() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'password123';
  
  console.log(`Creating user: ${email}`);

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: 'Test Admin' }
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  
  const userId = authData.user.id;
  console.log(`User created with ID: ${userId}`);

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      role: 'admin',
      status: 'approved' 
    })
    .eq('id', userId)
    .select()
    .single();

  if (profileError) {
    console.error('Profile Error:', profileError);
  } else {
    console.log('Profile updated to admin and approved:', profile.id);
  }
  
  console.log('Test User Credentials:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

setupTestUser();
