# Digital Family Directory — User Handbook & Product Guide

A secure, approval-based digital replacement for a printed family directory book. Built with Next.js App Router + Supabase for families who want to preserve their roots with modern tools while keeping the traditional household structure.

This is the complete handbook for users and admins. It describes **all features**, how the data model works (especially relationships and person details), how to identify family branches (e.g., "which wife of which child/son"), privacy rules, and step-by-step usage.

**Core principles (final product, not MVP):**
- Household-centric (exactly like the traditional printed book)
- Admins manually create or approve every change for trust and accuracy
- Strong privacy: visitors and pending accounts see only safe public fields
- Complete audit trail for every action
- Rich person details visible in context (full additional info for approved members)
- Simple, respectful, accessible, and polished for all generations (including non-technical and elderly family members)
- Support for complex families (multi-spouse, multi-generational) with clear relationship identification

## Data Model & How Relationships & Person Details Work

The app is built around these core concepts so that each person in a household has full details, and you can identify connections like "the wife of this particular son/child":

- **Households**: The primary unit (like the printed book). Has a primary head (SELF), address/contact fields (private), native place, etc.
- **Persons**: Every individual has rich additional details: full_name, gender, date_of_birth, date_of_death, is_deceased, education, occupation, marital_status, mobile_number, whatsapp_number, email, blood_group, notes, etc.
- **Household Members**: Links a person to a household with `relationship_to_head` (SELF, WIFE, SON, DAUGHTER, DAUGHTER IN LAW, etc.). This gives the direct link to the household head.
- **Relationships** (person-to-person): Captures the full graph — father, mother, spouse, child, sibling, etc. This is what allows identifying "which wife of which child/son".

**How we identify "who is the wife of which child/son" (and full branches in complex families):**
- When creating/approving a household, the form accepts members in order (add Wife1, then her sons; add Wife2, then her children).
- The system automatically creates:
  - `relationship_to_head` links (to the household head).
  - `relationships` entries: spouse links for wives, child links from the head, **and mother links from the most recent wife** (based on the order you added them in the form).
- In the **Household Detail** page (for approved members):
  - Members table shows Name + Relationship (to head) + DOB + full additional details (Occupation, Education/Marital, Blood Group, Notes) + Mobile (private fields protected).
  - A "Family Links" column pulls from the `relationships` table and shows connections like "child of Head", "child of WifeName", "spouse of X".
- This way, you can clearly see branches: e.g., Son1 listed under rel "SON" with Family Links showing he is child of both the head and a specific wife.
- The **Family Tree** page visualizes households as units with ordered members and shows inline relationships. It derives from the same data for a generated view of the family structure.
- If more complex links are needed (e.g., a child of a previous wife), use the correction/submit flow or admin tools to add/update `relationships` entries directly.

**Each person has all additional details**:
- All person fields (education, occupation, blood_group, notes, contacts, etc.) are captured during household creation, member submissions, corrections, and admin edits.
- In household views and the family tree (for approved members), these are displayed in context alongside the name and relationship.
- Public/visitor views show only safe fields (name, rel, DOB, education, marital, deceased status).
- My Profile (for approved members) lets you update your own details (creates an admin-reviewed correction request so the approval model is respected).
- Person data is always linked back to the household for the traditional book-like experience, while the relationships table provides the full family graph.

This model supports traditional single-head households as well as more complex multi-spouse or blended families common in real extended families.

## Key Features (Complete List for Users)

**Public / Visitor Access (limited, privacy-first):**
- Homepage with clear value proposition.
- Directory search (by name, native place, city, state, relationship to head, marital status, alive/deceased).
  - Results show households (primary name, location) and matching persons with safe fields only.
- Household detail pages: Primary member, basic location, limited family member list (name, rel to head, DOB, education/marital). No contacts or private notes.
- Culture & History pages: Public cultural content (history, gotra, rituals, etc.) formatted with Markdown for readability.
- Register / Login (new accounts start as "pending").

