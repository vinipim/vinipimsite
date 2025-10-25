import "dotenv/config";
import { upsertAdminCredential } from "../server/auth";
import { getDb } from "../server/db";

// Replace these values with your desired admin credentials
const email = process.env.ADMIN_EMAIL || "admin@example.com";
const password = process.env.ADMIN_PASSWORD || "SecurePassword123!";
const name = process.env.ADMIN_NAME || "Admin User";

async function createAdmin() {
  try {
    console.log("🔐 Creating admin account...");

    // First ensure database connection
    const db = await getDb();
    if (!db) {
      console.error("❌ Failed to connect to database");
      process.exit(1);
    }

    await upsertAdminCredential(email, password, name);

    console.log("✅ Admin created successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(
      `🔑 Password: ${password.replace(/./g, "*")} (stored securely)`,
    );
    console.log("⚠️  Please change these credentials after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin account:", error);
    process.exit(1);
  }
}

createAdmin();
