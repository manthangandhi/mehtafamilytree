## QA Test Report (Failed)

```
Registering new user: testuser_1781527559446@example.com
User registered: 6606eec8-799c-4db7-a5bb-b05a15afec4e
Creating 2 new persons...
Created Persons: 315e0309-ea11-4719-87dc-817bc33d583d, 13faa23f-332b-4fdf-aa22-78fd9b79044a
Creating a new household...
Created Household: 75cc3340-03f8-477d-a432-adeb344afab9
Linking persons to household...
Linked 2 persons to household.
Approving user profile...
Submitting a change request as the user...

ERROR: {
  "code": "23514",
  "details": null,
  "hint": null,
  "message": "new row for relation \"change_requests\" violates check constraint \"change_requests_request_type_check\""
}
```
