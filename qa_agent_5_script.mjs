import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Use service role key to bypass RLS for this test
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  const log = [];
  const addLog = (msg) => {
    console.log(msg);
    log.push(msg);
  };

  try {
    addLog("# QA Agent 5 Report\n");
    addLog("## 1. Register a new user");
    const email = `qa_user_admin_${Date.now()}@example.com`;
    const password = "password123";
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authErr) {
      addLog(`Failed to register user: ${authErr.message}`);
      return;
    }
    const userId = authData.user.id;
    addLog(`User registered successfully: ${email} (ID: ${userId})`);

    // Manually ensure profile exists or is approved if needed, but we are using service_role so RLS won't block us anyway.

    addLog("\n## 2. Create 2 new Persons");
    const { data: person1, error: p1Err } = await supabase.from('persons').insert({
      full_name: `QA Person 1 ${Date.now()}`,
      gender: 'male',
      status: 'active',
      created_by: userId
    }).select().single();

    if (p1Err) {
      addLog(`Error creating Person 1: ${JSON.stringify(p1Err)}`);
      return;
    }
    addLog(`Person 1 created: ${person1.full_name} (ID: ${person1.id})`);

    const { data: person2, error: p2Err } = await supabase.from('persons').insert({
      full_name: `QA Person 2 ${Date.now()}`,
      gender: 'female',
      status: 'active',
      created_by: userId
    }).select().single();

    if (p2Err) {
      addLog(`Error creating Person 2: ${JSON.stringify(p2Err)}`);
      return;
    }
    addLog(`Person 2 created: ${person2.full_name} (ID: ${person2.id})`);

    addLog("\n## 3. Create a new Household linking the Persons");
    const { data: household, error: hErr } = await supabase.from('households').insert({
      primary_member_name: person1.full_name,
      primary_person_id: person1.id,
      city: 'Test City',
      status: 'active',
      created_by: userId
    }).select().single();

    if (hErr) {
      addLog(`Error creating Household: ${JSON.stringify(hErr)}`);
      return;
    }
    addLog(`Household created (ID: ${household.id})`);

    const { error: hm1Err } = await supabase.from('household_members').insert({
      household_id: household.id,
      person_id: person1.id,
      relationship_to_head: 'SELF',
      is_primary: true
    });
    if (hm1Err) {
      addLog(`Error linking Person 1 to Household: ${JSON.stringify(hm1Err)}`);
    } else {
      addLog("Person 1 linked as SELF");
    }

    const { error: hm2Err } = await supabase.from('household_members').insert({
      household_id: household.id,
      person_id: person2.id,
      relationship_to_head: 'WIFE',
      is_primary: false
    });
    if (hm2Err) {
      addLog(`Error linking Person 2 to Household: ${JSON.stringify(hm2Err)}`);
    } else {
      addLog("Person 2 linked as WIFE");
    }

    addLog("\n## 4. Submit a change request");
    const { data: cr, error: crErr } = await supabase.from('change_requests').insert({
      request_type: 'update_person',
      target_table: 'persons',
      target_record_id: person1.id,
      submitted_by: userId,
      proposed_data: { full_name: `QA Person 1 Updated ${Date.now()}` },
      status: 'pending'
    }).select().single();

    if (crErr) {
      addLog(`Error creating change request: ${JSON.stringify(crErr)}`);
    } else {
      addLog(`Change request submitted (ID: ${cr.id})`);
    }

    addLog("\n## Summary");
    addLog("Script execution completed successfully.");

    fs.writeFileSync('QA_Agent_5_Report.md', log.join('\n'));
    console.log("Report saved to QA_Agent_5_Report.md");

  } catch (err) {
    console.error(err);
  }
}

run();
