import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { type InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _connection: mysql.Connection | null = null;
let _connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 10;
const RETRY_DELAY_MS = 5000;

/**
 * Establishes a connection to the database with retry logic
 * Optimized for Railway deployment with better error handling
 */
export async function getDb() {
  // If we already have a connection, return it
  if (_db) {
    return _db;
  }

  // If no DATABASE_URL is provided, we can't connect
  if (!process.env.DATABASE_URL) {
    console.error("[Database] DATABASE_URL environment variable is not set");
    return null;
  }

  try {
    // Create a connection with appropriate timeout settings
    _connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      connectTimeout: 10000, // 10 seconds
      // Connection pool settings for production
      ...(process.env.NODE_ENV === "production"
        ? {
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
          }
        : {}),
    });

    // Test the connection
    await _connection.ping();

    // Create the Drizzle instance
    _db = drizzle(_connection);

    // Reset connection attempts on successful connection
    _connectionAttempts = 0;

    console.log("[Database] Successfully connected to MySQL");
    return _db;
  } catch (error) {
    _connectionAttempts++;
    console.error(
      `[Database] Failed to connect (attempt ${_connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`,
      error,
    );

    // Clean up failed connection
    _db = null;
    if (_connection) {
      try {
        await _connection.end();
      } catch (endError) {
        console.error("[Database] Error closing failed connection:", endError);
      }
    }
    _connection = null;

    // Retry logic for production environment
    if (
      process.env.NODE_ENV === "production" &&
      _connectionAttempts < MAX_CONNECTION_ATTEMPTS
    ) {
      console.log(
        `[Database] Will retry connection in ${RETRY_DELAY_MS / 1000} seconds...`,
      );

      // Wait and try again
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return getDb(); // Recursive call to retry
    } else if (_connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error(
        `[Database] Maximum connection attempts (${MAX_CONNECTION_ATTEMPTS}) reached. Giving up.`,
      );
    }

    return null;
  }
}

/**
 * Checks if the database connection is healthy
 * Used by health check endpoints
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // Simple query to test connection
    await _connection?.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("[Database] Health check failed:", error);
    return false;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, any> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
