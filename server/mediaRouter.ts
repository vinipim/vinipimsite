import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { media } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const mediaInput = z.object({
  url: z.string().url(),
  fileType: z.enum(["image", "video", "document"]).default("image"),
  filename: z.string().optional(),
  contentType: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  storageKey: z.string().optional(),
  thumbnail: z.string().optional(),
  title: z.string().optional(),
});

export const mediaRouter = router({
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    return db.select().from(media);
  }),

  create: protectedProcedure
    .input(mediaInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const record = {
        id: nanoid(),
        filename: input.filename ?? `media-${Date.now()}`,
        fileType: input.fileType,
        contentType: input.contentType ?? "application/octet-stream",
        size: input.size ?? 0,
        storageKey: input.storageKey ?? input.url,
        url: input.url,
        thumbnail: input.thumbnail ?? null,
        userId: ctx.user?.id ?? null,
      };

      await db.insert(media).values(record);
      return record;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db.delete(media).where(eq(media.id, input.id));
      return { success: true };
    }),
});
