import { eq } from "drizzle-orm";
import { adminCredentials, type AdminCredential } from "../drizzle/schema";
import { getDb } from "./db";
import * as crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function upsertAdminCredential(
  email: string,
  password: string,
  name?: string,
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot upsert admin credential: database not available",
    );
    return;
  }

  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);

  try {
    await db
      .insert(adminCredentials)
      .values({
        id,
        email,
        passwordHash,
        name: name || null,
      })
      .onDuplicateKeyUpdate({
        set: {
          passwordHash,
          name: name || null,
        },
      });
  } catch (error) {
    console.error("[Database] Failed to upsert admin credential:", error);
    throw error;
  }
}

export async function verifyAdminLogin(
  email: string,
  password: string,
): Promise<AdminCredential | null> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot verify admin login: database not available",
    );
    return null;
  }

  try {
    const result = await db
      .select()
      .from(adminCredentials)
      .where(eq(adminCredentials.email, email))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const admin = result[0];
    if (!verifyPassword(password, admin.passwordHash)) {
      return null;
    }

    await db
      .update(adminCredentials)
      .set({ lastLogin: new Date() })
      .where(eq(adminCredentials.id, admin.id));

    return admin;
  } catch (error) {
    console.error("[Database] Failed to verify admin login:", error);
    return null;
  }
}

export async function getAdminByEmail(
  email: string,
): Promise<AdminCredential | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(adminCredentials)
      .where(eq(adminCredentials.email, email))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get admin:", error);
    return null;
  }
}

export async function updateAdminPassword(
  email: string,
  newPassword: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update admin password: database not available",
    );
    return false;
  }

  try {
    const passwordHash = hashPassword(newPassword);
    await db
      .update(adminCredentials)
      .set({ passwordHash })
      .where(eq(adminCredentials.email, email));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update admin password:", error);
    return false;
  }
}

export async function updateAdminEmail(
  oldEmail: string,
  newEmail: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update admin email: database not available",
    );
    return false;
  }

  try {
    await db
      .update(adminCredentials)
      .set({ email: newEmail })
      .where(eq(adminCredentials.email, oldEmail));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update admin email:", error);
    return false;
  }
}
