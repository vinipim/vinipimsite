import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { adminCredentials, media, posts, reviews, users } from "../drizzle/schema";

// Configuration
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Attempts to connect to the database with retry logic
 */
async function connectWithRetry(attempt = 1): Promise<mysql.Connection> {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  try {
    console.log(`Connecting to database (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})...`);
    
    // Create a connection with timeout
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      connectTimeout: 10000, // 10 seconds
    });
    
    // Test the connection
    await connection.ping();
    console.log("✅ Database connection successful");
    
    return connection;
  } catch (error) {
    console.error(`❌ Failed to connect to database (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, error);
    
    if (attempt >= MAX_RETRY_ATTEMPTS) {
      console.error("Maximum retry attempts reached. Exiting.");
      process.exit(1);
    }
    
    console.log(`Retrying in ${RETRY_DELAY_MS/1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    
    // Recursive retry
    return connectWithRetry(attempt + 1);
  }
}

/**
 * Creates a table if it doesn't exist
 */
async function createTable(connection: mysql.Connection, tableName: string, createStatement: string): Promise<void> {
  try {
    await connection.execute(createStatement);
    console.log(`✅ ${tableName} table created/verified`);
  } catch (error) {
    console.error(`❌ Error creating ${tableName} table:`, error);
    throw error;
  }
}

/**
 * Main database setup function
 */
async function setupDatabase() {
  console.log("🚀 Starting database setup for Railway deployment");
  
  try {
    // Connect to the database with retry logic
    const connection = await connectWithRetry();
    
    // Create Drizzle instance
    const db = drizzle(connection);
    
    console.log("\n📊 Creating/verifying tables...");
    
    // Users table
    await createTable(connection, "Users", `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name TEXT,
        email VARCHAR(320),
        loginMethod VARCHAR(64),
        role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Admin credentials table
    await createTable(connection, "Admin credentials", `
      CREATE TABLE IF NOT EXISTS adminCredentials (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        name TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastLogin TIMESTAMP
      )
    `);
    
    // Posts table
    await createTable(connection, "Posts", `
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        coverImage TEXT,
        category VARCHAR(100) NOT NULL,
        featured ENUM('yes', 'no') NOT NULL DEFAULT 'no',
        publishedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        authorId VARCHAR(64)
      )
    `);
    
    // Reviews table
    await createTable(connection, "Reviews", `
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(64) PRIMARY KEY,
        type ENUM('film', 'album', 'book') NOT NULL,
        title TEXT NOT NULL,
        creator TEXT,
        year INT,
        rating INT NOT NULL,
        notes TEXT,
        tags TEXT,
        coverImage TEXT,
        apiId VARCHAR(255),
        metadata TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        userId VARCHAR(64)
      )
    `);
    
    // Media table
    await createTable(connection, "Media", `
      CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(64) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        fileType ENUM('image', 'video', 'document') NOT NULL,
        contentType VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        storageKey VARCHAR(500) NOT NULL,
        url TEXT NOT NULL,
        thumbnail TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        userId VARCHAR(64)
      )
    `);
    
    console.log("\n✅ All tables created/verified successfully");
    
    // Verify tables exist by counting them
    const [rows] = await connection.execute(`
      SELECT COUNT(*) as tableCount 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('users', 'adminCredentials', 'posts', 'reviews', 'media')
    `);
    
    const tableCount = (rows as any)[0].tableCount;
    console.log(`📊 Verified ${tableCount}/5 tables exist in the database`);
    
    // Close the connection
    await connection.end();
    
    console.log("\n🎉 Database setup complete and ready for Railway deployment");
  } catch (error) {
    console.error("\n❌ Fatal error setting up database:", error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();