**For Approved Members (full private data + contributions):**
- Dashboard: Personalized welcome, status, quick links to all features. Guidance messages for pending/approved states. Email confirmation status shown.
- Full Directory + Household details: All person additional details visible in household members tables (occupation, blood, notes, full contacts via PrivacyField). Family Links column for relationships.
- Family Tree: Interactive generated view from household + relationship data. Searchable household units with members in order + inline family links. Shows the complete structure including branches.
- My Profile: Update your own full details (name, mobile, WhatsApp, email, notes). Submits as a tracked correction request.
- Submit updates (respects approval model, never direct live changes):
  - New Household (full form with family member repeater — supports complex input order for proper wife/child linking).
  - Correction (user-friendly form for any household or person — no raw JSON).
  - Mark Deceased (for a person, with date and notes).
- My Requests: Track all your submissions and their approval status/reasons.
- Culture: View rich formatted family history and guidance (Markdown support for admins means beautiful readable content for everyone).

**Admin Features (full control + accountability):**
- User management: Approve/reject/block/promote to admin, and "Confirm Email" button (bypasses Supabase email confirmation for family use).
- Household management: Create full households with repeater (auto-creates persons, members, and relationships including mother links). Edit basic fields + add missed family members directly in the edit screen (reuses the same rich repeater). Deactivate (soft delete).
- Persons: View and edit individual rich details.
- Change Requests: Full review queue with comparison view (current vs proposed). Approve applies changes live + creates audit. Reject with reason (visible to submitter). All request types supported for core flows.
- Cultural Pages: Full CRUD with Markdown formatting (title, category, language, visibility). Changes immediately available to the right audiences (public/members/admin).
- Audit Logs: Complete read-only history of every privileged action (who did what, when, old/new data).
- Overview dashboard with quick counts (pending users, pending requests, active households).

**Technical / Under the Hood (for transparency):**
- All member submissions go only into `change_requests` (never direct live updates).
- Approvals apply changes to live tables (persons, households, household_members, relationships) and always create audit entries.
- Privacy enforced at multiple layers: Safe database views for public, RLS policies, server-side checks, PrivacyField component in UI.
- Every admin action (create, update, approve, user status, culture, etc.) creates an `audit_logs` entry.
- Soft deletes preferred for households/persons.
- Service role key is server-only (never in browser).
- Rich data capture: Every person record supports the full set of additional details (see data model above).

## Workflows (Step-by-Step Handbook)

**Visitor browsing:**
1. Go to home or Directory — see limited safe data.
2. Click a household — see public view of head + basic members.
3. Browse Culture for traditions.

**New user registration & approval:**
1. Register (provide name, email, optional mobile).
2. Profile created as "pending".
3. Login shows "awaiting approval" message (you can still submit public-ish updates).
4. Admin goes to /admin/users, clicks "Approve" + "Confirm Email".
5. User can now login as approved and see full private data + use My Profile, submit forms, Family Tree.

**Adding a complex household (with multiple wives/children — so relationships are correct):**
1. Admin or approved member goes to Submit New Household or Admin > New Household.
2. Fill head details + use the Family Members repeater:
   - Add Wife1 (WIFE).
   - Add her Son1, Son2 (SON) — system will link them as children of head + of Wife1.
   - Add Wife2 (WIFE).
   - Add her Daughter (DAUGHTER) — system links to head + Wife2.
3. Submit (member) or Save (admin).
4. If member submission: Admin reviews in /admin/requests, compares, approves.
5. View in Directory or Household detail: Full details per person + Family Links column showing the mother links.
6. Check Family Tree: See the branched structure.

**Updating your own details (approved member):**
1. Dashboard > My Profile.
2. Form is pre-filled from your current data.
3. Edit any fields (full details supported).
4. Submit — creates a correction request.
5. Admin approves in requests queue.
6. Your updates appear in household views and tree.

**Admin editing a household (including adding missed members):**
1. /admin/households > edit a household.
2. Edit basic fields (name, addresses, verified, notes) — Save.
3. Scroll to "Add Missed Family Members" section.
4. Use the repeater to add anyone missed (full details + relationship).
5. "Add These Family Members" — creates the persons + links + relationships (including mother links).
6. View the updated household detail or tree.

**Marking someone deceased (respectful update):**
- Use Submit > Mark Deceased (or admin direct).
- Provide date + notes.
- Goes through approval.
- Appears with † in all views.

