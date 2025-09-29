# Auth and Users Architecture (Hello World)

- Login: OAuth 1.0a (consumer key/secret) for end-users; tokens stored in `users/{schoology_user_id}`.
- Admin tasks: Admin API credentials (Manage API) for seeding and privileged reads.
- Parent/Student flows:
  - Parent login: fetch `users/me` → role and possibly `child_uids`.
  - Children listing (real): `GET /api/parent/children` uses user tokens to read `child_uids` and resolves names via `users/{id}`.
  - Active child selection: `POST /api/parent/active` persists `activeChildId`.
  - Child profile read: `GET /api/schoology/child` uses admin creds to fetch profile by child ID.
- Demo mode: Firestore-only personas; no MSW dependency.

References

- Schoology REST API v1 (Users, Roles, Schools, Profile Images): https://developers.schoology.com/api-documentation/rest-api-v1/
- Parent accounts/associations docs:
  - Creating Parent Accounts: https://uc.powerschool-docs.com/en/schoology/latest/creating-parent-accounts-understanding-your-option
  - Add Children Associations (Parents): https://uc.powerschool-docs.com/en/schoology/latest/add-children-associations-parents
