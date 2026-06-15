require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSweep() {
  let approvedProfiles = 0;
  let approvedRequests = 0;

  // 1. Approve Profiles
  const { data: pendingProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('status', 'pending');

  if (pendingProfiles && pendingProfiles.length > 0) {
    const ids = pendingProfiles.map(p => p.id);
    await supabase.from('profiles').update({ status: 'approved' }).in('id', ids);
    approvedProfiles += ids.length;
    console.log(`Approved ${ids.length} profiles.`);
  }

  // 2. Approve Change Requests
  const { data: pendingReqs, error: reqsError } = await supabase
    .from('change_requests')
    .select('*')
    .eq('status', 'pending');
    
  if (reqsError) {
     console.error("Error fetching change requests:", reqsError);
  }

  if (pendingReqs && pendingReqs.length > 0) {
    for (const req of pendingReqs) {
      const { target_table, target_record_id, proposed_data, request_type } = req;
      
      try {
        if (!target_table) {
           console.log(`No target_table for request ${req.id}`);
           continue;
        }
        
        let dbRes;
        
        // Handle applying data
        if (target_record_id) {
           dbRes = await supabase.from(target_table).update(proposed_data).eq('id', target_record_id);
        } else {
           dbRes = await supabase.from(target_table).insert(proposed_data);
        }
        
        if (dbRes && dbRes.error) {
           console.error(`DB error for table ${target_table}:`, dbRes.error);
           continue;
        }
        
        // Mark approved
        const {error: upErr} = await supabase.from('change_requests').update({ status: 'approved' }).eq('id', req.id);
        if(upErr) console.error("Error updating status:", upErr);
        else approvedRequests++;
      } catch (err) {
        console.error(`Failed to process request ${req.id}:`, err);
      }
    }
    console.log(`Approved ${approvedRequests} change requests.`);
  }
  
  return { approvedProfiles, approvedRequests };
}

async function main() {
  console.log("Starting QA Admin sweep for 30 seconds...");
  const endTime = Date.now() + 32 * 1000; // 32 seconds
  
  let totalProfiles = 0;
  let totalRequests = 0;
  
  while (Date.now() < endTime) {
    try {
      const res = await runSweep();
      totalProfiles += res.approvedProfiles;
      totalRequests += res.approvedRequests;
    } catch(err) {
      console.error(err);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`Done. Total Profiles Approved: ${totalProfiles}, Total Requests Approved: ${totalRequests}`);
  
  const reportPath = '/Users/manthangandhi/.gemini/antigravity/brain/4738ea0e-aeec-4446-a9b8-18d47d2d95e3/Admin_QA_Report.md';
  const report = `# Admin QA Report\n\n- Profiles Approved: ${totalProfiles}\n- Change Requests Approved: ${totalRequests}\n`;
  fs.writeFileSync(reportPath, report);
  
  console.log("Report written to:", reportPath);
}

main().catch(console.error);
