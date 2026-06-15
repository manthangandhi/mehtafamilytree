require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for Auth
const supabaseAuth = createClient(supabaseUrl, supabaseKey);

// Client for DB operations (bypassing RLS to ensure rapid setup)
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function runTest() {
    const results = [];
    const log = (msg, data) => {
        console.log(msg, data ? JSON.stringify(data) : '');
        results.push(`- **${msg}**: ${data ? JSON.stringify(data) : ''}`);
    };

    try {
        log('Starting QA Test');

        // 1. Register a new user
        const email = `qatest_${Date.now()}@example.com`;
        const password = 'QaTestPassword123!';
        log(`Registering user`, email);
        const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
            email,
            password
        });
        if (authError) throw new Error('Auth error: ' + authError.message);
        
        const userId = authData?.user?.id;
        if (!userId) throw new Error('User ID not returned. Check if email confirmation is required.');
        log('User registered with ID', userId);

        // 2. Create 2 new Persons
        log('Creating Person 1');
        const { data: person1, error: p1Error } = await supabaseAdmin.from('persons').insert({
            full_name: 'John QA ' + Date.now(),
            gender: 'male',
            status: 'active',
            visibility_level: 'public',
            created_by: userId
        }).select().single();
        if (p1Error) throw new Error('Person 1 error: ' + p1Error.message);
        log('Person 1 created', person1.id);

        log('Creating Person 2');
        const { data: person2, error: p2Error } = await supabaseAdmin.from('persons').insert({
            full_name: 'Jane QA ' + Date.now(),
            gender: 'female',
            status: 'active',
            visibility_level: 'public',
            created_by: userId
        }).select().single();
        if (p2Error) throw new Error('Person 2 error: ' + p2Error.message);
        log('Person 2 created', person2.id);

        // 3. Create a new Household linking the Persons
        log('Creating Household');
        const { data: household, error: hError } = await supabaseAdmin.from('households').insert({
            primary_member_name: person1.full_name,
            primary_person_id: person1.id,
            country: 'USA',
            status: 'active',
            visibility_level: 'public',
            created_by: userId
        }).select().single();
        if (hError) throw new Error('Household error: ' + hError.message);
        log('Household created', household.id);

        log('Linking Person 1 to Household (Primary)');
        const { error: link1Error } = await supabaseAdmin.from('household_members').insert({
            household_id: household.id,
            person_id: person1.id,
            relationship_to_head: 'SELF',
            display_order: 1,
            is_primary: true
        });
        if (link1Error) throw new Error('Link 1 error: ' + link1Error.message);

        log('Linking Person 2 to Household (Spouse)');
        const { error: link2Error } = await supabaseAdmin.from('household_members').insert({
            household_id: household.id,
            person_id: person2.id,
            relationship_to_head: 'WIFE',
            display_order: 2,
            is_primary: false
        });
        if (link2Error) throw new Error('Link 2 error: ' + link2Error.message);

        // 4. Submit a change request
        log('Submitting Change Request for Person 1');
        const { data: changeReq, error: crError } = await supabaseAdmin.from('change_requests').insert({
            request_type: 'update_person',
            target_table: 'persons',
            target_record_id: person1.id,
            proposed_data: { mobile_number: '555-1234-QA' },
            status: 'pending',
            submitted_by: userId
        }).select().single();
        if (crError) throw new Error('Change request error: ' + crError.message);
        log('Change request created', changeReq.id);

        log('All tests passed successfully', '✅');

        const report = `# QA Agent 7 Report\n\n## Test Execution Overview\n\nThis script automated the database-level QA validation for:\n1. User Registration\n2. Person Creation\n3. Household Creation & Linking\n4. Change Request Submission\n\n## Test Logs\n\n${results.join('\n')}\n\n## Status\n**SUCCESS**\n`;
        fs.writeFileSync('QA_Agent_7_Report.md', report);
        log('Report written to QA_Agent_7_Report.md');

    } catch (e) {
        log('TEST FAILED', e.message);
        const report = `# QA Agent 7 Report\n\n## Test Execution Overview\n\nThis script automated the database-level QA validation.\n\n## Test Logs\n\n${results.join('\n')}\n\n## Status\n**FAILED**\n\n### Error Details\n\`\`\`\n${e.message}\n\`\`\`\n`;
        fs.writeFileSync('QA_Agent_7_Report.md', report);
    }
}

runTest();
