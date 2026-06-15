const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin(email) {
  if (!email) {
    console.error("Please provide an email address. Usage: node make-admin.js <email>");
    process.exit(1);
  }

  // 1. Get the user by email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error("Error fetching users:", userError);
    return;
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  // 2. Update their profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', status: 'approved' })
    .eq('id', user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    return;
  }

  console.log(`Successfully elevated ${email} to Admin and approved their status.`);
  console.log("You can now refresh the app and click the 'Admin' link in the top navigation.");
}

const emailArgs = process.argv.slice(2);
makeAdmin(emailArgs[0]);
