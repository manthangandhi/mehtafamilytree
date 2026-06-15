import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const report = [];
  report.push('# QA Test Report');
  report.push(`Date: ${new Date().toISOString()}\n`);

  try {
    // 1. Register a new user
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password123!';
    report.push('## 1. Registering new user');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
      }
    });

    if (authError) throw authError;
    report.push(`✅ User registered successfully via Admin: ${email} (ID: ${authData.user.id})`);

    // 2. Create 2 new Persons
    report.push('\n## 2. Creating Persons');
    const { data: persons, error: personError } = await supabaseAdmin.from('persons').insert([
      { full_name: 'Test Person A', gender: 'male', created_by: authData.user.id },
      { full_name: 'Test Person B', gender: 'female', created_by: authData.user.id }
    ]).select();

    if (personError) throw personError;
    report.push(`✅ Created 2 Persons: ${persons.map(p => p.full_name).join(', ')}`);

    // 3. Create a Household
    report.push('\n## 3. Creating Household');
    const { data: household, error: householdError } = await supabaseAdmin.from('households').insert({
      primary_member_name: persons[0].full_name,
      primary_person_id: persons[0].id,
      country: 'India',
      status: 'active',
      created_by: authData.user.id
    }).select().single();

    if (householdError) throw householdError;
    report.push(`✅ Created Household: ${household.primary_member_name} (ID: ${household.id})`);

    // Link Persons to Household
    report.push('\n## 4. Linking Persons to Household');
    const membersToInsert = [
      { household_id: household.id, person_id: persons[0].id, relationship_to_head: 'SELF', display_order: 1, is_primary: true },
      { household_id: household.id, person_id: persons[1].id, relationship_to_head: 'WIFE', display_order: 2, is_primary: false }
    ];
    const { error: membersError } = await supabaseAdmin.from('household_members').insert(membersToInsert);
    
    if (membersError) throw membersError;
    report.push(`✅ Linked persons to household successfully.`);

    // 4. Submit a change request
    report.push('\n## 5. Approving User');
    const { error: approveError } = await supabaseAdmin.from('profiles').update({ approval_status: 'approved' }).eq('id', authData.user.id);
    if (approveError) {
      report.push(`⚠️ Failed to approve user, cr insert might fail: ${approveError.message}`);
    } else {
      report.push(`✅ User approved.`);
    }

    report.push('\n## 6. Submitting Change Request');
    const { data: crData, error: crError } = await supabaseAdmin.from('change_requests').insert({
      request_type: 'update_person',
      target_table: 'persons',
      target_record_id: persons[0].id,
      submitted_by: authData.user.id,
      proposed_data: { full_name: 'Test Person A (Updated)' },
      status: 'pending'
    }).select();

    if (crError) throw crError;
    report.push(`✅ Change request submitted successfully (ID: ${crData[0].id})`);

  } catch (error) {
    report.push(`\n❌ ERROR: ${error.message || JSON.stringify(error)}`);
    console.error('Error:', error);
  }

  fs.writeFileSync('QA_Agent_1_Report.md', report.join('\n'));
  console.log('Test complete. Report saved to QA_Agent_1_Report.md');
}

run();
