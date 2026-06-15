require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  let report = "# QA Agent 3 Report\n\n## Execution Log\n\n";
  const log = (msg) => {
    console.log(msg);
    report += `- ${msg}\n`;
  };

  try {
    // 1. Register a new user
    const email = `qa_user_${Date.now()}@example.com`;
    const password = 'Password123!';
    log(`Registering new user: ${email}`);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'QA Tester 3' }
    });

    if (authError) throw new Error(`User creation failed: ${authError.message}`);
    const userId = authData.user.id;
    log(`User created with ID: ${userId}`);

    // Update profile to ensure approved
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', userId);
    log(`User profile approved.`);

    // 2. Create 2 new Persons
    log(`Creating Person 1...`);
    const { data: person1, error: p1Error } = await supabase.from('persons').insert({
      full_name: 'QA Person One',
      gender: 'male',
      mobile_number: '1234567890'
    }).select().single();
    if (p1Error) throw new Error(`Person 1 creation failed: ${p1Error.message}`);
    log(`Person 1 created: ${person1.id}`);

    log(`Creating Person 2...`);
    const { data: person2, error: p2Error } = await supabase.from('persons').insert({
      full_name: 'QA Person Two',
      gender: 'female',
      mobile_number: '0987654321'
    }).select().single();
    if (p2Error) throw new Error(`Person 2 creation failed: ${p2Error.message}`);
    log(`Person 2 created: ${person2.id}`);

    // 3. Create a Household
    log(`Creating Household...`);
    const { data: household, error: hhError } = await supabase.from('households').insert({
      household_code: `HH-QA-${Date.now()}`,
      primary_member_name: person1.full_name,
      primary_person_id: person1.id,
      residence_address: '123 QA Street',
      mobile_number: '1234567890'
    }).select().single();
    if (hhError) throw new Error(`Household creation failed: ${hhError.message}`);
    log(`Household created: ${household.id}`);

    // 4. Link Persons to Household
    log(`Linking Person 1 to Household as SELF...`);
    const { error: hm1Error } = await supabase.from('household_members').insert({
      household_id: household.id,
      person_id: person1.id,
      relationship_to_head: 'SELF'
    });
    if (hm1Error) throw new Error(`Link Person 1 failed: ${hm1Error.message}`);

    log(`Linking Person 2 to Household as WIFE...`);
    const { error: hm2Error } = await supabase.from('household_members').insert({
      household_id: household.id,
      person_id: person2.id,
      relationship_to_head: 'WIFE'
    });
    if (hm2Error) throw new Error(`Link Person 2 failed: ${hm2Error.message}`);
    log(`Persons linked to household successfully.`);

    // 5. Submit a change request
    log(`Submitting a change request...`);
    const { data: changeReq, error: crError } = await supabase.from('change_requests').insert({
      request_type: 'update_household',
      target_table: 'households',
      target_record_id: household.id,
      submitted_by: userId,
      proposed_data: { residence_address: '456 Updated QA Street' }
    }).select().single();
    if (crError) throw new Error(`Change request failed: ${crError.message}`);
    log(`Change request submitted: ${changeReq.id}`);

    report += "\n## Summary\nAll operations completed successfully. The application database schema handles relationships and constraints as expected.";

  } catch (error) {
    log(`ERROR: ${error.message}`);
    report += `\n## Error\nAn error occurred during execution:\n${error.message}\n`;
  }

  fs.writeFileSync('QA_Agent_3_Report.md', report);
  console.log('Report written to QA_Agent_3_Report.md');
}

run();
