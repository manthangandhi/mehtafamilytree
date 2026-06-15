import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUserKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
const supabaseAuth = createClient(supabaseUrl, supabaseUserKey);

async function run() {
  let log = [];
  const appendLog = (msg) => {
    console.log(msg);
    log.push(msg);
  };
  
  try {
    const userEmail = `qa_test_${Date.now()}@example.com`;
    const userPassword = 'Password123!';
    appendLog(`Registering user: ${userEmail}`);
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email: userEmail,
      password: userPassword,
      options: {
        data: {
          full_name: 'QA Tester'
        }
      }
    });
    
    if (authError) throw authError;
    const userId = authData.user.id;
    appendLog(`User registered with ID: ${userId}`);
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'approved', role: 'member' })
      .eq('id', userId);
    
    if (profileError) throw profileError;
    appendLog('User profile approved.');

    const person1 = {
      full_name: `John QA ${Date.now()}`,
      gender: 'male',
      visibility_level: 'members',
      status: 'active'
    };
    const person2 = {
      full_name: `Jane QA ${Date.now()}`,
      gender: 'female',
      visibility_level: 'members',
      status: 'active'
    };
    
    appendLog('Creating Person 1...');
    const { data: p1Data, error: p1Error } = await supabaseAdmin.from('persons').insert(person1).select().single();
    if (p1Error) throw p1Error;
    appendLog(`Person 1 created: ${p1Data.id}`);

    appendLog('Creating Person 2...');
    const { data: p2Data, error: p2Error } = await supabaseAdmin.from('persons').insert(person2).select().single();
    if (p2Error) throw p2Error;
    appendLog(`Person 2 created: ${p2Data.id}`);
    
    const household = {
      primary_member_name: p1Data.full_name,
      primary_person_id: p1Data.id,
      country: 'India',
      city: 'Mumbai',
      residence_address: '123 QA Street'
    };
    
    appendLog('Creating Household...');
    const { data: hData, error: hError } = await supabaseAdmin.from('households').insert(household).select().single();
    if (hError) throw hError;
    appendLog(`Household created: ${hData.id}`);
    
    appendLog('Linking Person 1 to Household...');
    const { error: hm1Error } = await supabaseAdmin.from('household_members').insert({
      household_id: hData.id,
      person_id: p1Data.id,
      relationship_to_head: 'SELF',
      display_order: 1,
      is_primary: true
    });
    if (hm1Error) throw hm1Error;
    
    appendLog('Linking Person 2 to Household...');
    const { error: hm2Error } = await supabaseAdmin.from('household_members').insert({
      household_id: hData.id,
      person_id: p2Data.id,
      relationship_to_head: 'WIFE',
      display_order: 2,
      is_primary: false
    });
    if (hm2Error) throw hm2Error;
    
    appendLog('Submitting a change request...');
    const changeRequest = {
      request_type: 'update_person',
      target_table: 'persons',
      target_record_id: p1Data.id,
      submitted_by: userId,
      status: 'pending',
      proposed_data: {
        mobile_number: '9876543210'
      }
    };
    
    const { data: crData, error: crError } = await supabaseAdmin.from('change_requests').insert(changeRequest).select().single();
    if (crError) throw crError;
    appendLog(`Change request submitted: ${crData.id}`);

    appendLog('All operations completed successfully!');
    
    fs.writeFileSync('QA_Agent_2_Report.md', `# QA Execution Report\n\n\`\`\`text\n${log.join('\n')}\n\`\`\`\n\n## Summary\nAll requested database operations (User Auth, Persons, Household, and Change Requests) executed successfully via the Supabase Node.js client.`);
    console.log("Report saved to QA_Agent_2_Report.md");

  } catch (err) {
    console.error("Error occurred:", err);
    appendLog(`ERROR: ${err.message || JSON.stringify(err)}`);
    fs.writeFileSync('QA_Agent_2_Report.md', `# QA Execution Report\n\n## Status: FAILED\n\n\`\`\`text\n${log.join('\n')}\n\`\`\`\n\nError details:\n\`\`\`json\n${JSON.stringify(err, null, 2)}\n\`\`\``);
  }
}

run();
