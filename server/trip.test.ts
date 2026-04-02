import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("trip.generate", () => {
  it("rejects invalid input (empty destination)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.trip.generate({
        destination: "",
        days: 3,
        budget: "mid-range",
        group: "solo",
        travelers: 1,
        interests: ["food"],
        adultOnly: false,
      })
    ).rejects.toThrow();
  });

  it("rejects invalid input (no interests)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.trip.generate({
        destination: "Berlin",
        days: 3,
        budget: "mid-range",
        group: "solo",
        travelers: 1,
        interests: [],
        adultOnly: false,
      })
    ).rejects.toThrow();
  });

  it("rejects invalid input (days out of range)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.trip.generate({
        destination: "Berlin",
        days: 0,
        budget: "mid-range",
        group: "solo",
        travelers: 1,
        interests: ["food"],
        adultOnly: false,
      })
    ).rejects.toThrow();
  });

  it("rejects invalid budget value", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.trip.generate({
        destination: "Berlin",
        days: 3,
        budget: "invalid-budget" as any,
        group: "solo",
        travelers: 1,
        interests: ["food"],
        adultOnly: false,
      })
    ).rejects.toThrow();
  });
});

describe("trip.save", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.trip.save({
        destination: "Berlin",
        days: 3,
        budget: "mid-range",
        group: "solo",
        travelers: 1,
        interests: ["food"],
        adultOnly: false,
        itinerary: { test: true },
        selectedOption: "A",
      })
    ).rejects.toThrow();
  });
});

describe("trip.list", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.trip.list()).rejects.toThrow();
  });
});

describe("trip.delete", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.trip.delete({ id: 1 })).rejects.toThrow();
  });
});
