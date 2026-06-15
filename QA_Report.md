# QA Report - Supabase Backend Tests

## Overview
Automated backend testing was performed directly against the Supabase instance. The test evaluated user registration, data insertions, and table relationships.

## Test Execution Log
- **Starting test...**
- **User Registration**: Successfully registered user `testuser_1781527522216@example.com` with ID: `75cf544b-da10-412d-9a40-ffe03db8f8cf`
- **Person Creation**: Created 2 persons (`ea0bb658-e590-47a5-9669-2f23d13a6b66` and `c1d42cfe-7b2c-4d55-b766-4bc666ada185`)
- **Household Creation**: Created household: `fce0c5ab-e688-4e41-b704-3e19b43cf4d2`

## Issues Found

### 1. `household_members` Check Constraint Violation
- **Error:** `new row for relation "household_members" violates check constraint "household_members_relationship_to_head_check"`
- **Details:** The system rejected linking a member to the household with `relationship_to_head` set to `"self"`. 
- **Recommendation:** Check database schema for allowed `relationship_to_head` values (e.g., `"Head"`, `"Spouse"`) and ensure UI only submits valid values.

### 2. `change_requests` Check Constraint Violation
- **Error:** `new row for relation "change_requests" violates check constraint "change_requests_request_type_check"`
- **Details:** The system rejected a change request with `request_type` set to `"update"`.
- **Recommendation:** Verify the permissible values for `request_type` (e.g., `"edit"`, `"addition"`) and ensure they match throughout the frontend and DB migrations.

## Conclusion
Core auth and basic record inserts for `persons` and `households` are fully operational. However, relational checks and constrained fields in `household_members` and `change_requests` resulted in insertion errors that need to be aligned with the frontend types.