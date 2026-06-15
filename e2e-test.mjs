import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runTest() {
  console.log("Starting E2E Database test...");
  
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  
  // 1. Register
  console.log(`\nRegistering user: ${testEmail}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  
  if (authError) {
    console.error("Signup Error:", authError);
    return;
  }
  const userId = authData.user?.id;
  console.log("User registered successfully. ID:", userId);
  
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  
  if (loginError) {
    console.error("Login Error:", loginError);
    return;
  }
  console.log("User logged in successfully.");

  await new Promise(r => setTimeout(r, 1000));
  
  // Promote to admin using service role
  console.log("\nPromoting user to admin...");
  const { error: promoteError } = await adminSupabase
    .from('profiles')
    .update({ role: 'admin', status: 'approved' })
    .eq('id', userId);
    
  if (promoteError) {
    console.error("Promotion error:", promoteError);
    return;
  }
  console.log("User promoted to admin and approved.");

  // 2. Create a Person
  console.log("\nCreating a Person...");
  const { data: personData, error: personError } = await supabase
    .from('persons')
    .insert([{
        full_name: 'John Doe E2E',
        gender: 'male',
        date_of_birth: '1980-01-01',
        is_deceased: false,
        created_by: userId
    }])
    .select()
    .single();

  if (personError) {
      console.error("Person creation error:", personError);
      return;
  } else {
      console.log("Person created successfully. ID:", personData.id);
  }
  
  // 3. Create a Household
  console.log("\nCreating a Household...");
  const householdName = `Test Household ${Date.now()}`;
  let householdData;
  const { data: hData, error: householdError } = await supabase
    .from('households')
    .insert([{ 
        primary_member_name: householdName,
        primary_person_id: personData.id,
        residence_address: '123 Test St',
        city: 'Testville',
        country: 'Testland',
        created_by: userId,
        status: 'active'
    }])
    .select()
    .single();
    
  if (householdError) {
    console.error("Household creation error:", householdError);
  } else {
    householdData = hData;
    console.log("Household created successfully. ID:", householdData.id);
  }

  // 4. Add a household_member
  if (householdData && personData) {
      console.log("\nAdding household_member...");
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .insert([{
            household_id: householdData.id,
            person_id: personData.id,
            relationship_to_head: 'SELF',
            display_order: 1,
            is_primary: true
        }])
        .select()
        .single();
        
      if (memberError) {
          console.error("Member creation error:", memberError);
      } else {
          console.log("Household Member created successfully. ID:", memberData.id);
      }

      // 5. Submit a change request
      console.log("\nSubmitting change request...");
      const { data: correctionData, error: correctionError } = await supabase
        .from('change_requests')
        .insert([{
            request_type: 'update_household',
            target_table: 'households',
            target_record_id: householdData.id,
            submitted_by: userId,
            status: 'pending',
            proposed_data: { residence_address: "456 New St" }
        }])
        .select()
        .single();
        
      if (correctionError) {
          console.error("Change request error:", correctionError);
      } else {
          console.log("Change request submitted. ID:", correctionData.id);
      }
      
      // 6. Create an announcement
      console.log("\nCreating announcement...");
      const { data: announcementData, error: announcementError } = await adminSupabase
        .from('announcements')
        .insert([{
            title: 'Test Announcement',
            content: 'This is a test announcement created by E2E script',
            created_by: userId,
            event_type: 'general'
        }])
        .select()
        .single();
        
      if (announcementError) {
          console.error("Announcement error:", announcementError);
      } else {
          console.log("Announcement created. ID:", announcementData.id);
      }
  }

  console.log("\nTest completed.");
}

runTest();
