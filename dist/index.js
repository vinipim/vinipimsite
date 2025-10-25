// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var UNAUTHED_ERR_MSG = "UNAUTHORIZED";
var API_URL = process.env.VITE_API_URL || "/api";
var NOT_ADMIN_ERR_MSG = "Not an admin";
var COOKIE_NAME = "session";
var ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1e3;
var MAX_FILE_SIZE = 10 * 1024 * 1024;

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// drizzle/schema.ts
import {
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  int
} from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow()
});
var adminCredentials = mysqlTable("adminCredentials", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  createdAt: timestamp("createdAt").defaultNow(),
  lastLogin: timestamp("lastLogin")
});
var posts = mysqlTable("posts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("coverImage"),
  category: varchar("category", { length: 100 }).notNull(),
  featured: mysqlEnum("featured", ["yes", "no"]).default("no").notNull(),
  publishedAt: timestamp("publishedAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  authorId: varchar("authorId", { length: 64 })
});
var reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  type: mysqlEnum("type", ["film", "album", "book"]).notNull(),
  title: text("title").notNull(),
  creator: text("creator"),
  year: int("year"),
  rating: int("rating").notNull(),
  notes: text("notes"),
  tags: text("tags"),
  coverImage: text("coverImage"),
  apiId: varchar("apiId", { length: 255 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  userId: varchar("userId", { length: 64 })
});
var media = mysqlTable("media", {
  id: varchar("id", { length: 64 }).primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["image", "video", "document"]).notNull(),
  contentType: varchar("contentType", { length: 100 }).notNull(),
  size: int("size").notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  userId: varchar("userId", { length: 64 })
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
var _connection = null;
var _connectionAttempts = 0;
var MAX_CONNECTION_ATTEMPTS = 10;
var RETRY_DELAY_MS = 5e3;
async function getDb() {
  if (_db) {
    return _db;
  }
  if (!process.env.DATABASE_URL) {
    console.error("[Database] DATABASE_URL environment variable is not set");
    return null;
  }
  try {
    _connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      connectTimeout: 1e4,
      // 10 seconds
      // Connection pool settings for production
      ...process.env.NODE_ENV === "production" ? {
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      } : {}
    });
    await _connection.ping();
    _db = drizzle(_connection);
    _connectionAttempts = 0;
    console.log("[Database] Successfully connected to MySQL");
    return _db;
  } catch (error) {
    _connectionAttempts++;
    console.error(
      `[Database] Failed to connect (attempt ${_connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`,
      error
    );
    _db = null;
    if (_connection) {
      try {
        await _connection.end();
      } catch (endError) {
        console.error("[Database] Error closing failed connection:", endError);
      }
    }
    _connection = null;
    if (process.env.NODE_ENV === "production" && _connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log(
        `[Database] Will retry connection in ${RETRY_DELAY_MS / 1e3} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return getDb();
    } else if (_connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error(
        `[Database] Maximum connection attempts (${MAX_CONNECTION_ATTEMPTS}) reached. Giving up.`
      );
    }
    return null;
  }
}
async function upsertUser(user) {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      id: user.id
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === void 0) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/sdk.ts
var sdk = {
  // SDK utilities for external integrations
  initialized: true
};

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        id: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS
      });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
async function notifyOwner(message) {
  console.log("[Notification]", message);
}

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/adminRouter.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
import { z as z2 } from "zod";

// server/auth.ts
import { eq as eq2 } from "drizzle-orm";
import * as crypto from "crypto";
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}
async function verifyAdminLogin(email, password) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot verify admin login: database not available"
    );
    return null;
  }
  try {
    const result = await db.select().from(adminCredentials).where(eq2(adminCredentials.email, email)).limit(1);
    if (result.length === 0) {
      return null;
    }
    const admin = result[0];
    if (!verifyPassword(password, admin.passwordHash)) {
      return null;
    }
    await db.update(adminCredentials).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq2(adminCredentials.id, admin.id));
    return admin;
  } catch (error) {
    console.error("[Database] Failed to verify admin login:", error);
    return null;
  }
}
async function updateAdminPassword(email, newPassword) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update admin password: database not available"
    );
    return false;
  }
  try {
    const passwordHash = hashPassword(newPassword);
    await db.update(adminCredentials).set({ passwordHash }).where(eq2(adminCredentials.email, email));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update admin password:", error);
    return false;
  }
}
async function updateAdminEmail(oldEmail, newEmail) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update admin email: database not available"
    );
    return false;
  }
  try {
    await db.update(adminCredentials).set({ email: newEmail }).where(eq2(adminCredentials.email, oldEmail));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update admin email:", error);
    return false;
  }
}

// server/adminRouter.ts
import * as jwt from "jose";
var ADMIN_SESSION_COOKIE = "admin_session";
var adminRouter = router({
  login: publicProcedure.input(
    z2.object({
      email: z2.string().email(),
      password: z2.string().min(1)
    })
  ).mutation(async ({ input, ctx }) => {
    const admin = await verifyAdminLogin(input.email, input.password);
    if (!admin) {
      throw new TRPCError2({
        code: "UNAUTHORIZED",
        message: "Invalid email or password"
      });
    }
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const token = await new jwt.SignJWT({
      adminId: admin.id,
      email: admin.email,
      name: admin.name
    }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.cookie(ADMIN_SESSION_COOKIE, token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    return {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    };
  }),
  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies[ADMIN_SESSION_COOKIE];
    if (!token) {
      return null;
    }
    try {
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwt.jwtVerify(token, secret);
      return {
        adminId: payload.adminId,
        email: payload.email,
        name: payload.name
      };
    } catch (error) {
      return null;
    }
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(ADMIN_SESSION_COOKIE, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
  updateEmail: publicProcedure.input(
    z2.object({
      currentEmail: z2.string().email(),
      newEmail: z2.string().email()
    })
  ).mutation(async ({ input, ctx }) => {
    const token = ctx.req.cookies[ADMIN_SESSION_COOKIE];
    if (!token) {
      throw new TRPCError2({ code: "UNAUTHORIZED" });
    }
    const success = await updateAdminEmail(
      input.currentEmail,
      input.newEmail
    );
    if (!success) {
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update email"
      });
    }
    return { success: true };
  }),
  updatePassword: publicProcedure.input(
    z2.object({
      email: z2.string().email(),
      newPassword: z2.string().min(8)
    })
  ).mutation(async ({ input, ctx }) => {
    const token = ctx.req.cookies[ADMIN_SESSION_COOKIE];
    if (!token) {
      throw new TRPCError2({ code: "UNAUTHORIZED" });
    }
    const success = await updateAdminPassword(input.email, input.newPassword);
    if (!success) {
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update password"
      });
    }
    return { success: true };
  })
});

// server/reviewsRouter.ts
import { z as z3 } from "zod";
import { eq as eq3, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
var reviewsRouter = router({
  list: protectedProcedure.input(
    z3.object({
      type: z3.enum(["film", "album", "book", "all"]).optional(),
      sortBy: z3.enum(["date", "rating", "title"]).optional().default("date"),
      order: z3.enum(["asc", "desc"]).optional().default("desc")
    })
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    let query = db.select().from(reviews);
    if (input.type && input.type !== "all") {
      query = query.where(eq3(reviews.type, input.type));
    }
    if (input.sortBy === "date") {
      query = query.orderBy(
        input.order === "desc" ? desc(reviews.createdAt) : reviews.createdAt
      );
    } else if (input.sortBy === "rating") {
      query = query.orderBy(
        input.order === "desc" ? desc(reviews.rating) : reviews.rating
      );
    } else if (input.sortBy === "title") {
      query = query.orderBy(
        input.order === "desc" ? desc(reviews.title) : reviews.title
      );
    }
    const allReviews = await query;
    return allReviews;
  }),
  getById: protectedProcedure.input(z3.object({ id: z3.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const [review] = await db.select().from(reviews).where(eq3(reviews.id, input.id)).limit(1);
    return review;
  }),
  create: protectedProcedure.input(
    z3.object({
      type: z3.enum(["film", "album", "book"]),
      title: z3.string().min(1),
      creator: z3.string().optional(),
      year: z3.number().optional(),
      rating: z3.number().min(1).max(5),
      notes: z3.string().optional(),
      tags: z3.array(z3.string()).optional(),
      coverImage: z3.string().optional(),
      apiId: z3.string().optional(),
      metadata: z3.any().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const id = nanoid();
    const userId = ctx.user?.id || "admin";
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.insert(reviews).values({
      id,
      type: input.type,
      title: input.title,
      creator: input.creator,
      year: input.year,
      rating: input.rating,
      notes: input.notes,
      tags: input.tags ? JSON.stringify(input.tags) : null,
      coverImage: input.coverImage,
      apiId: input.apiId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      userId
    });
    return { success: true, id };
  }),
  update: protectedProcedure.input(
    z3.object({
      id: z3.string(),
      title: z3.string().optional(),
      creator: z3.string().optional(),
      year: z3.number().optional(),
      rating: z3.number().min(1).max(5).optional(),
      notes: z3.string().optional(),
      tags: z3.array(z3.string()).optional(),
      coverImage: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    const updateData = {};
    if (input.title) updateData.title = input.title;
    if (input.creator) updateData.creator = input.creator;
    if (input.year) updateData.year = input.year;
    if (input.rating) updateData.rating = input.rating;
    if (input.notes !== void 0) updateData.notes = input.notes;
    if (input.tags) updateData.tags = JSON.stringify(input.tags);
    if (input.coverImage) updateData.coverImage = input.coverImage;
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(reviews).set(updateData).where(eq3(reviews.id, input.id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z3.object({ id: z3.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(reviews).where(eq3(reviews.id, input.id));
    return { success: true };
  }),
  stats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      return {
        total: 0,
        byType: { film: 0, album: 0, book: 0 },
        averageRating: 0,
        topRated: []
      };
    const allReviews = await db.select().from(reviews);
    const stats = {
      total: allReviews.length,
      byType: {
        film: allReviews.filter((r) => r.type === "film").length,
        album: allReviews.filter((r) => r.type === "album").length,
        book: allReviews.filter((r) => r.type === "book").length
      },
      averageRating: allReviews.length ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0,
      topRated: allReviews.filter((r) => r.rating === 5).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 10)
    };
    return stats;
  })
});

// server/postsRouter.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z4 } from "zod";
import { eq as eq4 } from "drizzle-orm";
import { nanoid as nanoid2 } from "nanoid";
var postsRouter = router({
  /**
   * Get all posts (public)
   */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available"
      });
    }
    const allPosts = await db.select().from(posts).orderBy(posts.publishedAt);
    return allPosts;
  }),
  /**
   * Get post by slug (public)
   */
  getBySlug: publicProcedure.input(z4.object({ slug: z4.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available"
      });
    }
    const [post] = await db.select().from(posts).where(eq4(posts.slug, input.slug));
    if (!post) {
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "Post not found"
      });
    }
    return post;
  }),
  /**
   * Create new post (admin only)
   */
  create: protectedProcedure.input(
    z4.object({
      title: z4.string().min(1),
      slug: z4.string().min(1),
      excerpt: z4.string().optional(),
      content: z4.string().min(1),
      coverImage: z4.string().optional(),
      category: z4.string().min(1),
      featured: z4.enum(["yes", "no"]).default("no")
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available"
      });
    }
    if (ctx.user?.role !== "admin") {
      throw new TRPCError3({
        code: "FORBIDDEN",
        message: "Admin access required"
      });
    }
    const id = nanoid2();
    await db.insert(posts).values({
      id,
      ...input,
      authorId: ctx.user.id,
      publishedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return { success: true, id };
  }),
  /**
   * Update post (admin only)
   */
  update: protectedProcedure.input(
    z4.object({
      id: z4.string(),
      title: z4.string().min(1).optional(),
      slug: z4.string().min(1).optional(),
      excerpt: z4.string().optional(),
      content: z4.string().min(1).optional(),
      coverImage: z4.string().optional(),
      category: z4.string().min(1).optional(),
      featured: z4.enum(["yes", "no"]).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available"
      });
    }
    if (ctx.user?.role !== "admin") {
      throw new TRPCError3({
        code: "FORBIDDEN",
        message: "Admin access required"
      });
    }
    const { id, ...updateData } = input;
    await db.update(posts).set({
      ...updateData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(posts.id, id));
    return { success: true };
  }),
  /**
   * Delete post (admin only)
   */
  delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available"
      });
    }
    if (ctx.user?.role !== "admin") {
      throw new TRPCError3({
        code: "FORBIDDEN",
        message: "Admin access required"
      });
    }
    await db.delete(posts).where(eq4(posts.id, input.id));
    return { success: true };
  })
});

// server/uploadRouter.ts
import { z as z5 } from "zod";

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
async function buildDownloadUrl(baseUrl, relKey, apiKey) {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey)
  });
  return (await response.json()).url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}
async function storageGet(relKey, _expiresIn = 300) {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey)
  };
}
var storage = {
  put: storagePut,
  get: storageGet,
  getUploadUrl: async (filename, contentType) => {
    const { baseUrl, apiKey } = getStorageConfig();
    const uploadUrl = buildUploadUrl(baseUrl, filename);
    return uploadUrl.toString();
  }
};

// server/uploadRouter.ts
var uploadRouter = router({
  getUploadUrl: protectedProcedure.input(
    z5.object({
      filename: z5.string(),
      contentType: z5.string()
    })
  ).mutation(async ({ input }) => {
    const url = await storage.getUploadUrl(input.filename, input.contentType);
    return { url };
  })
});

// server/mediaRouter.ts
import { z as z6 } from "zod";
import { eq as eq5 } from "drizzle-orm";
var mediaRouter = router({
  getAll: publicProcedure.query(async () => {
    const db = getDb();
    return await db.select().from(media);
  }),
  create: protectedProcedure.input(
    z6.object({
      url: z6.string(),
      type: z6.enum(["image", "video", "audio"]),
      title: z6.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const [newMedia] = await db.insert(media).values(input).returning();
    return newMedia;
  }),
  delete: protectedProcedure.input(z6.object({ id: z6.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(media).where(eq5(media.id, input.id));
    return { success: true };
  })
});

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  admin: adminRouter,
  reviews: reviewsRouter,
  posts: postsRouter,
  upload: uploadRouter,
  media: mediaRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
async function setupVite(app) {
  const { createServer: createServer2 } = await import("vite");
  const vite = await createServer2({
    server: { middlewareMode: true },
    appType: "custom"
  });
  app.use(vite.middlewares);
  return vite;
}

// server/_core/index.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use((req, res, next) => {
    try {
      express2.json({ limit: "50mb" })(req, res, next);
    } catch (error) {
      console.error("JSON middleware error:", error);
      next();
    }
  });
  app.use((req, res, next) => {
    try {
      express2.urlencoded({ limit: "50mb", extended: true })(req, res, next);
    } catch (error) {
      console.error("URL-encoded middleware error:", error);
      next();
    }
  });
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  registerOAuthRoutes(app);
  app.get("/", (req, res) => {
    try {
      res.status(200).send("Vinipim Portfolio API is running");
    } catch (error) {
      console.error("Root endpoint error:", error);
      res.status(500).send("Internal server error");
    }
  });
  app.use("/api/trpc", (req, res, next) => {
    try {
      createExpressMiddleware({
        router: appRouter,
        createContext
      })(req, res, next);
    } catch (error) {
      console.error("tRPC middleware error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  const env = process.env.NODE_ENV || "development";
  if (env === "development") {
    try {
      await setupVite(app, server);
      console.log("\u2705 Vite development server setup complete");
    } catch (error) {
      console.error("\u274C Vite setup failed:", error);
    }
  }
  let finalPort;
  try {
    const port = parseInt(process.env.PORT || "3000", 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${process.env.PORT}`);
    }
    finalPort = env === "production" ? port : await findAvailablePort(port);
  } catch (error) {
    console.error("Port resolution failed:", error);
    finalPort = 3e3;
  }
  console.log("\u{1F680} Server starting on port:", finalPort);
  console.log("\u{1F3E5} Health endpoint ready at /health");
  console.log("\u{1F3E0} Root endpoint ready at /");
  server.listen(finalPort, "0.0.0.0", () => {
    console.log(`\u2705 Server running on port ${finalPort}`);
    console.log(`\u{1F30D} Environment: ${env}`);
    console.log(`\u{1F4BE} Database: ${process.env.DATABASE_URL ? "Configured" : "Not configured"}`);
    console.log(`\u{1F517} Health check: http://localhost:${finalPort}/health`);
  });
  app.use((error, req, res, next) => {
    console.error(`\u274C Unhandled error in ${req.method} ${req.path}:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        path: req.path,
        method: req.method
      });
    }
  });
  app.use((req, res) => {
    console.warn(`\u26A0\uFE0F Route not found: ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(404).json({
        error: "Not found",
        path: req.path,
        method: req.method
      });
    }
  });
  process.on("uncaughtException", (error) => {
    console.error("\u274C Uncaught Exception:", error);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("\u274C Unhandled Rejection at:", promise, "reason:", reason);
  });
}
startServer().catch(console.error);
