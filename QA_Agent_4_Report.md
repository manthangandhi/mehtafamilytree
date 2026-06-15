# QA Automation Report

- Starting QA Test...
- ✅ Created user: 0d0fa820-e48a-4e18-8133-e031ed90f381 (qa_test_1781527492932@example.com)
- ✅ Created persons: 01d04a4a-370c-431a-8429-ede219de1bb0, 073c6a84-fe7e-439c-a2ad-370106d384e8
- ✅ Created household: 65ec92d1-1204-4881-b2ae-ac8c74dd22cd
- ❌ Error: new row for relation "household_members" violates check constraint "household_members_relationship_to_head_check"

**Error during test execution:**
```json
{
  "code": "23514",
  "details": "Failing row contains (83ee1f52-e0fd-4a13-8dad-3f09a771007b, 65ec92d1-1204-4881-b2ae-ac8c74dd22cd, 01d04a4a-370c-431a-8429-ede219de1bb0, self, 1, t, 2026-06-15 12:44:54.233785+00, 2026-06-15 12:44:54.233785+00).",
  "hint": null,
  "message": "new row for relation \"household_members\" violates check constraint \"household_members_relationship_to_head_check\""
}
```