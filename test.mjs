import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env vars. Source .env.local first.");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const supabaseAnon = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const log = [];
  const addLog = (msg) => {
    console.log(msg);
    log.push(msg);
  };

  try {
    // 1. Register a new user
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password123!';
    addLog(`Registering new user: ${email}`);
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    addLog(`User registered: ${authData.user.id}`);

    // 2. Create 2 new Persons
    addLog(`Creating 2 new persons...`);
    const { data: personsData, error: personsError } = await supabaseAdmin
      .from('persons')
      .insert([
        { full_name: 'John Doe Test', visibility_level: 'public', status: 'active', created_by: authData.user.id },
        { full_name: 'Jane Doe Test', visibility_level: 'public', status: 'active', created_by: authData.user.id }
      ])
      .select();
      
    if (personsError) throw personsError;
    const person1 = personsData[0];
    const person2 = personsData[1];
    addLog(`Created Persons: ${person1.id}, ${person2.id}`);

    // 3. Create a new Household
    addLog(`Creating a new household...`);
    const { data: hhData, error: hhError } = await supabaseAdmin
      .from('households')
      .insert([
        { 
          primary_member_name: 'John Doe Test', 
          primary_person_id: person1.id,
          visibility_level: 'public', 
          status: 'active',
          country: 'Test Country'
        }
      ])
      .select();

    if (hhError) throw hhError;
    const household = hhData[0];
    addLog(`Created Household: ${household.id}`);

    // Link the Persons
    addLog(`Linking persons to household...`);
    const { data: hmData, error: hmError } = await supabaseAdmin
      .from('household_members')
      .insert([
        { household_id: household.id, person_id: person1.id, relationship_to_head: 'SELF', is_primary: true },
        { household_id: household.id, person_id: person2.id, relationship_to_head: 'WIFE', is_primary: false }
      ])
      .select();
      
    if (hmError) throw hmError;
    addLog(`Linked 2 persons to household.`);

    addLog(`Approving user profile...`); 
    const { error: profileError } = await supabaseAdmin.from("profiles").update({ status: "approved", role: "member" }).eq("id", authData.user.id); 
    if (profileError) throw profileError; 

    // 4. Submit a change request
    addLog(`Submitting a change request as the user...`);
    // Need to use Anon client, and maybe sign in if signUp didn't give a session? 
    // Or just use service role key to insert the change request for the user. 
    // To properly test RLS on change_requests, let's use the anon client with the user's session.
    
    // Wait, the anon client already has the session from signUp!
    const { data: crData, error: crError } = await supabaseAnon
      .from('change_requests')
      .insert([
        {
          request_type: 'update',
          target_table: 'persons',
          target_record_id: person1.id,
          submitted_by: authData.user.id,
          status: 'pending',
          proposed_data: { full_name: 'John Doe Updated' }
        }
      ])
      .select();

    if (crError) throw crError;
    addLog(`Submitted change request: ${crData[0].id}`);
    
    addLog("\nSUCCESS! All operations completed.");
    fs.writeFileSync('QA_Agent_6_Report.md', '## QA Test Report\n\n```\n' + log.join('\n') + '\n```\n');
  } catch (error) {
    addLog(`\nERROR: ${JSON.stringify(error, null, 2)}`);
    fs.writeFileSync('QA_Agent_6_Report.md', '## QA Test Report (Failed)\n\n```\n' + log.join('\n') + '\n```\n');
  }
}

run();
