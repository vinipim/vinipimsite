import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storage } from "./storage";

export const uploadRouter = router({
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const url = await storage.getUploadUrl(input.filename, input.contentType);
      return { url };
    }),
});
