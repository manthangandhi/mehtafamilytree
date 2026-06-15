require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function runQA() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  // Admin client for DB ops
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Anon client for Auth
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const results = [];

  try {
    const timestamp = Date.now();
    const email = `qa_test_${timestamp}@example.com`;
    const password = "Password123!";

    // 1. Register a new user
    console.log(`Registering user: ${email}`);
    const { data: authData, error: authError } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: `QA User ${timestamp}` }
      }
    });

    if (authError) throw new Error(`Auth Error: ${authError.message}`);
    const userId = authData.user.id;
    results.push(`✅ Successfully registered new user: ${email} (ID: ${userId})`);

    // 2. Approve the user
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', userId);
    
    if (profileError) throw new Error(`Profile Update Error: ${profileError.message}`);
    results.push(`✅ Automatically approved user profile in DB.`);

    // 3. Create 2 new Persons
    console.log("Creating 2 new persons...");
    const { data: personsData, error: personsError } = await adminClient
      .from('persons')
      .insert([
        { full_name: `John QA ${timestamp}`, gender: 'male', status: 'active', visibility_level: 'members' },
        { full_name: `Jane QA ${timestamp}`, gender: 'female', status: 'active', visibility_level: 'members' }
      ])
      .select();

    if (personsError) throw new Error(`Persons Creation Error: ${personsError.message}`);
    results.push(`✅ Successfully created 2 new Persons: ${personsData.map(p => p.full_name).join(', ')}`);

    // 4. Create a Household
    console.log("Creating a household...");
    const { data: householdData, error: householdError } = await adminClient
      .from('households')
      .insert([
        { 
          primary_member_name: `John QA ${timestamp}`, 
          primary_person_id: personsData[0].id,
          status: 'active', 
          visibility_level: 'members' 
        }
      ])
      .select();

    if (householdError) throw new Error(`Household Creation Error: ${householdError.message}`);
    const householdId = householdData[0].id;
    results.push(`✅ Successfully created Household: ${householdData[0].primary_member_name} (ID: ${householdId})`);

    // 5. Link Persons to Household
    console.log("Linking persons to household...");
    const { error: linkError } = await adminClient
      .from('household_members')
      .insert([
        { household_id: householdId, person_id: personsData[0].id, is_primary: true, relationship_to_head: 'SELF' },
        { household_id: householdId, person_id: personsData[1].id, is_primary: false, relationship_to_head: 'WIFE' }
      ]);
    
    if (linkError) throw new Error(`Household Link Error: ${linkError.message}`);
    results.push(`✅ Successfully linked Persons to Household.`);

    // 6. Submit a change request
    console.log("Submitting change request...");
    const { data: requestData, error: requestError } = await authClient
      .from('change_requests')
      .insert([
        { 
          request_type: 'update_person',
          target_table: 'persons',
          target_record_id: personsData[0].id, 
          proposed_data: { education: "Ph.D. in QA" },
          status: 'pending',
          submitted_by: userId
        }
      ])
      .select();

    if (requestError) throw new Error(`Change Request Error: ${requestError.message}`);
    results.push(`✅ Successfully submitted a change request for Person (ID: ${personsData[0].id}).`);

    // Save report
    const fs = require('fs');
    const reportContent = `# QA Execution Report\n\nDate: ${new Date().toISOString()}\n\n## Summary\n\n${results.join('\n\n')}\n`;
    fs.writeFileSync('QA_Agent_8_Report.md', reportContent);
    console.log("Report saved to QA_Agent_8_Report.md");

  } catch (error) {
    console.error("Execution Failed:", error.message);
    const fs = require('fs');
    fs.writeFileSync('QA_Agent_8_Report.md', `# QA Execution Report\n\nDate: ${new Date().toISOString()}\n\n## ERROR\n\n${error.message}\n`);
    process.exit(1);
  }
}

runQA();
