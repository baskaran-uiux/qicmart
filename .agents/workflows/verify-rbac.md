---
description: how to verify Admin & Super Admin Access Flow
---

Follow these steps to verify the role-based access control (RBAC) implementation:

### 1. Promote a User to Super Admin
To test the full platform access, you first need a Super Admin account.

// turbo
1. In your terminal, run the following command:
   ```bash
   npx tsx scripts/manage-roles.ts
   ```
2. Enter the email address of an existing user and type `SUPER_ADMIN` when prompted for the role.

### 2. Verify Super Admin Access
1. Visit the main domain (e.g., `localhost:3000`).
2. Log in with the account you just promoted.
3. Manually navigate to `/admin`.
   - **Expected Result**: You should have full access to the Platform Admin dashboard.
4. Manually navigate to `/dashboard`.
   - **Expected Result**: You should have access to the store dashboard.

### 3. Verify Admin Access (Store Owner)
1. Use the script again to promote a different user (or demote the previous one) to `ADMIN`.
   ```bash
   npx tsx scripts/manage-roles.ts
   ```
2. Log in with that account.
3. Navigate to `/dashboard`.
   - **Expected Result**: You should have access.
4. Navigate to `/admin`.
   - **Expected Result**: You should be automatically redirected to the home page (`/`).

### 4. Verify Customer Access
1. Use the script to set a user's role to `CUSTOMER`.
2. Log in and try to access `/admin` or `/dashboard`.
   - **Expected Result**: You should be redirected to the home page (`/`) in both cases.

> [!NOTE]
> If a user is already logged in when you change their role, they must **log out and log back in** for the changes to take effect in their session.
