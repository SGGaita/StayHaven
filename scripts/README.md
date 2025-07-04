# User Account Creation Scripts

This directory contains scripts for creating user accounts in the StayHaven application.

## create-specific-accounts.js

Creates three specific accounts for testing and administration:

### Accounts Created:
1. **admin@stayhaven.com** - SUPER_ADMIN role
2. **property@stayhaven.com** - PROPERTY_MANAGER role  
3. **customer@stayhaven.com** - CUSTOMER role

### Default Password:
All accounts are created with the password: `StayHaven@2024`

### How to Run:

#### Option 1: Using npm script (recommended)
```bash
npm run create-accounts
```

#### Option 2: Direct execution
```bash
node scripts/create-specific-accounts.js
```

### Features:
- ✅ Checks if accounts already exist before creating
- ✅ Updates existing accounts with correct roles and details
- ✅ Sets verification status to "VERIFIED" for immediate use
- ✅ Uses secure password hashing (bcrypt)
- ✅ Proper error handling for individual account creation

### Notes:
- The script is safe to run multiple times
- If accounts already exist, they will be updated with the correct roles
- All accounts are created with verified status for immediate testing
- Make sure your database is running and accessible before executing 