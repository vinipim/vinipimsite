-- SQL script to create an admin account
-- Run this in your MySQL database if you can't use the TypeScript method

INSERT INTO adminCredentials (id, email, passwordHash, name)
VALUES (
  UUID(),
  'admin@example.com',
  SHA2('SecurePassword123!', 256),
  'Admin User'
);

-- To verify the account was created:
SELECT * FROM adminCredentials WHERE email = 'admin@example.com';

-- To run this script, use the following command:
-- mysql -u root -p < "c:\Users\vinil\vinipimsite\vinipimsite\scripts\create-admin.sql"