# Security Specification: Barangay Tanod S.O.S

## Data Invariants
1. A **Resident** can only create an Incident with their own `uid` as `reporterId`.
2. A **Resident** cannot modify an Incident once created, except for resolving if they are the reporter (optional, currently not implemented for residents in UI).
3. A **Tanod** can update an Incident's `status` and `assignedTanods`.
4. A **Tanod** can update their own `lastLocation` and `status`.
5. **Announcements** are strictly read-only for Residents and Tanods. Only **Admins** can create them.

## The Dirty Dozen Payloads (Rejections Expected)
1. **Malicious Resident**: Create incident with `reporterId` of another user.
2. **Account Takeover**: Resident trying to update another user's `role` via public profile update.
3. **Status Poisoning**: Resident trying to set their own role to 'Tanod'.
4. **Ghost Incident**: Update an incident's `reporterId` after creation.
5. **Admin Access Leak**: Resident trying to create an Announcement.
6. **Location Spoofing**: Tanod trying to update another Tanod's location.
7. **Jumbo Payload**: Creating an incident with a 1MB description string.
8. **Invalid ID**: Incident with ID injected as a path variable with malicious symbols.
9. **Role Escalation**: Resident updating their own `role` field.
10. **Terminal State Bypass**: Updating a 'Resolved' incident back to 'Pending'.
11. **PII Leak**: Fetching all user profiles (including phone numbers) without being Admin or the Owner.
12. **Unauthorized Metadata**: Spoofing `createdAt` timestamp using client-side clock.

## Security Rules Implementation Plan
- Use `isValidUser`, `isValidIncident`, `isValidAnnouncement` helpers.
- Enforce `request.time` for timestamps.
- Use `affectedKeys().hasOnly()` for all updates.
- Root matches with `allow read, write: if false;`.
- Partition access to `users` collection.
