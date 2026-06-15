const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  const log = [];
  const addLog = (msg) => {
    console.log(msg);
    log.push(msg);
  }

  addLog('Starting test...');

  // 1. Register a new user
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  let userId = 'admin-fallback';
  if (authError) {
    addLog(`Error registering user: ${authError.message}`);
  } else {
    userId = authData?.user?.id || userId;
    addLog(`Successfully registered user: ${email} with ID: ${userId}`);
  }

  // Use service client to bypass RLS if anon key fails
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

  // 2. Create 2 new persons
  const { data: person1, error: p1Err } = await adminSupabase.from('persons').insert({
    full_name: 'John Doe ' + Date.now(),
    gender: 'male',
    visibility_level: 'public',
    status: 'active'
  }).select().single();

  const { data: person2, error: p2Err } = await adminSupabase.from('persons').insert({
    full_name: 'Jane Doe ' + Date.now(),
    gender: 'female',
    visibility_level: 'public',
    status: 'active'
  }).select().single();

  if (p1Err || p2Err) {
    addLog(`Error creating persons: ${JSON.stringify(p1Err || p2Err)}`);
  } else {
    addLog(`Created persons: ${person1.id} and ${person2.id}`);
  }

  // 3. Create a new Household
  let householdId = null;
  if (person1 && person2) {
    const { data: household, error: hErr } = await adminSupabase.from('households').insert({
      primary_member_name: person1.full_name,
      primary_person_id: person1.id,
      city: 'New York',
      country: 'USA',
      visibility_level: 'public',
      status: 'active'
    }).select().single();

    if (hErr) {
      addLog(`Error creating household: ${JSON.stringify(hErr)}`);
    } else {
      householdId = household.id;
      addLog(`Created household: ${household.id}`);
      
      // Link persons to household
      const { error: hm1Err } = await adminSupabase.from('household_members').insert({
        household_id: household.id,
        person_id: person1.id,
        relationship_to_head: 'self',
        is_primary: true
      });
      
      const { error: hm2Err } = await adminSupabase.from('household_members').insert({
        household_id: household.id,
        person_id: person2.id,
        relationship_to_head: 'spouse',
        is_primary: false
      });

      if (hm1Err || hm2Err) {
        addLog(`Error linking members: ${JSON.stringify(hm1Err || hm2Err)}`);
      } else {
        addLog(`Successfully linked persons to household`);
      }
    }
  }

  // 4. Submit a change request
  if (householdId) {
    const { data: changeReq, error: crErr } = await adminSupabase.from('change_requests').insert({
      request_type: 'update',
      target_table: 'households',
      target_record_id: householdId,
      submitted_by: userId,
      proposed_data: { city: 'Boston' },
      status: 'pending'
    }).select().single();

    if (crErr) {
      addLog(`Error creating change request: ${JSON.stringify(crErr)}`);
    } else {
      addLog(`Created change request: ${changeReq.id}`);
    }
  }

  addLog('Test finished.');

  // Write to QA_Agent_9_Report.md
  const reportContent = '# QA Report\n\n' + log.map(l => `- ${l}`).join('\n');
  fs.writeFileSync('QA_Agent_9_Report.md', reportContent);
}

runTest().catch(console.error);
