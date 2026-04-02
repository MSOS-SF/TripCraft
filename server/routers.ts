import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { generateItinerary } from "./itineraryGenerator";
import { saveTrip, getUserTrips, deleteTrip, getTripById } from "./db";
import type { TripInput } from "../shared/tripTypes";

const tripInputSchema = z.object({
  destination: z.string().min(2),
  days: z.number().min(1).max(14),
  budget: z.enum(["budget", "mid-range", "premium"]),
  group: z.enum(["solo", "couple", "friends", "family"]),
  travelers: z.number().min(1).max(20).default(1),
  interests: z.array(z.string()).min(1),
  adultOnly: z.boolean().default(false),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  trip: router({
    generate: publicProcedure
      .input(tripInputSchema)
      .mutation(async ({ input }) => {
        const tripInput: TripInput = {
          destination: input.destination,
          days: input.days,
          budget: input.budget,
          group: input.group,
          travelers: input.travelers,
          interests: input.interests,
          adultOnly: input.adultOnly,
        };
        const itinerary = await generateItinerary(tripInput);
        return itinerary;
      }),

    save: protectedProcedure
      .input(z.object({
        destination: z.string(),
        days: z.number(),
        budget: z.string(),
        group: z.string(),
        travelers: z.number().default(1),
        interests: z.array(z.string()),
        adultOnly: z.boolean().default(false),
        itinerary: z.any(),
        selectedOption: z.string().default("A"),
      }))
      .mutation(async ({ ctx, input }) => {
        const tripId = await saveTrip({
          userId: ctx.user.id,
          destination: input.destination,
          days: input.days,
          budget: input.budget,
          group: input.group,
          travelers: input.travelers,
          interests: input.interests,
          adultOnly: input.adultOnly ? 1 : 0,
          itinerary: input.itinerary,
          selectedOption: input.selectedOption,
        });
        return { id: tripId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserTrips(ctx.user.id);
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await deleteTrip(input.id, ctx.user.id);
        return { success };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getTripById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
