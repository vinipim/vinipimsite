import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { publicProcedure, protectedProcedure, router } from "./_core/trpc"
import { getDb } from "./db"
import { posts } from "../drizzle/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

/**
 * Posts router for blog content management
 */
export const postsRouter = router({
  /**
   * Get all posts (public)
   */
  getAll: publicProcedure.query(async () => {}),

  /**
   * Get post by slug (public)
   */
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {}),

  /**
   * Create new post (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        coverImage: z.string().optional(),
        category: z.string().min(1),
        featured: z.enum(["yes", "no"]).default("no"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        })
      }

      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        })
      }

      const id = nanoid()
      await db.insert(posts).values({
        id,
        ...input,
        authorId: ctx.user.id,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })

      return { success: true, id }
    }),

  /**
   * Update post (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1).optional(),
        coverImage: z.string().optional(),
        category: z.string().min(1).optional(),
        featured: z.enum(["yes", "no"]).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        })
      }

      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        })
      }

      const { id, ...updateData } = input
      await db
        .update(posts)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))

      return { success: true }
    }),

  /**
   * Delete post (admin only)
   */
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const db = await getDb()
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      })
    }

    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      })
    }

    await db.delete(posts).where(eq(posts.id, input.id))

    return { success: true }
  }),
})
