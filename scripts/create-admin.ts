import { upsertAdminCredential } from '../server/auth';

// Replace these values with your desired admin credentials
const email = 'admin@example.com';
const password = 'SecurePassword123!';
const name = 'Admin User';

async function createAdmin() {
  try {
    await upsertAdminCredential(
      email,
      password,
      name
    );
    console.log('Admin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password} (keep this secure)`);
  } catch (error) {
    console.error('Failed to create admin account:', error);
  }
}

createAdmin();