**Culture & traditions:**
- Admins create/edit in /admin/culture with Markdown (bold, lists, links) for nice formatting.
- Everyone sees beautifully rendered pages based on visibility (public or members only).

All actions are audited. Privacy is always respected.

## Getting Started & Admin Setup (Production Handbook)

(See the setup section in the original for Supabase + migrations. Once set up as final product:)

1. Register the first user.
2. Promote to admin + approved via SQL (one-time).
3. (Optional but recommended) Use the "Confirm Email" button in Admin > Users for family members instead of relying on email links.
4. Create the first households using the rich form (pay attention to member order for correct wife/child linking).
5. Share the site with family. Direct them to register, then wait for your approval.

The app is now a complete, self-documenting handbook for your specific family.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`

Built with care for families as a lasting digital archive and modern replacement for the printed book. All features are designed to be used and trusted by the whole family.

## Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind
- Supabase Auth + PostgreSQL + RLS
- Zod + React Hook Form (client forms)
- Server Actions for privileged operations
- Clean reusable components

## Project Structure (key paths)
```
app/
  (public) / /directory /households/[id] /culture /login /register
  (member) /dashboard /submit/* /my-requests
  (admin)  /admin/** (protected server-side)
lib/
  supabase/ (client, server, admin, types)
  auth/ (getCurrentUserProfile, requireAdmin, requireApprovedMember)
  validations/ (Zod)
  actions/ (households, changeRequests, users, culture, audit)
db/migrations/
  001_initial_schema.sql
  (002_seed_data.sql is deprecated and contains no data)
components/
  ui/ forms/ admin/ directory/
```

## Getting Started

### 1. Supabase Project
1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key.

### 2. Environment
```bash
cp .env.example .env.local
```

Fill:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...     # Keep this secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Database Migrations
In the Supabase dashboard → SQL Editor, run the files in order:

1. `db/migrations/001_initial_schema.sql`

This creates:
- All tables + views + indexes + triggers
- RLS policies (public / approved member / admin)
- Auto profile creation trigger on new auth.users

No seed data is included. Add your real family households via the UI (Submit New Household) or admin tools after setup.

### 4. Create your first Admin
1. Register a new account via the web UI (`/register`).
2. In Supabase SQL Editor or Table Editor, find your `profiles` row and run:

```sql
UPDATE public.profiles 
SET role = 'admin', status = 'approved' 
WHERE id = 'PASTE-YOUR-UUID-HERE';
```

### 5. Run the App
```bash
npm run dev
```

Visit http://localhost:3000

## Key Workflows (Testing Checklist)

**Visitor:**
- Can browse `/`, `/directory` (limited fields), `/culture`
- Cannot see phones, addresses, emails

**Registration & Pending:**
- New user registers → profile created with `role=member`, `status=pending`
- Pending users can log in but see messages that they are awaiting approval
- They can still submit change requests

**Admin User Approval:**
- Go to `/admin/users`
- Approve / block / promote users

**Admin Household Creation:**
- `/admin/households/new` — full form with repeater for family members
- Automatically creates persons + household_members + basic relationships
- Creates audit log

**Member Submissions:**
- Approved members can submit:
  - New household (`/submit/new-household`)
  - Corrections (`/submit/correction`)
  - Mark deceased (`/submit/mark-deceased`)
- All go into `change_requests` with `status=pending`

**Admin Approvals:**
- `/admin/requests` → review each request
- Comparison view of current vs proposed
- Approve applies the change + creates audit log
- Reject saves reason

**Privacy in action:**
- Public pages use safe views (`public_*_view`)
- Approved member pages can access full columns via RLS + server components

## Admin Quick Links (after login)
- `/admin` — overview
- `/admin/users`
- `/admin/households/new`
- `/admin/requests`
- `/admin/audit-logs`

## Important Notes
- First admin must be promoted manually in the database (one-time step).
- Service role key is used only in server actions for privileged writes (never exposed to browser).
- Soft delete is preferred (`status = 'inactive'`).
- Relationship creation focuses on the most common cases (spouse/child) but can be extended via corrections and admin tools.
- The Family Tree and Culture sections are fully featured for a complete family experience.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`

Built with care for families — ready for real use as a trusted digital family archive.
