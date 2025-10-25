import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { media } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const mediaRouter = router({
  getAll: publicProcedure.query(async () => {
    const db = getDb();
    return await db.select().from(media);
  }),

  create: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        type: z.enum(["image", "video", "audio"]),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [newMedia] = await db.insert(media).values(input).returning();
      return newMedia;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(media).where(eq(media.id, input.id));
      return { success: true };
    }),
});
