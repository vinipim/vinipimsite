"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.media = exports.reviews = exports.posts = exports.adminCredentials = exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Core user table backing auth flow.
 */
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
    name: (0, mysql_core_1.text)("name"),
    email: (0, mysql_core_1.varchar)("email", { length: 320 }),
    loginMethod: (0, mysql_core_1.varchar)("loginMethod", { length: 64 }),
    role: (0, mysql_core_1.mysqlEnum)("role", ["user", "admin"]).default("user").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    lastSignedIn: (0, mysql_core_1.timestamp)("lastSignedIn").defaultNow(),
});
/**
 * Admin credentials table for custom authentication
 */
exports.adminCredentials = (0, mysql_core_1.mysqlTable)("adminCredentials", {
    id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
    email: (0, mysql_core_1.varchar)("email", { length: 320 }).notNull().unique(),
    passwordHash: (0, mysql_core_1.text)("passwordHash").notNull(),
    name: (0, mysql_core_1.text)("name"),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    lastLogin: (0, mysql_core_1.timestamp)("lastLogin"),
});
/**
 * Posts table for blog content
 */
exports.posts = (0, mysql_core_1.mysqlTable)("posts", {
    id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
    slug: (0, mysql_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    title: (0, mysql_core_1.text)("title").notNull(),
    excerpt: (0, mysql_core_1.text)("excerpt"),
    content: (0, mysql_core_1.text)("content").notNull(),
    coverImage: (0, mysql_core_1.text)("coverImage"),
    category: (0, mysql_core_1.varchar)("category", { length: 100 }).notNull(),
    featured: (0, mysql_core_1.mysqlEnum)("featured", ["yes", "no"]).default("no").notNull(),
    publishedAt: (0, mysql_core_1.timestamp)("publishedAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
    authorId: (0, mysql_core_1.varchar)("authorId", { length: 64 }),
});
/**
 * Reviews table for films, albums, and books
 */
exports.reviews = (0, mysql_core_1.mysqlTable)("reviews", {
    id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
    type: (0, mysql_core_1.mysqlEnum)("type", ["film", "album", "book"]).notNull(),
    title: (0, mysql_core_1.text)("title").notNull(),
    creator: (0, mysql_core_1.text)("creator"),
    year: (0, mysql_core_1.int)("year"),
    rating: (0, mysql_core_1.int)("rating").notNull(),
    notes: (0, mysql_core_1.text)("notes"),
    tags: (0, mysql_core_1.text)("tags"),
    coverImage: (0, mysql_core_1.text)("coverImage"),
    apiId: (0, mysql_core_1.varchar)("apiId", { length: 255 }),
    metadata: (0, mysql_core_1.text)("metadata"),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
    userId: (0, mysql_core_1.varchar)("userId", { length: 64 }),
});
/**
 * Media files table
 */
exports.media = (0, mysql_core_1.mysqlTable)("media", {
    id: (0, mysql_core_1.varchar)("id", { length: 64 }).primaryKey(),
    filename: (0, mysql_core_1.varchar)("filename", { length: 255 }).notNull(),
    fileType: (0, mysql_core_1.mysqlEnum)("fileType", ["image", "video", "document"]).notNull(),
    contentType: (0, mysql_core_1.varchar)("contentType", { length: 100 }).notNull(),
    size: (0, mysql_core_1.int)("size").notNull(),
    storageKey: (0, mysql_core_1.varchar)("storageKey", { length: 500 }).notNull(),
    url: (0, mysql_core_1.text)("url").notNull(),
    thumbnail: (0, mysql_core_1.text)("thumbnail"),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow(),
    userId: (0, mysql_core_1.varchar)("userId", { length: 64 }),
});
